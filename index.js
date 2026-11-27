import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';
import { Service } from '@deepseek-ai/cordis';
import { RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import {
  classifyCard, comparePoint, foldProgress, initialProgress, projectionView, snoozeStatus, pruneOperations,
  isApprovalQuestionIntent, PROJECTION_VERSION,
} from './lib/model.js';
import { readGitInfo } from './lib/git-branch.js';
import { progress, record as recordSchema } from './lib/schemas.js';
import { z } from 'zod';
import { DEFAULT_PRESETS, presetsSchema } from './lib/snooze-presets.js';
import { TYPERT } from './typert.js';

const DOMAIN = 'dsh_t3_inbox';
const SETTINGS_DOMAIN = 'dsh_t3_inbox_settings';
const settingsRecord = z.strictObject({revision:z.number().int().nonnegative(),presets:presetsSchema});
const PROJECTION_KEY = 't3' + 'Inbox' + 'Progress';
const CONTEXT_TTL = 10 * 60 * 1000;
const UNDO_TTL = 5 * 1000;
const UNDO_GRACE_MS = 2500;
const MAX_TREE = 256;
const MAX_CONTEXT_LENGTH = 100_000;
const EMPTY_SNAPSHOT = {
  schemaVersion: 1, generation: '', revision: 0, phase: 'building', error: null,
  cards: [], receipts: [],
  capabilities: { pendingIdentity: false, durableTree: true, awaitedWork: false },
};

function clone(value) { return value === undefined ? undefined : structuredClone(value); }
function finiteEpochMs(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string' && value) {
    const ms = Date.parse(value);
    if (Number.isFinite(ms) && ms > 0) return ms;
  }
  return null;
}
function projectionTitle(value) {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object' && typeof value.title === 'string' && value.title.trim()) return value.title;
  return null;
}
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function hash(value) { return createHmac('sha256', 'dsh-t3-inbox-content').update(stable(value)).digest('base64url'); }
function resultMap(members, field = 'latestResult') {
  return Object.fromEntries(members.filter((member) => member.progress?.[field]).map((member) => [member.sessionId, member.progress[field]]));
}
function pointsAfter(current, baseline) {
  for (const member of current) {
    const before = baseline?.[member.sessionId] ?? null;
    const point = member.progress?.latestResult;
    if (point && (!before || before.sessionId !== member.sessionId || point.seq > before.seq)) return false;
  }
  return true;
}
function cachedMember(member, pending, generation) {
  return {
    progress: clone(member.progress), label: member.label,
    ...(member.title ? { title: member.title } : {}),
    runtime: clone(member.runtime), pending: clone(pending), lastSeenGeneration: generation,
  };
}

function createLimiter(limit) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= limit || !queue.length) return;
    active += 1;
    const item = queue.shift();
    Promise.resolve().then(item.fn).then(item.resolve, item.reject).finally(() => {
      active -= 1;
      next();
    });
  };
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}

async function mapLimit(items, limit, operation) {
  const run = createLimiter(limit);
  return Promise.all(items.map((item, index) => run(() => operation(item, index))));
}

export default class T3InboxService extends TypertRemoteService {
  static inject = ['sessionController', 'sessionProjections', 'sessionQuery', 'storageDomain', 'workspaceRegistry', 'subagents', 'sessions', 'typertGateway', 'typert', 'cordisInspect'];

  constructor(ctx) {
    super(ctx, 't3Inbox');
    this.generation = randomUUID();
    this.contextSecret = randomUUID();
    this.pending = new Map();
    this.ownerEpochs = new Map();
    this.followers = new Set();
    this.memberCache = new Map();
    this.rootSummaries = new Map();
    this.lastSnapshotSignature = null;
    this.internalDomainWrites = 0;
    this.snapshotMutationEpoch = 0;
    this.currentSnapshot = { ...EMPTY_SNAPSHOT, generation: this.generation };
    this.stats = { buildCount: 0, lastBuildMs: null, lastListMs: null, lastTreeMs: null, lastMemberMs: null, lastRoots: 0, lastMembers: 0, lastRetired: 0, lastTreeCalls: 0, lastMemberCalls: 0, lastMemberErrors: 0, lastAt: null };
    this.refreshing = null;
    this.refreshAgain = false;
    this.disposed = false;
    this.initialEnrolledAt = null;
    this.pendingCardRefreshes = new Set();
    this.cardRefreshFlush = null;
    this.prepareLimit = createLimiter(2);
  }

  async [Service.init]() {
    const ctx = this.ctx;
    this.domain = await ctx.storageDomain.open({
      name: DOMAIN, version: 1, layout: 'per-record', invalidRecords: 'backup-and-skip',
      tables: { records: { valueSchema: recordSchema } },
    });
    let earliestEnroll = Infinity;
    for (const [, rec] of this.domain?.table?.('records')?.entries?.() ?? []) {
      const at = finiteEpochMs(rec?.enrollment?.at);
      if (at !== null && at < earliestEnroll) earliestEnroll = at;
    }
    this.initialEnrolledAt = Number.isFinite(earliestEnroll) ? earliestEnroll : null;
    this.settingsDomain = await ctx.storageDomain.open({
      name:SETTINGS_DOMAIN, version:1, layout:'per-record', invalidRecords:'backup-and-skip',
      // Preserve malformed JSON records so the UI can report damage and offer Reset.
      // The contents are decoded strictly by settingsRecord before use.
      tables:{settings:{valueSchema:z.json()}},
    });
    ctx.effect(() => () => this.settingsDomain.close(), 't3-inbox: settings domain');
    await this.ensureSnoozeSettings();
    ctx.effect(() => () => this.domain.close(), 't3-inbox: domain');
    // A hot-reloaded or disabled service must end its follow() streams; otherwise clients keep
    // waiting on the disposed instance forever and never reconnect to the new one.
    ctx.effect(() => () => {
      this.disposed = true;
      for (const listener of [...(this.followers ?? [])]) listener(null);
    }, 't3-inbox: end follow streams on dispose');
    ctx.effect(() => () => clearTimeout(this.wakeTimer), 't3-inbox: wake timer');
    ctx.effect(() => ctx.typert.register(TYPERT), 't3-inbox: strict Remote descriptors');
    ctx.effect(() => ctx.cordisInspect.register({
      manifest: {
        id: 'T3Inbox',
        description: 'Read-only timing and cardinality for the Inbox Host projection.',
        methods: [{
          name: 'getStats', description: 'Return sanitized projection timing and member counts.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          outputSchema: { description: 'Timing and cardinality only; no Session content.' },
        }],
      },
      query: (method) => {
        if (method !== 'getStats') throw new Error(`Unknown T3Inbox method ${method}`);
        const cards = (this.currentSnapshot?.cards ?? []).map((card) => ({
          sessionId: card.sessionId,
          providerId: card.providerId ?? null,
          modelId: card.modelId ?? null,
        }));
        return { ...this.stats, generation: this.generation, phase: this.currentSnapshot.phase, cards };
      },
    }), 't3-inbox: read-only projection statistics');
    this.projection = await ctx.sessionProjections.register({
      key: PROJECTION_KEY, stateVersion: PROJECTION_VERSION, stateSchema: progress,
      init: (header, inheritedEventCount) => initialProgress(inheritedEventCount, header.id),
      apply: foldProgress,
      wire: { viewSchema: progress, view: projectionView, summary: false },
    });

    const trackPending = (sessionId, kind, identity) => {
      const id = randomUUID();
      this.pending.set(id, { sessionId, kind, identity });
      this.requestRefresh();
      return () => { this.pending.delete(id); this.requestRefresh(); };
    };
    const onRequest = (kind, request, next) => {
      const sessionId = request.agent?.id;
      if (!sessionId) return next();
      const callId = kind === 'approval' ? request.callId : request.wait?.callId;
      /* ask_user_question may carry plan-review as Approval even on the question waterfall. */
      const trackedKind = (request.questions ?? []).some(isApprovalQuestionIntent) ? 'approval' : kind;
      const release = trackPending(sessionId, trackedKind, callId ? {
        sessionId, generation: this.generation,
        continuityKey: `${sessionId}:${this.ownerEpochs.get(sessionId) ?? 'initial'}:${callId}`,
        contentVersion: hash(kind === 'question' ? request.questions : { callId, toolName: request.toolName }),
      } : null);
      return Promise.resolve().then(next).finally(release);
    };
    ctx.on('approval/request', (request, next) => onRequest('approval', request, next));
    // Legacy waterfall name — current UserQuestionService.ask has no waterfall; kept for compat.
    ctx.on('user-questions/request', (request, next) => onRequest('question', request, next));
    // Real ask seam: wrap userQuestions.ask so product question cards mark needsYou / Input.
    // Optional — ask has no waterfall; Client pendingInteraction overlay is the other half.
    // Synthesize identity (T3 allows Snooze during user_input; Host canSnooze needs continuity).
    const userQuestions = ctx.get?.('userQuestions') ?? ctx.userQuestions;
    if (userQuestions?.ask) {
      const originalAsk = userQuestions.ask.bind(userQuestions);
      userQuestions.ask = async (request) => {
        const sessionId = request?.agent?.id;
        if (!sessionId) return originalAsk(request);
        /* ask() may nest questions under several keys depending on seam version. */
        const questionItems = [
          ...(Array.isArray(request?.questions) ? request.questions : []),
          ...(Array.isArray(request?.payload?.questions) ? request.payload.questions : []),
          ...(request?.question ? [request.question] : []),
        ];
        const kind = questionItems.some(isApprovalQuestionIntent) ? 'approval' : 'question';
        const callId = request?.wait?.callId ?? request?.callId ?? request?.id
          ?? hash(request.questions ?? { sessionId, at: Date.now() });
        const identity = kind === 'question' ? {
          sessionId,
          generation: this.generation,
          continuityKey: `${sessionId}:${this.ownerEpochs.get(sessionId) ?? 'initial'}:${callId}`,
          contentVersion: hash(request.questions ?? callId),
        } : null;
        const release = trackPending(sessionId, kind, identity);
        try { return await originalAsk(request); }
        finally { release(); }
      };
    }
    for (const item of ctx.typertGateway.getPendingRemoteEvents()) {
      const kind = item.event === 'approval/request' ? 'approval' : item.event === 'user-questions/request' ? 'question' : 'other';
      const key = `seed:${item.event}:${item.agentId}`;
      this.pending.set(key, { sessionId: item.agentId, kind, identity: null });
    }

    ctx.on('domain/changed', (change) => {
      if ((this.internalDomainWrites ?? 0) > 0) return;
      if (change.domain === DOMAIN || change.domain === SETTINGS_DOMAIN) this.requestRefresh();
    });
    ctx.on('session/event', (session, event) => {
      if (!['turn/start', 'turn/end', 'user/message', 'model/selection'].includes(event.type)) return;
      const live = ctx.sessions.get(session.id);
      if (live) {
        const prior = this.memberCache.get(session.id);
        try {
          this.memberCache.set(session.id, {
            ...(prior?.title ? { title: prior.title } : {}),
            ...(event.type !== 'model/selection' && prior?.modelSelection !== undefined ? { modelSelection: prior.modelSelection } : {}),
            progress: this.projection.stateOf(live),
            header: live.header,
            updatedAt: this.sessionUpdatedAt?.get(session.id) ?? null,
          });
        } catch { this.memberCache.delete(session.id); }
      }
      this.scheduleCardRefresh(session.id);
    }, { global: true });
    ctx.on('session/created', () => this.requestRefresh(), { global: true });
    ctx.on('session/disposed', () => this.requestRefresh(), { global: true });
    ctx.on('agent/status', () => this.requestRefresh(), { global: true });
    ctx.on('agent/created', ({ agent }) => { this.ownerEpochs.set(agent.id, randomUUID()); this.requestRefresh(); }, { global: true });
    ctx.on('agent/disposed', ({ agent }) => { this.ownerEpochs.set(agent.id, randomUUID()); this.requestRefresh(); }, { global: true });
    for (const event of ['api-session/added', 'api-session/status', 'api-session/error', 'api-session/removed', 'subagent/start', 'subagent/end']) ctx.on(event, () => this.requestRefresh());
    // Build the initial cold baseline in the background so enabling/reloading the plugin finishes
    // immediately instead of blocking Cordis/DSH; follow() pushes `phase: 'ready'` once built.
    void this.refresh();
  }

  requireOwner() {
    if (this.ctx.invocation?.peer?.principal?.kind !== 'owner') throw new RemoteError('t3-inbox/owner-only', 'Inbox requires an authenticated owner Peer', {});
  }

  sign(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.contextSecret).update(encoded).digest('base64url');
    return `${encoded}.${signature}`;
  }

  verifyContext(token, sessionId, revision) {
    const [encoded, signature] = String(token).split('.');
    if (!encoded || !signature) return false;
    const expected = createHmac('sha256', this.contextSecret).update(encoded).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    try {
      const value = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
      return value.sessionId === sessionId && value.revision === revision && value.generation === this.generation && value.expiresAt > Date.now() ? value : false;
    } catch { return false; }
  }

  issueContext(card, record) {
    const payload = {
      sessionId: card.sessionId, revision: record.revision, generation: this.generation,
      expiresAt: Date.now() + CONTEXT_TTL,
      results: resultMap(card.members), failures: resultMap(card.members, 'latestFailure'), inputs: resultMap(card.members, 'latestHumanInput'),
      pending: card.pending.map((item) => ({ sessionId: item.sessionId, kind: item.kind, identity: item.identity })),
    };
    const token = this.sign(payload);
    if (token.length > MAX_CONTEXT_LENGTH) return null;
    return token;
  }

  async withInternalDomainWrite(fn) {
    this.internalDomainWrites = (this.internalDomainWrites ?? 0) + 1;
    try { return await fn(); }
    finally {
      Promise.resolve().then(() => {
        this.internalDomainWrites = Math.max(0, (this.internalDomainWrites ?? 1) - 1);
      });
    }
  }

  refreshGatewayPendingSeeds() {
    for (const [key, value] of this.pending ?? []) {
      if (key.startsWith('seed:') || (value.identity === null && key.startsWith('seed:'))) this.pending.delete(key);
    }
    for (const item of this.ctx?.typertGateway?.getPendingRemoteEvents?.() ?? []) {
      const kind = item.event === 'approval/request' ? 'approval' : item.event === 'user-questions/request' ? 'question' : 'other';
      const hasLive = [...(this.pending ?? []).values()].some((row) => row.sessionId === item.agentId && row.kind === kind && row.identity);
      if (hasLive) continue;
      this.pending.set(`seed:${item.event}:${item.agentId}`, { sessionId: item.agentId, kind, identity: null });
    }
  }

  computeReceipts(now = Date.now()) {
    const receipts = [];
    for (const [sessionId, metadata] of this.domain?.table?.('records')?.entries?.() ?? []) {
      for (const operation of metadata.operations ?? []) {
        if (operation.receipt.expiresAt > now) receipts.push({ ...clone(operation.receipt), sessionId, kind: operation.kind });
      }
    }
    receipts.sort((a, b) => b.committedAt - a.committedAt);
    return receipts;
  }

  scheduleWakeTimer(cards, now = Date.now()) {
    clearTimeout(this.wakeTimer);
    const wakeTimes = (cards ?? []).filter((card) => card.snooze && card.snoozeEffect?.deferExceptions)
      .map((card) => Date.parse(card.snooze.until)).filter((time) => Number.isFinite(time) && time > now);
    if (wakeTimes.length) this.wakeTimer = setTimeout(() => { void this.requestRefresh(); }, Math.min(...wakeTimes) - now + 5);
  }

  publishSnapshot(nextBase) {
    const signature = stable({ ...nextBase, revision: 0 });
    if (signature !== this.lastSnapshotSignature) {
      this.lastSnapshotSignature = signature;
      this.currentSnapshot = { ...nextBase, revision: (this.currentSnapshot?.revision ?? 0) + 1 };
      for (const listener of this.followers ?? []) listener(this.currentSnapshot);
    }
  }

  requestRefresh() {
    if (this.refreshing) { this.refreshAgain = true; return this.refreshing; }
    this.refreshing = (async () => {
      try {
        // Yield two microtasks so synchronous `turn/end` and `kick()`'s finally `agent/status=idle`
        // coalesce into one buildSnapshot() instead of emitting a stale running:true snapshot first.
        await Promise.resolve();
        await Promise.resolve();
        do {
          if (this.disposed) return;
          this.refreshAgain = false;
          const startEpoch = this.snapshotMutationEpoch ?? 0;
          const next = await this.buildSnapshot();
          if (this.disposed || !next) return;
          if ((this.snapshotMutationEpoch ?? 0) !== startEpoch) {
            this.refreshAgain = true;
            continue;
          }
          this.publishSnapshot(next);
        } while (this.refreshAgain && !this.disposed);
      } catch (error) {
        if (this.disposed) return;
        this.ctx.logger?.warn?.('t3-inbox refresh failed', error);
        this.lastSnapshotSignature = null;
        this.currentSnapshot = { ...this.currentSnapshot, phase: 'unavailable', error: error instanceof Error ? error.message : String(error), revision: (this.currentSnapshot?.revision ?? 0) + 1 };
        for (const listener of this.followers ?? []) listener(this.currentSnapshot);
      } finally { this.refreshing = null; }
    })();
    return this.refreshing;
  }

  refresh() { return this.requestRefresh(); }

  /* Deliver turn/start and turn/end updates for known root sessions via O(1) single-card refresh
     instead of waiting for a full workspace rebuild, so Done / Working status appears immediately. */
  scheduleCardRefresh(sessionId) {
    if (!sessionId || this.disposed) return;
    if (this.refresh !== T3InboxService.prototype.refresh || this.currentSnapshot?.phase !== 'ready' || !this.rootSummaries?.has(sessionId)) {
      this.requestRefresh();
      return;
    }
    this.pendingCardRefreshes ??= new Set();
    this.pendingCardRefreshes.add(sessionId);
    if (this.cardRefreshFlush) return;
    this.cardRefreshFlush = (async () => {
      try {
        await Promise.resolve();
        await Promise.resolve();
        while (this.pendingCardRefreshes.size > 0 && !this.disposed) {
          const ids = [...this.pendingCardRefreshes];
          this.pendingCardRefreshes.clear();
          for (const id of ids) {
            if (this.disposed) break;
            try { await this.refreshSessionCard(id); }
            catch (error) {
              this.ctx.logger?.warn?.('t3-inbox card refresh failed', error);
              this.requestRefresh();
            }
          }
        }
      } finally {
        this.cardRefreshFlush = null;
        if (this.pendingCardRefreshes?.size > 0 && !this.disposed) {
          const nextId = this.pendingCardRefreshes.values().next().value;
          if (nextId) this.scheduleCardRefresh(nextId);
        }
      }
    })();
  }

  /* Perf: an unloaded tree cannot change unless one of its session logs changes. Key the cached
     listDescendants() result by the listing updatedAt of the root and every child; any loaded
     (live) member, diagnostic, or external subagent bypasses the cache. */
  treeKey(rootId, summary, descendants) {
    const at = this.sessionUpdatedAt;
    if (!at || summary?.updatedAt == null || typeof this.ctx.sessions?.get !== 'function') return null;
    const ids = [rootId, ...descendants.filter((item) => item.kind === 'child').map((item) => item.id)];
    if (ids.some((id) => this.ctx.sessions.get(id))) return null;
    return ids.map((id) => `${id}@${id === rootId ? summary.updatedAt : (at.get(id) ?? 'missing')}`).join('|');
  }

  cachedDescendants(rootId, summary) {
    const entry = this.treeCache?.get(rootId);
    if (!entry) return null;
    const key = this.treeKey(rootId, summary, entry.descendants);
    if (key === null || key !== entry.key) { this.treeCache.delete(rootId); return null; }
    return entry.descendants;
  }

  rememberDescendants(rootId, summary, descendants) {
    this.treeCache ??= new Map();
    if (descendants.some((item) => item.kind === 'diagnostic' || item.mode === 'external')) { this.treeCache.delete(rootId); return; }
    const key = this.treeKey(rootId, summary, descendants);
    if (key === null) this.treeCache.delete(rootId);
    else this.treeCache.set(rootId, { key, descendants });
  }

  /* Perf: an unloaded, idle session cannot change until it is loaded again (then it is live) or its
     log changes (updatedAt), so reuse its cold state instead of re-reading it on every rebuild. */
  async readSessionState(sessionId, live, signal) {
    this.coldStateCache ??= new Map();
    const updatedAt = this.sessionUpdatedAt?.get(sessionId);
    const entry = this.coldStateCache.get(sessionId);
    if (!live && updatedAt != null && entry?.updatedAt === updatedAt && !this.ctx.sessions?.get?.(sessionId)) return entry.state;
    const state = await this.ctx.sessionController.state({ sessionId }, signal);
    const coldIdle = state?.active === false && state.queue === null && !state.running && !(state.pendingInput?.length);
    if (!live && updatedAt != null && coldIdle && !this.ctx.sessions?.get?.(sessionId)) this.coldStateCache.set(sessionId, { updatedAt, state });
    else this.coldStateCache.delete(sessionId);
    return state;
  }

  async readMember(sessionId, label, signal) {
    const live = this.ctx.sessions.get(sessionId);
    const updatedAt = this.sessionUpdatedAt?.get(sessionId) ?? null;
    let cached = live ? undefined : this.memberCache.get(sessionId);
    if (cached && updatedAt != null && cached.updatedAt != null && cached.updatedAt !== updatedAt) cached = undefined;
    if (!cached) {
      if (live) {
        cached = { progress: this.projection.stateOf(live), header: live.header, updatedAt };
        const prior = this.memberCache.get(sessionId);
        if (prior && prior.modelSelection !== undefined) {
          cached.modelSelection = prior.modelSelection;
          cached.title = prior.title ?? cached.title;
        } else {
          try {
            const observation = await this.ctx.sessionQuery.observeSession(sessionId, { signal, projectionMode: 'all' });
            try {
              cached.modelSelection = observation.projections?.values?.modelSelection ?? null;
              cached.title = projectionTitle(observation.projections?.values?.title) ?? cached.title;
              if (observation.header) cached.header = observation.header;
            } finally { observation[Symbol.dispose](); }
          } catch (_) { /* keep progress-only live cache */ }
        }
      } else {
        const observation = await this.ctx.sessionQuery.observeSession(sessionId, { signal, projectionMode: 'all' });
        try {
          const value = observation.projections?.values?.[PROJECTION_KEY];
          if (!value) throw new Error('Inbox progress projection is unavailable');
          cached = {
            progress: value,
            header: observation.header,
            title: projectionTitle(observation.projections?.values?.title),
            modelSelection: observation.projections?.values?.modelSelection ?? null,
            updatedAt,
          };
        } finally { observation[Symbol.dispose](); }
      }
      this.memberCache.set(sessionId, cached);
    }
    const state = await this.readSessionState(sessionId, live, signal);
    const cold = state.active === false && state.queue === null;
    const coldIdle = cold && !state.running && !(state.pendingInput?.length);
    return {
      sessionId, label, progress: cached.progress,
      cold,
      header: cached.header ?? null,
      modelSelection: cached.modelSelection ?? null,
      runtime: {
        running: state.running,
        queue: coldIdle ? [] : state.queue,
        startedAt: cached.progress?.latestWork?.time ?? null,
        completeness: Array.isArray(state.queue) || coldIdle ? 'complete' : 'unavailable',
      },
      title: cached.title,
      pendingInput: state.pendingInput,
    };
  }

  pendingFor(member, runtimePending) {
    const known = [...this.pending.values()].filter((item) => item.sessionId === member.sessionId);
    /* Prefer identified ask-wrap rows over null-identity gateway seeds of the same kind. */
    const byKind = new Map();
    for (const item of known) {
      const prev = byKind.get(item.kind);
      if (!prev || (!prev.identity && item.identity)) byKind.set(item.kind, item);
    }
    const result = [...byKind.values()];
    for (const kind of runtimePending ?? []) if (!byKind.has(kind)) result.push({ sessionId: member.sessionId, kind, identity: null });
    return result;
  }

  async buildCard(summary, runMember, timings = null, workspaceBySessionId = null) {
    const rootId = summary.sessionId;
    let descendants = [];
    let treeError = null;
    const treeStart = performance.now();
    try {
      const cachedTree = this.cachedDescendants(rootId, summary);
      if (cachedTree) {
        descendants = cachedTree;
        if (timings) timings.treeHits = (timings.treeHits ?? 0) + 1;
      } else {
        if (timings) timings.treeCalls += 1;
        descendants = await this.ctx.subagents.listDescendants(rootId);
        this.rememberDescendants(rootId, summary, descendants);
      }
    }
    catch (error) { treeError = error instanceof Error ? error.message : String(error); this.treeCache?.delete(rootId); }
    finally { if (timings) timings.treeMs += performance.now() - treeStart; }
    const diagnostic = descendants.find((item) => item.kind === 'diagnostic');
    if (diagnostic) treeError = `Subagent tree ${diagnostic.reason}`;
    const external = descendants.find((item) => item.mode === 'external');
    if (external) treeError = 'External subagent progress is unavailable';
    if (descendants.length > MAX_TREE) treeError = `Subagent tree exceeds ${MAX_TREE} members`;
    const rows = [
      { sessionId: rootId, label: projectionTitle(summary.projections?.values?.title) ?? summary.cwd ?? rootId },
      ...descendants.filter((item) => item.kind === 'child').map((item) => ({ sessionId: item.id, label: item.label ?? item.id })),
    ];
    if (timings) timings.memberCalls += rows.length;
    const memberStart = performance.now();
    const currentMembers = await Promise.all(rows.map((row) => runMember(async () => {
      try { return await this.readMember(row.sessionId, row.label, new AbortController().signal); }
      catch (error) { if (timings) timings.memberErrors += 1; return { sessionId: row.sessionId, label: row.label, error: error instanceof Error ? error.message : String(error) }; }
    })));
    if (timings) timings.memberMs += performance.now() - memberStart;
    const table = this.domain.table('records');
    let metadata = table.get(rootId);
    if (!metadata) {
      const allResults = resultMap(currentMembers);
      const enrollCutoff = this.initialEnrolledAt ?? null;
      // Only treat results from before initial Inbox enrollment as pre-settled baseline;
      // newly created sessions that finish their first turn before first scan stay unread/Active.
      const baseline = enrollCutoff === null
        ? allResults
        : Object.fromEntries(Object.entries(allResults).filter(([, pt]) => {
            const at = finiteEpochMs(pt?.time);
            return at === null || at <= enrollCutoff;
          }));
      const now = Date.now();
      metadata = {
        revision: 0, settledThrough: baseline, settledAt: null, settledOverride: null, unsettledAt: null,
        enrollment: { at: now, baseline, version: 1 },
        knownMembers: Object.fromEntries(currentMembers.filter((member) => member.progress && member.runtime).map((member) => [member.sessionId, cachedMember(member, [], this.generation)])),
        snooze: null, operations: [],
      };
      await this.withInternalDomainWrite(() => table.put(rootId, metadata));
    }
    const present = new Set(rows.map((row) => row.sessionId));
    const retired = Object.values(metadata.knownMembers ?? {}).filter((saved) => !present.has(saved.progress.sessionId) && (
      comparePoint(saved.progress.latestResult, metadata.settledThrough[saved.progress.sessionId]) || saved.pending.length > 0 || saved.runtime.running
    )).map((saved) => ({
      ...clone(saved), sessionId: saved.progress.sessionId, retired: true,
      runtime: saved.lastSeenGeneration === this.generation ? saved.runtime : { running: false, queue: null, startedAt: saved.runtime.startedAt, completeness: 'unavailable' },
      pending: saved.lastSeenGeneration === this.generation ? saved.pending : saved.pending.map((item) => ({ sessionId: item.sessionId, kind: 'other', identity: null })),
    }));
    const members = [...currentMembers, ...retired];
    if (timings) timings.retired += retired.length;
    const pendingByMember = new Map(members.map((member) => [member.sessionId, member.retired ? member.pending ?? [] : this.pendingFor(member, member.pendingInput)]));
    const pending = [...pendingByMember.values()].flat();
    const complete = !treeError && members.every((member) => member.progress && !member.error && member.runtime?.completeness === 'complete');
    const knownMembers = Object.fromEntries(members.filter((member) => member.progress && member.runtime).map((member) => [member.sessionId, cachedMember(member, pendingByMember.get(member.sessionId), this.generation)]));
    if (stable(knownMembers) !== stable(metadata.knownMembers ?? {})) {
      metadata = await this.withInternalDomainWrite(() => table.update(rootId, (current) => ({ ...current, knownMembers })));
    }
    const runtime = {
      running: members.some((member) => member.runtime?.running),
      queue: members.every((member) => Array.isArray(member.runtime?.queue)) ? members.flatMap((member) => member.runtime.queue) : null,
      completeness: complete ? 'complete' : 'unavailable',
      startedAt: summary.updatedAt,
    };
    const rootHeader = members[0]?.header ?? null;
    const createdAt = finiteEpochMs(rootHeader?.createdAt) ?? finiteEpochMs(summary.createdAt) ?? null;
    const progress = members[0]?.progress ?? null;
    const snoozeEffect = snoozeStatus(metadata.snooze, { members, pending }, Date.now());
    const acknowledged = metadata.snooze?.wokeAcknowledged?.instanceId === metadata.snooze?.instanceId;
    const classification = classifyCard({
      enrolled: true, progress, members, settledThroughMap: metadata.settledThrough,
      settledThrough: metadata.settledThrough[rootId] ?? null,
      settledAt: metadata.settledAt ?? null,
      settledOverride: metadata.settledOverride ?? null,
      createdAt,
      unsettledAt: metadata.unsettledAt ?? null,
      unreadAt: metadata.unreadAt ?? null,
      snoozeEffect: { ...snoozeEffect, woke: snoozeEffect.woke && !acknowledged },
      runtime, pending, now: Date.now(),
    });
    const workspace = workspaceBySessionId
      ? workspaceBySessionId.get(rootId)
      : this.ctx.workspaceRegistry.list().find((item) => item.sessionIds.includes(rootId));
    const headerConfig = rootHeader?.config && typeof rootHeader.config === 'object'
      ? rootHeader.config
      : rootHeader;
    const route = progress?.route ?? null;
    const lastUsed = members[0]?.modelSelection?.lastUsed
      ?? summary.projections?.values?.modelSelection?.lastUsed
      ?? null;
    const pickStr = (...values) => {
      for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value;
      }
      return null;
    };
    const modelId = pickStr(route?.model, lastUsed?.model, headerConfig?.model, summary.model);
    const providerId = pickStr(route?.provider, lastUsed?.provider, headerConfig?.provider, summary.provider);
    const cwd = summary.cwd ?? null;
    const gitInfo = readGitInfo(cwd);
    const card = {
      sessionId: rootId,
      createdAt,
      cold: Boolean(!treeError && currentMembers[0]?.cold === true && members.slice(1).every((member) =>
        member.progress && !member.error && member.runtime?.completeness === 'complete' && Array.isArray(member.runtime.queue))),
      title: projectionTitle(summary.projections?.values?.title) ?? members[0]?.title ?? summary.cwd ?? rootId,
      cwd,
      /* T3 SidebarThreadRow metaLine: branch/worktree from .git/HEAD (no git spawn). */
      branch: gitInfo.branch,
      worktree: gitInfo.isWorktree,
      workspaceId: workspace?.id ?? null, workspaceTitle: workspace?.title ?? null,
      modelId, providerId,
      members, pending, runtime, progress, result: classification.result,
      revision: metadata.revision, settledThrough: metadata.settledThrough,
      settledAt: metadata.settledAt, settledOverride: metadata.settledOverride ?? null, unsettledAt: metadata.unsettledAt ?? null, snooze: metadata.snooze, snoozeEffect,
      unreadAt: metadata.unreadAt ?? null,
      ...classification, treeError,
    };
    card.context = complete ? this.issueContext(card, metadata) : null;
    if (!card.context) { card.canSettle = false; card.canSnooze = false; }
    return card;
  }

  async buildSnapshot() {
    const buildStart = performance.now();
    const timings = { listMs: 0, treeMs: 0, memberMs: 0, treeCalls: 0, memberCalls: 0, memberErrors: 0, retired: 0 };
    this.refreshGatewayPendingSeeds();
    const listStart = performance.now();
    const listing = await this.ctx.sessionController.list({}, new AbortController().signal);
    timings.listMs = performance.now() - listStart;
    const roots = listing.items.filter((item) => item.origin !== 'subagent' && !item.blank);
    this.rootSummaries = new Map(roots.map((item) => [item.sessionId, item]));
    this.sessionUpdatedAt = new Map(listing.items.map((item) => [item.sessionId, item.updatedAt]));
    for (const id of [...(this.treeCache?.keys() ?? [])]) if (!this.rootSummaries.has(id)) this.treeCache.delete(id);
    for (const id of [...(this.coldStateCache?.keys() ?? [])]) if (!this.sessionUpdatedAt.has(id)) this.coldStateCache.delete(id);
    const workspaceBySessionId = new Map();
    for (const workspace of this.ctx.workspaceRegistry.list()) {
      for (const sid of workspace.sessionIds ?? []) workspaceBySessionId.set(sid, workspace);
    }
    const runMember = createLimiter(2);
    const cards = (await mapLimit(roots, 2, (summary) => (
      this.disposed ? null : this.buildCard(summary, runMember, timings, workspaceBySessionId)
    ))).filter(Boolean);
    if (this.disposed) return null;
    const now = Date.now();
    if (this.initialEnrolledAt == null) this.initialEnrolledAt = now;
    this.scheduleWakeTimer(cards, now);
    const receipts = this.computeReceipts(now);
    const result = { ...EMPTY_SNAPSHOT, generation: this.generation, phase: 'ready', cards, receipts, snoozeSettings:this.readSnoozeSettings() };
    this.stats = {
      buildCount: (this.stats?.buildCount ?? 0) + 1,
      lastBuildMs: performance.now() - buildStart,
      lastListMs: timings.listMs, lastTreeMs: timings.treeMs, lastMemberMs: timings.memberMs,
      lastRoots: cards.length, lastMembers: cards.reduce((total, card) => total + card.members.length, 0),
      lastRetired: timings.retired, lastTreeCalls: timings.treeCalls, lastTreeHits: timings.treeHits ?? 0, lastMemberCalls: timings.memberCalls,
      lastMemberErrors: timings.memberErrors, lastAt: Date.now(),
    };
    return result;
  }

  async refreshSessionCard(sessionId, signal) {
    if (this.refresh !== T3InboxService.prototype.refresh) return this.refresh();
    if (this.currentSnapshot?.phase !== 'ready' || !this.rootSummaries?.has(sessionId)) return this.refresh();
    this.refreshGatewayPendingSeeds();
    this.treeCache?.delete(sessionId);
    this.coldStateCache?.delete(sessionId);
    const updatedCard = await this.buildCard(this.rootSummaries.get(sessionId), createLimiter(2), null, null);
    if (signal?.aborted) return;
    const latestCards = this.currentSnapshot?.cards ?? [];
    const idx = latestCards.findIndex((item) => item.sessionId === sessionId);
    if (idx < 0) return this.refresh();
    if ((latestCards[idx]?.revision ?? 0) > updatedCard.revision) return;
    const existingCard = latestCards[idx];
    const now = Date.now();
    if (
      existingCard?.context
      && updatedCard.context
      && stable({ ...existingCard, context: null }) === stable({ ...updatedCard, context: null })
    ) {
      const verified = this.verifyContext(existingCard.context, sessionId, existingCard.revision);
      if (verified && verified.expiresAt > now + (CONTEXT_TTL / 2)) {
        updatedCard.context = existingCard.context;
      }
    }
    const cards = latestCards.slice();
    cards[idx] = updatedCard;
    this.scheduleWakeTimer(cards, now);
    const receipts = this.computeReceipts(now);
    const prevRev = this.currentSnapshot?.revision ?? 0;
    this.publishSnapshot({ ...this.currentSnapshot, cards, receipts, snoozeSettings: this.readSnoozeSettings() });
    if ((this.currentSnapshot?.revision ?? 0) !== prevRev) {
      this.snapshotMutationEpoch = (this.snapshotMutationEpoch ?? 0) + 1;
    }
  }

  async reclassifyCardInSnapshot(sessionId, savedRecord) {
    if (this.currentSnapshot?.phase !== 'ready' || !savedRecord) return this.refreshSessionCard(sessionId);
    const existingCards = this.currentSnapshot.cards ?? [];
    const idx = existingCards.findIndex((item) => item.sessionId === sessionId);
    if (idx < 0) return this.refreshSessionCard(sessionId);
    this.refreshGatewayPendingSeeds();
    const existingCard = existingCards[idx];
    const members = (existingCard.members ?? []).filter((member) => !member.retired || (
      comparePoint(member.progress?.latestResult, savedRecord.settledThrough?.[member.sessionId])
      || (member.pending?.length ?? 0) > 0
      || member.runtime?.running
    ));
    const pendingByMember = new Map(members.map((member) => [
      member.sessionId,
      member.retired ? (member.pending ?? []) : this.pendingFor(member, member.pendingInput),
    ]));
    const pending = [...pendingByMember.values()].flat();
    const complete = !existingCard.treeError && members.every((member) => member.progress && !member.error && member.runtime?.completeness === 'complete');
    const knownMembers = Object.fromEntries(members.filter((member) => member.progress && member.runtime).map((member) => [member.sessionId, cachedMember(member, pendingByMember.get(member.sessionId), this.generation)]));
    let effectiveRecord = savedRecord;
    if (stable(knownMembers) !== stable(savedRecord.knownMembers ?? {})) {
      effectiveRecord = await this.withInternalDomainWrite(() => this.domain.table('records').update(sessionId, (current) => (current ? { ...current, knownMembers } : current))) ?? savedRecord;
    }
    const runtime = {
      running: members.some((member) => member.runtime?.running),
      queue: members.every((member) => Array.isArray(member.runtime?.queue)) ? members.flatMap((member) => member.runtime.queue) : null,
      completeness: complete ? 'complete' : 'unavailable',
      startedAt: existingCard.runtime?.startedAt ?? null,
    };
    const now = Date.now();
    const progress = members[0]?.progress ?? existingCard.progress ?? null;
    const snoozeEffect = snoozeStatus(effectiveRecord.snooze, { members, pending }, now);
    const acknowledged = effectiveRecord.snooze?.wokeAcknowledged?.instanceId === effectiveRecord.snooze?.instanceId;
    const classification = classifyCard({
      enrolled: true,
      progress,
      members,
      settledThroughMap: effectiveRecord.settledThrough,
      settledThrough: effectiveRecord.settledThrough?.[sessionId] ?? null,
      settledAt: effectiveRecord.settledAt ?? null,
      settledOverride: effectiveRecord.settledOverride ?? null,
      createdAt: existingCard.createdAt ?? null,
      unsettledAt: effectiveRecord.unsettledAt ?? null,
      unreadAt: effectiveRecord.unreadAt ?? null,
      snoozeEffect: { ...snoozeEffect, woke: snoozeEffect.woke && !acknowledged },
      runtime,
      pending,
      now,
    });
    const nextCard = {
      ...existingCard,
      members,
      pending,
      runtime,
      progress,
      result: classification.result,
      revision: effectiveRecord.revision,
      settledThrough: effectiveRecord.settledThrough,
      settledAt: effectiveRecord.settledAt,
      settledOverride: effectiveRecord.settledOverride ?? null,
      unsettledAt: effectiveRecord.unsettledAt ?? null,
      snooze: effectiveRecord.snooze,
      snoozeEffect,
      unreadAt: effectiveRecord.unreadAt ?? null,
      ...classification,
    };
    nextCard.context = complete ? this.issueContext(nextCard, effectiveRecord) : null;
    if (!nextCard.context) { nextCard.canSettle = false; nextCard.canSnooze = false; }
    const latestCards = this.currentSnapshot.cards ?? [];
    const latestIdx = latestCards.findIndex((item) => item.sessionId === sessionId);
    if (latestIdx < 0) return this.refreshSessionCard(sessionId);
    const cards = latestCards.slice();
    cards[latestIdx] = nextCard;
    this.scheduleWakeTimer(cards, now);
    const receipts = this.computeReceipts(now);
    this.snapshotMutationEpoch = (this.snapshotMutationEpoch ?? 0) + 1;
    this.publishSnapshot({ ...this.currentSnapshot, cards, receipts, snoozeSettings: this.readSnoozeSettings() });
  }

  async snapshot(_request, _signal) {
    this.requireOwner();
    // Return the current snapshot immediately (including `phase: 'building'` during cold start)
    // so clients never time out or spam retry errors while the background scan builds; follow()
    // pushes `phase: 'ready'` as soon as it lands.
    if (this.refresh !== T3InboxService.prototype.refresh) {
      await this.refresh();
    } else if (this.currentSnapshot?.phase !== 'ready' && !this.disposed) {
      void this.refresh();
    }
    return clone(this.currentSnapshot);
  }

  readSnoozeSettings() {
    const raw = this.settingsDomain?.table('settings').get('snooze-presets');
    if (raw === undefined) return {revision:0,presets:clone(DEFAULT_PRESETS),error:null};
    const parsed = settingsRecord.safeParse(raw);
    if (!parsed.success) return {revision:0,presets:clone(DEFAULT_PRESETS),error:'Snooze options could not be read. Reset to defaults to repair them.'};
    return {...parsed.data,error:null};
  }

  async ensureSnoozeSettings() {
    if (this.settingsInitialization) return this.settingsInitialization;
    const table = this.settingsDomain.table('settings');
    if (table.get('snooze-presets') !== undefined) return;
    const initialization = table.put('snooze-presets',{revision:0,presets:clone(DEFAULT_PRESETS)});
    this.settingsInitialization = initialization;
    try { await initialization; } finally { if (this.settingsInitialization === initialization) this.settingsInitialization = null; }
  }

  async saveSnoozeSettings(request, signal) {
    this.requireOwner();
    const presets = presetsSchema.parse(request.presets);
    if (signal?.aborted) throw new Error('Cancelled');
    await this.ensureSnoozeSettings();
    if (signal?.aborted) throw new Error('Cancelled');
    let status = 'stale';
    await this.withInternalDomainWrite(() => this.settingsDomain.table('settings').update('snooze-presets', (raw) => {
      if (signal?.aborted) throw new Error('Cancelled');
      const parsed = raw === undefined ? null : settingsRecord.safeParse(raw);
      const revision = parsed?.success ? parsed.data.revision : 0;
      if (request.revision !== revision) return raw;
      status = 'committed';
      return {revision:revision+1,presets:clone(presets)};
    }));
    if (status === 'committed') {
      this.snapshotMutationEpoch = (this.snapshotMutationEpoch ?? 0) + 1;
      if (this.refresh !== T3InboxService.prototype.refresh || this.currentSnapshot?.phase !== 'ready') {
        await this.refresh();
      } else {
        this.publishSnapshot({ ...this.currentSnapshot, snoozeSettings: this.readSnoozeSettings() });
      }
    }
    return {status,settings:this.readSnoozeSettings()};
  }

  async *follow(_request, signal) {
    this.requireOwner();
    if (this.disposed || signal?.aborted) return;
    let queued = null;
    let wake = null;
    const listener = (snapshot) => { queued = snapshot; wake?.(); };
    this.followers.add(listener);
    const abort = () => { wake?.(); };
    signal.addEventListener('abort', abort);
    try {
      if (this.refresh !== T3InboxService.prototype.refresh) {
        await this.refresh();
      } else if (this.currentSnapshot?.phase !== 'ready' && !this.disposed) {
        void this.refresh();
      }
      if (this.disposed || signal?.aborted) return;
      queued = this.currentSnapshot;
      let lastRevision = -1;
      while (!signal.aborted && !this.disposed) {
        if (queued && queued.revision !== lastRevision) {
          const next = queued; queued = null; lastRevision = next.revision;
          yield clone(next);
          continue;
        }
        await new Promise((resolve) => { wake = resolve; });
        wake = null;
      }
    } finally {
      this.followers.delete(listener);
      signal.removeEventListener('abort', abort);
      wake?.();
    }
  }

  /**
   * Quietly obtain a writeContext for one session (T3-style: no user-facing cold state).
   * Activates via resolveAgent when the host has no context yet, then refreshes baseline.
   */
  async prepare(request, signal) {
    this.requireOwner();
    if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Status loading was cancelled', {});
    return this.prepareLimit(async () => {
      if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Status loading was cancelled', {});
      await this.refreshSessionCard(request.sessionId, signal);
      if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Status loading was cancelled', {});
      if (this.currentSnapshot.phase !== 'ready') return { status:'unavailable', message:'Session status could not be loaded.' };
      const card = this.currentSnapshot.cards.find((item) => item.sessionId === request.sessionId);
      if (!card) return { status:'not-found' };
      if (card.context && card.completeness === 'complete') return { status:'ready' };
      if (card.treeError || typeof this.ctx.sessionController.resolveAgent !== 'function') {
        return { status:'unavailable', message:'Session status could not be loaded.' };
      }
      const result = await this.ctx.sessionController.resolveAgent(request.sessionId);
      if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Status loading was cancelled', {});
      if (!result || result.error || !result.agent) return { status:'unavailable', message:'Session status could not be loaded.' };
      await this.refreshSessionCard(request.sessionId, signal);
      if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Status loading was cancelled', {});
      const refreshed = this.currentSnapshot.cards.find((item) => item.sessionId === request.sessionId);
      return this.currentSnapshot.phase === 'ready' && refreshed?.context && refreshed.completeness === 'complete'
        ? { status:'ready' }
        : { status:'unavailable', message:'Some session state is still unavailable.' };
    });
  }

  currentEffect(kind, card, metadata, operationId) {
    if (!card) return 'unchanged';
    if (kind === 'settle') {
      /* Settle is attention-only (T3): pending Input/Approval does not supersede. */
      if ((card.running && !card.needsYou) || card.completeness !== 'complete') return 'superseded';
      return pointsAfter(card.members, metadata.settledThrough) ? 'effective' : 'superseded';
    }
    if (kind === 'snooze') {
      if (metadata.snooze?.instanceId !== card.snooze?.instanceId) return 'superseded';
      if (card.snoozeEffect?.reason === 'pending') return 'temporarily-revealed';
      return card.snoozeEffect?.active ? 'effective' : 'superseded';
    }
    return 'effective';
  }

  async act(request, signal) {
    this.requireOwner();
    if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Inbox operation was cancelled', {});
    const hasSnapshotCard = this.currentSnapshot?.phase === 'ready'
      && this.currentSnapshot.cards?.some((item) => item.sessionId === request.sessionId);
    if (request.kind !== 'undo' || !hasSnapshotCard) {
      await this.refreshSessionCard(request.sessionId, signal);
      if (signal?.aborted) throw new RemoteError('gateway/cancelled', 'Inbox operation was cancelled', {});
    }
    const table = this.domain.table('records');
    const requestHash = hash(request);
    const existingMetadata = table.get(request.sessionId);
    if (!existingMetadata) return { status: 'not-found', operationId: request.operationId, revision: request.revision, effect: null };
    if (this.currentSnapshot.phase !== 'ready') return { status: 'unavailable', operationId: request.operationId, revision: existingMetadata.revision, effect: null };
    const existing = existingMetadata.operations.find((item) => item.id === request.operationId);
    if (existing) {
      if (existing.requestHash !== requestHash) return { status: 'stale', operationId: request.operationId, revision: existingMetadata.revision, effect: null, message: 'Operation id was already used for another request' };
      const card = this.currentSnapshot.cards.find((item) => item.sessionId === request.sessionId);
      return { status: existing.result, operationId: request.operationId, revision: existing.revision, effect: this.currentEffect(request.kind, card, existingMetadata, request.operationId), receipt: clone(existing.receipt) };
    }
    let outcome;
    const saved = await this.withInternalDomainWrite(() => table.update(request.sessionId, (current) => {
      if (signal?.aborted) { outcome = { status: 'cancelled' }; return current; }
      if (!current) { outcome = { status: 'not-found', effect: null }; return current; }
      const duplicate = current.operations.find((item) => item.id === request.operationId);
      if (duplicate) {
        if (duplicate.requestHash !== requestHash) {
          outcome = { status: 'stale', revision: current.revision, effect: null, message: 'Operation id was already used for another request' };
          return current;
        }
        outcome = { status: duplicate.result, revision: duplicate.revision, receipt: clone(duplicate.receipt) };
        return current;
      }
      if (request.revision !== current.revision) { outcome = { status: 'stale', effect: null, message: 'The Inbox record changed' }; return current; }
      const context = this.verifyContext(request.context, request.sessionId, request.revision);
      if (!context) { outcome = { status: 'stale', effect: null, message: 'The operation context expired or changed Host generation' }; return current; }
      const card = this.currentSnapshot.cards.find((item) => item.sessionId === request.sessionId);
      if (!card) { outcome = { status: 'not-found', effect: null }; return current; }
      const pinned = Boolean(this.ctx.workspaceRegistry?.pinnedSessionIds?.includes?.(request.sessionId));
      const archived = Boolean(this.ctx.workspaceRegistry?.archivedSessionIds?.includes?.(request.sessionId));
      if (request.kind === 'settle' && pinned) {
        outcome = { status: 'not-eligible', effect: null, message: 'Unpin this session before settling' };
        return current;
      }
      if ((request.kind === 'settle' || request.kind === 'snooze') && archived) {
        outcome = { status: 'not-eligible', effect: null, message: 'Archived sessions cannot be settled or snoozed' };
        return current;
      }
      if (!['restore', 'wake', 'ack-woke', 'undo', 'mark-unread', 'clear-unread'].includes(request.kind) && !card.context) { outcome = { status: 'unavailable', effect: null }; return current; }
      const before = { settledThrough: clone(current.settledThrough), settledAt: current.settledAt, settledOverride: current.settledOverride ?? null, unsettledAt: current.unsettledAt ?? null, snooze: clone(current.snooze), unreadAt: current.unreadAt ?? null };
      let settledThrough = current.settledThrough;
      let settledAt = current.settledAt;
      let settledOverride = current.settledOverride ?? null;
      let unsettledAt = current.unsettledAt ?? null;
      let snoozeState = current.snooze;
      let unreadAt = current.unreadAt ?? null;
      const now = Date.now();
      const requestedAt = finiteEpochMs(request.at);
      const mutationAt = requestedAt !== null && requestedAt <= 8_640_000_000_000_000 ? Math.trunc(requestedAt) : now;
      if (request.kind === 'settle') {
        if (!card.canSettle || !pointsAfter(card.members, context.results)) { outcome = { status: 'not-eligible', effect: null, message: 'Settle requires a complete idle tree' }; return current; }
        settledThrough = clone(context.results); settledAt = mutationAt; settledOverride = 'settled'; unsettledAt = null; snoozeState = null;
      } else if (request.kind === 'restore') {
        settledThrough = {}; settledAt = null; settledOverride = 'active'; unsettledAt = mutationAt; snoozeState = null;
      } else if (request.kind === 'snooze') {
        const until = Date.parse(request.until ?? '');
        if (!card.canSnooze || !Number.isFinite(until) || until <= now) { outcome = { status: 'not-eligible', effect: null, message: 'Snooze requires a complete baseline, future time, and identified ordinary questions only' }; return current; }
        snoozeState = {
          instanceId: randomUUID(), startedAt: now, until: new Date(until).toISOString(),
          failureBaseline: clone(context.failures), inputBaseline: clone(context.inputs),
          deferredQuestions: clone(context.pending.filter((item) => item.kind === 'question' && item.identity).map((item) => item.identity)),
          wokeAcknowledged: null,
        };
      } else if (request.kind === 'wake') {
        if (!snoozeState) { outcome = { status: 'not-eligible', effect: 'unchanged' }; return current; }
        snoozeState = null;
      } else if (request.kind === 'ack-woke') {
        if (!snoozeState || !card.snoozeEffect?.woke || snoozeState.wokeAcknowledged) { outcome = { status: 'not-eligible', effect: 'unchanged' }; return current; }
        snoozeState = { ...snoozeState, wokeAcknowledged: { instanceId: snoozeState.instanceId, at: now } };
      } else if (request.kind === 'mark-unread') {
        if (Object.keys(resultMap(card.members)).length === 0) {
          outcome = { status: 'not-eligible', effect: null, message: 'Session has no completed turn to mark unread' };
          return current;
        }
        unreadAt = now;
      } else if (request.kind === 'clear-unread') {
        unreadAt = null;
      } else if (request.kind === 'undo') {
        const target = current.operations.find((item) => item.id === request.targetOperationId);
        if (!target || (target.receipt.expiresAt + UNDO_GRACE_MS) <= now || target.receipt.revision !== current.revision) { outcome = { status: 'stale', effect: null, message: 'Undo is no longer valid' }; return current; }
        ({ settledThrough, settledAt, settledOverride = null, unsettledAt = null, snooze: snoozeState, unreadAt } = clone(target.receipt.before));
      }
      const committedAt = Date.now();
      const nextRevision = current.revision + 1;
      const receipt = { operationId: request.operationId, committedAt, expiresAt: committedAt + UNDO_TTL, revision: nextRevision, before };
      const operations = pruneOperations([...current.operations, {
        id: request.operationId, kind: request.kind, requestHash, committedAt,
        revision: nextRevision, result: 'committed', receipt,
      }], committedAt);
      if (!operations) { outcome = { status: 'unavailable', effect: null, message: 'Operation receipt capacity is full' }; return current; }
      outcome = { status: 'committed', revision: nextRevision, receipt };
      this.snapshotMutationEpoch = (this.snapshotMutationEpoch ?? 0) + 1;
      return { ...current, revision: nextRevision, settledThrough, settledAt, settledOverride, unsettledAt, snooze: snoozeState, unreadAt, operations };
    }));
    if (signal?.aborted || outcome?.status === 'cancelled') throw new RemoteError('gateway/cancelled', 'Inbox operation was cancelled', {});
    if (this.refresh !== T3InboxService.prototype.refresh) {
      await this.refresh();
    } else if (outcome?.status === 'committed') {
      await this.reclassifyCardInSnapshot(request.sessionId, saved);
    }
    const card = this.currentSnapshot.cards.find((item) => item.sessionId === request.sessionId);
    return {
      status: outcome?.status ?? 'unavailable', operationId: request.operationId,
      revision: outcome?.revision ?? saved?.revision ?? request.revision,
      effect: outcome?.status === 'committed' ? this.currentEffect(request.kind, card, saved, request.operationId) : outcome?.effect ?? null,
      message: outcome?.message, receipt: outcome?.receipt,
    };
  }

  async pin(request, _signal) {
    this.requireOwner();
    if (request.pinned) {
      await this.ctx.workspaceRegistry.pinSession(request.sessionId);
      const table = this.domain?.table?.('records');
      const existing = table?.get?.(request.sessionId);
      if (existing) {
        const snapCard = this.currentSnapshot?.cards?.find?.((item) => item.sessionId === request.sessionId);
        const wasSettled = snapCard?.section === 'settled'
          || existing.settledOverride === 'settled'
          || existing.settledAt != null
          || (!snapCard && existing.settledOverride !== 'active' && Object.keys(existing.settledThrough ?? {}).length > 0);
        const wasSnoozed = existing.snooze != null;
        if (wasSettled || wasSnoozed) {
          await this.withInternalDomainWrite(() => table.update(request.sessionId, (current) => {
            if (!current) return current;
            const now = Date.now();
            this.snapshotMutationEpoch = (this.snapshotMutationEpoch ?? 0) + 1;
            return {
              ...current,
              revision: current.revision + 1,
              ...(wasSettled ? { settledThrough: {}, settledAt: null, settledOverride: 'active', unsettledAt: now } : {}),
              snooze: null,
            };
          }));
        }
      }
    } else {
      await this.ctx.workspaceRegistry.unpinSession(request.sessionId);
    }
    if (this.refresh !== T3InboxService.prototype.refresh) {
      await this.refresh();
    } else {
      const recordNow = this.domain?.table?.('records')?.get?.(request.sessionId);
      if (recordNow) await this.reclassifyCardInSnapshot(request.sessionId, recordNow);
      else await this.refreshSessionCard(request.sessionId);
    }
    return { pinned: request.pinned };
  }
}
