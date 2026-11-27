import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyClientPendingOverlay,
  applyClientRunningOverlay,
  classifyCard,
  comparePoint,
  deriveCardStatus,
  foldProgress,
  foldSearchQuery,
  hasActiveQueuedWork,
  hasCompletedTurn,
  inboxSortTimestamp,
  initialProgress,
  isApprovalQuestionIntent,
  isFailureReason,
  isPendingSnoozeException,
  nextCandidate,
  orderedSections,
  pendingKindFromInteraction,
  pinnedFallbackTimestamp,
  pruneOperations,
  scoreCardSearch,
  searchSidebarCards,
  showsCardRelativeTime,
  formatSidebarRelativeTime,
  activityTimestamp,
  settledTimestamp,
  sortInboxCardsByReturn,
  sortPinnedCards,
  sortSettledCards,
  sortSnoozedCards,
  sortWorkingCardsBySend,
  resolveDropVerb,
  sidebarMarkerId,
  sidebarListItemId,
  resolveSidebarDropTarget,
  projectSidebarDrag,
  resolveAdjacentThreadId,
  resolveSidebarSweepKeys,
  providerInitials,
  searchHighlightRange,
  providerStackSources,
  projectionView,
  snoozeStatus,
  workingSortTimestamp,
} from '../lib/model.js';

const runtime = { running: false, queue: [], completeness: 'complete' };
const event = (type, seq, data = {}, time = seq * 1000) => ({ type, seq, time, data });
const ended = (sessionId, seq = 10, kind = 'completed') => {
  let state = initialProgress(0, sessionId);
  state = foldProgress(state, event('turn/start', seq - 1, { turn: 1 }));
  return foldProgress(state, event('turn/end', seq, { turn: 1, reason: { kind } }));
};
const question = (generation = 'g1', continuityKey = 'q/1') => ({
  kind: 'question',
  identity: { sessionId: 'a', generation, continuityKey, contentVersion: 'v1' },
});
const snoozeFor = (pending = [], overrides = {}) => ({
  instanceId: 's1',
  until: new Date(20_000).toISOString(),
  deferredQuestions: pending.map((item) => item.identity),
  failureBaseline: {},
  inputBaseline: {},
  ...overrides,
});

test('fork prefix does not manufacture a new result, and own progress revives', () => {
  const baseline = ended('fork', 8);
  const inherited = initialProgress(8, 'fork');
  const copied = foldProgress(inherited, event('turn/end', 7, { turn: 1, reason: { kind: 'completed' } }));
  assert.equal(copied, inherited);
  assert.equal(comparePoint(baseline.latestResult, inherited.latestResult), true);
  const own = foldProgress(inherited, event('turn/end', 9, { turn: 2, reason: { kind: 'completed' } }));
  assert.equal(own.latestResult.seq, 9);
});

test('request/header and request/context seed provider route', () => {
  let state = initialProgress(0, 'a');
  state = foldProgress(state, event('request/header', 14, {
    header: { config: { provider: 'deepseek-official', model: 'deepseek-flash' } },
  }));
  assert.equal(state.route.provider, 'deepseek-official');
  assert.equal(state.route.model, 'deepseek-flash');
  const same = foldProgress(state, event('request/context', 15, {
    provider: 'deepseek-official', model: 'deepseek-flash',
  }));
  assert.equal(same, state);
  const next = foldProgress(state, event('request/context', 70, {
    provider: 'openrouter', model: 'openai/gpt-5.4',
  }));
  assert.equal(next.route.provider, 'openrouter');
  assert.equal(next.route.model, 'openai/gpt-5.4');
});

test('ordinary metadata does not advance the semantic fold', () => {
  const state = ended('a');
  assert.equal(foldProgress(state, event('session/title', 11, { title: 'renamed' })), state);
});

test('a failed result survives a later successful turn', () => {
  let state = ended('a', 10, 'error');
  state = foldProgress(state, event('turn/start', 11, { turn: 2 }));
  state = foldProgress(state, event('turn/end', 12, { turn: 2, reason: { kind: 'completed' } }));
  assert.equal(state.latestFailure.seq, 10);
  assert.equal(state.latestResult.seq, 12);
});

test('abort/interrupt/fork are not automatically failures', () => {
  for (const kind of ['aborted', 'interrupted', 'forked']) assert.equal(isFailureReason({ kind }), false);
  for (const kind of ['error', 'blocked', 'max-tokens']) assert.equal(isFailureReason({ kind }), true);
});

test('needs you wins over settled and working', () => {
  const card = classifyCard({
    enrolled: true,
    progress: ended('a'),
    settledThrough: { seq: 20, time: 20_000 },
    runtime: { ...runtime, running: true },
    pending: [{ kind: 'approval' }],
  });
  assert.equal(card.section, 'active');
  assert.equal(card.needsYou, true);
  /* T3: needsYou + running still allows Settle when there is a new result. */
  assert.equal(card.canSettle, true);
  assert.equal(card.canSnooze, false);
});

test('child seq advances independently rather than by cross-session maximum', () => {
  const child = ended('child', 9);
  assert.equal(comparePoint(child.latestResult, { seq: 8, sessionId: 'child' }), true);
  assert.equal(comparePoint(child.latestResult, { seq: 100, sessionId: 'parent' }), true);
});

test('snooze keeps background success parked and preserves error→completed wake', () => {
  const before = ended('a', 10);
  const snooze = snoozeFor([], { failureBaseline: { a: before.latestFailure }, inputBaseline: {} });
  const background = ended('a', 12);
  assert.equal(snoozeStatus(snooze, { members: [{ progress: background }], pending: [] }, 15_000).active, true);
  const withFailure = ended('a', 14, 'error');
  assert.equal(snoozeStatus(snooze, { members: [{ progress: withFailure }], pending: [] }, 15_000).reason, 'failure');
  assert.equal(snoozeStatus(snooze, { members: [{ progress: withFailure }], pending: [] }, 25_000).active, false);
});

test('a human input wakes snooze but agent turn start alone does not', () => {
  let state = ended('a', 10);
  const snooze = snoozeFor([], { inputBaseline: { a: state.latestHumanInput } });
  state = foldProgress(state, event('turn/start', 11, { turn: 2 }));
  assert.equal(snoozeStatus(snooze, { members: [{ progress: state }], pending: [] }, 15_000).active, true);
  state = foldProgress(state, event('user/message', 12, { id: 'm1', source: { kind: 'user' } }));
  assert.equal(snoozeStatus(snooze, { members: [{ progress: state }], pending: [] }, 15_000).reason, 'human-input');
});

test('only the exact deferred question instance is hidden', () => {
  const original = question();
  const snooze = snoozeFor([original]);
  assert.equal(isPendingSnoozeException(original, snooze), true);
  assert.equal(isPendingSnoozeException(question('g1', 'q/2'), snooze), false);
  assert.equal(isPendingSnoozeException(question('g2'), snooze), false);
  assert.equal(isPendingSnoozeException({ ...original, kind: 'approval' }, snooze), false);
  assert.equal(isPendingSnoozeException({ ...original, identity: { ...original.identity, contentVersion: 'v2' } }, snooze), false);
});

test('new pending temporarily reveals without discarding the old question exception', () => {
  const old = question();
  const fresh = question('g1', 'q/2');
  const effect = snoozeStatus(snoozeFor([old]), { members: [], pending: [old, fresh] }, 15_000);
  assert.equal(effect.active, false);
  assert.equal(effect.reason, 'pending');
  assert.equal(effect.deferExceptions, true);
  const card = classifyCard({ enrolled: true, progress: ended('a'), runtime, pending: [old, fresh], snoozeEffect: effect });
  assert.equal(card.pendingCount, 1);
  assert.equal(card.section, 'active');
});

test('expiry invalidates deferred questions instead of hiding them forever', () => {
  const old = question();
  const effect = snoozeStatus(snoozeFor([old]), { members: [], pending: [old] }, 25_000);
  assert.equal(effect.woke, true);
  assert.equal(effect.deferExceptions, false);
  const card = classifyCard({ enrolled: true, progress: ended('a'), runtime, pending: [old], snoozeEffect: effect });
  assert.equal(card.needsYou, true);
});

test('unknown completeness or queue blocks settle and snooze', () => {
  for (const state of [{ completeness: 'building', queue: [] }, { completeness: 'complete', queue: null }]) {
    const card = classifyCard({ enrolled: true, progress: ended('a'), runtime: state, pending: [] });
    assert.equal(card.canSettle, false);
    assert.equal(card.canSnooze, false);
  }
});

test('tree results use the originating member and its own settled watermark', () => {
  const parent = ended('parent', 100);
  const child = ended('child', 9);
  const card = classifyCard({
    enrolled: true, progress: parent, runtime,
    members: [
      { sessionId: 'parent', progress: parent, runtime },
      { sessionId: 'child', progress: child, runtime },
    ],
    settledThroughMap: { parent: parent.latestResult, child: { ...child.latestResult, seq: 8 } },
    pending: [],
  });
  assert.equal(card.section, 'active');
  assert.equal(card.result.sessionId, 'child');
  assert.equal(card.result.seq, 9);
  assert.equal(card.canSettle, true);
});

test('a settled parent does not hide a running child', () => {
  const parent = ended('parent', 100);
  const child = ended('child', 9);
  const card = classifyCard({
    enrolled: true, progress: parent,
    runtime: { ...runtime, running: true },
    members: [
      { sessionId: 'parent', progress: parent, runtime },
      { sessionId: 'child', progress: child, runtime: { ...runtime, running: true } },
    ],
    settledThroughMap: { parent: parent.latestResult, child: child.latestResult },
    pending: [],
  });
  assert.equal(card.section, 'working');
  assert.equal(card.canSettle, false);
});

test('running wins Working shelf even with unread Done', () => {
  const progress = ended('a', 1);
  const card = classifyCard({
    enrolled: true,
    progress,
    runtime: { ...runtime, running: true },
    settledThrough: null,
    pending: [],
  });
  assert.equal(card.newResult, true);
  assert.equal(card.running, true);
  assert.equal(card.section, 'working');
  assert.equal(deriveCardStatus(card, true)?.label, 'working');
});

test('Input questions snooze even without identity; approvals do not', () => {
  const input = classifyCard({ enrolled: true, progress: ended('a'), runtime, pending: [{ kind: 'question' }] });
  assert.equal(input.needsYou, true);
  assert.equal(input.canSnooze, true);
  const approval = classifyCard({ enrolled: true, progress: ended('a'), runtime, pending: [{ kind: 'approval' }] });
  assert.equal(approval.needsYou, true);
  assert.equal(approval.canSnooze, false);
});

test('identified Input still allows Snooze while the wait queue is non-empty', () => {
  const card = classifyCard({
    enrolled: true,
    progress: ended('a'),
    runtime: { running: true, queue: [{ kind: 'turn' }], completeness: 'complete' },
    pending: [question(), { kind: 'question', identity: null }],
  });
  assert.equal(card.needsYou, true);
  assert.equal(card.running, true);
  assert.equal(card.canSnooze, true);
  assert.equal(card.canSettle, true);
});

test('working candidates follow shelf visibility and pre-park forward order', () => {
  const cards = [
    { sessionId: 'p', section: 'active', pinned: true, sortAt: 40 },
    { sessionId: 'a', section: 'active', sortAt: 30 },
    { sessionId: 'b', section: 'working', sortAt: 20 },
    { sessionId: 'c', section: 'active', sortAt: 10 },
  ];
  assert.deepEqual(Object.keys(orderedSections(cards)), ['pinned', 'active', 'working', 'snoozed', 'settled']);
  assert.equal(nextCandidate(cards, 'a', 'a')?.sessionId, 'c', 'settling Active #1 advances to Active #2 rather than Pinned #1');
  assert.equal(nextCandidate(cards, 'c', 'c')?.sessionId, 'b', 'expanded Working follows Active');
  assert.equal(nextCandidate(cards, 'c', 'c', null, { workingOpen: false })?.sessionId, 'p', 'collapsed Working is skipped and wraps to Pinned #1');
  const only = [{ sessionId: 'a', section: 'working', sortAt: 20 }];
  assert.equal(nextCandidate(only, 'a', 'a'), null);
});

test('operation retention refuses overflow instead of dropping replay receipts', () => {
  const now = 100_000;
  assert.equal(pruneOperations([{ committedAt: now - 90_000 }], now).length, 1);
  assert.equal(pruneOperations([{ committedAt: now - (24 * 60 * 60 * 1000 + 1) }], now).length, 0);
  assert.equal(pruneOperations(Array.from({ length: 257 }, () => ({ committedAt: now })), now), null);
});

test('active Snooze suppresses Working status while Working/Failed/Limited win over Woke', () => {
  const snoozed = {
    section: 'snoozed',
    snoozed: true,
    completeness: 'complete',
    newResult: true,
    needsYou: false,
    running: true,
    woke: false,
    treeError: null,
    pending: [],
    result: { reason: { kind: 'completed' }, time: 1 },
  };
  assert.equal(deriveCardStatus(snoozed, true), null);
  assert.equal(deriveCardStatus({ ...snoozed, running: false, woke: true, snoozed: false, section: 'active' }, false)?.label, 'woke');
  assert.equal(deriveCardStatus({ ...snoozed, running: true, woke: true, snoozed: false, section: 'working' }, false)?.label, 'working');
  assert.equal(deriveCardStatus({ ...snoozed, running: false, woke: true, snoozed: false, section: 'active', result: { reason: { kind: 'error' }, time: 1 } }, false)?.label, 'failed');
  assert.equal(deriveCardStatus({ ...snoozed, running: false, woke: true, snoozed: false, section: 'active', result: { reason: { kind: 'max-tokens' }, time: 1 } }, false)?.label, 'limited');
});

test('visited Idle cards fall back to relative time; raw newResult must not suppress it', () => {
  const idle = {
    section: 'active',
    completeness: 'complete',
    newResult: true,
    needsYou: false,
    running: false,
    woke: false,
    treeError: null,
    pending: [],
    result: { reason: { kind: 'completed' }, time: 1 },
  };
  // Bug shape: StatusSlot used visited unread=false, but time fallback called cardStatus(card)
  // which defaults unread to newResult and hides the relative time.
  assert.equal(deriveCardStatus(idle)?.label, 'done');
  assert.equal(deriveCardStatus(idle, false), null);
  assert.equal(showsCardRelativeTime(idle, false), true);
  assert.equal(showsCardRelativeTime(idle, true), false);
  assert.equal(deriveCardStatus({ ...idle, needsYou: true, pending: [{ kind: 'question' }] }, false)?.tone, 'input');
  // Cold / incomplete stay quiet in the status slot (relative time), like T3 ready.
  assert.equal(showsCardRelativeTime({ ...idle, completeness: 'unavailable', newResult: false }, false), true);
  assert.equal(deriveCardStatus({ ...idle, completeness: 'unavailable', newResult: false }, false), null);
  assert.equal(deriveCardStatus({ ...idle, cold: true, completeness: 'unavailable', newResult: false }, false), null);
  assert.equal(showsCardRelativeTime({ ...idle, cold: true, completeness: 'unavailable', newResult: false }, false), true);
  assert.equal(deriveCardStatus({ ...idle, treeError: 'tree broken', newResult: false }, false)?.label, 'failed');
  /* max-tokens → Limited (warning), not Failed (error) — T3 usage_limit. */
  assert.equal(deriveCardStatus({ ...idle, result: { reason: { kind: 'max-tokens' }, time: 1 }, newResult: false }, false)?.label, 'limited');
  assert.equal(deriveCardStatus({ ...idle, result: { reason: { kind: 'max-tokens' }, time: 1 }, newResult: false }, false)?.tone, 'limited');
  assert.equal(deriveCardStatus({ ...idle, result: { reason: { kind: 'error' }, time: 1 }, newResult: false }, false)?.label, 'failed');
});

test('sidebar relative time matches T3 compact floor buckets', () => {
  const now = Date.parse('2026-11-13T12:00:00.000Z');
  assert.equal(formatSidebarRelativeTime(now - 5_000, now), 'now');
  assert.equal(formatSidebarRelativeTime(now - 59_999, now), 'now');
  assert.equal(formatSidebarRelativeTime(now - 60_000, now), '1m');
  assert.equal(formatSidebarRelativeTime(now - 89_999, now), '1m'); // floor, not round-up
  assert.equal(formatSidebarRelativeTime(now - 3_600_000, now), '1h');
  assert.equal(formatSidebarRelativeTime(now - 25 * 3_600_000, now), '1d');
  assert.equal(formatSidebarRelativeTime(now - 40 * 86_400_000, now), '40d'); // no mo bucket
  assert.equal(formatSidebarRelativeTime(new Date(now - 120_000).toISOString(), now), '2m');
  assert.equal(formatSidebarRelativeTime(null, now), '');

  for (const locale of ['zh', 'zh-CN']) {
    assert.equal(formatSidebarRelativeTime(now - 5_000, now, locale), '刚刚');
    assert.equal(formatSidebarRelativeTime(now - 59_999, now, locale), '刚刚');
    assert.equal(formatSidebarRelativeTime(now - 60_000, now, locale), '1 分钟');
    assert.equal(formatSidebarRelativeTime(now - 89_999, now, locale), '1 分钟');
    assert.equal(formatSidebarRelativeTime(now - 3_600_000, now, locale), '1 小时');
    assert.equal(formatSidebarRelativeTime(now - 25 * 3_600_000, now, locale), '1 天');
    assert.equal(formatSidebarRelativeTime(now - 40 * 86_400_000, now, locale), '40 天');
    assert.equal(formatSidebarRelativeTime(new Date(now - 120_000).toISOString(), now, locale), '2 分钟');
  }

  const expectedByLocale = [
    ['ja', ['たった今', '1分', '3時間', '5日']],
    ['ja-JP', ['たった今', '1分', '3時間', '5日']],
    ['es', ['ahora', '1 min', '3 h', '5 d']],
    ['fr', ['maintenant', '1 min', '3 h', '5 j']],
    ['de', ['jetzt', '1 Min.', '3 Std.', '5 T.']],
    ['de-DE', ['jetzt', '1 Min.', '3 Std.', '5 T.']],
    ['ru', ['сейчас', '1 мин', '3 ч', '5 д']],
    ['ru-RU', ['сейчас', '1 мин', '3 ч', '5 д']],
    ['pt', ['agora', '1min', '3h', '5d']],
    ['pt-BR', ['agora', '1min', '3h', '5d']],
    ['ko', ['now', '1m', '3h', '5d']],
  ];
  for (const [locale, [nowText, m1Text, h3Text, d5Text]] of expectedByLocale) {
    assert.equal(formatSidebarRelativeTime(now - 5_000, now, locale), nowText);
    assert.equal(formatSidebarRelativeTime(now - 60_000, now, locale), m1Text);
    assert.equal(formatSidebarRelativeTime(now - 3 * 3_600_000, now, locale), h3Text);
    assert.equal(formatSidebarRelativeTime(now - 5 * 86_400_000, now, locale), d5Text);
  }
});

test('activity timestamp follows the newest user, work, or result point', () => {
  const card = {
    sortAt: 10,
    runtime: { startedAt: 20 },
    progress: {
      latestHumanInput: { time: 100 },
      latestResult: { time: 80 },
      latestWork: { time: 90 },
      turn: { start: { time: 70 }, end: { time: 80 } },
    },
    members: [
      { progress: { latestResult: { time: 150 } } },
    ],
  };
  assert.equal(activityTimestamp(card), 150);
  assert.equal(activityTimestamp({ sortAt: 10, runtime: { startedAt: 40 } }), 40);
  assert.equal(activityTimestamp({ sortAt: 12 }), 12);
  assert.equal(activityTimestamp({ sortAt: 0, progress: { latestResult: { time: 0 } } }), null);
});

test('drop verbs match T3 shelf transitions', () => {
  assert.equal(resolveDropVerb('active', 'active'), null);
  assert.equal(resolveDropVerb('active', 'working'), null);
  assert.equal(resolveDropVerb('active', 'snoozed'), null);
  assert.equal(resolveDropVerb('working', 'active'), null);
  assert.equal(resolveDropVerb('active', 'pinned'), 'pin');
  assert.equal(resolveDropVerb('pinned', 'active'), 'unpin');
  assert.equal(resolveDropVerb('active', 'settled'), 'settle');
  assert.equal(resolveDropVerb('pinned', 'settled'), 'settle');
  assert.equal(resolveDropVerb('settled', 'active'), 'unsettle');
  assert.equal(resolveDropVerb('snoozed', 'active'), 'wake');
  assert.equal(resolveDropVerb('snoozed', 'pinned'), 'pin');
  assert.equal(resolveDropVerb('snoozed', 'settled'), 'settle');
});

test('unknown provider initials match T3 two-letter fallback', () => {
  assert.equal(providerInitials('kimi'), 'KI');
  assert.equal(providerInitials('openrouter anthropic'), 'OA');
  assert.equal(providerInitials(''), '');
});

test('search highlight range is case-insensitive and empty-safe', () => {
  assert.equal(searchHighlightRange('了解 inbox-t3', 'INBOX')?.start, 3);
  assert.equal(searchHighlightRange('了解 inbox-t3', 'INBOX')?.end, 8);
  assert.equal(searchHighlightRange('了解 inbox-t3', '   '), null);
  assert.equal(searchHighlightRange('了解 inbox-t3', 'missing'), null);
});

test('provider history follows root request logs, ignores unused selections and deduplicates models', () => {
  let progress = initialProgress(3, 'root');
  progress = foldProgress(progress, event('request/context', 2, { provider:'inherited', model:'old' }));
  progress = foldProgress(progress, event('model/selection', 3, { provider:'unused', model:'unused' }));
  assert.deepEqual(progress.providerHistory, []);
  for (const [i, provider] of ['openai','google','deepseek','openrouter','openai'].entries()) {
    progress = foldProgress(progress, event('request/context', 4 + i, { provider, model:`${provider}-${i}` }));
  }
  assert.deepEqual(progress.providerHistory.map((item) => item.provider), ['openai','google','deepseek','openrouter']);
  assert.equal(progress.providerHistory[0].model, 'openai-4');
  assert.deepEqual(projectionView(progress).providerHistory, progress.providerHistory);
  assert.deepEqual(providerStackSources({ progress }).map((item) => item.providerId), ['deepseek','openrouter','openai']);
});

test('provider stack never borrows child providers and keeps the current instance last', () => {
  const card = {
    providerId:'openrouter', modelId:'moonshot/kimi-k2',
    progress:{ providerHistory:[{ provider:'openrouter', model:'moonshot/old' }, { provider:'openai', model:'gpt-5' }] },
    members:[{}, { progress:{ route:{ provider:'child-only', model:'claude-child' } } }],
  };
  assert.deepEqual(providerStackSources(card).map((item) => item.providerId), ['openai','openrouter']);
  assert.deepEqual(providerStackSources({ ...card, progress:null }).map((item) => item.providerId), ['openrouter']);
  assert.deepEqual(providerStackSources({ providerId: 'deepseek', modelId: 'deepseek-flash' }).map((item) => item.modelId), ['deepseek-flash']);
});

test('Client pendingInteraction does not yank an active Snooze back to Active', () => {
  const snoozed = {
    sessionId: 'a',
    section: 'snoozed',
    snoozed: true,
    needsYou: false,
    running: true,
    pending: [],
    pendingCount: 0,
    canSettle: false,
    snoozeEffect: { active: true, woke: false, snooze: { until: new Date(Date.now() + 60000).toISOString() } },
  };
  assert.equal(applyClientPendingOverlay(snoozed, 'question'), snoozed);
});

test('ask_user_question intent string plan-review maps to Approval', () => {
  /* Live DSH tool args: intent is a string, not { kind }. */
  assert.equal(isApprovalQuestionIntent({ intent: 'plan-review' }), true);
  assert.equal(isApprovalQuestionIntent({ intent: 'approval' }), true);
  assert.equal(isApprovalQuestionIntent({ intent: { kind: 'plan-review' } }), true);
  assert.equal(isApprovalQuestionIntent({ intent: { type: 'approval' } }), true);
  assert.equal(isApprovalQuestionIntent({ intent: 'question' }), false);
  /* Header alone is enough when Host ask() strips intent before wrap. */
  assert.equal(isApprovalQuestionIntent({ header: 'Plan Review' }), true);
  assert.equal(isApprovalQuestionIntent({ header: 'Other' }), false);
  const approvalCard = {
    sessionId: 'a',
    section: 'active',
    needsYou: true,
    pending: [{ kind: 'approval' }],
    running: false,
    result: null,
  };
  assert.equal(deriveCardStatus(approvalCard, false)?.tone, 'approval');
  assert.equal(deriveCardStatus(approvalCard, false)?.label, 'approval');
});

test('Client pendingInteraction overlays Working into Input/Approval', () => {
  assert.equal(pendingKindFromInteraction('question'), 'question');
  assert.equal(pendingKindFromInteraction('approval'), 'approval');
  assert.equal(pendingKindFromInteraction('plan-review'), 'approval');
  assert.equal(pendingKindFromInteraction(undefined), null);
  const working = {
    sessionId: 'a',
    section: 'working',
    needsYou: false,
    running: true,
    pending: [],
    pendingCount: 0,
    canSettle: true,
    snoozeEffect: null,
  };
  const input = applyClientPendingOverlay(working, 'question');
  assert.equal(input.needsYou, true);
  assert.equal(input.section, 'active');
  assert.equal(input.canSettle, true); /* T3: Settle stays available during Input */
  assert.equal(input.pending[0].kind, 'question');
  assert.equal(deriveCardStatus(input, false)?.tone, 'input');
  const approval = applyClientPendingOverlay(working, 'approval');
  assert.equal(deriveCardStatus(approval, false)?.tone, 'approval');
  assert.equal(applyClientPendingOverlay(working, null), working);
  const settled = applyClientPendingOverlay({ ...working, section: 'settled', canSettle: false, running: false }, 'question');
  assert.equal(settled.section, 'settled'); /* do not yank Settled back to Active */
  assert.equal(settled.needsYou, true);
});

test('Settle stays available while Input is pending (T3 attention-only)', () => {
  const progress = ended('a', 1);
  const card = classifyCard({
    enrolled: true,
    progress,
    runtime,
    pending: [{ kind: 'question', identity: { continuityKey: 'c', contentVersion: 'v', generation: 'g' } }],
    members: [{ sessionId: 'a', progress, runtime }],
  });
  assert.equal(card.needsYou, true);
  assert.equal(card.newResult, true);
  assert.equal(card.canSettle, true);
  assert.equal(card.section, 'active');
  const waiting = classifyCard({
    enrolled: true,
    progress,
    runtime: { ...runtime, running: true },
    pending: [{ kind: 'question', identity: { continuityKey: 'c', contentVersion: 'v', generation: 'g' } }],
    members: [{ sessionId: 'a', progress, runtime: { ...runtime, running: true } }],
  });
  assert.equal(waiting.needsYou, true);
  assert.equal(waiting.running, true);
  assert.equal(waiting.canSettle, true);
  const parked = classifyCard({
    enrolled: true,
    progress,
    runtime,
    pending: [{ kind: 'question', identity: { continuityKey: 'c', contentVersion: 'v', generation: 'g' } }],
    members: [{ sessionId: 'a', progress, runtime }],
    settledThrough: progress.latestResult,
    settledThroughMap: { a: progress.latestResult },
  });
  assert.equal(parked.needsYou, true);
  assert.equal(parked.newResult, false);
  assert.equal(parked.section, 'settled');
});

test('Working status takes priority over prior-turn Failed and Limited results', () => {
  const workingWithError = {
    section: 'working',
    completeness: 'complete',
    newResult: false,
    needsYou: false,
    running: true,
    woke: false,
    snoozed: false,
    treeError: null,
    pending: [],
    result: { reason: { kind: 'error' }, time: 1 },
  };
  assert.equal(deriveCardStatus(workingWithError, false)?.label, 'working');
  assert.equal(deriveCardStatus(workingWithError, false)?.tone, 'working');
  assert.equal(deriveCardStatus({ ...workingWithError, result: { reason: { kind: 'blocked' }, time: 1 } }, false)?.tone, 'working');
  assert.equal(deriveCardStatus({ ...workingWithError, result: { reason: { kind: 'max-tokens' }, time: 1 } }, false)?.tone, 'working');
  assert.equal(deriveCardStatus({ ...workingWithError, running: false, section: 'active' }, false)?.label, 'failed');
  assert.equal(deriveCardStatus({ ...workingWithError, running: false, section: 'active', result: { reason: { kind: 'max-tokens' }, time: 1 } }, false)?.label, 'limited');
});

test('settledTimestamp prefers settledAt over activity timestamps and falls back cleanly', () => {
  const isoSettled = '2026-11-16T12:00:00.000Z';
  const expectedMs = Date.parse(isoSettled);
  assert.equal(settledTimestamp({
    settledAt: isoSettled,
    progress: { latestResult: { time: 7777 } },
    sortAt: 1000,
    result: { time: 2000 },
  }), expectedMs);
  assert.equal(settledTimestamp({
    settledAt: 5500,
    progress: { latestResult: { time: 9999 } },
    sortAt: 1000,
  }), 5500);
  assert.equal(settledTimestamp({
    settledAt: null,
    progress: { latestResult: { time: 7777 } },
    sortAt: 1000,
  }), 7777);
  assert.equal(settledTimestamp({ sortAt: 4200, settledAt: '' }), 4200);
  assert.equal(settledTimestamp(null), null);
});

test('resolveAdjacentThreadId navigates without wrapping and handles null/missing ids', () => {
  const threadIds = ['a', 'b', 'c'];
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: null, direction: 'next' }), 'a');
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: null, direction: 'previous' }), 'c');
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: 'a', direction: 'previous' }), null);
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: 'b', direction: 'previous' }), 'a');
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: 'b', direction: 'next' }), 'c');
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: 'c', direction: 'next' }), null);
  assert.equal(resolveAdjacentThreadId({ threadIds, currentThreadId: 'missing', direction: 'next' }), null);
  assert.equal(resolveAdjacentThreadId({ threadIds: [], currentThreadId: null, direction: 'next' }), null);
});

test('resolveSidebarSweepKeys returns inclusive directional slice filtered by canApply', () => {
  const ordered = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(resolveSidebarSweepKeys(ordered, 'b', 'd', (id) => id !== 'c'), ['b', 'd']);
  assert.deepEqual(resolveSidebarSweepKeys(ordered, 'd', 'b', () => true), ['b', 'c', 'd']);
  assert.deepEqual(resolveSidebarSweepKeys(ordered, 'missing', 'b', () => true), []);
  assert.deepEqual(resolveSidebarSweepKeys(ordered, 'b', 'missing', () => true), []);
});

test('nextCandidate skips excludeIds (coParkingKeys) across eligible candidates', () => {
  const card = (sessionId, sortAt) => ({ sessionId, section: 'active', pinned: false, archived: false, accessible: true, sortAt });
  const cards = [card('a', 300), card('b', 200), card('c', 100)];
  assert.equal(nextCandidate(cards, 'a', 'a', new Set(['b']))?.sessionId, 'c');
  assert.equal(nextCandidate(cards, 'a', 'a', new Set(['b', 'c'])), null);
});

test('resolveSidebarDropTarget resolves reorder and cross-shelf transitions and rejects working/snoozed', () => {
  const items = [
    { kind: 'marker', marker: 'pinned-header' },
    { kind: 'thread', key: 'p1', section: 'pinned' },
    { kind: 'marker', marker: 'pinned-divider' },
    { kind: 'thread', key: 'a1', section: 'active' },
    { kind: 'thread', key: 'a2', section: 'active' },
    { kind: 'marker', marker: 'active-placeholder' },
    { kind: 'marker', marker: 'working-header' },
    { kind: 'thread', key: 'w1', section: 'working' },
    { kind: 'marker', marker: 'snoozed-header' },
    { kind: 'thread', key: 'z1', section: 'snoozed' },
    { kind: 'marker', marker: 'settled-header' },
    { kind: 'marker', marker: 'settled-placeholder' },
  ];
  assert.deepEqual(
    resolveSidebarDropTarget(items, 'a1', sidebarMarkerId('pinned-divider')),
    { section: 'pinned', pinnedOrder: ['p1', 'a1'], activeOrder: ['a2'] },
  );
  assert.deepEqual(
    resolveSidebarDropTarget(items, 'p1', sidebarMarkerId('pinned-divider')),
    { section: 'active', pinnedOrder: [], activeOrder: ['p1', 'a1', 'a2'] },
  );
  assert.deepEqual(
    resolveSidebarDropTarget(items, 'a1', sidebarMarkerId('settled-header')),
    { section: 'settled', pinnedOrder: ['p1'], activeOrder: ['a2'] },
  );
  assert.equal(resolveSidebarDropTarget(items, 'a1', sidebarMarkerId('working-header')), null);
  assert.equal(resolveSidebarDropTarget(items, 'a1', sidebarMarkerId('snoozed-header')), null);
  assert.equal(sidebarListItemId(items[0]), sidebarMarkerId('pinned-header'));
});

test('projectSidebarDrag displaces boundaries, 36px placeholders, and expanded settled rows', () => {
  const makeRect = (top, height) => ({ top, bottom: top + height, height });
  const items = [
    { kind: 'marker', marker: 'pinned-header' },
    { kind: 'marker', marker: 'pinned-divider' },
    { kind: 'thread', key: 'a1', section: 'active' },
    { kind: 'marker', marker: 'active-placeholder' },
    { kind: 'marker', marker: 'settled-header' },
    { kind: 'marker', marker: 'settled-placeholder' },
  ];
  const rects = [
    makeRect(0, 0),
    makeRect(0, 0),
    makeRect(0, 64),
    makeRect(64, 0),
    makeRect(360, 32),
    makeRect(392, 0),
  ];

  // Dragging sole active thread into Pinned reveals active-placeholder (hidden: false) and shifts divider down by 64px.
  const toPinned = projectSidebarDrag({
    items,
    rects,
    activeKey: 'a1',
    overId: sidebarMarkerId('pinned-header'),
    containerHeight: 392,
    footerHeight: 0,
  });
  assert.equal(toPinned.target?.section, 'pinned');
  assert.equal(toPinned.transforms.get(sidebarMarkerId('pinned-header')).y, 0);
  assert.equal(toPinned.transforms.get(sidebarMarkerId('pinned-divider')).y, 88);
  assert.equal(toPinned.transforms.get(sidebarMarkerId('active-placeholder')).hidden, false);
  assert.equal(toPinned.transforms.get(sidebarMarkerId('active-placeholder')).y, 48);

  // Dragging active thread over collapsed empty Settled reveals settled-placeholder (36px) and lifts settled-header by -36px.
  const toSettled = projectSidebarDrag({
    items,
    rects,
    activeKey: 'a1',
    overId: sidebarMarkerId('settled-header'),
    containerHeight: 392,
    footerHeight: 0,
  });
  assert.equal(toSettled.target?.section, 'settled');
  assert.equal(toSettled.transforms.get(sidebarMarkerId('settled-placeholder')).hidden, false);
  assert.equal(toSettled.transforms.get(sidebarMarkerId('settled-header')).y, -36);

  // Expanded Settled with an existing row pushes settled-header up to open a 36px slot at index 0.
  const expItems = [
    { kind: 'marker', marker: 'pinned-header' },
    { kind: 'marker', marker: 'pinned-divider' },
    { kind: 'thread', key: 'a1', section: 'active' },
    { kind: 'marker', marker: 'active-placeholder' },
    { kind: 'marker', marker: 'settled-header' },
    { kind: 'marker', marker: 'settled-placeholder' },
    { kind: 'thread', key: 's1', section: 'settled' },
  ];
  const expRects = [
    makeRect(0, 0),
    makeRect(0, 0),
    makeRect(0, 64),
    makeRect(64, 0),
    makeRect(324, 32),
    makeRect(356, 0),
    makeRect(356, 36),
  ];
  const toExpanded = projectSidebarDrag({
    items: expItems,
    rects: expRects,
    activeKey: 'a1',
    overId: sidebarMarkerId('settled-header'),
    settledOrder: ['s1'],
    settledExpanded: true,
    settledVisibleCount: 10,
    containerHeight: 392,
    footerHeight: 0,
  });
  assert.equal(toExpanded.transforms.get(sidebarMarkerId('settled-placeholder')).hidden, true);
  assert.equal(toExpanded.transforms.get(sidebarMarkerId('settled-header')).y, -36);
  assert.equal(toExpanded.transforms.get('s1').hidden, false);
});

test('inboxSortTimestamp and sortInboxCardsByReturn align with T3 return ordering and ignore manualUnread', () => {
  const baseProgress = initialProgress(0, 'x');
  // Brand-new or forked session with no turn/end yet must sort by createdAt, never 0.
  const freshFork = classifyCard({
    enrolled: true,
    progress: baseProgress,
    members: [{ sessionId: 'fork', progress: baseProgress, runtime }],
    runtime,
    pending: [],
    createdAt: 5_000,
    unsettledAt: null,
  });
  assert.equal(freshFork.sortAt, 5_000);

  // Older completed card whose unreadAt is set manually keeps its real activity timestamp for sortAt.
  const markedUnread = classifyCard({
    enrolled: true,
    progress: ended('unread', 10),
    members: [{ sessionId: 'unread', progress: ended('unread', 10), runtime }],
    runtime,
    pending: [],
    createdAt: 1_000,
    unreadAt: 999_000,
  });
  assert.equal(markedUnread.sortAt, 10_000);

  const restored = {
    sessionId: 'restored',
    section: 'active',
    createdAt: 1_000,
    unsettledAt: 15_000,
    progress: ended('restored', 2),
  };
  const returned = {
    sessionId: 'returned',
    section: 'active',
    createdAt: 2_000,
    observedReturnAt: 20_000,
    progress: ended('returned', 3),
  };
  const olderNew = {
    sessionId: 'fork',
    section: 'active',
    ...freshFork,
    createdAt: 5_000,
    progress: baseProgress,
  };
  const manual = {
    sessionId: 'unread',
    section: 'active',
    ...markedUnread,
    createdAt: 1_000,
    unreadAt: 999_000,
    progress: ended('unread', 10),
  };
  assert.equal(inboxSortTimestamp(restored), 15_000);
  assert.equal(inboxSortTimestamp(returned), 20_000);
  assert.deepEqual(
    sortInboxCardsByReturn([olderNew, restored, manual, returned]).map((c) => c.sessionId),
    ['returned', 'restored', 'unread', 'fork'],
  );
});

test('sortPinnedCards honors manual pin order first and stabilizes keyless pins by createdAt desc', () => {
  const pinCard = (sessionId, createdAt, latestResultTime) => ({
    sessionId,
    section: 'active',
    pinned: true,
    createdAt,
    progress: { latestResult: { seq: 1, time: latestResultTime, sessionId, kind: 'turn-end' } },
  });
  const p1 = pinCard('p1', 100, 99_000);
  const p2 = pinCard('p2', 200, 1_000);
  const p3 = pinCard('p3', 300, 100);
  const p4 = pinCard('p4', 400, 50);
  assert.equal(pinnedFallbackTimestamp(p1), 100);
  assert.deepEqual(
    sortPinnedCards([p1, p2, p3, p4], ['p2', 'p1']).map((c) => c.sessionId),
    ['p2', 'p1', 'p4', 'p3'],
  );
  // Keyless pins ignore message activity (p1 has latestResult 99_000 but createdAt 100).
  assert.deepEqual(
    sortPinnedCards([p1, p2, p3], null).map((c) => c.sessionId),
    ['p3', 'p2', 'p1'],
  );
});

test('sortWorkingCardsBySend sorts by max(createdAt, latestHumanInput ?? turnStart) and ignores streaming updatedAt', () => {
  const workCard = (sessionId, { createdAt, inputAt, startAt, startedAt }) => ({
    sessionId,
    section: 'working',
    createdAt,
    runtime: { running: true, queue: [], startedAt, completeness: 'complete' },
    progress: {
      latestHumanInput: inputAt ? { seq: 1, time: inputAt, sessionId, kind: 'human-input' } : null,
      turn: startAt ? { start: { seq: 2, time: startAt, sessionId, kind: 'turn-start' }, end: null } : null,
    },
  });
  const sentFirstStreaming = workCard('first', { createdAt: 100, inputAt: 1_000, startAt: 9_000, startedAt: 99_000 });
  const sentLast = workCard('last', { createdAt: 100, inputAt: 2_000, startAt: 2_000, startedAt: 3_000 });
  const launchedNoMsg = workCard('launched', { createdAt: 500, inputAt: null, startAt: null, startedAt: 5_000 });
  assert.equal(workingSortTimestamp(sentFirstStreaming), 1_000);
  assert.deepEqual(
    sortWorkingCardsBySend([launchedNoMsg, sentFirstStreaming, sentLast]).map((c) => c.sessionId),
    ['last', 'first', 'launched'],
  );
});

test('searchSidebarCards ranks whole-word title matches over prefixes, branches, projects, and typos with CJK + recency ties', () => {
  const now = 1_000_000_000;
  const exactTitle = {
    sessionId: 's-exact',
    title: 'Inbox',
    branch: 'main',
    workspaceTitle: 'Other',
    progress: { latestWork: { time: now - 5 * 86_400_000 } },
  };
  const wordRecent = {
    sessionId: 's-word-recent',
    title: 'Fix inbox sort',
    branch: 'main',
    workspaceTitle: 'Other',
    progress: { latestWork: { time: now - 1_000 } },
  };
  const wordStale = {
    sessionId: 's-word-stale',
    title: 'Fix inbox old',
    branch: 'main',
    workspaceTitle: 'Other',
    progress: { latestWork: { time: now - 10 * 86_400_000 } },
  };
  const prefixTitle = {
    sessionId: 's-prefix',
    title: 'Inboxer panel',
    branch: 'main',
    workspaceTitle: 'Other',
    progress: { latestWork: { time: now } },
  };
  const branchMatch = {
    sessionId: 's-branch',
    title: 'Unrelated task',
    branch: 't3/inbox-sort',
    workspaceTitle: 'Other',
    progress: { latestWork: { time: now } },
  };
  const projectOnly = {
    sessionId: 's-project',
    title: 'General cleanup',
    branch: 'main',
    workspaceTitle: 'Inbox workspace',
    progress: { latestWork: { time: now } },
  };

  assert.equal(foldSearchQuery('  "Fix   Sidebar"  '), 'fix sidebar');
  const hits = searchSidebarCards(
    [projectOnly, branchMatch, prefixTitle, wordStale, wordRecent, exactTitle],
    'inbox',
    now,
  );
  assert.deepEqual(
    hits.map((h) => h.card.sessionId),
    ['s-exact', 's-word-recent', 's-word-stale', 's-prefix', 's-branch', 's-project'],
  );
  assert.deepEqual(hits[0].ranges, [{ start: 0, end: 5 }]);

  // Joined words, CJK word boundaries, and 1-edit typo fallback.
  const cjkAndJoined = [
    { sessionId: 'c1', title: '继续推进 dsh-t3-inbox 项目' },
    { sessionId: 'c2', title: 'Deploy worker service' },
  ];
  assert.deepEqual(searchSidebarCards(cjkAndJoined, '推进', now).map((h) => h.card.sessionId), ['c1']);
  assert.deepEqual(searchSidebarCards(cjkAndJoined, 't3inb', now).map((h) => h.card.sessionId), ['c1']);
  assert.deepEqual(searchSidebarCards(cjkAndJoined, 'Deplyo', now).map((h) => h.card.sessionId), ['c2']);
  assert.ok(scoreCardSearch('inbox', branchMatch, now));
});

test('zero-result sessions settle via settledOverride, auto-unsettle on new result, and Woke unblocks Working', () => {
  const blank = initialProgress(0, 'a');
  assert.equal(hasCompletedTurn({ progress: blank, members: [{ sessionId: 'a', progress: blank }] }), false);
  const idleBlank = classifyCard({ enrolled: true, progress: blank, runtime, pending: [] });
  assert.equal(idleBlank.section, 'active');
  assert.equal(idleBlank.canSettle, true);

  const settledBlank = classifyCard({
    enrolled: true,
    progress: blank,
    runtime,
    pending: [],
    settledAt: 10_000,
    settledOverride: 'settled',
  });
  assert.equal(settledBlank.section, 'settled');
  assert.equal(settledBlank.canSettle, false);

  const restoredByNewResult = classifyCard({
    enrolled: true,
    progress: ended('a', 5),
    runtime,
    pending: [],
    settledThrough: {},
    settledAt: 10_000,
    settledOverride: 'settled',
  });
  assert.equal(restoredByNewResult.section, 'active');
  assert.equal(restoredByNewResult.newResult, true);

  // Mark unread keeps settled card in Settled, and fresher turn activity retires stale unreadAt.
  const prog = ended('a', 10);
  const unreadSettled = classifyCard({
    enrolled: true,
    progress: prog,
    runtime,
    pending: [],
    settledThrough: prog.latestResult,
    settledThroughMap: { a: prog.latestResult },
    settledAt: 12_000,
    settledOverride: 'settled',
    unreadAt: 15_000,
  });
  assert.equal(unreadSettled.section, 'settled');
  assert.equal(unreadSettled.manualUnread, true);
  assert.equal(hasCompletedTurn({ ...unreadSettled, progress: prog }), true);

  const retiredUnread = classifyCard({
    enrolled: true,
    progress: ended('a', 11),
    runtime,
    pending: [],
    settledThrough: ended('a', 11).latestResult,
    settledThroughMap: { a: ended('a', 11).latestResult },
    settledAt: 12_000,
    settledOverride: 'settled',
    unreadAt: 5_000,
  });
  assert.equal(retiredUnread.manualUnread, false);

  // Running card enters Working even when woke === true.
  const wokeRunning = classifyCard({
    enrolled: true,
    progress: prog,
    runtime: { ...runtime, running: true },
    pending: [],
    snoozeEffect: { active: false, woke: true, deferExceptions: false, snooze: null },
  });
  assert.equal(wokeRunning.section, 'working');
  assert.equal(deriveCardStatus(wokeRunning, false)?.label, 'working');
});

test('parent Waiting subagent state and workingShelfEnabled folding behave per T3', () => {
  const idleRoot = ended('root', 10);
  const runningChild = foldProgress(initialProgress(0, 'child'), event('turn/start', 11, { turn: 2 }, 15_000));
  const waitingCard = classifyCard({
    enrolled: true,
    progress: idleRoot,
    runtime: { running: false, queue: [], completeness: 'complete' },
    members: [
      { id: 'root', progress: idleRoot, runtime: { running: false, queue: [] } },
      { id: 'child', progress: runningChild, runtime: { running: true, queue: [] } },
    ],
    pending: [],
  });
  assert.equal(waitingCard.running, true);
  assert.equal(waitingCard.waiting, true);
  assert.equal(waitingCard.section, 'working');
  assert.deepEqual(deriveCardStatus(waitingCard, false), { icon: 'dotdashed', label: 'waiting', tone: 'waiting' });

  const bothRunning = classifyCard({
    enrolled: true,
    progress: idleRoot,
    runtime: { running: true, queue: [], completeness: 'complete' },
    members: [
      { id: 'root', progress: idleRoot, runtime: { running: true, queue: [] } },
      { id: 'child', progress: runningChild, runtime: { running: true, queue: [] } },
    ],
    pending: [],
  });
  assert.equal(bothRunning.waiting, false);
  assert.deepEqual(deriveCardStatus(bothRunning, false), { icon: 'dashed', label: 'working', tone: 'working' });

  const cards = [
    { sessionId: 'a1', section: 'active', pinned: false, createdAt: 1000, sortAt: 1000 },
    { sessionId: 'w1', section: 'working', waiting: true, pinned: false, createdAt: 2000, sortAt: 3000 },
    { sessionId: 'a2', section: 'active', pinned: false, createdAt: 1500, sortAt: 1500 },
  ];
  const shelfOff = orderedSections(cards, null, { workingShelfEnabled: false });
  assert.deepEqual(shelfOff.working, []);
  assert.deepEqual(shelfOff.active.map((c) => c.sessionId), ['w1', 'a2', 'a1']);
  assert.equal(nextCandidate(cards, 'w1', 'w1', null, { workingShelfEnabled: false })?.sessionId, 'a2');
});

test('workingGrace placement hold never paints Working status and applyClientRunningOverlay clears stale root running', () => {
  const graceCard = { sessionId: 'g1', section: 'working', running: false, workingGrace: true, newResult: true };
  assert.equal(deriveCardStatus(graceCard, false), null);
  assert.deepEqual(deriveCardStatus(graceCard, true), { icon: 'checkcircle', label: 'done', tone: 'done' });
  assert.deepEqual(
    deriveCardStatus({ ...graceCard, result: { reason: { kind: 'error' }, time: 1 } }, false),
    { icon: 'alert', label: 'failed', tone: 'failed' },
  );

  const staleWorking = {
    sessionId: 'r1',
    section: 'working',
    running: true,
    waiting: false,
    needsYou: false,
    runtime: { running: true, queue: [], completeness: 'complete' },
    members: [{ sessionId: 'r1', runtime: { running: true, queue: [] } }],
  };
  // Pending or non-false summaries leave Host state untouched.
  assert.equal(applyClientRunningOverlay(staleWorking, { phase: 'pending', byId: { r1: { running: false } } }), staleWorking);
  assert.equal(applyClientRunningOverlay(staleWorking, { phase: 'ready', byId: { r1: { running: true } } }), staleWorking);
  assert.equal(applyClientRunningOverlay(staleWorking, { phase: 'ready', byId: { r1: {} } }), staleWorking);
  // Queued follow-ups stay running until Host confirms.
  const queued = { ...staleWorking, runtime: { running: true, queue: [{ id: 'q1' }], completeness: 'complete' } };
  assert.equal(applyClientRunningOverlay(queued, { phase: 'ready', byId: { r1: { running: false } } }), queued);

  // Live Client idle clears running/working immediately when no child is running.
  const cleared = applyClientRunningOverlay(staleWorking, { phase: 'ready', byId: { r1: { running: false } } });
  assert.equal(cleared.running, false);
  assert.equal(cleared.waiting, false);
  assert.equal(cleared.section, 'active');

  // Root idle with an active subagent child transitions to Waiting instead of clearing running.
  const withChild = {
    ...staleWorking,
    members: [
      { sessionId: 'r1', runtime: { running: true, queue: [] } },
      { sessionId: 'c1', runtime: { running: true, queue: [] } },
    ],
  };
  const waiting = applyClientRunningOverlay(withChild, { phase: 'ready', byId: { r1: { running: false }, c1: { running: false } } });
  assert.equal(waiting.running, true);
  assert.equal(waiting.waiting, true);
  assert.equal(waiting.section, 'working');
});

test('passive placement:"context" queue entries never classify idle threads as working or block snooze/settle', () => {
  const contextQueue = [{ id: 'q-ctx', placement: 'context', content: [{ type: 'text', text: '[SCHEDULE CHANGE]' }] }];
  const realQueue = [{ id: 'q-next', placement: 'next', content: [{ type: 'text', text: 'Follow up' }] }];
  const untaggedQueue = [{ id: 'q-raw', content: [{ type: 'text', text: 'Queued prompt' }] }];

  assert.equal(hasActiveQueuedWork([]), false);
  assert.equal(hasActiveQueuedWork(null), false);
  assert.equal(hasActiveQueuedWork(contextQueue), false);
  assert.equal(hasActiveQueuedWork(realQueue), true);
  assert.equal(hasActiveQueuedWork(untaggedQueue), true);
  assert.equal(hasActiveQueuedWork([...contextQueue, ...realQueue]), true);

  const doneProgress = ended('ctx-only', 10);
  const idleWithContext = classifyCard({
    enrolled: true,
    progress: doneProgress,
    members: [{ sessionId: 'ctx-only', progress: doneProgress, runtime: { running: false, queue: contextQueue, completeness: 'complete' } }],
    runtime: { running: false, queue: contextQueue, completeness: 'complete' },
    pending: [],
    now: 20_000,
  });
  assert.equal(idleWithContext.running, false);
  assert.equal(idleWithContext.section, 'active');
  assert.equal(idleWithContext.canSettle, true);
  assert.equal(idleWithContext.canSnooze, true);

  const activeWithReal = classifyCard({
    enrolled: true,
    progress: doneProgress,
    members: [{ sessionId: 'real-q', progress: doneProgress, runtime: { running: false, queue: [...contextQueue, ...realQueue], completeness: 'complete' } }],
    runtime: { running: false, queue: [...contextQueue, ...realQueue], completeness: 'complete' },
    pending: [],
    now: 20_000,
  });
  assert.equal(activeWithReal.running, true);
  assert.equal(activeWithReal.section, 'working');
  assert.equal(activeWithReal.canSettle, false);
  assert.equal(activeWithReal.canSnooze, false);

  const staleCard = {
    sessionId: 'ctx-only',
    section: 'working',
    running: true,
    waiting: false,
    needsYou: false,
    runtime: { running: false, queue: contextQueue, completeness: 'complete' },
    members: [{ sessionId: 'ctx-only', runtime: { running: false, queue: contextQueue }, progress: doneProgress }],
  };
  const overlaid = applyClientRunningOverlay(staleCard, { phase: 'ready', byId: { 'ctx-only': { running: false } } });
  assert.equal(overlaid.running, false);
  assert.equal(overlaid.section, 'active');
});



