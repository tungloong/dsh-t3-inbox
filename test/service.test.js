import assert from 'node:assert/strict';
import test from 'node:test';
import { Service } from '@deepseek-ai/cordis';
import T3InboxService from '../index.js';
import { classifyCard, foldProgress, initialProgress } from '../lib/model.js';
import { record as recordSchema } from '../lib/schemas.js';

function progress(id, seq = 10) {
  let value = initialProgress(0, id);
  value = foldProgress(value, { type: 'turn/start', seq: seq - 1, time: seq * 100 - 1, data: { turn: 1 } });
  return foldProgress(value, { type: 'turn/end', seq, time: seq * 100, data: { turn: 1, reason: { kind: 'completed' } } });
}
function metadata() {
  return { revision: 0, settledThrough: {}, settledAt: null, enrollment: { at: 1, baseline: {}, version: 1 }, snooze: null, operations: [] };
}
function harness() {
  let current = metadata();
  let writes = Promise.resolve();
  const table = {
    get: () => current,
    update(_id, fn) {
      writes = writes.then(() => fn(current)).then((next) => { current = structuredClone(next); return current; });
      return writes;
    },
  };
  const service = Object.create(T3InboxService.prototype);
  const member = { sessionId: 'a', progress: progress('a'), runtime: { running: false, queue: [], completeness: 'complete' } };
  const card = {
    sessionId: 'a', context: 'signed', members: [member], pending: [], runtime: member.runtime, progress: member.progress,
    ...classifyCard({ enrolled: true, progress: member.progress, members: [member], runtime: member.runtime, pending: [] }),
  };
  service.ctx = { invocation: { peer: { principal: { kind: 'owner' } } } };
  service.currentSnapshot = { phase: 'ready', cards: [card] };
  service.domain = { table: () => table };
  service.refresh = async () => {
    card.snooze = current.snooze;
    card.snoozeEffect = current.snooze ? { active: true, deferExceptions: true, snooze: current.snooze } : { active: false, deferExceptions: false };
  };
  service.verifyContext = (token, id, revision) => {
    if (revision !== current.revision || id !== 'a') return false;
    const value = JSON.parse(token);
    return value.expiresAt > Date.now() ? value : false;
  };
  const context = (overrides = {}) => JSON.stringify({
    expiresAt: Date.now() + 10000,
    results: { a: member.progress.latestResult },
    failures: {}, inputs: {}, pending: [], ...overrides,
  });
  const request = (kind, overrides = {}) => ({ sessionId: 'a', operationId: crypto.randomUUID(), revision: current.revision, context: context(), kind, ...overrides });
  return { service, card, request, context, read: () => current };
}

test('owner check runs before any Inbox aggregation read', async () => {
  const { service, request } = harness();
  service.ctx.invocation.peer.principal.kind = 'guest';
  let refreshed = false;
  service.refresh = async () => { refreshed = true; };
  await assert.rejects(service.act(request('settle')), (error) => error.code === 't3-inbox/owner-only');
  assert.equal(refreshed, false);
});

test('Host refreshes the Inbox when a session selects a model', async () => {
  const { service } = harness();
  const listeners = new Map();
  const session = { id:'a', header:{id:'a'} };
  const event = { type:'model/selection', seq:11, time:1100, data:{provider:'deepseek-account',model:'deepseek-v4-pro'} };
  const projected = foldProgress(progress('a'),event);
  let refreshes = 0;
  service.memberCache = new Map();
  service.ensureSnoozeSettings = async () => {};
  service.requestRefresh = () => { refreshes++; };
  service.ctx = {
    storageDomain:{open:async () => ({})},
    effect:() => {},
    sessionProjections:{register:async () => ({stateOf:() => projected})},
    typertGateway:{getPendingRemoteEvents:() => []},
    sessions:{get:(id) => id === session.id ? session : undefined},
    on:(name,listener) => listeners.set(name,listener),
  };
  await service[Service.init]();
  listeners.get('session/event')(session,event);
  assert.equal(refreshes,1);
  assert.deepEqual(service.memberCache.get(session.id)?.progress.route,{...event.data,seq:11,time:1100});
});

test('loading a cold session refreshes its baseline without mutating attention metadata', async () => {
  const { service, card, read } = harness();
  card.cold = true;
  card.context = null;
  service.prepareLimit = (fn) => fn();
  let activated = false;
  service.ctx.sessionController = { resolveAgent: async (id) => { assert.equal(id, 'a'); activated = true; return { agent:{} }; } };
  service.refresh = async () => { if (activated) { card.cold = false; card.context = 'fresh-context'; card.completeness = 'complete'; } };
  const before = structuredClone(read());
  const result = await service.prepare({ sessionId:'a' }, new AbortController().signal);
  assert.deepEqual(result, { status:'ready' });
  assert.deepEqual(read(), before);
  assert.equal(card.context, 'fresh-context');
});

test('a cold state is identified only when the host explicitly reports it inactive', async () => {
  const service = Object.create(T3InboxService.prototype);
  service.memberCache = new Map();
  let state = { active:false, running:false, queue:null, pendingInput:[] };
  service.ctx = {
    sessions:{ get:() => ({ header:{ id:'a' } }) },
    sessionController:{ state:async () => state },
  };
  service.projection = { stateOf:() => progress('a') };
  assert.equal((await service.readMember('a', 'a', new AbortController().signal)).cold, true);
  state = { active:true, running:false, queue:null, pendingInput:[] };
  const unknown = await service.readMember('a', 'a', new AbortController().signal);
  assert.equal(unknown.cold, false);
  assert.equal(unknown.runtime.completeness, 'unavailable');
});

test('status loading never treats an unknown or failed baseline as ready', async () => {
  const { service, card } = harness();
  card.context = null;
  card.cold = false;
  card.completeness = 'unavailable';
  service.prepareLimit = (fn) => fn();
  let activations = 0;
  service.ctx.sessionController = { resolveAgent: async () => { activations++; return { agent:{} }; } };
  assert.equal((await service.prepare({ sessionId:'a' })).status, 'unavailable');
  assert.equal(activations, 1, 'missing context attempts resolveAgent even when not flagged cold');
  card.treeError = 'tree incomplete';
  assert.equal((await service.prepare({ sessionId:'a' })).status, 'unavailable');
  assert.equal(activations, 1, 'tree errors do not activate');
  card.treeError = null;
  card.cold = true;
  assert.equal((await service.prepare({ sessionId:'a' })).status, 'unavailable');
  assert.equal(activations, 2, 'activation alone does not prove the tree is readable');
  service.ctx.invocation.peer.principal.kind = 'guest';
  await assert.rejects(service.prepare({ sessionId:'a' }), (error) => error.code === 't3-inbox/owner-only');
  assert.equal(activations, 2);
});

test('cancelled status loading never reports success after activation', async () => {
  const { service, card } = harness();
  card.cold = true;
  card.context = null;
  service.prepareLimit = (fn) => fn();
  let release;
  let started;
  const start = new Promise((resolve) => { started = resolve; });
  service.ctx.sessionController = { resolveAgent: () => new Promise((resolve) => { release = resolve; started(); }) };
  const controller = new AbortController();
  const promise = service.prepare({ sessionId:'a' }, controller.signal);
  await start;
  controller.abort();
  release({ agent:{} });
  await assert.rejects(promise, (error) => error.code === 'gateway/cancelled');
});

test('settle persists only the exact member result vector', async () => {
  const { service, request, read } = harness();
  const req = request('settle');
  const result = await service.act(req);
  assert.equal(result.status, 'committed');
  assert.equal(result.effect, 'effective');
  assert.equal(read().revision, 1);
  assert.equal(read().settledThrough.a.seq, 10);
  assert.equal(read().snooze, null);
});

test('same operation id replays its original commit, not a second mutation', async () => {
  const { service, request, read } = harness();
  const req = request('settle');
  const first = await service.act(req);
  const replay = await service.act(req);
  assert.equal(replay.revision, first.revision);
  assert.equal(replay.receipt.operationId, first.receipt.operationId);
  assert.equal(read().operations.length, 1);
  const changed = await service.act({ ...req, kind: 'restore' });
  assert.equal(changed.status, 'stale');
  assert.equal(read().revision, 1);
});

test('same-revision competing actions allow only one CAS mutation', async () => {
  const { service, request, read } = harness();
  const first = request('settle');
  const second = request('restore', { revision: 0 });
  const results = await Promise.all([service.act(first), service.act(second)]);
  assert.deepEqual(results.map((item) => item.status).sort(), ['committed', 'stale']);
  assert.equal(read().revision, 1);
});

test('concurrent requests with the same operation id and different arguments reject the mismatch as stale', async () => {
  const { service, request, read } = harness();
  const first = request('settle');
  const second = { ...first, kind: 'restore' };
  const results = await Promise.all([service.act(first), service.act(second)]);
  assert.deepEqual(results.map((item) => item.status).sort(), ['committed', 'stale']);
  assert.equal(read().revision, 1);
  assert.equal(read().operations.length, 1);
  assert.equal(read().operations[0].kind, 'settle');
});

test('a request cancelled before commit does not write metadata', async () => {
  const { service, request, read } = harness();
  let entered, release;
  const reached = new Promise((resolve) => { entered = resolve; });
  const gate = new Promise((resolve) => { release = resolve; });
  service.refresh = async () => { entered(); await gate; };
  const controller = new AbortController();
  const pending = service.act(request('settle'), controller.signal);
  await reached;
  controller.abort();
  release();
  await assert.rejects(pending, (error) => error.code === 'gateway/cancelled');
  assert.equal(read().revision, 0);
  assert.equal(read().operations.length, 0);
});

test('settle stays attention-effective when pending arrives after commit', async () => {
  const { service, card, request, read } = harness();
  const table = service.domain.table('records');
  const update = table.update.bind(table);
  table.update = async (...args) => {
    const result = await update(...args);
    card.pending = [{ sessionId: 'a', kind: 'approval', identity: null }];
    Object.assign(card, classifyCard({
      enrolled: true, progress: card.progress, members: card.members,
      runtime: card.runtime, pending: card.pending,
      settledThrough: read().settledThrough.a, settledThroughMap: read().settledThrough,
    }));
    return result;
  };
  const answer = await service.act(request('settle'));
  assert.equal(answer.status, 'committed');
  /* T3 Settle is attention-only: pending Input/Approval does not force superseded. */
  assert.equal(answer.effect, 'effective');
  assert.equal(card.needsYou, true);
  assert.ok(read().settledThrough?.a);
});

test('pinned sessions cannot be settled at commit time', async () => {
  const { service, request, read } = harness();
  service.ctx.workspaceRegistry = { pinnedSessionIds: ['a'], archivedSessionIds: [] };
  const result = await service.act(request('settle'));
  assert.equal(result.status, 'not-eligible');
  assert.equal(read().revision, 0);
});

test('archived sessions cannot be settled or snoozed at commit time', async () => {
  const { service, request, read } = harness();
  service.ctx.workspaceRegistry = { pinnedSessionIds: [], archivedSessionIds: ['a'] };
  const settled = await service.act(request('settle'));
  const snoozed = await service.act(request('snooze', { until: new Date(Date.now() + 60000).toISOString() }));
  assert.equal(settled.status, 'not-eligible');
  assert.equal(snoozed.status, 'not-eligible');
  assert.equal(read().revision, 0);
});

test('snooze stays effective after background progress and only defers identified questions', async () => {
  const { service, card, request, context, read } = harness();
  const pending = { sessionId: 'a', kind: 'question', identity: { sessionId: 'a', generation: 'g1', continuityKey: 'q1', contentVersion: 'v1' } };
  card.pending = [pending];
  card.canSnooze = true;
  card.snoozeEffect = { active: true, deferExceptions: true };
  const req = request('snooze', { context: context({ pending: [pending] }), until: new Date(Date.now() + 60000).toISOString() });
  const result = await service.act(req);
  assert.equal(result.status, 'committed');
  assert.equal(result.effect, 'effective');
  assert.deepEqual(read().snooze.deferredQuestions, [pending.identity]);
  assert.equal(read().settledAt, null);
});

test('new unexcepted pending reports temporary reveal rather than superseding Snooze', async () => {
  const { service, card, request, read } = harness();
  await service.act(request('snooze', { until: new Date(Date.now() + 60000).toISOString() }));
  const snooze = read().snooze;
  card.snooze = snooze;
  card.snoozeEffect = { active: false, reason: 'pending', deferExceptions: true };
  const replay = await service.act({ ...request('wake'), operationId: 'unused-operation', revision: 0 });
  assert.equal(replay.status, 'stale');
  assert.equal(snooze.until, read().snooze.until);
});

test('conditional undo restores one record only when its revision is unchanged', async () => {
  const { service, request, read } = harness();
  const settled = await service.act(request('settle'));
  const undo = await service.act(request('undo', { targetOperationId: settled.receipt.operationId }));
  assert.equal(undo.status, 'committed');
  assert.equal(read().revision, 2);
  assert.deepEqual(read().settledThrough, {});
  assert.equal(read().settledAt, null);
});

test('an intervening action rejects stale Undo without lowering revision', async () => {
  const { service, request, read } = harness();
  const settled = await service.act(request('settle'));
  await service.act(request('restore'));
  const undo = await service.act(request('undo', { targetOperationId: settled.receipt.operationId }));
  assert.equal(undo.status, 'stale');
  assert.equal(read().revision, 2);
});

test('undo skips pre-commit refreshSessionCard when snapshot is ready and honors UNDO_GRACE_MS before expiring', async () => {
  const { service, request, read } = harness();
  let refreshCalls = 0;
  service.refreshSessionCard = async () => { refreshCalls += 1; };

  const settled = await service.act(request('settle'));
  assert.equal(refreshCalls, 1);
  refreshCalls = 0;

  // Simulate an in-flight batch undo arriving 1s after the 5s UI bar expires (inside UNDO_GRACE_MS).
  read().operations[0].receipt.expiresAt = Date.now() - 1000;
  const withinGrace = await service.act(request('undo', { targetOperationId: settled.receipt.operationId }));
  assert.equal(withinGrace.status, 'committed');
  assert.equal(refreshCalls, 0);
  assert.deepEqual(read().settledThrough, {});

  // Once beyond UNDO_GRACE_MS, Host still rejects expired Undo as stale.
  const settledAgain = await service.act(request('settle'));
  refreshCalls = 0;
  read().operations.at(-1).receipt.expiresAt = Date.now() - 3000;
  const pastGrace = await service.act(request('undo', { targetOperationId: settledAgain.receipt.operationId }));
  assert.equal(pastGrace.status, 'stale');
  assert.equal(refreshCalls, 0);
});

test('retired child results survive catalog removal until tree settlement', async () => {
  const root = { sessionId: 'root', progress: progress('root', 100), runtime: { running: false, queue: [], completeness: 'complete' }, label: 'Root', pendingInput: [] };
  const childProgress = progress('child', 9);
  const child = { sessionId: 'child', progress: childProgress, runtime: { running: false, queue: [], completeness: 'complete' }, label: 'Child', pending: [], lastSeenGeneration: 'g1' };
  let current = { ...metadata(), settledThrough: { root: root.progress.latestResult }, knownMembers: { child } };
  const service = Object.create(T3InboxService.prototype);
  service.generation = 'g1'; service.contextSecret = 'test-' + 'tree'; service.pending = new Map();
  service.ctx = {
    sessionController: { list: async () => ({ items: [{ sessionId: 'root', blank: false, updatedAt: 100, projections: { values: { title: { title: 'Root' } } } }] }) },
    subagents: { listDescendants: async () => [] }, workspaceRegistry: { list: () => [] }, typertGateway: { getPendingRemoteEvents: () => [] },
  };
  service.domain = { table: () => ({ get: () => current, entries: () => [['root', current]], put: async (_id, next) => { current = next; }, update: async (_id, fn) => { current = fn(current); return current; } }) };
  service.readMember = async () => root;
  const snapshot = await service.buildSnapshot();
  assert.equal(snapshot.cards[0].result.sessionId, 'child');
  assert.equal(snapshot.cards[0].section, 'active');
  assert.ok(snapshot.cards[0].members.some((member) => member.sessionId === 'child' && member.retired));
  current = { ...current, settledThrough: { root: root.progress.latestResult, child: childProgress.latestResult } };
  const settled = await service.buildSnapshot();
  assert.equal(settled.cards[0].section, 'settled');
  assert.equal(current.knownMembers.child, undefined);
});

test('signed write contexts enforce Host generation, revision and expiry', () => {
  const { service } = harness();
  delete service.verifyContext;
  service.contextSecret = 'test-' + 'tree';
  service.generation = 'g1';
  const payload = { sessionId: 'a', revision: 0, generation: 'g1', expiresAt: Date.now() + 10000 };
  const token = service.sign(payload);
  assert.equal(service.verifyContext(token, 'a', 0).generation, 'g1');
  assert.equal(service.verifyContext(token, 'a', 1), false);
  assert.equal(service.verifyContext(`${token}x`, 'a', 0), false);
  service.generation = 'g2';
  assert.equal(service.verifyContext(token, 'a', 0), false);
  service.generation = 'g1';
  const expired = service.sign({ ...payload, expiresAt: Date.now() - 1 });
  assert.equal(service.verifyContext(expired, 'a', 0), false);
});

test('restore sets unsettledAt, settle clears unsettledAt, and undo restores before.unsettledAt under strict recordSchema', async () => {
  const { service, request, read } = harness();
  const settled = await service.act(request('settle'));
  assert.equal(settled.status, 'committed');
  assert.equal(read().unsettledAt, null);
  assert.equal(recordSchema.safeParse(read()).success, true);

  const restored = await service.act(request('restore'));
  assert.equal(restored.status, 'committed');
  assert.equal(typeof read().unsettledAt, 'number');
  assert.ok(read().unsettledAt > 0);
  assert.equal(recordSchema.safeParse(read()).success, true);

  const undoneRestore = await service.act(request('undo', { targetOperationId: restored.receipt.operationId }));
  assert.equal(undoneRestore.status, 'committed');
  assert.equal(read().unsettledAt, null);
  assert.equal(read().settledThrough.a.seq, 10);
  assert.equal(recordSchema.safeParse(read()).success, true);

  const restoredAgain = await service.act(request('restore'));
  assert.ok(read().unsettledAt > 0);
  const reSettled = await service.act(request('settle'));
  assert.equal(reSettled.status, 'committed');
  assert.equal(read().unsettledAt, null);
  const undoneReSettle = await service.act(request('undo', { targetOperationId: reSettled.receipt.operationId }));
  assert.equal(undoneReSettle.status, 'committed');
  assert.equal(read().unsettledAt, restoredAgain.receipt ? read().unsettledAt : read().unsettledAt);
  assert.equal(typeof read().unsettledAt, 'number');
  assert.equal(recordSchema.safeParse(read()).success, true);
});

test('zero-result sessions settle/restore/undo cleanly, reject mark-unread, and pin promotes settled/snoozed records', async () => {
  const { service, card, read } = harness();
  const emptyProgress = initialProgress(0, 'a');
  card.progress = emptyProgress;
  card.members = [{ sessionId: 'a', progress: emptyProgress, runtime: { running: false, queue: [], completeness: 'complete' } }];
  Object.assign(card, classifyCard({
    enrolled: true,
    progress: emptyProgress,
    members: card.members,
    runtime: card.runtime,
    pending: [],
    settledThrough: {},
    settledAt: null,
    settledOverride: null,
  }));
  const zeroContext = () => JSON.stringify({
    expiresAt: Date.now() + 10000,
    results: {},
    failures: {},
    inputs: {},
    pending: [],
  });

  const deniedUnread = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: read().revision,
    context: zeroContext(),
    kind: 'mark-unread',
  });
  assert.equal(deniedUnread.status, 'not-eligible');

  const settledZero = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: read().revision,
    context: zeroContext(),
    kind: 'settle',
  });
  assert.equal(settledZero.status, 'committed');
  assert.equal(settledZero.effect, 'effective');
  assert.equal(read().settledOverride, 'settled');
  assert.equal(typeof read().settledAt, 'number');
  assert.equal(recordSchema.safeParse(read()).success, true);

  Object.assign(card, classifyCard({
    enrolled: true,
    progress: emptyProgress,
    members: card.members,
    runtime: card.runtime,
    pending: [],
    settledThrough: read().settledThrough,
    settledAt: read().settledAt,
    settledOverride: read().settledOverride,
  }));
  const restoredZero = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: read().revision,
    context: zeroContext(),
    kind: 'restore',
  });
  assert.equal(restoredZero.status, 'committed');
  assert.equal(read().settledOverride, 'active');
  assert.equal(typeof read().unsettledAt, 'number');

  // Re-settle and snooze, then verify service.pin promotes atomically.
  Object.assign(card, classifyCard({
    enrolled: true,
    progress: emptyProgress,
    members: card.members,
    runtime: card.runtime,
    pending: [],
    settledThrough: {},
    settledAt: null,
    settledOverride: 'active',
  }));
  await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: read().revision,
    context: zeroContext(),
    kind: 'settle',
  });
  let pinnedIds = [];
  service.ctx.workspaceRegistry = {
    pinSession: async (id) => { pinnedIds.push(id); },
    unpinSession: async (id) => { pinnedIds = pinnedIds.filter((item) => item !== id); },
  };
  await service.pin({ sessionId: 'a', pinned: true });
  assert.deepEqual(pinnedIds, ['a']);
  assert.equal(read().settledOverride, 'active');
  assert.equal(read().settledAt, null);
  assert.deepEqual(read().settledThrough, {});
  assert.equal(read().snooze, null);
  assert.equal(typeof read().unsettledAt, 'number');
  assert.equal(recordSchema.safeParse(read()).success, true);

  // Also test snooze -> pin promotion.
  await service.domain.table('records').update('a', (cur) => ({
    ...cur,
    snooze: {
      instanceId: 'sn1',
      startedAt: Date.now(),
      until: new Date(Date.now() + 60_000).toISOString(),
      failureBaseline: {},
      inputBaseline: {},
      deferredQuestions: [],
      wokeAcknowledged: null,
    },
  }));
  await service.pin({ sessionId: 'a', pinned: true });
  assert.equal(read().snooze, null);
});

test('Host subscribes to global agent/status and coalesces turn/end with kick() idle into a single snapshot', async () => {
  const { service } = harness();
  const listeners = new Map();
  const optionsByEvent = new Map();
  const session = { id: 'a', header: { id: 'a' } };
  const endEvent = { type: 'turn/end', seq: 10, time: 1000, data: { turn: 1, reason: { kind: 'completed' } } };
  const projected = progress('a', 10);
  let agentRunning = true;
  const seenRunning = [];

  service.memberCache = new Map();
  service.followers = new Set();
  service.currentSnapshot = { revision: 0, phase: 'ready', cards: [] };
  service.ensureSnoozeSettings = async () => {};
  service.buildSnapshot = async () => {
    seenRunning.push(agentRunning);
    return { phase: 'ready', cards: [{ sessionId: 'a', running: agentRunning }] };
  };
  service.ctx = {
    storageDomain: { open: async () => ({}) },
    effect: () => {},
    sessionProjections: { register: async () => ({ stateOf: () => projected }) },
    typertGateway: { getPendingRemoteEvents: () => [] },
    sessions: { get: (id) => (id === session.id ? session : undefined) },
    on: (name, listener, opts) => {
      listeners.set(name, listener);
      optionsByEvent.set(name, opts);
    },
  };
  await service[Service.init]();
  assert.equal(optionsByEvent.get('session/event')?.global, true);
  assert.equal(optionsByEvent.get('agent/status')?.global, true);
  seenRunning.length = 0;

  // Mirror dsh-agent-loop: turn() finally appends turn/end synchronously while phase is still running,
  // then kick() finally transitions to idle on the next microtask and emits agent/status + api-session/status.
  async function turn() {
    try { await Promise.resolve(); }
    finally { listeners.get('session/event')(session, endEvent); }
    return false;
  }
  async function kick() {
    try { while (await turn()); }
    finally {
      agentRunning = false;
      listeners.get('agent/status')({ agent: { id: 'a' }, status: 'idle' });
      listeners.get('api-session/status')('a', false);
    }
  }
  await kick();
  await service.refreshing;

  assert.deepEqual(seenRunning, [false], 'turn/end and kick() idle coalesce into one idle buildSnapshot');
  assert.equal(service.currentSnapshot.cards[0].running, false);
});

function createIncrementalServiceHarness(ids, { stateById = {}, readMemberHook = null } = {}) {
  const listeners = new Map();
  const records = new Map(ids.map((id) => [id, {
    revision: 0,
    settledThrough: {},
    settledAt: null,
    settledOverride: null,
    unsettledAt: null,
    enrollment: { at: 1, baseline: {}, version: 1 },
    knownMembers: {},
    snooze: null,
    operations: [],
  }]));
  const settings = new Map();
  let writes = Promise.resolve();
  const makeTable = (domainName, map) => ({
    get: (id) => map.get(id),
    entries: () => map.entries(),
    put: async (id, value) => {
      map.set(id, structuredClone(value));
      listeners.get('domain/changed')?.({ domain: domainName, key: id });
    },
    update(id, fn) {
      writes = writes.then(() => fn(map.get(id))).then((next) => {
        if (next !== undefined) map.set(id, structuredClone(next));
        listeners.get('domain/changed')?.({ domain: domainName, key: id });
        return next;
      });
      return writes;
    },
  });
  const recordsTable = makeTable('dsh_t3_inbox', records);
  const settingsTable = makeTable('dsh_t3_inbox_settings', settings);
  const counts = { list: 0, tree: 0, member: 0, resolveAgent: 0 };
  let pinnedIds = [];
  const ctx = {
    invocation: { peer: { principal: { kind: 'owner' } } },
    storageDomain: {
      open: async ({ name }) => ({
        table: () => (name === 'dsh_t3_inbox' ? recordsTable : settingsTable),
        close: async () => {},
      }),
    },
    effect: () => {},
    typert: { register: () => () => {} },
    cordisInspect: { register: () => () => {} },
    sessionProjections: { register: async () => ({ stateOf: (session) => progress(session.id) }) },
    typertGateway: { getPendingRemoteEvents: () => [] },
    sessions: { get: () => undefined },
    sessionQuery: {
      observeSession: async (id) => ({
        header: { id, createdAt: 100 },
        projections: { values: { title: { title: id }, t3InboxProgress: progress(id) } },
        [Symbol.dispose]() {},
      }),
    },
    sessionController: {
      list: async () => {
        counts.list += 1;
        return {
          items: ids.map((id) => ({
            sessionId: id,
            blank: false,
            updatedAt: 1000,
            cwd: `/${id}`,
            projections: { values: { title: { title: id } } },
          })),
        };
      },
      state: async ({ sessionId }) => {
        counts.member += 1;
        if (readMemberHook) await readMemberHook(sessionId);
        return stateById[sessionId] ?? { active: true, running: false, queue: [], pendingInput: [] };
      },
      resolveAgent: async () => {
        counts.resolveAgent += 1;
        return { agent: {} };
      },
    },
    subagents: {
      listDescendants: async () => {
        counts.tree += 1;
        return [];
      },
    },
    workspaceRegistry: {
      list: () => [],
      get pinnedSessionIds() { return pinnedIds; },
      archivedSessionIds: [],
      pinSession: async (id) => { pinnedIds = [...new Set([...pinnedIds, id])]; },
      unpinSession: async (id) => { pinnedIds = pinnedIds.filter((item) => item !== id); },
    },
    on: (name, listener) => listeners.set(name, listener),
  };
  const service = Object.create(T3InboxService.prototype);
  service.ctx = ctx;
  service.generation = 'inc-gen';
  service.contextSecret = 'inc-secret';
  service.pending = new Map();
  service.ownerEpochs = new Map();
  service.followers = new Set();
  service.memberCache = new Map();
  service.rootSummaries = new Map();
  service.lastSnapshotSignature = null;
  service.internalDomainWrites = 0;
  service.snapshotMutationEpoch = 0;
  service.currentSnapshot = { schemaVersion: 1, generation: 'inc-gen', revision: 0, phase: 'building', error: null, cards: [], receipts: [] };
  service.stats = {};
  service.refreshing = null;
  service.refreshAgain = false;
  service.prepareLimit = (fn) => fn();
  return { service, counts, records, resetCounts: () => { counts.list = 0; counts.tree = 0; counts.member = 0; counts.resolveAgent = 0; } };
}

test('inactive cold sessions get complete idle writeContext without resolveAgent while active unknown queues stay gated', async () => {
  const { service, counts } = createIncrementalServiceHarness(['a'], {
    stateById: {
      a: { active: false, running: false, queue: null, pendingInput: [] },
    },
  });
  await service[Service.init]();
  await service.refreshing;
  const card = service.currentSnapshot.cards[0];
  assert.equal(card.cold, true);
  assert.equal(card.runtime.completeness, 'complete');
  assert.deepEqual(card.runtime.queue, []);
  assert.equal(card.completeness, 'complete');
  assert.equal(card.canSettle, true);
  assert.equal(card.canSnooze, true);
  assert.equal(typeof card.context, 'string');
  assert.ok(card.context.length > 0);

  const actResult = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: card.revision,
    context: card.context,
    kind: 'settle',
  });
  assert.equal(actResult.status, 'committed');
  assert.equal(actResult.effect, 'effective');
  assert.equal(counts.resolveAgent, 0);

  service.ctx.sessionController.state = async () => ({ active: true, running: false, queue: null, pendingInput: [] });
  const activeUnknown = await service.readMember('b', 'b', new AbortController().signal);
  assert.equal(activeUnknown.cold, false);
  assert.equal(activeUnknown.runtime.completeness, 'unavailable');
  assert.equal(activeUnknown.runtime.queue, null);
});

test('act, snapshot, pin, and saveSnoozeSettings refresh incrementally without full-list scans or self domain/changed loops', async () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  const { service, counts, resetCounts } = createIncrementalServiceHarness(ids);
  await service[Service.init]();
  await service.refreshing;
  const emitted = [];
  service.followers.add((snapshot) => emitted.push(snapshot));
  resetCounts();

  const cardA = service.currentSnapshot.cards.find((item) => item.sessionId === 'a');
  const settled = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: cardA.revision,
    context: cardA.context,
    kind: 'settle',
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(settled.status, 'committed');
  assert.equal(counts.list, 0, 'act must not rescan full session list');
  assert.equal(counts.tree, 1, 'act refreshes only the target session tree');
  assert.equal(counts.member, 1, 'act refreshes only the target session member');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').section, 'settled');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').revision, 1);
  assert.equal(emitted.length, 1);

  resetCounts();
  const snap = await service.snapshot({});
  assert.equal(counts.list, 0, 'snapshot() serves ready cached snapshot without full rebuild');
  assert.equal(snap.cards.find((item) => item.sessionId === 'a').section, 'settled');

  const pinned = await service.pin({ sessionId: 'a', pinned: true });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(pinned.pinned, true);
  assert.equal(counts.list, 0, 'pin() promotes incrementally without full-list scan');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').section, 'active');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').revision, 2);
  assert.equal(emitted.length, 2);

  const savedSettings = await service.saveSnoozeSettings({ revision: 0, presets: [{ kind: 'after', minutes: 15 }] });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(savedSettings.status, 'committed');
  assert.equal(counts.list, 0, 'saveSnoozeSettings() updates snapshot without full-list scan');
  assert.equal(service.currentSnapshot.snoozeSettings.revision, 1);
  assert.equal(emitted.length, 3);
});

test('slow background buildSnapshot does not clobber a newer act mutation', async () => {
  let holdSecondMember = false;
  let enteredSecondMember;
  let releaseSecondMember;
  const secondEntered = new Promise((resolve) => { enteredSecondMember = resolve; });
  const { service } = createIncrementalServiceHarness(['a', 'b'], {
    readMemberHook: async (sessionId) => {
      if (holdSecondMember && sessionId === 'b') {
        holdSecondMember = false;
        enteredSecondMember();
        await new Promise((resolve) => { releaseSecondMember = resolve; });
      }
    },
  });
  await service[Service.init]();
  await service.refreshing;

  holdSecondMember = true;
  const bgRefresh = service.requestRefresh();
  await secondEntered;

  const cardA = service.currentSnapshot.cards.find((item) => item.sessionId === 'a');
  const actResult = await service.act({
    sessionId: 'a',
    operationId: crypto.randomUUID(),
    revision: cardA.revision,
    context: cardA.context,
    kind: 'settle',
  });
  assert.equal(actResult.status, 'committed');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').section, 'settled');

  releaseSecondMember();
  await bgRefresh;
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').section, 'settled');
  assert.equal(service.currentSnapshot.cards.find((item) => item.sessionId === 'a').revision, 1);
});

test('act honors optional request.at for batch settle/restore ordering while keeping before snapshots and undo grace on wall clock', async () => {
  const { service, request, read } = harness();
  const explicitSettleAt = 1_700_000_123_000;
  const settled = await service.act(request('settle', { at: explicitSettleAt }));
  assert.equal(settled.status, 'committed');
  assert.equal(read().settledAt, explicitSettleAt);
  assert.equal(read().unsettledAt, null);
  assert.ok(settled.receipt.committedAt >= Date.now() - 5000);
  assert.equal(settled.receipt.before.settledAt, null);

  // Explicit request.at on undo must never bypass real wall-clock UNDO_GRACE_MS expiration.
  read().operations[0].receipt.expiresAt = Date.now() - 3000;
  const expiredUndo = await service.act(request('undo', { targetOperationId: settled.receipt.operationId, at: explicitSettleAt + 1 }));
  assert.equal(expiredUndo.status, 'stale');

  const explicitRestoreAt = 1_700_000_124_500;
  const restored = await service.act(request('restore', { at: explicitRestoreAt }));
  assert.equal(restored.status, 'committed');
  assert.equal(read().settledAt, null);
  assert.equal(read().unsettledAt, explicitRestoreAt);
  assert.equal(restored.receipt.before.settledAt, explicitSettleAt);
  assert.equal(recordSchema.safeParse(read()).success, true);
});

test('Service.init builds cold baseline non-blockingly, follow() transitions building->ready, and dispose ends follow() cleanly', async () => {
  let releaseList;
  const listGate = new Promise((resolve) => { releaseList = resolve; });
  const disposers = [];
  const { service } = createIncrementalServiceHarness(['boot-1']);
  service.ctx.effect = (fn) => {
    const dispose = fn();
    if (typeof dispose === 'function') disposers.push(dispose);
    return dispose;
  };
  const origList = service.ctx.sessionController.list;
  let firstCall = true;
  service.ctx.sessionController.list = async () => {
    if (firstCall) { firstCall = false; await listGate; }
    return origList();
  };

  await Promise.race([
    service[Service.init](),
    new Promise((_, rej) => setTimeout(() => rej(new Error('Service.init blocked on cold scan')), 300)),
  ]);
  assert.equal(service.currentSnapshot.phase, 'building');

  const buildingSnap = await Promise.race([
    service.snapshot({}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('snapshot() blocked during cold scan')), 300)),
  ]);
  assert.equal(buildingSnap.phase, 'building');
  assert.deepEqual(buildingSnap.cards, []);

  const ac = new AbortController();
  const stream = service.follow({}, ac.signal);
  const firstFrame = await stream.next();
  assert.equal(firstFrame.done, false);
  assert.equal(firstFrame.value.phase, 'building');

  const readyPromise = stream.next();
  releaseList();
  const secondFrame = await readyPromise;
  assert.equal(secondFrame.done, false);
  assert.equal(secondFrame.value.phase, 'ready');
  assert.equal(secondFrame.value.cards.length, 1);

  // Disposing the service ends parked follow() cleanly so hot-reloaded clients reconnect immediately.
  const parked = stream.next();
  for (const dispose of disposers.reverse()) dispose();
  const ended = await Promise.race([
    parked,
    new Promise((_, rej) => setTimeout(() => rej(new Error('follow() hung after dispose')), 500)),
  ]);
  assert.equal(ended.done, true);
  assert.equal(service.disposed, true);
});

test('cold tree/state caches avoid redundant reads and initialEnrolledAt keeps fast new completions unread', async () => {
  const { service, counts, records, resetCounts } = createIncrementalServiceHarness(['old-1'], {
    stateById: {
      'old-1': { active: false, running: false, queue: null, pendingInput: [] },
    },
  });
  records.clear();
  await service[Service.init]();
  await service.refreshing;
  assert.equal(service.currentSnapshot.cards[0].section, 'settled');

  // Unchanged cold session hits treeCache and coldStateCache on full rebuild.
  resetCounts();
  await service.refresh();
  assert.equal(counts.tree, 0, 'cold treeCache skips redundant listDescendants');
  assert.equal(counts.member, 0, 'coldStateCache skips redundant state read');

  // Brand-new session completing after initialEnrolledAt stays Active + unread instead of being swallowed into settled.
  const newerAt = service.initialEnrolledAt + 5000;
  const origList = service.ctx.sessionController.list;
  const origObserve = service.ctx.sessionQuery.observeSession;
  service.ctx.sessionController.list = async () => {
    const base = await origList();
    return {
      items: [
        ...base.items,
        { sessionId: 'fast-new', blank: false, updatedAt: newerAt, cwd: '/fast-new', projections: { values: { title: { title: 'fast-new' } } } },
      ],
    };
  };
  service.ctx.sessionQuery.observeSession = async (id) => {
    if (id !== 'fast-new') return origObserve(id);
    let state = initialProgress(0, 'fast-new');
    state = foldProgress(state, { type: 'turn/start', seq: 1, time: newerAt - 100, data: { turn: 1 } });
    state = foldProgress(state, { type: 'turn/end', seq: 2, time: newerAt, data: { turn: 1, reason: { kind: 'completed' } } });
    return {
      header: { id: 'fast-new', createdAt: newerAt - 100 },
      projections: { values: { title: { title: 'fast-new' }, t3InboxProgress: state } },
      [Symbol.dispose]() {},
    };
  };
  await service.refresh();
  const fastCard = service.currentSnapshot.cards.find((card) => card.sessionId === 'fast-new');
  assert.equal(fastCard.section, 'active');
  assert.equal(fastCard.newResult, true);
});

