export const PROJECTION_VERSION = 4;

export function initialProgress(inheritedEventCount = 0, sessionId = '') {
  return {
    sessionId,
    inheritedEventCount,
    latestWork: null,
    latestResult: null,
    latestFailure: null,
    latestHumanInput: null,
    turn: null,
    route: null,
    providerHistory: [],
  };
}

function point(event, extra = {}) {
  return { seq: event.seq, time: event.time, sessionId: event.sessionId ?? '', ...extra };
}

export function isFailureReason(reason) {
  return reason?.kind === 'error' || reason?.kind === 'max-tokens' || reason?.kind === 'blocked';
}

export function humanMessageSource(data) {
  const source = data?.source;
  if (!source || typeof source !== 'object') return false;
  if (source.kind !== 'user' && source.kind !== 'user-rpc') return false;
  return !source.principal || source.principal.kind === 'owner';
}

/** Pure log fold. Fork-inherited events do not count as this branch's progress. */
export function foldProgress(state, event) {
  if (!event || event.seq < state.inheritedEventCount) return state;
  if (event.type === 'turn/start') {
    const work = point(event, { sessionId: state.sessionId, kind: 'turn-start', turn: event.data?.turn });
    return { ...state, latestWork: work, turn: { start: work, end: null } };
  }
  if (event.type === 'turn/end') {
    const reason = event.data?.reason;
    const result = point(event, { sessionId: state.sessionId, kind: 'turn-end', turn: event.data?.turn, reason });
    const next = {
      ...state,
      latestWork: result,
      latestResult: result,
      turn: state.turn?.start?.turn === event.data?.turn
        ? { start: state.turn.start, end: result }
        : { start: null, end: result },
    };
    if (isFailureReason(reason)) next.latestFailure = result;
    return next;
  }
  if (event.type === 'model/selection' || event.type === 'request/context' || event.type === 'request/header') {
    const config = event.type === 'request/header' ? event.data?.header?.config : event.data;
    const provider = typeof config?.provider === 'string' ? config.provider : null;
    const model = typeof config?.model === 'string' ? config.model : null;
    if (!provider && !model) return state;
    let providerHistory = state.providerHistory ?? [];
    // T3 history includes this thread's used provider instances, in first-use order.
    // Merely selecting a model must not manufacture a historical provider.
    if (provider && event.type !== 'model/selection') {
      const index = providerHistory.findIndex((item) => item.provider === provider);
      if (index < 0) providerHistory = [...providerHistory, { provider, model }];
      else if (providerHistory[index].model !== model) {
        providerHistory = providerHistory.map((item, i) => i === index ? { provider, model } : item);
      }
    }
    if (state.route?.provider === provider && state.route?.model === model && providerHistory === state.providerHistory) return state;
    return { ...state, providerHistory, route: { provider, model, seq: event.seq, time: event.time } };
  }
  if (event.type === 'user/message' && humanMessageSource(event.data)) {
    const input = point(event, { sessionId: state.sessionId, kind: 'human-input', messageId: event.data?.id });
    return { ...state, latestHumanInput: input, latestWork: input };
  }
  return state;
}

export function projectionView(state) {
  return {
    sessionId: state.sessionId,
    inheritedEventCount: state.inheritedEventCount,
    latestWork: state.latestWork,
    latestResult: state.latestResult,
    latestFailure: state.latestFailure,
    latestHumanInput: state.latestHumanInput,
    turn: state.turn,
    route: state.route ?? null,
    providerHistory: state.providerHistory ?? [],
  };
}

export function comparePoint(current, baseline) {
  if (!baseline) return Boolean(current);
  if (!current) return false;
  if (current.sessionId && baseline.sessionId && current.sessionId !== baseline.sessionId) return true;
  return current.seq > baseline.seq;
}

export function hasUnacknowledgedResult(progress, settledThrough) {
  return comparePoint(progress?.latestResult, settledThrough);
}

export function isPendingSnoozeException(pending, snooze) {
  if (pending?.kind !== 'question' || !snooze?.deferredQuestions) return false;
  const identity = pending.identity;
  if (!identity?.continuityKey || !identity.contentVersion) return false;
  return snooze.deferredQuestions.some((saved) =>
    saved.sessionId === identity.sessionId &&
    saved.continuityKey === identity.continuityKey &&
    saved.contentVersion === identity.contentVersion &&
    saved.generation === identity.generation);
}

export function pendingAttention(pending, snooze) {
  return (pending ?? []).filter((item) => !isPendingSnoozeException(item, snooze));
}

export function snoozeStatus(snooze, facts, now) {
  if (!snooze) return { active: false, woke: false, deferExceptions: false, snooze: null };
  const failures = (facts.members ?? []).map((member) => member.progress?.latestFailure).filter(Boolean);
  const inputs = (facts.members ?? []).map((member) => member.progress?.latestHumanInput).filter(Boolean);
  const newFailure = failures.some((item) => comparePoint(item, snooze.failureBaseline?.[item.sessionId] ?? null));
  const newInput = inputs.some((item) => comparePoint(item, snooze.inputBaseline?.[item.sessionId] ?? null));
  const visiblePending = pendingAttention(facts.pending, snooze);
  if (newFailure) return { active: false, woke: true, reason: 'failure', deferExceptions: false, snooze };
  if (newInput) return { active: false, woke: true, reason: 'human-input', deferExceptions: false, snooze };
  if (!(Date.parse(snooze.until) > now)) return { active: false, woke: true, reason: 'expired', deferExceptions: false, snooze };
  if (visiblePending.length) return { active: false, woke: false, reason: 'pending', deferExceptions: true, snooze };
  return { active: true, woke: false, deferExceptions: true, snooze };
}

export function hasCompletedTurn(card) {
  if (!card || typeof card !== 'object') return false;
  if (card.result || card.progress?.latestResult) return true;
  return (card.members ?? []).some((member) => Boolean(member?.progress?.latestResult));
}

export function classifyCard({ enrolled, progress, settledThrough, settledThroughMap, settledAt = null, settledOverride = null, members, snoozeEffect, runtime, pending, now, unreadAt = null, createdAt = null, unsettledAt = null }) {
  const membersComplete = (members ?? []).every((member) => member.runtime?.completeness === 'complete' && Array.isArray(member.runtime?.queue));
  const complete = runtime?.completeness === 'complete' && Array.isArray(runtime?.queue) && membersComplete;
  const attention = pendingAttention(pending, snoozeEffect?.deferExceptions ? snoozeEffect.snooze : null);
  const needsYou = attention.length > 0;
  const tree = members ?? [{ progress, runtime }];
  const unacknowledged = tree.filter((member) => hasUnacknowledgedResult(member.progress, settledThroughMap?.[member.sessionId ?? member.progress?.sessionId] ?? (member.sessionId || member.progress?.sessionId ? undefined : settledThrough)));
  const hasUnacknowledged = unacknowledged.length > 0;
  const result = unacknowledged.map((member) => member.progress?.latestResult).filter(Boolean).sort((a,b) => b.time - a.time)[0] ?? null;
  const latestTurnActivity = tree.reduce((max, member) => Math.max(
    max,
    member.progress?.latestHumanInput?.time ?? 0,
    member.progress?.latestResult?.time ?? 0,
  ), 0);
  const manualUnread = Boolean(unreadAt && !(latestTurnActivity > unreadAt));
  const newResult = hasUnacknowledged || manualUnread;
  const displayProgress = result ? { ...progress, latestResult: result } : progress;
  const isMemberRunning = (member) => Boolean(
    member?.runtime?.running
    || member?.runtime?.queue?.length
    || (member?.progress?.turn && !member.progress.turn.end),
  );
  const rootRunning = isMemberRunning(tree[0]);
  const childRunning = tree.slice(1).some(isMemberRunning);
  const running = rootRunning || childRunning;
  const waiting = !rootRunning && childRunning && !needsYou;
  const snoozed = Boolean(snoozeEffect?.active && !needsYou);
  const woke = Boolean(snoozeEffect?.woke);
  /* T3 Settle is attention-only: pending Input does not block Settled shelf or canSettle,
     and Mark unread never pulls a Settled thread back into Active. */
  const settled = !hasUnacknowledged && !running && settledOverride !== 'active'
    && (settledOverride === 'settled' || settledAt != null || Boolean(settledThrough && typeof settledThrough.seq === 'number'));
  let section = 'active';
  if (snoozed) section = 'snoozed';
  else if (settled) section = 'settled';
  // T3 Working shelf is driven by isThreadWorking, independent of unread/Done or prior Woke.
  else if (running && !needsYou) section = 'working';
  const sortAt = section === 'working'
    ? workingSortTimestamp({ createdAt, progress: displayProgress, members })
    : inboxSortTimestamp({ createdAt, unsettledAt, progress: displayProgress, members, result });
  return {
    section,
    needsYou,
    newResult, manualUnread, unreadAt,
    running,
    waiting,
    snoozed,
    woke,
    /* Pending Input may keep runtime.running true while waiting; T3 still allows Settle,
       including zero-result idle sessions via settledOverride. */
    canSettle: Boolean(enrolled && progress && complete && !settled && (!running || needsYou)),
    /* T3 canSnooze: allow user_input; block approvals / other; queue OK while needsYou.
       Null-identity questions still snooze (deferredQuestions stays empty); identity only
       gates wake-exception matching, not the button. */
    canSnooze: Boolean(enrolled && progress && complete
      && (!runtime.queue?.length || needsYou)
      && !(pending ?? []).some((item) => item.kind === 'approval' || item.kind === 'other')),
    completeness: complete ? 'complete' : runtime?.completeness ?? 'unavailable',
    result,
    sortAt,
    pendingCount: attention.length,
  };
}

/**
 * Top-right status aligned with T3 `resolveSidebarThreadStatus` → `topStatus`:
 * Approval → Input → (Snoozed: null) → Working → Failed → Limited → Woke → Done → null (relative time).
 * `unread` must be the Client visited watermark (runtime.isUnread), not raw
 * `card.newResult`. Host cold/incomplete never paints a status chip.
 */
export function isCardActivelyWorking(card) {
  return Boolean(
    card?.running
    || (card?.section === 'working' && card?.running !== false && !card?.workingGrace),
  );
}

export function deriveCardStatus(card, unread = card.newResult) {
  const reason = card.result?.reason?.kind;
  const failed = reason === 'error' || reason === 'blocked';
  const limited = reason === 'max-tokens';
  if (card.needsYou) {
    const pendingKinds = new Set((card.pending ?? []).map((item) => item.kind));
    const approval = pendingKinds.has('approval');
    return { icon: approval ? 'shield' : 'message', label: approval ? 'approval' : 'needsYou', tone: approval ? 'approval' : 'input' };
  }
  /* T3 snoozed rows paint snoozeWakeLabel, not Working — even if runtime still looks running. */
  if ((card.snoozed || card.section === 'snoozed') && !card.woke) return null;
  /* Active work overrides a stale failed/limited result or prior woke state. */
  if (card.waiting) return { icon: 'dotdashed', label: 'waiting', tone: 'waiting' };
  if (isCardActivelyWorking(card)) return { icon: 'dashed', label: 'working', tone: 'working' };
  if (failed || card.treeError) return { icon: 'alert', label: 'failed', tone: 'failed' };
  /* T3: usage_limit / max-tokens → Limited (warning), not Failed (error). */
  if (limited) return { icon: 'alert', label: 'limited', tone: 'limited' };
  if (card.woke) return { icon: 'alarm', label: 'woke', tone: 'woke' };
  if (unread) return { icon: 'checkcircle', label: 'done', tone: 'done' };
  return null;
}

/** True when the Idle corner should show relative time instead of a status chip. */
export function showsCardRelativeTime(card, unread) {
  return deriveCardStatus(card, unread) == null;
}

const SIDEBAR_RELATIVE_TIME_UNITS = Object.freeze({
  en: Object.freeze({ now: 'now', m: (n) => `${n}m`, h: (n) => `${n}h`, d: (n) => `${n}d` }),
  zh: Object.freeze({ now: '刚刚', m: (n) => `${n} 分钟`, h: (n) => `${n} 小时`, d: (n) => `${n} 天` }),
  ja: Object.freeze({ now: 'たった今', m: (n) => `${n}分`, h: (n) => `${n}時間`, d: (n) => `${n}日` }),
  es: Object.freeze({ now: 'ahora', m: (n) => `${n} min`, h: (n) => `${n} h`, d: (n) => `${n} d` }),
  fr: Object.freeze({ now: 'maintenant', m: (n) => `${n} min`, h: (n) => `${n} h`, d: (n) => `${n} j` }),
  de: Object.freeze({ now: 'jetzt', m: (n) => `${n} Min.`, h: (n) => `${n} Std.`, d: (n) => `${n} T.` }),
  ru: Object.freeze({ now: 'сейчас', m: (n) => `${n} мин`, h: (n) => `${n} ч`, d: (n) => `${n} д` }),
  pt: Object.freeze({ now: 'agora', m: (n) => `${n}min`, h: (n) => `${n}h`, d: (n) => `${n}d` }),
});

/**
 * Compact sidebar relative time aligned with T3 `formatRelativeTimeLabel` +
 * `compactSidebarTimeLabel` (floor buckets; `just now` → `now`; no `ago` / `mo`).
 * `time` may be epoch ms or an ISO string.
 */
export function formatSidebarRelativeTime(time, nowMs = Date.now(), locale = 'en') {
  if (time == null || time === '') return '';
  const then = typeof time === 'number' ? time : Date.parse(time);
  if (!Number.isFinite(then)) return '';
  const primary = String(locale ?? '').toLowerCase().split(/[-_]/)[0];
  const units = SIDEBAR_RELATIVE_TIME_UNITS[primary] ?? SIDEBAR_RELATIVE_TIME_UNITS.en;
  const elapsedMs = Math.max(0, nowMs - then);
  const seconds = Math.floor(elapsedMs / 1000);
  if (seconds < 60) return units.now;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return units.m(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return units.h(hours);
  const days = Math.floor(hours / 24);
  return units.d(days);
}

function finiteTime(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

export function toSortableMs(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value === 'string' && value) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  }
  return null;
}

function collectProgresses(card) {
  const list = [];
  if (card?.progress) list.push(card.progress);
  for (const member of card?.members ?? []) {
    if (member?.progress && member.progress !== card?.progress) list.push(member.progress);
  }
  return list;
}

/**
 * Active Inbox sort key aligned with T3 `sortInboxThreadsByReturn`:
 * max(createdAt, unsettledAt, observedReturnAt, result/work/input/turn timestamps).
 * Falls back to synthetic `sortAt` when no explicit timestamps are present.
 */
export function inboxSortTimestamp(card) {
  if (!card || typeof card !== 'object') return 0;
  let best = Math.max(
    0,
    toSortableMs(card.createdAt) ?? toSortableMs(card.members?.[0]?.header?.createdAt) ?? 0,
    toSortableMs(card.unsettledAt) ?? 0,
    toSortableMs(card.observedReturnAt) ?? 0,
    toSortableMs(card.result?.time) ?? 0,
  );
  for (const progress of collectProgresses(card)) {
    best = Math.max(
      best,
      toSortableMs(progress.latestHumanInput?.time) ?? 0,
      toSortableMs(progress.turn?.start?.time) ?? 0,
      toSortableMs(progress.turn?.end?.time) ?? 0,
      toSortableMs(progress.latestResult?.time) ?? 0,
      toSortableMs(progress.latestWork?.time) ?? 0,
    );
  }
  return best > 0 ? best : (toSortableMs(card.sortAt) ?? 0);
}

/**
 * Working shelf sort key aligned with T3 `sortWorkingThreadsBySend`:
 * max(createdAt, latestHumanInput ?? turn.start), never streaming `runtime.startedAt`.
 */
export function workingSortTimestamp(card) {
  if (!card || typeof card !== 'object') return 0;
  const createdAt = toSortableMs(card.createdAt) ?? toSortableMs(card.members?.[0]?.header?.createdAt);
  let latestHumanInput = null;
  let turnStart = null;
  for (const progress of collectProgresses(card)) {
    const inputMs = toSortableMs(progress.latestHumanInput?.time);
    if (inputMs != null && (latestHumanInput == null || inputMs > latestHumanInput)) latestHumanInput = inputMs;
    const startMs = toSortableMs(progress.turn?.start?.time);
    if (startMs != null && (turnStart == null || startMs > turnStart)) turnStart = startMs;
  }
  const sendAt = latestHumanInput ?? turnStart;
  if (createdAt != null || sendAt != null) return Math.max(createdAt ?? 0, sendAt ?? 0);
  return toSortableMs(card.sortAt) ?? 0;
}

/** Pinned unkeyed fallback aligned with T3 `sortPinnedThreadsByOrderKey`. */
export function pinnedFallbackTimestamp(card) {
  if (!card || typeof card !== 'object') return 0;
  return toSortableMs(card.createdAt) ?? toSortableMs(card.members?.[0]?.header?.createdAt) ?? toSortableMs(card.sortAt) ?? 0;
}

export function sortPinnedCards(cards, pinnedOrderIds = null) {
  const list = [...(cards ?? [])];
  if (list.length < 2) return list;
  const rank = new Map();
  for (const id of pinnedOrderIds ?? []) {
    if (typeof id === 'string' && !rank.has(id)) rank.set(id, rank.size);
  }
  const keyed = [];
  const keyless = [];
  for (const card of list) (rank.has(card.sessionId) ? keyed : keyless).push(card);
  keyed.sort((a, b) => rank.get(a.sessionId) - rank.get(b.sessionId) || a.sessionId.localeCompare(b.sessionId));
  keyless.sort((a, b) => pinnedFallbackTimestamp(b) - pinnedFallbackTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
  return [...keyed, ...keyless];
}

export function sortInboxCardsByReturn(cards) {
  return [...(cards ?? [])].sort((a, b) => inboxSortTimestamp(b) - inboxSortTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
}

export function sortWorkingCardsBySend(cards) {
  return [...(cards ?? [])].sort((a, b) => workingSortTimestamp(b) - workingSortTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
}

export function sortSnoozedCards(cards) {
  return [...(cards ?? [])].sort(
    (a, b) => (toSortableMs(a.snooze?.until ?? a.snoozeUntil) ?? 0) - (toSortableMs(b.snooze?.until ?? b.snoozeUntil) ?? 0) || a.sessionId.localeCompare(b.sessionId),
  );
}

export function sortSettledCards(cards) {
  return [...(cards ?? [])].sort((a, b) => (settledTimestamp(b) ?? 0) - (settledTimestamp(a) ?? 0) || a.sessionId.localeCompare(b.sessionId));
}

/**
 * Sidebar clock aligned with T3 `resolveThreadActivityTimestamp`:
 * max(user message, latest work, turn start/end, result) across the tree.
 * `runtime.startedAt` is the session updatedAt fallback; `sortAt` is last.
 */
export function activityTimestamp(card) {
  if (!card || typeof card !== 'object') return null;
  let latest = null;
  const consider = (time) => {
    const value = finiteTime(time);
    if (value != null && (latest == null || value > latest)) latest = value;
  };
  const progresses = [];
  if (card.progress) progresses.push(card.progress);
  for (const member of card.members ?? []) {
    if (member?.progress) progresses.push(member.progress);
  }
  for (const progress of progresses) {
    consider(progress.latestHumanInput?.time);
    consider(progress.latestResult?.time);
    consider(progress.latestWork?.time);
    consider(progress.turn?.start?.time);
    consider(progress.turn?.end?.time);
  }
  if (latest != null) return latest;
  return finiteTime(card.runtime?.startedAt) ?? finiteTime(card.sortAt);
}

/**
 * Settled row clock aligned with T3 `resolveSettledThreadTimestamp`:
 * prefer `settledAt`, falling back to `activityTimestamp(card)`.
 */
export function settledTimestamp(card) {
  if (!card || typeof card !== 'object') return null;
  const settled = typeof card.settledAt === 'number'
    ? finiteTime(card.settledAt)
    : typeof card.settledAt === 'string' && card.settledAt
      ? finiteTime(Date.parse(card.settledAt))
      : null;
  return settled ?? activityTimestamp(card);
}

/**
 * T3 provider stack: the root thread's two latest distinct historical provider
 * instances, then its current provider. Child agents are separate threads.
 */
export function providerStackSources(card) {
  if (!card || typeof card !== 'object') return [];
  const progress = card.progress ?? card.members?.[0]?.progress;
  const providerId = card.providerId || progress?.route?.provider || null;
  const modelId = card.modelId || progress?.route?.model || null;
  if (!providerId && !modelId) return [];
  const current = { id: providerId || modelId, providerId, modelId };
  const previous = (progress?.providerHistory ?? [])
    .filter((item) => item.provider && item.provider !== providerId)
    .map((item) => ({ id:item.provider, providerId:item.provider, modelId:item.model }));
  return [...previous.slice(-2), current];
}

/** First case-insensitive match of `query` inside `text`, or null. */
export function searchHighlightRange(text, query) {
  const source = String(text ?? '');
  const needle = String(query ?? '').trim().toLocaleLowerCase();
  if (!needle) return null;
  const start = source.toLocaleLowerCase().indexOf(needle);
  if (start < 0) return null;
  return { start, end: start + needle.length };
}

const SEARCH_ALPHANUMERIC = /[\p{L}\p{N}]/u;
const SEARCH_LOWERCASE = /\p{Ll}/u;
const SEARCH_UPPERCASE = /\p{Lu}/u;
const SEARCH_DIGIT = /\p{N}/u;
const SEARCH_LETTER = /\p{L}/u;
const SEARCH_SYMBOL = /\p{So}/u;
const SEARCH_APOSTROPHE = /['\u2019]/;
const SEARCH_WRAPPING_QUOTES = /^\s*["'`\u201c\u201d\u2018\u2019]+|["'`\u201c\u201d\u2018\u2019]+\s*$/g;
const SEARCH_FILLER_WORDS = new Set(['a', 'an', 'and', 'for', 'in', 'of', 'on', 'the', 'to', 'with']);
const SEARCH_WORKTREE_PREFIX_RE = /^(?:t3|t3code)\/(?=\S)/;
const SEARCH_WHOLE_WORD = 1;
const SEARCH_WHOLE_NAME = 1.5;
const SEARCH_MID_WORD = 0.3;
const SEARCH_TYPO = 0.45;
const SEARCH_JOINED_WORDS = 0.6;
const SEARCH_RECENCY_HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000;
const SEARCH_FIELD_CACHE = new Map();
const SEARCH_FIELD_CACHE_LIMIT = 4096;

function foldSearchCharacter(character) {
  return character
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace('ς', 'σ')
    .replace(/[\u2018\u2019]/g, "'");
}

function foldSearchInPlace(text) {
  return text
    .replace(/[\u0080-\uffff]/g, (character) => {
      const folded = foldSearchCharacter(character);
      return folded.length === 1 ? folded : character;
    })
    .toLowerCase();
}

function isSearchCjk(character) {
  if (!character) return false;
  const code = character.codePointAt(0);
  return (
    (code >= 0x3040 && code <= 0x30ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xf900 && code <= 0xfaff)
  );
}

function isSearchWordStart(beforePrevious, previous, character, next) {
  const afterApostrophe = SEARCH_APOSTROPHE.test(previous) && SEARCH_ALPHANUMERIC.test(beforePrevious);
  return (
    (SEARCH_ALPHANUMERIC.test(character) || SEARCH_SYMBOL.test(character)) &&
    !afterApostrophe &&
    (previous === '' ||
      !SEARCH_ALPHANUMERIC.test(previous) ||
      (SEARCH_LOWERCASE.test(previous) && SEARCH_UPPERCASE.test(character)) ||
      (SEARCH_UPPERCASE.test(previous) && SEARCH_UPPERCASE.test(character) && SEARCH_LOWERCASE.test(next)) ||
      SEARCH_DIGIT.test(previous) !== SEARCH_DIGIT.test(character) ||
      isSearchCjk(character))
  );
}

function prepareSearchField(source) {
  const cached = SEARCH_FIELD_CACHE.get(source);
  if (cached) return cached;
  if (SEARCH_FIELD_CACHE.size >= SEARCH_FIELD_CACHE_LIMIT) {
    SEARCH_FIELD_CACHE.delete(SEARCH_FIELD_CACHE.keys().next().value);
  }
  const wordStarts = new Uint8Array(source.length);
  const characters = Array.from(source);
  let index = 0;
  for (let pos = 0; pos < characters.length; pos++) {
    const character = characters[pos];
    const previous = characters[pos - 1] ?? '';
    const next = characters[pos + 1] ?? '';
    if (isSearchWordStart(characters[pos - 2] ?? '', previous, character, next)) {
      wordStarts[index] = 1;
    }
    index += character.length;
  }
  const field = { text: foldSearchInPlace(source), wordStarts };
  SEARCH_FIELD_CACHE.set(source, field);
  return field;
}

/** Folded, whitespace-collapsed query aligned with T3 `foldSearchQuery`. */
export function foldSearchQuery(query) {
  return foldSearchInPlace(String(query ?? '').replace(SEARCH_WRAPPING_QUOTES, '').normalize('NFC'))
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .join(' ');
}

function searchWordEnd(field, index) {
  let end = index + 1;
  while (end < field.text.length && !field.wordStarts[end] && SEARCH_ALPHANUMERIC.test(field.text[end])) {
    end++;
  }
  return end;
}

function withinOneSearchEdit(left, right, swapOnly) {
  if (Math.abs(left.length - right.length) > (swapOnly ? 0 : 1)) return false;
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index++;
  const restLeft = left.slice(index);
  const restRight = right.slice(index);
  const swapped =
    restLeft.length > 1 &&
    restLeft[0] === restRight[1] &&
    restLeft[1] === restRight[0] &&
    restLeft.slice(2) === restRight.slice(2);
  if (swapOnly) return swapped;
  return (
    swapped ||
    restLeft === restRight ||
    restLeft.slice(1) === restRight.slice(1) ||
    restLeft.slice(1) === restRight ||
    restLeft === restRight.slice(1)
  );
}

function matchSearchJoinedWords(field, token) {
  for (let start = field.text.indexOf(token[0]); start !== -1; start = field.text.indexOf(token[0], start + 1)) {
    if (!field.wordStarts[start]) continue;
    const runs = [];
    let at = start;
    let rest = token;
    while (rest.length > 0 && at < field.text.length) {
      const end = searchWordEnd(field, at);
      if (rest.length <= end - at && field.text.startsWith(rest, at)) {
        runs.push({ start: at, end: at + rest.length });
        rest = '';
      } else if (rest.startsWith(field.text.slice(at, end))) {
        runs.push({ start: at, end });
        rest = rest.slice(end - at);
        at = end;
        while (at < field.text.length && !field.wordStarts[at]) at++;
      } else {
        break;
      }
    }
    const last = runs.at(-1);
    if (rest.length > 0 || last === undefined || runs.length < 2) continue;
    if (
      last.end === searchWordEnd(field, last.start) ||
      last.end - last.start >= 3 ||
      start === field.wordStarts.indexOf(1) ||
      runs.slice(0, -1).every((run) => run.end - run.start >= 3)
    ) {
      return { score: SEARCH_JOINED_WORDS, start, end: last.end, letters: runs };
    }
  }
  return null;
}

function matchSearchToken(field, token, typos, isPrimary, midWord) {
  if (!token.length) return null;
  let best = null;
  let ownBoundary;
  for (let index = field.text.indexOf(token); index !== -1; index = field.text.indexOf(token, index + 1)) {
    if (field.wordStarts[index] || (ownBoundary ??= !SEARCH_ALPHANUMERIC.test(token[0]) && !SEARCH_SYMBOL.test(token[0]))) {
      const end = index + token.length;
      const whole =
        end >= field.text.length ||
        field.wordStarts[end] === 1 ||
        !SEARCH_ALPHANUMERIC.test(field.text[end]);
      let runEnd = end;
      while (runEnd < field.text.length && SEARCH_ALPHANUMERIC.test(field.text[runEnd])) runEnd++;
      const score = whole ? SEARCH_WHOLE_WORD : 0.7 + (0.2 * token.length) / (runEnd - index);
      if (best === null || score > best.score) best = { score, start: index, end };
      if (score === SEARCH_WHOLE_WORD) return best;
    } else if (midWord && token.length >= 4 && best === null) {
      best = { score: SEARCH_MID_WORD, start: index, end: index + token.length };
    }
  }
  if ((best === null || best.score <= SEARCH_MID_WORD) && isPrimary) {
    const joined = matchSearchJoinedWords(field, token);
    if (joined) return joined;
  }
  if ((best !== null && best.score > SEARCH_MID_WORD) || !typos || token.length < 3) return best;
  if (SEARCH_LETTER.test(token)) {
    for (let index = 0; index < field.text.length; index++) {
      if (!field.wordStarts[index]) continue;
      const first = field.text[index];
      const firstLetterKept =
        first === token[0] ||
        (token.length > 3 && first === token[1] && field.text[index + 1] === token[0]);
      if (!firstLetterKept) continue;
      let runEnd = index + 1;
      while (runEnd < field.text.length && SEARCH_ALPHANUMERIC.test(field.text[runEnd])) runEnd++;
      const word = field.text.slice(index, runEnd);
      const short = token.length <= 4;
      const lengths = short ? [token.length, token.length + 1] : [token.length, token.length - 1, token.length + 1];
      for (const length of lengths) {
        if (length > word.length) continue;
        if (withinOneSearchEdit(token, word.slice(0, length), short && length === token.length)) {
          return { score: SEARCH_TYPO, start: index, end: index + length };
        }
      }
    }
  }
  return best;
}

function mergeSearchRanges(ranges) {
  const merged = [];
  for (const range of [...ranges].sort((left, right) => left.start - right.start)) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, range.end) };
    } else {
      merged.push({ start: range.start, end: range.end });
    }
  }
  return merged;
}

function matchSearchFields(normalizedQuery, fields, options) {
  if (!normalizedQuery.length) return null;
  const primary = fields[0]?.value ? prepareSearchField(fields[0].value) : undefined;
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (!tokens.length) return null;
  const fillerOptional = tokens.some((token) => !SEARCH_FILLER_WORDS.has(token));
  const primaryRanges = [];
  let total = 0;
  let counted = 0;
  let notWhole = false;
  let strong = true;
  for (const token of tokens) {
    let best = 0;
    let bestPrimary = null;
    let atWordStart = false;
    for (const weighted of fields) {
      if (!weighted.value.length) continue;
      const { weight, context, midWord } = weighted;
      const field = prepareSearchField(weighted.value);
      if (best >= weight && field !== primary && atWordStart) continue;
      const match = matchSearchToken(field, token, options?.typos ?? false, field === primary, midWord ?? false);
      if (match === null) continue;
      if (field === primary) bestPrimary = match;
      if (match.score >= 0.7 && !context) atWordStart = true;
      if (match.score * weight > best) best = match.score * weight;
    }
    if (best === 0) {
      if (fillerOptional && SEARCH_FILLER_WORDS.has(token)) continue;
      return null;
    }
    strong &&= atWordStart;
    if (bestPrimary) primaryRanges.push(...(bestPrimary.letters ?? [bestPrimary]));
    total += best;
    counted += 1;
    if (SEARCH_FILLER_WORDS.has(token)) notWhole ||= !fillerOptional;
    else notWhole ||= token.length < 3 || best < SEARCH_WHOLE_WORD;
  }
  let quality = total / counted;
  if (primary) {
    if (primary.text === normalizedQuery) quality += SEARCH_WHOLE_NAME - SEARCH_WHOLE_WORD;
    else if (tokens.length > 1 && primary.text.includes(normalizedQuery)) quality += 0.25;
  }
  return {
    quality,
    wholeWords: !notWhole,
    strong,
    primaryRanges: mergeSearchRanges(primaryRanges),
  };
}

function searchPathBasename(cwd) {
  if (typeof cwd !== 'string' || !cwd.trim()) return null;
  const parts = cwd.trim().split(/[/\\]+/).filter(Boolean);
  return parts.at(-1) ?? null;
}

function searchableCardBranch(branch) {
  return typeof branch === 'string' && branch ? branch.replace(SEARCH_WORKTREE_PREFIX_RE, '') : null;
}

function matchCardReference(normalizedQuery, card) {
  if (normalizedQuery.length < 8 || !card?.sessionId) return null;
  const folded = String(card.sessionId).toLowerCase();
  const anywhere = SEARCH_DIGIT.test(normalizedQuery);
  const notCut = (text, end) => !SEARCH_DIGIT.test(text[end] ?? '');
  const at = folded.indexOf(normalizedQuery);
  const matched = anywhere
    ? (at !== -1 && notCut(folded, at + normalizedQuery.length)) ||
      (normalizedQuery.startsWith(folded) && notCut(normalizedQuery, folded.length))
    : at === 0;
  return matched ? { quality: 0.6, wholeWords: false, strong: true, primaryRanges: [] } : null;
}

function cardSearchHintValid(fieldQuery, branch, projectTitle, typos) {
  const candidates = [branch, projectTitle];
  const holds = (text, q) => matchSearchFields(q, [{ value: text, weight: 1 }], { typos })?.primaryRanges;
  for (const text of candidates) {
    if (text && holds(text, fieldQuery)) return true;
  }
  if (!projectTitle) return false;
  const rest = fieldQuery.split(' ').filter((token) => !holds(projectTitle, token)).join(' ');
  return Boolean(rest && rest !== fieldQuery && branch && holds(branch, rest));
}

function cardUsageBoost(card, nowMs) {
  const activityAt = activityTimestamp(card);
  const recency = activityAt == null ? 0 : 2 ** (-Math.max(0, nowMs - activityAt) / SEARCH_RECENCY_HALF_LIFE_MS);
  return Math.min(2.5, 1 + recency);
}

/** Score a sidebar card for a pre-folded search query aligned with T3 `scoreThreadSearch`. */
export function scoreCardSearch(normalizedQuery, card, nowMs = Date.now(), options = {}) {
  if (!normalizedQuery || !card) return null;
  const branch = searchableCardBranch(card.branch);
  const projectTitle = (typeof card.workspaceTitle === 'string' && card.workspaceTitle.trim())
    ? card.workspaceTitle.trim()
    : searchPathBasename(card.cwd);
  const fields = [{ value: String(card.title ?? ''), weight: 1, midWord: true }];
  if (branch) fields.push({ value: branch, weight: 0.6 });
  if (projectTitle) fields.push({ value: projectTitle, weight: 0.25, context: true });
  const fieldQuery = normalizedQuery
    .replace(/^(?:pr|pull request|pull)\s*(?=#?\d)/, '')
    .replace(/^#\s*/, '')
    .replace(SEARCH_WORKTREE_PREFIX_RE, '');
  const fieldMatch = matchSearchFields(fieldQuery, fields, options);
  const referenceMatch = fieldMatch ? null : matchCardReference(normalizedQuery, card);
  const match = fieldMatch ?? referenceMatch;
  if (!match) return null;
  const typos = options?.typos ?? false;
  const titleShowsMatch = match.primaryRanges.length > 0;
  if (!titleShowsMatch && !referenceMatch && fieldQuery.includes(' ')) {
    if (!cardSearchHintValid(fieldQuery, branch, projectTitle, typos)) return null;
  }
  return {
    score: match.quality * cardUsageBoost(card, nowMs),
    quality: match.quality,
    wholeWords: match.wholeWords,
    strong: match.strong,
    ranges: match.primaryRanges,
  };
}

function searchMatchClass(quality) {
  return quality >= SEARCH_WHOLE_NAME ? 3 : quality >= 0.7 ? 2 : quality >= 0.4 ? 1 : 0;
}

/** Rank sidebar cards against `query` aligned with T3 `searchSidebarThreads` + `rankSearchItems`. */
export function searchSidebarCards(cards, query, nowMs = Date.now()) {
  const normalizedQuery = foldSearchQuery(query);
  if (!normalizedQuery || !Array.isArray(cards) || cards.length === 0) return [];
  const collect = (typos) => {
    const items = [];
    for (let order = 0; order < cards.length; order++) {
      const card = cards[order];
      const match = scoreCardSearch(normalizedQuery, card, nowMs, { typos });
      if (match) items.push({ card, match, order });
    }
    return items;
  };
  let items = collect(false);
  if (!items.some(({ match }) => match.strong)) {
    items = collect(true);
  }
  const wordMatch = (match) => Math.min(searchMatchClass(match.quality), 2);
  items.sort(
    (left, right) =>
      wordMatch(right.match) - wordMatch(left.match) ||
      searchMatchClass(right.match.quality) - searchMatchClass(left.match.quality) ||
      Number(right.match.wholeWords) - Number(left.match.wholeWords) ||
      right.match.score - left.match.score ||
      left.order - right.order,
  );
  return items.map(({ card, match }) => ({
    card,
    ranges: match.ranges,
    score: match.score,
    quality: match.quality,
  }));
}

/** T3 `providerInstanceInitials`: one word → two letters, else the first letter of each of the first two words. */
export function providerInitials(label) {
  const words = String(label ?? '')
    .replace(/[^\p{L}\p{N}'’]+/gu, ' ')
    .split(/\s+/u)
    .map((word) => word.replace(/^['’]+|['’]+$/gu, ''))
    .filter(Boolean);
  if (!words.length) return '';
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join('').toUpperCase();
  return `${Array.from(words[0])[0] ?? ''}${Array.from(words[1])[0] ?? ''}`.toUpperCase();
}

/** Drop caption aligned with T3 shelves; Working is not a drop destination. */
export function resolveDropVerb(from, to) {
  if (!to || to === from || to === 'working' || to === 'snoozed' || from === 'working') return null;
  if (to === 'pinned') return 'pin';
  if (to === 'settled') return 'settle';
  if (from === 'pinned') return 'unpin';
  if (from === 'settled') return 'unsettle';
  if (from === 'snoozed' && to === 'active') return 'wake';
  return null;
}

/**
 * True when an ask_user_question item is a Plan Review / approval (T3 Approval chip).
 * Live DSH tool args use `intent: "plan-review"` (string) plus header "Plan Review";
 * older shapes use `{ kind: "plan-review" }`. Normalize all known carriers.
 */
export function isApprovalQuestionIntent(item) {
  if (!item || typeof item !== 'object') return false;
  const intent = item.intent ?? item.Intent ?? item.questionIntent;
  if (intent === 'plan-review' || intent === 'approval') return true;
  if (typeof intent === 'string' && /^(plan[_-]?review|approval)$/i.test(intent.trim())) return true;
  if (intent && typeof intent === 'object') {
    const kind = intent.kind ?? intent.type ?? intent.value ?? intent.name;
    if (kind === 'plan-review' || kind === 'approval') return true;
    if (typeof kind === 'string' && /^(plan[_-]?review|approval)$/i.test(kind.trim())) return true;
  }
  /* Product chrome title when intent was stripped before Host wrap. */
  if (typeof item.header === 'string' && /^plan\s*review$/i.test(item.header.trim())) return true;
  return false;
}

/**
 * Map Client session-list `pendingInteraction` (mux question/approval) to Inbox pending kind.
 * DSH tracks live Input/Approval on the Client list; Host `user-questions/request` waterfall
 * does not exist on the ask seam, so the sidebar must overlay this fact.
 */
export function pendingKindFromInteraction(status) {
  if (status === 'approval' || status === 'plan-review') return 'approval';
  if (status === 'question') return 'question';
  return null;
}

/**
 * Overlay Client `pendingInteraction` onto a Host card so status/section match T3 Input/Approval
 * while a product question or approval is waiting — even if Host pending is empty.
 */
export function applyClientPendingOverlay(card, pendingInteraction) {
  const kind = pendingKindFromInteraction(pendingInteraction);
  if (!kind || !card) return card;
  /* T3: snoozing during user_input parks the ask — do not yank Snoozed back to Active. */
  if (card.snoozed || card.section === 'snoozed' || card.snoozeEffect?.active) return card;
  const pending = Array.isArray(card.pending) ? [...card.pending] : [];
  /* Do not inject a null-identity twin when Host already tracked this kind (ask wrap). */
  if (!pending.some((item) => item.kind === kind)) {
    pending.push({ sessionId: card.sessionId, kind, identity: null });
  }
  const attention = pendingAttention(pending, card.snoozeEffect?.deferExceptions ? card.snoozeEffect.snooze : null);
  if (!attention.length) return card;
  let section = card.section;
  /* Pull Working/Snoozed into Active for Input; leave Settled alone (user may Settle while pending). */
  if (section === 'working' || section === 'snoozed') section = 'active';
  return {
    ...card,
    pending,
    needsYou: true,
    pendingCount: attention.length,
    section,
  };
}

/**
 * Overlay live Client `sessions.byId[id].running === false` onto a stale Host card.
 * `api-session/status` reaches Client ahead of Host's full-workspace snapshot rebuild, so
 * clearing root running here stops the `Working Xs` timer immediately while preserving
 * active subagent waiting and Host write-context gating (`canSettle`).
 */
export function applyClientRunningOverlay(card, sessions) {
  if (!card || !card.running) return card;
  if (!sessions || sessions.phase === 'pending') return card;
  const summary = sessions.byId?.[card.sessionId];
  if (summary?.running !== false) return card;
  if (card.runtime?.queue?.length > 0) return card;
  const children = Array.isArray(card.members) ? card.members.slice(1) : [];
  const childRunning = children.some((member) => {
    const childSummary = sessions.byId?.[member?.sessionId];
    return Boolean(
      childSummary?.running === true
      || member?.runtime?.running
      || member?.runtime?.queue?.length
      || (member?.progress?.turn && !member.progress.turn.end),
    );
  });
  if (childRunning) {
    const waiting = !card.needsYou;
    return card.waiting === waiting ? card : { ...card, waiting };
  }
  const section = card.section === 'working' ? 'active' : card.section;
  return { ...card, running: false, waiting: false, section };
}

export function orderedSections(cards, pinnedOrderIds = null, options = {}) {
  const { workingShelfEnabled = true } = options ?? {};
  const bySection = (section) => cards.filter((card) => card.section === section);
  const activeRaw = bySection('active').filter((card) => !card.pinned);
  const workingRaw = bySection('working').filter((card) => !card.pinned);
  return {
    pinned: sortPinnedCards(cards.filter((card) => card.pinned), pinnedOrderIds),
    active: sortInboxCardsByReturn(workingShelfEnabled ? activeRaw : [...activeRaw, ...workingRaw]),
    working: workingShelfEnabled ? sortWorkingCardsBySend(workingRaw) : [],
    snoozed: sortSnoozedCards(bySection('snoozed').filter((card) => !card.pinned)),
    settled: sortSettledCards(bySection('settled').filter((card) => !card.pinned)),
  };
}

/** One next-card choice aligned with T3 `planForwardNavigation` before park mutation. */
export function nextCandidate(cards, currentId, actionSessionId, excludeIds = null, options = {}) {
  const { workingOpen = true, workingShelfEnabled = true, pinnedOrderIds = null } = options ?? {};
  const excluded = excludeIds instanceof Set ? excludeIds : (excludeIds ? new Set(excludeIds) : null);
  const sections = orderedSections(cards, pinnedOrderIds, { workingShelfEnabled });
  const workingList = workingOpen
    ? sections.working
    : sections.working.filter((card) => card.sessionId === currentId);
  const ordered = [...sections.pinned, ...sections.active, ...workingList]
    .filter((card) => card.accessible !== false && !card.archived);
  if (!ordered.length) return null;
  const currentIndex = ordered.findIndex((card) => card.sessionId === currentId);
  for (let offset = 1; offset <= ordered.length; offset += 1) {
    const candidate = ordered[((currentIndex < 0 ? -1 : currentIndex) + offset) % ordered.length];
    if (
      candidate.sessionId !== currentId &&
      candidate.sessionId !== actionSessionId &&
      !excluded?.has(candidate.sessionId) &&
      (candidate.pinned || (candidate.section !== 'settled' && candidate.section !== 'snoozed')) &&
      !(candidate.snoozed && !candidate.woke)
    ) {
      return candidate;
    }
  }
  return null;
}

/** Non-wrapping adjacent thread navigation aligned with T3 `resolveAdjacentThreadId`. */
export function resolveAdjacentThreadId({ threadIds, currentThreadId, direction }) {
  if (!Array.isArray(threadIds) || threadIds.length === 0) return null;
  if (currentThreadId === null || currentThreadId === undefined) {
    return direction === 'previous' ? (threadIds.at(-1) ?? null) : (threadIds[0] ?? null);
  }
  const index = threadIds.indexOf(currentThreadId);
  if (index === -1) return null;
  if (direction === 'previous') return index > 0 ? (threadIds[index - 1] ?? null) : null;
  return index < threadIds.length - 1 ? (threadIds[index + 1] ?? null) : null;
}

/** Sweep range resolution aligned with T3 `resolveSidebarSweepKeys`. */
export function resolveSidebarSweepKeys(orderedKeys, originKey, targetKey, canApply = () => true) {
  if (!Array.isArray(orderedKeys)) return [];
  const origin = orderedKeys.indexOf(originKey);
  const target = orderedKeys.indexOf(targetKey);
  if (origin === -1 || target === -1) return [];
  return orderedKeys.slice(Math.min(origin, target), Math.max(origin, target) + 1).filter(canApply);
}

export const SIDEBAR_MARKER_PREFIX = 'sidebar-marker-';

export function sidebarMarkerId(marker) {
  return `${SIDEBAR_MARKER_PREFIX}${marker}`;
}

export function sidebarListItemId(item) {
  return item?.kind === 'thread' ? item.key : sidebarMarkerId(item?.marker);
}

function sectionAtSidebarSlot(items, index) {
  let section = 'pinned';
  for (let i = 0; i < index && i < items.length; i += 1) {
    const item = items[i];
    if (item.kind !== 'marker') continue;
    if (item.marker === 'pinned-divider') section = 'active';
    else if (item.marker === 'working-header') section = 'working';
    else if (item.marker === 'snoozed-header') section = 'snoozed';
    else if (item.marker === 'settled-header') section = 'settled';
  }
  return section;
}

/** Resolve drop section and projected section order (aligned with `Sidebar.logic.ts`). */
export function resolveSidebarDropTarget(items, activeKey, overId) {
  const activeIndex = items.findIndex((item) => sidebarListItemId(item) === activeKey);
  const overIndex = items.findIndex((item) => sidebarListItemId(item) === overId);
  if (activeIndex === -1 || overIndex === -1 || items[activeIndex]?.kind !== 'thread') return null;
  const moved = items.filter((_, index) => index !== activeIndex);
  moved.splice(overIndex, 0, items[activeIndex]);
  const section = sectionAtSidebarSlot(moved, overIndex);
  if (section === 'working' || section === 'snoozed') return null;
  const pinnedOrder = [];
  const activeOrder = [];
  let currentSection = 'pinned';
  for (const item of moved) {
    if (item.kind === 'marker') {
      if (item.marker === 'pinned-divider') currentSection = 'active';
      else if (item.marker === 'working-header' || item.marker === 'snoozed-header' || item.marker === 'settled-header') break;
    } else if (currentSection === 'pinned') pinnedOrder.push(item.key);
    else activeOrder.push(item.key);
  }
  return { section, pinnedOrder, activeOrder };
}

const isShelfHeaderMarker = (item) =>
  item?.kind === 'marker' && (item.marker === 'working-header' || item.marker === 'snoozed-header' || item.marker === 'settled-header');

/** Compute live row/marker vertical displacement (`translateY`) during sidebar drag. */
export function projectSidebarDrag(input) {
  const {
    items = [],
    rects = [],
    activeKey,
    overId,
    settledOrder = [],
    activeOrder = null,
    settledExpanded = false,
    settledVisibleCount = 10,
    routeThreadKey = null,
    snoozedThreadCount = 0,
    cardHeight: inputCardHeight,
    slimHeight: inputSlimHeight,
    boundaryLabelHeight = 24,
    containerHeight = null,
    footerHeight = 0,
  } = input ?? {};
  const activeIndex = items.findIndex((item) => sidebarListItemId(item) === activeKey);
  if (activeIndex === -1 || !rects[0]) return { transforms: new Map(), target: null, projected: [] };
  const active = items[activeIndex];
  const overIndexRaw = items.findIndex((item) => sidebarListItemId(item) === overId);
  const over = (overIndexRaw >= 0 ? items[overIndexRaw] : active) ?? active;
  const target = resolveSidebarDropTarget(items, active.key, sidebarListItemId(over));
  if (!target) return { transforms: new Map(), target: null, projected: [] };

  const indices = new Map(items.map((item, idx) => [sidebarListItemId(item), idx]));
  const groups = { pinned: [], active: [], working: [], snoozed: [], settled: [] };
  let cardHeight = inputCardHeight;
  let slimHeight = inputSlimHeight;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'marker') continue;
    if (item.section === 'pinned' || item.section === 'active' || item.section === 'working') {
      if (cardHeight === undefined && rects[i]?.height) cardHeight = rects[i].height;
    } else if (slimHeight === undefined && rects[i]?.height) {
      slimHeight = rects[i].height;
    }
    if (item.key !== active.key) groups[item.section].push(item);
  }
  cardHeight = cardHeight ?? 64;
  slimHeight = slimHeight ?? 36;
  const labelHeight = boundaryLabelHeight;

  const targetGroup = groups[target.section];
  const order = target.section === 'pinned' ? target.pinnedOrder : target.section === 'settled' ? settledOrder : (activeOrder ?? target.activeOrder);
  const ranks = new Map(order.map((key, idx) => [key, idx]));
  const rank = ranks.get(active.key) ?? Number.POSITIVE_INFINITY;
  const insertAt = targetGroup.findIndex((item) => (ranks.get(item.key) ?? Number.POSITIVE_INFINITY) > rank);
  targetGroup.splice(insertAt < 0 ? targetGroup.length : insertAt, 0, { ...active, section: target.section });

  const nextSettled = (settledOrder.length > 0 ? settledOrder : groups.settled.map((item) => item.key))
    .filter((key) => key !== active.key || target.section === 'settled');
  if (target.section === 'settled' && !nextSettled.includes(active.key)) nextSettled.unshift(active.key);
  const visibleSettled = settledExpanded ? nextSettled.slice(0, settledVisibleCount) : [];
  if (routeThreadKey && nextSettled.includes(routeThreadKey) && !visibleSettled.includes(routeThreadKey)) {
    visibleSettled.push(routeThreadKey);
  }
  groups.settled = visibleSettled.map((key) => ({ kind: 'thread', key, section: 'settled' }));

  const projected = [];
  const marker = (name) => projected.push({ kind: 'marker', marker: name });
  marker('pinned-header');
  projected.push(...groups.pinned);
  marker('pinned-divider');
  if (groups.active.length > 0) projected.push(...groups.active);
  else marker('active-placeholder');
  if (items.some((item) => item.kind === 'marker' && item.marker === 'working-header')) {
    marker('working-header');
    projected.push(...groups.working);
  }
  if (
    groups.snoozed.length > 0 ||
    ((active.section !== 'snoozed' || snoozedThreadCount > 1) && items.some((item) => item.kind === 'marker' && item.marker === 'snoozed-header'))
  ) {
    marker('snoozed-header');
    projected.push(...groups.snoozed);
  }
  marker('settled-header');
  if (groups.settled.length > 0) projected.push(...groups.settled);
  else marker('settled-placeholder');

  const heights = projected.map((item) => {
    const idx = indices.get(sidebarListItemId(item));
    const rect = idx === undefined ? undefined : rects[idx];
    const fallback = item.kind === 'thread' && (item.section === 'pinned' || item.section === 'active' || item.section === 'working') ? cardHeight : slimHeight;
    if (item.kind === 'marker' && (item.marker === 'pinned-header' || item.marker === 'pinned-divider')) return labelHeight;
    if (item.kind === 'marker' && item.marker.endsWith('-placeholder')) return slimHeight;
    if (item.kind === 'thread' && item.key === active.key) return fallback;
    return rect?.height ?? fallback;
  });

  const firstShelfIndex = items.findIndex(isShelfHeaderMarker);
  const shelfRect = firstShelfIndex >= 0 ? rects[firstShelfIndex] : undefined;
  const beforeShelf = firstShelfIndex > 0 ? rects[firstShelfIndex - 1] : undefined;
  const lastRect = rects.at(-1);
  const contentSpan = lastRect ? lastRect.bottom - rects[0].top : 0;
  const availableSpan = Math.max(contentSpan, containerHeight ?? 0);
  const totalProjected = heights.reduce((sum, h) => sum + h, 0) + footerHeight;
  let shelfSpace = (shelfRect && (!beforeShelf || shelfRect.top > beforeShelf.bottom + 1 || availableSpan > totalProjected))
    ? Math.max(0, availableSpan - totalProjected)
    : 0;

  const transforms = new Map();
  for (const item of items) transforms.set(sidebarListItemId(item), { y: 0, hidden: true });
  let top = rects[0].top;
  for (let i = 0; i < projected.length; i++) {
    const item = projected[i];
    if (isShelfHeaderMarker(item)) {
      top += shelfSpace;
      shelfSpace = 0;
    }
    const id = sidebarListItemId(item);
    const idx = indices.get(id);
    const rect = idx === undefined ? undefined : rects[idx];
    if (idx !== undefined && rect) {
      transforms.set(id, { y: Math.round(top - rect.top), hidden: false });
    }
    top += heights[i];
  }
  transforms.set(sidebarListItemId(active), { y: 0, hidden: false });
  return { transforms, target, projected, contentBottom: top };
}

export function pruneOperations(operations, now, limit = 256) {
  const fresh = (operations ?? []).filter((entry) => now - entry.committedAt <= 24 * 60 * 60 * 1000);
  if (fresh.length <= limit) return fresh;
  return null;
}
