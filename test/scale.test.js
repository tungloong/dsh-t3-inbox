import assert from 'node:assert/strict';
import test from 'node:test';
import T3InboxService from '../index.js';
import { foldProgress, initialProgress } from '../lib/model.js';

function completed(id) {
  let state = initialProgress(0, id);
  state = foldProgress(state, { type: 'turn/start', seq: 9, time: 1000, data: { turn: 1 } });
  return foldProgress(state, { type: 'turn/end', seq: 10, time: 2000, data: { turn: 1, reason: { kind: 'completed' } } });
}
function tableHarness() {
  const values = new Map();
  return {
    get: (id) => values.get(id), entries: () => values.entries(),
    put: async (id, value) => { values.set(id, structuredClone(value)); },
    update: async (id, fn) => { const next = fn(values.get(id)); values.set(id, structuredClone(next)); return next; },
  };
}
function hostHarness(ids, descendantsByRoot = {}) {
  const table = tableHarness();
  const host = Object.create(T3InboxService.prototype);
  const state = { active: 0, maxActive: 0 };
  host.generation = 'scale-test'; host.contextSecret = 'scale-secret'; host.pending = new Map(); host.domain = { table: () => table };
  host.ctx = {
    invocation: { peer: { principal: { kind: 'owner' } } },
    sessionController: { list: async () => ({ items: ids.map((id) => ({ sessionId: id, blank: false, updatedAt: 2000, cwd: `/${id}` })) }) },
    subagents: { listDescendants: async (root) => descendantsByRoot[root] ?? [] },
    workspaceRegistry: { list: () => [] }, typertGateway: { getPendingRemoteEvents: () => [] },
  };
  host.readMember = async (id) => {
    state.active += 1; state.maxActive = Math.max(state.maxActive, state.active);
    await new Promise((resolve) => setTimeout(resolve, 1));
    try { return { sessionId: id, label: id, progress: completed(id), runtime: { running: false, queue: [], completeness: 'complete' }, pendingInput: [] }; }
    finally { state.active -= 1; }
  };
  host.refresh = async function () { this.currentSnapshot = await this.buildSnapshot(); };
  return { host, state };
}

test('synthetic 1000-root projection retains bounded member concurrency', async () => {
  const ids = Array.from({ length: 1000 }, (_, index) => `root-${index}`);
  const { host, state } = hostHarness(ids);
  await host.refresh();
  assert.equal(host.currentSnapshot.phase, 'ready');
  assert.equal(host.stats.lastRoots, 1000);
  assert.equal(host.stats.lastMembers, 1000);
  assert.equal(host.stats.lastTreeCalls, 1000);
  assert.equal(host.stats.lastMemberCalls, 1000);
  assert.equal(host.stats.lastMemberErrors, 0);
  assert.equal(state.maxActive, 2);
});

test('synthetic 200-member tree preserves every member and the concurrency limit', async () => {
  const descendants = Array.from({ length: 199 }, (_, index) => ({ kind: 'child', id: `child-${index}` }));
  const { host, state } = hostHarness(['root'], { root: descendants });
  await host.refresh();
  assert.equal(host.currentSnapshot.phase, 'ready');
  assert.equal(host.stats.lastRoots, 1);
  assert.equal(host.stats.lastMembers, 200);
  assert.equal(host.stats.lastTreeCalls, 1);
  assert.equal(host.stats.lastMemberCalls, 200);
  assert.equal(host.stats.lastMemberErrors, 0);
  assert.equal(state.maxActive, 2);
  const card = host.currentSnapshot.cards[0];
  assert.equal(card.members.length, 200);
  assert.equal(card.members[0].sessionId, 'root');
  assert.equal(card.members[199].sessionId, 'child-198');
});

test('multi-root multi-member projection shares the global member concurrency limit of 2', async () => {
  const { host, state } = hostHarness(['root-a', 'root-b'], {
    'root-a': [{ kind: 'child', id: 'child-a' }],
    'root-b': [{ kind: 'child', id: 'child-b' }],
  });
  await host.refresh();
  assert.equal(host.stats.lastRoots, 2);
  assert.equal(host.stats.lastMembers, 4);
  assert.equal(host.stats.lastMemberErrors, 0);
  assert.equal(state.maxActive, 2);
});

test('oversized writeContext over the 100k wire limit disables settle and snooze', async () => {
  const id = (index) => `session-${String(index).padStart(36, '0')}`;
  const { host } = hostHarness([id(0)], {
    [id(0)]: Array.from({ length: 139 }, (_, index) => ({ kind: 'child', id: id(index + 1) })),
  });
  host.readMember = async (sessionId) => {
    let progress = initialProgress(0, sessionId);
    progress = foldProgress(progress, { type: 'turn/end', seq: 10, time: 1794052800000, data: { turn: 1, reason: { kind: 'error' } } });
    progress = foldProgress(progress, { type: 'user/message', seq: 11, time: 1794052800001, data: { id: `message-${sessionId.slice(8)}`, source: { kind: 'user' } } });
    progress = foldProgress(progress, { type: 'turn/start', seq: 12, time: 1794052800002, data: { turn: 2 } });
    progress = foldProgress(progress, { type: 'turn/end', seq: 13, time: 1794052800003, data: { turn: 2, reason: { kind: 'completed' } } });
    return { sessionId, label: sessionId, progress, runtime: { running: false, queue: [], completeness: 'complete' }, pendingInput: [] };
  };
  await host.refresh();
  const card = host.currentSnapshot.cards[0];
  assert.equal(card.members.length, 140);
  assert.equal(card.context, null);
  assert.equal(card.canSettle, false);
  assert.equal(card.canSnooze, false);
});
