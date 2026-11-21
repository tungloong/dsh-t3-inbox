import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import T3InboxService from '../index.js';
import { foldProgress, initialProgress } from '../lib/model.js';
import * as sharedModel from '../lib/model.js';
import React, { act } from 'react';
import { createPortal } from 'react-dom';
import { JSDOM } from 'jsdom';

let cachedClientDefinition = null;

function completed(id, seq = 10) {
  let state = initialProgress(0, id);
  state = foldProgress(state, { type: 'turn/start', seq: seq - 1, time: 1000 + seq, data: { turn: 1 } });
  return foldProgress(state, { type: 'turn/end', seq, time: 2000 + seq, data: { turn: 1, reason: { kind: 'completed' } } });
}
function source(initial) {
  let value = initial;
  const listeners = new Set();
  return { getSnapshot: () => value, subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }, set: (next) => { value = next; for (const fn of [...listeners]) fn(); } };
}
function tableHarness() {
  const values = new Map();
  let writes = Promise.resolve();
  return {
    get: (id) => values.get(id), entries: () => values.entries(),
    put: async (id, value) => { values.set(id, structuredClone(value)); },
    update(id, fn) { writes = writes.then(() => fn(values.get(id))).then((next) => { values.set(id, structuredClone(next)); return next; }); return writes; },
    values,
  };
}
async function hostHarness(ids) {
  const host = Object.create(T3InboxService.prototype);
  const table = tableHarness();
  host.generation = 'integration-host'; host.contextSecret = 'integration-secret'; host.pending = new Map(); host.running = new Set(); host.domain = { table: () => table };
  host.ctx = {
    invocation: { peer: { principal: { kind: 'owner' } } },
    sessionController: {
      list: async () => ({
        items: ids.map((id) => ({
          sessionId: id, blank: false, updatedAt: 2000, cwd: `/${id}`,
          projections: { values: { title: { title: id } } },
        })),
      }),
    },
    subagents: { listDescendants: async () => [] }, workspaceRegistry: { list: () => [] }, typertGateway: { getPendingRemoteEvents: () => [] },
  };
  host.readMember = async (id) => ({ sessionId: id, label: id, progress: completed(id), runtime: { running: host.running.has(id), queue: [], completeness: 'complete' }, pendingInput: [] });
  host.refresh = async function () { this.currentSnapshot = await this.buildSnapshot(); };
  await host.refresh();
  for (const id of ids) await table.update(id, (record) => ({ ...record, settledThrough: {}, settledAt: null }));
  await host.refresh();
  return { host, table };
}

async function clientHarness(ids, { holdActions = false, injectSharedModel = false, render = false, nativeMenus = false, openContextMenus = false, shortcuts = false, storage = undefined, renameSession = null, searchSessions = null, archiveSession = null, globalPanels = true, hostPanels = [] } = {}) {
  const { host, table } = await hostHarness(ids);
  const panel = source({ activePanelId: null });
  const sessions = source({ byId: { [ids[0]]: { id: ids[0], retainedBy: { mainView: 1 } } } });
  const workspaces = source({ items: [], pinnedSessionIds: [], archivedSessionIds: [] });
  const locale = source({ id:'zh' });
  const registrations = [];
  const slotListeners = new Map();
  const notifySlots = (key) => {
    for (const fn of [...(slotListeners.get(key) ?? [])]) fn();
  };
  for (const hp of hostPanels) {
    registrations.push({
      options: { name: 'sidebar.panellist', id: hp.id, order: hp.order ?? 0, label: hp.label },
      component: 'component' in hp ? hp.component : (() => React.createElement('svg', { className: `host-panel-icon-${hp.id}`, 'data-host-icon': hp.id })),
    });
  }
  const effects = [];
  const eventListeners = new Map();
  const hostListeners = new Set();
  const startSessionCalls = [];
  const openSessionCalls = [];
  const menuRegistrations = [];
  const openedContextMenus = [];
  const openedSettings = [];
  const dictionaries = {};
  let releaseAction = null;
  let holdNext = holdActions;
  const remote = {
    snapshot: async () => ({ ok: true, value: structuredClone(host.currentSnapshot) }),
    follow: async function* (_request, signal) {
      let revision = -1;
      while (!signal.aborted) {
        if (host.currentSnapshot.revision !== revision) { revision = host.currentSnapshot.revision; yield structuredClone(host.currentSnapshot); continue; }
        await new Promise((resolve) => {
          const wake = () => { signal.removeEventListener('abort', wake); resolve(); };
          hostListeners.add(wake); signal.addEventListener('abort', wake, { once: true });
        });
      }
    },
    act: async (request, signal) => {
      try {
        const value = await host.act(request, signal);
        for (const listener of hostListeners) listener();
        if (holdNext) await new Promise((resolve) => { releaseAction = resolve; });
        return { ok: true, value };
      } catch (error) { return { ok: false, error }; }
    },
    pin: async (request) => {
      const current = workspaces.getSnapshot();
      const pinnedSessionIds = request.pinned
        ? [...new Set([...current.pinnedSessionIds, request.sessionId])]
        : current.pinnedSessionIds.filter((id) => id !== request.sessionId);
      workspaces.set({ ...current, pinnedSessionIds });
      await host.refresh();
      for (const listener of hostListeners) listener();
      return { ok: true, value: { pinned: request.pinned } };
    },
  };
  let inspectProvider = null;
  const ctx = {
    remote: { $mount: async () => {} },
    slots: {
      inject: (key, callback) => {
        if (key !== 'sidebar.panellist' || globalPanels) return ctx.effect(callback);
      },
      register: (options, component) => {
        const entry = { options, component };
        registrations.push(entry);
        notifySlots(options?.name);
        return () => {
          const idx = registrations.indexOf(entry);
          if (idx >= 0) registrations.splice(idx, 1);
          notifySlots(options?.name);
        };
      },
      entries: (key) => key === 'sidebar.settings' ? [{children:{'settings.section':{}},store:{create:() => ({actions:{open:() => openedSettings.push('default'),openSection:(id) => openedSettings.push(id)}})}}] : registrations.filter((entry) => entry.options?.name === key),
      entriesOfSlot: (key) => registrations.filter((entry) => entry.options?.name === key),
      subscribe: (key, fn) => {
        let set = slotListeners.get(key);
        if (!set) { set = new Set(); slotListeners.set(key, set); }
        set.add(fn);
        return () => { set.delete(fn); };
      },
    },
    locale: { register: (_ns, language, dict) => { dictionaries[language] = dict; return () => {}; }, getLocale:locale.getSnapshot, subscribe: (fn) => locale.subscribe(fn) },
    layout: {
      panelInfo: panel,
      selectPanel(id) { panel.set({ activePanelId: id }); },
    },
    sessions: {
      list: sessions,
      ...(typeof renameSession === 'function' ? { manager: { rename: renameSession } } : {}),
      ...(typeof searchSessions === 'function' ? { search: searchSessions } : {}),
    },
    workspaces: {
      list: workspaces,
      ...(typeof archiveSession === 'function' ? { archiveSession } : {}),
    },
    uiWorkspace: {
      openSession(id) { openSessionCalls.push(id); sessions.set({ byId: { [id]: { id, retainedBy: { mainView: 1 } } } }); panel.set({ activePanelId: null }); },
      startSession(workspaceId) { startSessionCalls.push(workspaceId); },
    },
    cordisInspect: { register: (provider) => { inspectProvider = provider; return () => { if (inspectProvider === provider) inspectProvider = null; }; } },
    effect(fn) { const dispose = fn(); if (typeof dispose === 'function') effects.push(dispose); return dispose; },
    on(name, fn) { eventListeners.set(name, fn); return () => eventListeners.delete(name); },
    get: (name) => name === 'remote.t3Inbox' ? remote : undefined,
  };
  if (nativeMenus) {
    ctx.contextMenus = {
      register: (menu) => { menuRegistrations.push(menu); return () => {}; },
      ...(openContextMenus ? { open: (target, point) => { openedContextMenus.push({ target, point }); } } : {}),
    };
  }
  let shortcutHarness = null;
  if (shortcuts) {
    const scOpts = typeof shortcuts === 'object' ? shortcuts : {};
    const platform = scOpts.platform ?? 'macos';
    const runtimeKind = scOpts.runtime ?? 'desktop';
    const registeredCommands = new Map();
    const fixedListeners = new Set();
    const catalogStore = source([]);
    let catalogCustom = false;
    const syncCatalog = () => {
      if (catalogCustom) return;
      const rows = [];
      const mac = platform === 'macos';
      for (const cmd of registeredCommands.values()) {
        const def = cmd.defaults?.[`${runtimeKind}:${platform}`] ?? null;
        const mods = def ? (def.modifiers ?? []).map((m) => (m === 'primary' ? (mac ? 'meta' : 'control') : m)) : [];
        const binding = def ? { code: def.code, modifiers: mods } : null;
        const sym = { control: mac ? '⌃' : 'Ctrl', alt: mac ? '⌥' : 'Alt', shift: mac ? '⇧' : 'Shift', meta: mac ? '⌘' : 'Meta' };
        const keyLabel = def ? def.code.replace(/^(Key|Digit)/, '').replace('BracketLeft', '[').replace('BracketRight', ']') : '';
        const rawKeys = binding ? [...mods.map((m) => sym[m]), keyLabel] : [];
        const keys = !mac && rawKeys.length > 1 ? rawKeys.flatMap((k, i) => (i === 0 ? [k] : ['+', k])) : rawKeys;
        rows.push({ id: cmd.id, label: cmd.label?.(), binding, keys, issue: null, conflicts: [] });
      }
      catalogStore.set(rows);
    };
    ctx.shortcuts = {
      platform,
      runtime: runtimeKind,
      catalog: catalogStore,
      register(cmd) {
        if (registeredCommands.has(cmd.id)) throw new Error(`Duplicate shortcut command: ${cmd.id}`);
        if (!/^[a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z][a-zA-Z0-9-]*)+$/u.test(cmd.id)) throw new Error(`Invalid shortcut definition: ${cmd.id}`);
        if (!Array.isArray(cmd.aliases)) throw new TypeError(`row.aliases is not iterable for ${cmd.id}`);
        for (const rt of ['desktop', 'web']) {
          for (const pf of ['macos', 'windows', 'linux']) {
            const def = cmd.defaults?.[`${rt}:${pf}`];
            if (def === undefined) continue;
            const mods = def.modifiers ?? [];
            if (def.code === 'KeyZ' && mods.includes('primary')) throw new Error(`Reserved shortcut default: ${cmd.id}`);
            if (rt === 'web' && (pf === 'linux' || (def.code.startsWith('Digit') && mods.length < 2))) {
              throw new Error(`Unsupported Web shortcut: ${cmd.id}`);
            }
          }
        }
        registeredCommands.set(cmd.id, cmd);
        syncCatalog();
        return () => { registeredCommands.delete(cmd.id); syncCatalog(); };
      },
      observeFixedInput(listener) {
        fixedListeners.add(listener);
        return () => { fixedListeners.delete(listener); };
      },
      registry: {
        invoke(id, context = { source: 'menu', region: 'page', modal: null, target: null }) {
          const cmd = registeredCommands.get(id);
          if (!cmd) return { status: 'pass' };
          const res = cmd.resolve(context);
          if (res.status === 'handled') res.run();
          return res;
        },
      },
    };
    shortcutHarness = {
      commands: registeredCommands,
      catalog: catalogStore,
      registerCommand: (cmd) => ctx.shortcuts.register(cmd),
      setCatalog(rows) { catalogCustom = true; catalogStore.set(rows); },
      emitFixedInput(input) { for (const fn of [...fixedListeners]) fn(input); },
      dispatch(id, context = { region: 'page', modal: null, target: null }) {
        const cmd = registeredCommands.get(id);
        if (!cmd) return { status: 'pass' };
        const res = cmd.resolve(context);
        if (res.status === 'handled') res.run();
        return res;
      },
    };
  }
  let definition;
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const dom = render ? new JSDOM('<!doctype html><html><head></head><body></body></html>', { url:'http://localhost/' }) : null;
  const resolvedStorage = storage === true ? dom?.window.localStorage : storage;
  Object.defineProperty(globalThis, 'localStorage', { value: resolvedStorage, configurable: true });
  if (dom) Object.defineProperty(globalThis, 'navigator', { value:dom.window.navigator, configurable:true });
  globalThis.window = dom ? dom.window : { addEventListener() {}, removeEventListener() {} };
  globalThis.document = dom ? dom.window.document : {
    createElement: () => ({ dataset: {}, remove() {} }), head: { append() {} },
    querySelectorAll: () => [], querySelector: () => null, visibilityState: 'visible',
  };
  if (!cachedClientDefinition) {
    globalThis.window.__ModuleLoader__ = { load: (value) => { cachedClientDefinition = value; } };
    await import('../client.js');
  }
  definition = cachedClientDefinition;
  const { z } = await import('zod');
  const plugin = definition.factory((id) => {
    if (id === 'react') return render ? React : { createElement: () => null };
    if (id === 'react-dom') return { createPortal };
    if (id === 'zod') return { z };
    // Production Desktop Client ModuleLoader does not resolve package subpaths.
    if (id === 'dsh-t3-inbox/model') {
      if (injectSharedModel) return sharedModel;
      throw new Error(`Cannot find module '${id}'`);
    }
    throw new Error(`Unexpected Client require: ${id}`);
  });
  await plugin.apply(ctx);
  const browser = registrations.find((entry) => entry.options.name === 'sidebar.workspaces');
  const runtime = (browser ?? registrations.find((entry) => entry.options.name === 'settings.section')).options.inject().inbox;
  for (let i = 0; i < 10 && !runtime.store.getSnapshot().remote; i++) await new Promise((resolve) => setImmediate(resolve));
  assert.ok(runtime.store.getSnapshot().remote, 'Client received Host baseline');
  return {
    runtime, ctx, host, table, workspaces, panel, sessions, startSessionCalls, openSessionCalls, browser, remote, menuRegistrations, openedContextMenus, shortcuts: shortcutHarness, dictionaries, registrations, openedSettings, locale,
    inspect: { query: (method, input) => inspectProvider.query(method, input) },
    emitSnapshot(snapshot) { host.currentSnapshot = structuredClone(snapshot); for (const listener of hostListeners) listener(); },
    async release() { releaseAction?.(); await new Promise((resolve) => setImmediate(resolve)); },
    holdNext() { holdNext = true; },
    dispose() {
      clearTimeout(host.wakeTimer);
      for (const dispose of effects.reverse()) dispose();
      dom?.window.close();
      if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else delete globalThis.window;
      if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else delete globalThis.document;
      if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage); else delete globalThis.localStorage;
      if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator); else delete globalThis.navigator;
    },
  };
}

function settle(runtime, sessionId) {
  const card = runtime.store.getSnapshot().remote.cards.find((item) => item.sessionId === sessionId);
  return runtime.act(card, 'settle');
}

test('Host records build timings and tree/member call counts', async () => {
  const env = await clientHarness(['a', 'b', 'c']);
  try {
    assert.equal(env.host.stats.lastRoots, 3);
    assert.equal(env.host.stats.lastMembers, 3);
    assert.equal(env.host.stats.lastTreeCalls, 3);
    assert.equal(env.host.stats.lastMemberCalls, 3);
    assert.ok(env.host.stats.lastBuildMs >= 0);
    assert.ok(env.host.stats.lastListMs >= 0);
    assert.ok(env.host.stats.lastMemberMs >= 0);
    assert.ok(env.host.stats.lastTreeMs >= 0);
    assert.equal(env.host.stats.lastMemberErrors, 0);
  } finally { env.dispose(); }
});

test('snooze settings do not regress on delayed stream snapshots or old-generation replies', async () => {
  const env = await clientHarness(['a'], {render:true});
  try {
    const base = env.runtime.store.getSnapshot().remote;
    const older = {...base,revision:base.revision+10,snoozeSettings:{revision:1,presets:[],error:null}};
    env.emitSnapshot(older);
    await new Promise((resolve) => setImmediate(resolve));
    env.remote.saveSnoozeSettings = async () => ({ok:true,value:{status:'committed',settings:{revision:2,presets:[{kind:'after',minutes:30}],error:null}}});
    await env.runtime.saveSnoozeSettings({revision:1,presets:[{kind:'after',minutes:30}]});
    env.emitSnapshot({...older,revision:older.revision+1});
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(env.runtime.store.getSnapshot().remote.snoozeSettings.revision,2);
    let release;
    env.remote.saveSnoozeSettings = () => new Promise((resolve) => { release = resolve; });
    const saving = env.runtime.saveSnoozeSettings({revision:2,presets:[]});
    const replacement = {...older,revision:older.revision+2,generation:'new-generation',snoozeSettings:{revision:0,presets:[],error:null}};
    env.emitSnapshot(replacement);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(env.runtime.store.getSnapshot().remote.snoozeSettings.revision,0);
    release({ok:true,value:{status:'committed',settings:{revision:3,presets:[],error:null}}});
    await assert.rejects(saving,/Connection changed/);
    assert.equal(env.runtime.store.getSnapshot().remote.generation,'new-generation');
    assert.equal(env.runtime.store.getSnapshot().remote.snoozeSettings.revision,0);
  } finally { env.dispose(); }
});

test('Client and Host settle advances, then conditional Undo returns to the owned origin', async () => {
  const env = await clientHarness(['a', 'b']);
  try {
    await settle(env.runtime, 'a');
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'b');
    assert.equal(env.table.get('a').revision, 1);
    const undo = env.runtime.store.getSnapshot().undo;
    assert.ok(undo);
    await env.runtime.undo(undo);
    assert.equal(env.runtime.store.getSnapshot().error, null);
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a');
    assert.equal(env.table.get('a').revision, 2);
    assert.deepEqual(env.table.get('a').settledThrough, {});
  } finally { env.dispose(); }
});

test('an Undo clicked during the originating action is neither executed nor discarded', async () => {
  const env = await clientHarness(['a', 'b']);
  try {
    await settle(env.runtime, 'a');
    const undo = env.runtime.store.getSnapshot().undo;
    env.runtime.store.set({ pendingActions: { a: 1 }, undo });
    await env.runtime.undo(undo);
    assert.equal(env.table.get('a').revision, 1);
    assert.equal(env.runtime.store.getSnapshot().undo.operationId, undo.operationId);
    env.runtime.store.set({ pendingActions: {} });
    await env.runtime.undo(undo);
    assert.equal(env.table.get('a').revision, 2);
  } finally { env.dispose(); }
});

test('no next candidate opens the native new-session view, and Undo returns', async () => {
  const env = await clientHarness(['a']);
  try {
    await settle(env.runtime, 'a');
    assert.equal(env.startSessionCalls.length, 1);
    await env.runtime.undo(env.runtime.store.getSnapshot().undo);
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a');
  } finally { env.dispose(); }
});

test('A→B→A while a committed response is delayed cannot steal navigation', async () => {
  const env = await clientHarness(['a', 'b'], { holdActions: true });
  try {
    const pending = settle(env.runtime, 'a');
    for (let i = 0; i < 10 && env.table.get('a').revision === 0; i++) await new Promise((resolve) => setImmediate(resolve));
    assert.equal(env.table.get('a').revision, 1);
    env.sessions.set({ byId: { b: { id: 'b', retainedBy: { mainView: 1 } } } });
    env.sessions.set({ byId: { a: { id: 'a', retainedBy: { mainView: 1 } } } });
    await env.release();
    await pending;
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a');
    assert.equal(env.runtime.store.getSnapshot().navigationOwner, null);
  } finally { env.dispose(); }
});

test('changing filters while an action is pending cancels only automatic advancement', async () => {
  const env = await clientHarness(['a', 'b'], { holdActions: true });
  try {
    const pending = settle(env.runtime, 'a');
    for (let i = 0; i < 10 && env.table.get('a').revision === 0; i++) await new Promise((resolve) => setImmediate(resolve));
    env.runtime.changeView({ search: 'different' });
    await env.release();
    await pending;
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a');
    assert.equal(env.table.get('a').revision, 1);
    assert.equal(env.runtime.store.getSnapshot().search, 'different');
  } finally { env.dispose(); }
});

test('forward navigation advances past Pinned to Active #2, skips collapsed Working, and preserves workspaceId on empty fallback', async () => {
  const env = await clientHarness(['p1', 'a1', 'a2', 'w1']);
  try {
    // Prepare w1 in Working (collapsed vs expanded) and a1/a2 in Active; pin p1.
    await env.table.update('w1', (record) => ({ ...record, settledThrough: { w1: env.host.currentSnapshot.cards.find((card) => card.sessionId === 'w1').members[0].progress.latestResult } }));
    env.host.running.add('w1');
    env.workspaces.set({ items: [{ workspaceId: 'ws-a', title: 'Alpha', path: '/a1' }], pinnedSessionIds: ['p1'], archivedSessionIds: [] });
    await env.host.refresh();
    const enrichedSnap = structuredClone(env.host.currentSnapshot);
    enrichedSnap.cards = enrichedSnap.cards.map((c) => c.sessionId === 'a1' ? { ...c, workspaceId: 'ws-a', sortAt: 300 } : c.sessionId === 'a2' ? { ...c, sortAt: 200 } : c);
    enrichedSnap.revision += 1;
    env.emitSnapshot(enrichedSnap);
    await new Promise((resolve) => setImmediate(resolve));

    // Settle Active #1 (a1) while Pinned #1 (p1) exists -> advances forward to Active #2 (a2), NOT Pinned #1.
    env.runtime.openCard(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a1'));
    await settle(env.runtime, 'a1');
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a2');

    // Collapsed Working skips w1 and opens native new-session preserving workspaceId; expanded Working advances to w1.
    await settle(env.runtime, 'p1');
    env.runtime.store.set({ workingOpen: false });
    await env.runtime.act({ ...env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a2'), workspaceId: 'ws-a' }, 'settle');
    assert.equal(env.startSessionCalls.length, 1);
    assert.equal(env.startSessionCalls[0], 'ws-a');

    await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a2'), 'restore');
    env.runtime.openCard(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a2'));
    env.runtime.store.set({ workingOpen: true });
    await settle(env.runtime, 'a2');
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'w1');
  } finally { env.dispose(); }
});

test('an archived candidate is not opened; no other candidate opens native new session', async () => {
  const env = await clientHarness(['a', 'b']);
  try {
    env.workspaces.set({ items: [], pinnedSessionIds: [], archivedSessionIds: ['b'] });
    await settle(env.runtime, 'a');
    assert.equal(env.startSessionCalls.length, 1);
    assert.notEqual(env.runtime.store.getSnapshot().currentSessionId, 'b');
  } finally { env.dispose(); }
});

test('Done follows the visited watermark, Mark unread rewinds it, and opening clears it', async () => {
  const env = await clientHarness(['a', 'b']);
  try {
    const card = () => env.runtime.store.getSnapshot().remote.cards.find((item) => item.sessionId === 'b');
    assert.equal(env.runtime.isUnread(card()), true, 'an unvisited completion starts as Done');
    env.runtime.openCard(card());
    assert.equal(env.runtime.isUnread(card()), false, 'opening the session records the visit');
    await env.runtime.markUnread(card());
    assert.equal(env.runtime.isUnread(card()), true, 'Mark unread rewinds the visit');
    assert.equal(typeof env.table.get('b').unreadAt, 'number');
    env.runtime.openCard(card());
    for (let i = 0; i < 8; i++) await new Promise((resolve) => setImmediate(resolve));
    assert.equal(env.runtime.isUnread(card()), false, 'opening again clears unread');
    assert.equal(env.table.get('b').unreadAt, null);
  } finally { env.dispose(); }
});

function browserProps(env) {
  return {
    wide:true, expandSidebar() {}, inbox:env.runtime,
    useWorkspaces: (select) => select(env.workspaces.getSnapshot()),
    usePanelInfo: (select) => select(env.panel.getSnapshot()),
    useSessions: (select) => select(env.sessions.getSnapshot()),
    renderFactorySlot: (name, props, options) => {
      if (name !== 'sidebar.panel.icon') return options?.fallback ?? null;
      const entry = env.registrations.find((reg) => reg.options?.name === 'sidebar.panellist' && reg.options?.id === props?.id);
      if (!entry?.component) return options?.fallback ?? null;
      return React.createElement(entry.component, { size: props.size, active: Boolean(props.active) });
    },
    t: (key) => ({ done:'Done', loadStatus:'Load status', filterWorkspace:'Filter threads by project' }[key] ?? key),
  };
}

async function mountBrowser(env, overrides = {}) {
  const { createRoot } = await import('react-dom/client');
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => { root.render(React.createElement(env.browser.component, { ...browserProps(env), ...overrides })); });
  return { root, container };
}

function enTranslator(env) {
  return (key, vars) => {
    let text = env.dictionaries.en[key] ?? key;
    for (const [k, v] of Object.entries(vars ?? {})) text = text.replace(`{${k}}`, String(v));
    return text;
  };
}

test('left footer gear opens general Settings while T3 Inbox settings manages sidebar appearance and panel visibility', async () => {
  const env = await clientHarness(['a'],{render:true});
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const {createRoot} = await import('react-dom/client');
  const shell = document.documentElement;
  const hostStyle = document.createElement('style');
  hostStyle.textContent = '.kB3qhq_root, .kB3qhq_topStrip, .kB3qhq_panelList { background-color: rgb(28, 49, 61); }';
  document.head.append(hostStyle);
  const hostSidebar = document.createElement('div');
  hostSidebar.className = 'kB3qhq_root';
  document.body.append(hostSidebar);
  const hostPanels = document.createElement('div');
  hostPanels.className = 'kB3qhq_panelList';
  hostSidebar.append(hostPanels);
  const settingsHost = document.createElement('div');
  document.body.append(settingsHost);
  const settingsRoot = createRoot(settingsHost);
  let mounted;
  try {
    const entry = env.registrations.find(({options}) => options.name === 'settings.section');
    const iconEntry = env.registrations.find(({options}) => options.name === 'settings.section.icon');
    assert.equal(entry.options.label,'T3 Inbox');
    assert.equal(iconEntry?.options.id,entry.options.id);
    mounted = await mountBrowser(env,{t:enTranslator(env)});
    await act(async () => {
      env.runtime.noteWide(true);
      settingsRoot.render(React.createElement(React.Fragment,null,
        React.createElement(iconEntry.component,{size:16,active:true}),
        React.createElement(entry.component,{inbox:env.runtime})));
    });
    const navSvg = settingsHost.querySelector('svg.t3i-settings-nav-icon');
    assert.equal(navSvg?.getAttribute('width'),'16');
    assert.equal(navSvg?.getAttribute('height'),'16');
    const footer = (label) => mounted.container.querySelector(`.t3i-foot button[aria-label="${label}"]`);
    const control = (label) => [...settingsHost.querySelectorAll('label')].find((el) => el.textContent === label).control;
    const change = async (input,value) => {
      const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input),'value').set;
      await act(async () => {
        setValue.call(input,value);
        input.dispatchEvent(new window.Event(input.type === 'color' ? 'input' : 'change',{bubbles:true}));
      });
    };

    const gear = footer('Settings');
    assert.equal(Boolean(gear),true);
    assert.equal(mounted.container.querySelector('.t3i-foot').firstElementChild === gear,true);
    assert.equal(footer('Panel menu'),null);
    assert.equal(footer('T3 Inbox settings'),null);
    await act(async () => { gear.click(); });
    assert.deepEqual(env.openedSettings,['default']);
    assert.equal(shell.dataset.t3InboxBackground,'host');
    assert.equal(control('Background').value,'host');
    assert.deepEqual([...settingsHost.querySelectorAll('.t3i-settings-group-title')].map((heading) => heading.textContent),[
      'Appearance & layout','Inbox behavior',
    ]);
    assert.deepEqual([...settingsHost.querySelectorAll('.t3i-settings-pref-title')].map((label) => label.textContent),[
      'Sidebar view','Background','Global panels','Working section','Snooze shortcuts','Time format',
    ]);
    assert.equal(settingsHost.querySelector('.t3i-settings-view-option[aria-pressed="true"]').textContent,'Inbox View');
    assert.equal(settingsHost.querySelector('.t3i-settings-editor').hidden,true);
    assert.equal(control('Global panels').value,'footer');
    assert.equal(shell.dataset.t3InboxNav,'off');
    assert.equal(window.getComputedStyle(hostPanels).display,'none');
    await change(control('Global panels'),'top');
    assert.equal(control('Global panels').value,'top');
    assert.equal(shell.dataset.t3InboxNav,'on');
    assert.notEqual(window.getComputedStyle(hostPanels).display,'none');
    await change(control('Global panels'),'hidden');
    assert.equal(control('Global panels').value,'hidden');
    assert.equal(shell.dataset.t3InboxNav,'off');
    assert.equal(window.getComputedStyle(hostPanels).display,'none');
    await change(control('Global panels'),'footer');
    assert.equal(shell.dataset.t3InboxNav,'off');

    await change(control('Background'),'t3');
    assert.equal(shell.dataset.t3InboxBackground,'t3');
    await change(control('Background'),'custom');
    assert.equal(control('Background').closest('.t3i-settings-pref')?.getAttribute('data-expanded'),'true');
    assert.equal(Boolean(settingsHost.querySelector('.t3i-settings-subpanel.t3i-settings-colors input[type="color"]')),true);
    await change(control('Light mode color'),'#e0dec8');
    await change(control('Dark mode color'),'#2a333b');
    assert.equal(shell.dataset.t3InboxBackground,'custom');
    assert.equal(shell.style.getPropertyValue('--t3i-sidebar-light'),'#e0dec8');
    assert.equal(shell.style.getPropertyValue('--t3i-sidebar-dark'),'#2a333b');
    await change(control('Background'),'host');
    assert.equal(Boolean(settingsHost.querySelector('.t3i-settings-subpanel.t3i-settings-colors')),false);
    assert.equal(shell.dataset.t3InboxBackground,'host');
    assert.equal(shell.style.getPropertyValue('--t3i-sidebar-light'),'');
    assert.equal(window.getComputedStyle(hostSidebar).backgroundColor,'rgb(28, 49, 61)');
    assert.equal(window.getComputedStyle(hostPanels).backgroundColor,'rgb(28, 49, 61)');
    assert.equal(window.getComputedStyle(mounted.container.querySelector('.t3i-root')).backgroundColor,'rgba(0, 0, 0, 0)');

    await act(async () => { env.runtime.toggleMode(); });
    assert.equal(shell.hasAttribute('data-t3-inbox-background'),false);
    assert.equal(shell.hasAttribute('data-t3-inbox-nav'),false);
    await act(async () => { env.runtime.toggleMode(); });
  } finally {
    await act(async () => { mounted?.root.unmount(); settingsRoot.unmount(); });
    env.dispose();
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }

  // When host registers `settings.open`, footer gear invokes the host general Settings shortcut.
  const shortcutEnv = await clientHarness(['a'],{shortcuts:true});
  try {
    let shortcutCalls = 0;
    shortcutEnv.shortcuts.registerCommand({
      id:'settings.open',
      label:() => 'Settings',
      aliases:['settings'],
      resolve:() => ({ status:'handled', run:() => { shortcutCalls += 1; } }),
    });
    const opened = await shortcutEnv.runtime.openSettings();
    assert.equal(opened,true);
    assert.equal(shortcutCalls,1);
    assert.deepEqual(shortcutEnv.openedSettings,[]);
  } finally { shortcutEnv.dispose(); }
});

test('first launch uses T3 defaults, restarts preserve user preferences, and bundle activation enters Inbox without overwriting saved preferences', async () => {
  const assertStartupSettings = ({mode,panelsPosition,sidebarAppearance,workingShelfEnabled,timeFormat}) => {
    assert.equal(mode,'inbox');
    assert.equal(panelsPosition,'footer');
    assert.deepEqual(sidebarAppearance,{mode:'host',light:'#fafafa',dark:'#000000'});
    assert.equal(workingShelfEnabled,true);
    assert.equal(timeFormat,'locale');
  };
  const values = new Map();
  const storage = {getItem:(key) => values.get(key) ?? null,setItem:(key,value) => values.set(key,value)};
  const first = await clientHarness(['a'],{storage});
  try {
    assertStartupSettings(first.runtime.store.getSnapshot());
    first.runtime.toggleMode();
    first.runtime.setPanelsPosition('top');
    first.runtime.setSidebarAppearance({mode:'custom',light:'#f2efd9'});
    first.runtime.setWorkingShelfEnabled(false);
    first.runtime.setTimeFormat('24-hour');
  } finally { first.dispose(); }

  assert.equal(values.get('dsh-t3-inbox:mode'),'native');
  assert.equal(values.get('dsh-t3-inbox:global-panels'),'top');
  assert.deepEqual(JSON.parse(values.get('dsh-t3-inbox:sidebar-appearance')),{mode:'custom',light:'#f2efd9',dark:'#000000'});
  assert.equal(values.get('dsh-t3-inbox:working-shelf'),'off');
  assert.equal(values.get('dsh-t3-inbox:time-format'),'24-hour');

  const restarted = await clientHarness(['a'],{render:true,storage});
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const {createRoot} = await import('react-dom/client');
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    const initial = restarted.runtime.store.getSnapshot();
    assert.equal(initial.mode,'native');
    assert.equal(initial.panelsPosition,'top');
    assert.deepEqual(initial.sidebarAppearance,{mode:'custom',light:'#f2efd9',dark:'#000000'});
    assert.equal(initial.workingShelfEnabled,false);
    assert.equal(initial.timeFormat,'24-hour');

    restarted.panel.set({activePanelId:'plugins'});
    const entry = restarted.registrations.find(({options}) => options.name === 'plugins.bundle.activation' && options.key === 'dsh-t3-inbox');
    let dismissed = false;
    await act(async () => {
      root.render(React.createElement(entry.component,{...entry.options.inject(),onDismiss:() => { dismissed = true; }}));
    });
    const activated = restarted.runtime.store.getSnapshot();
    assert.equal(activated.mode,'inbox');
    assert.equal(values.get('dsh-t3-inbox:mode'),'inbox');
    assert.equal(activated.panelsPosition,'top');
    assert.deepEqual(activated.sidebarAppearance,{mode:'custom',light:'#f2efd9',dark:'#000000'});
    assert.equal(activated.workingShelfEnabled,false);
    assert.equal(activated.timeFormat,'24-hour');
    assert.equal(restarted.panel.getSnapshot().activePanelId,'plugins');
    assert.equal(dismissed,true);

    restarted.runtime.setSidebarAppearance({mode:'t3'});
  } finally {
    await act(async () => { root.unmount(); });
    restarted.dispose();
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }

  const third = await clientHarness(['a'],{storage});
  try {
    const afterT3 = third.runtime.store.getSnapshot();
    assert.equal(afterT3.mode,'inbox');
    assert.equal(afterT3.panelsPosition,'top');
    assert.deepEqual(afterT3.sidebarAppearance,{mode:'t3',light:'#f2efd9',dark:'#000000'});
    assert.equal(afterT3.workingShelfEnabled,false);
    assert.equal(afterT3.timeFormat,'24-hour');
  } finally { third.dispose(); }

  // Legacy `dsh-t3-inbox:panels` key migrates cleanly when `dsh-t3-inbox:global-panels` is absent.
  for (const [legacy, expected] of [['on', 'top'], ['off', 'footer']]) {
    const legacyValues = new Map([['dsh-t3-inbox:panels', legacy]]);
    const legacyEnv = await clientHarness(['a'], {
      storage: { getItem:(key) => legacyValues.get(key) ?? null, setItem:(key,value) => legacyValues.set(key,value) },
    });
    try {
      assert.equal(legacyEnv.runtime.store.getSnapshot().panelsPosition, expected);
    } finally { legacyEnv.dispose(); }
  }
});

test('the sidebar switch pairs the localized view name and icon with its destination', async () => {
  const env = await clientHarness(['a'],{render:true,storage:true});
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const {createRoot} = await import('react-dom/client');
  const shell = document.createElement('div');
  shell.className = 'kB3qhq_root';
  document.body.append(shell);
  const nav = document.createElement('nav');
  nav.className = 'kB3qhq_panelList';
  shell.append(nav);
  const nativeButton = document.createElement('button');
  nativeButton.className = 'kB3qhq_panelRow';
  nav.append(nativeButton);
  const iconRoot = createRoot(nativeButton);
  const container = document.createElement('div');
  shell.append(container);
  const root = createRoot(container);
  let mounted;
  try {
    const findRow = () => env.registrations.find(({options}) => options.name === 'sidebar.panellist');
    const renderIcon = () => {
      const {component,options} = findRow();
      iconRoot.render(React.createElement(component,options.inject()));
    };
    const row = findRow();
    const target = env.registrations.find(({options}) => options.name === 'main' && options.key === row.options.id);
    assert.equal(env.registrations.some(({options}) => options.name === 'sidebar.footer.action'),false);
    assert.equal(row.options.label(),'工作区视图');
    env.locale.set({active:'en',id:'zh'});
    assert.equal(row.options.label(),'Workspaces View');
    await act(async () => {
      env.runtime.toggleMode();
      renderIcon();
    });
    assert.equal(env.runtime.store.getSnapshot().mode,'native');
    assert.equal(findRow() === row,false);
    assert.equal(findRow().options.label(),'Inbox View');
    assert.equal(findRow().options.inject().destination,'inbox');
    env.locale.set({active:'zh-CN',id:'en'});
    assert.equal(findRow().options.label(),'收件箱视图');
    assert.equal(container.querySelector('button'),null);
    assert.equal(nativeButton.hasAttribute('aria-pressed'),false);
    const switchIcon = nativeButton.querySelector('svg.t3i-sidebar-switch-icon');
    assert.equal(switchIcon?.getAttribute('viewBox'),'0 0 16 16');
    assert.equal(switchIcon?.getAttribute('stroke-width'),'1.15');
    assert.equal(window.getComputedStyle(switchIcon).display,'block');
    const trayOutline = switchIcon.querySelector('path').getAttribute('d');
    const navigationEpoch = env.runtime.store.getSnapshot().navigationEpoch;

    const activatePanel = async () => {
      await act(async () => {
        env.panel.set({activePanelId:row.options.id});
        root.render(React.createElement(target.component,target.options.inject()));
      });
      await act(async () => { root.render(null); });
    };
    await activatePanel();
    assert.equal(env.runtime.store.getSnapshot().mode,'inbox');
    assert.equal(findRow().options.label(),'工作区视图');
    assert.equal(findRow().options.inject().destination,'workspaces');
    await act(async () => { renderIcon(); });
    const folderIcon = nativeButton.querySelector('svg.t3i-sidebar-switch-icon');
    assert.equal(folderIcon?.getAttribute('stroke-width'),'1.15');
    assert.notEqual(folderIcon?.querySelector('path').getAttribute('d'),trayOutline);
    assert.equal(nativeButton.hasAttribute('aria-pressed'),false);
    assert.equal(env.panel.getSnapshot().activePanelId,null);
    assert.equal(env.runtime.store.getSnapshot().currentSessionId,'a');

    mounted = await mountBrowser(env,{t:enTranslator(env)});
    shell.append(mounted.container);
    assert.equal(window.getComputedStyle(nav).display,'none');
    assert.equal(mounted.container.querySelector('button[aria-label="Back to Sessions"]'),null);
    assert.equal(mounted.container.querySelector('.t3i-foot button[aria-label="Sessions"]'),null);
    assert.equal(mounted.container.querySelector('.t3i-foot button[aria-label="Inbox"]'),null);
    await act(async () => { env.runtime.setPanelsPosition('top'); });
    assert.notEqual(window.getComputedStyle(nav).display,'none');
    await activatePanel();
    assert.equal(env.runtime.store.getSnapshot().mode,'native');
    assert.equal(findRow().options.label(),'收件箱视图');
    assert.equal(nativeButton.hasAttribute('aria-pressed'),false);
    assert.equal(container.querySelector('button'),null);

    await activatePanel();
    await act(async () => { iconRoot.render(null); });
    nativeButton.remove();
    assert.equal(mounted.container.querySelector('button[aria-label="Back to Sessions"]'),null);
    await activatePanel();
    assert.equal(env.runtime.store.getSnapshot().mode,'native');
    assert.equal(env.panel.getSnapshot().activePanelId,null);
    assert.equal(env.runtime.store.getSnapshot().navigationEpoch,navigationEpoch);
    assert.equal(env.openSessionCalls.length,0);
    assert.equal(env.startSessionCalls.length,0);
    assert.equal(env.registrations.filter(({options}) => options.name === 'sidebar.panellist').length,1);
  } finally {
    await act(async () => { mounted?.root.unmount(); iconRoot.unmount(); root.unmount(); });
    env.dispose();
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
});

test('settings can choose either view and show Inbox preferences only in Inbox View', async () => {
  const env = await clientHarness(['a'],{render:true,globalPanels:false});
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const {createRoot} = await import('react-dom/client');
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    const settings = env.registrations.find(({options}) => options.name === 'settings.section');
    assert.equal(env.registrations.some(({options}) => options.name === 'sidebar.footer.action'),false);
    await act(async () => {
      env.runtime.toggleMode();
      root.render(React.createElement(settings.component,settings.options.inject()));
    });
    const [inbox,workspaces] = container.querySelectorAll('.t3i-settings-view-option');
    const settingTitles = () => [...container.querySelectorAll('.t3i-settings-pref-title')].map((label) => label.textContent);
    assert.deepEqual([inbox.textContent,workspaces.textContent],['Inbox View','Workspaces View']);
    assert.equal(workspaces.getAttribute('aria-pressed'),'true');
    assert.deepEqual(settingTitles(),['Sidebar view']);
    await act(async () => { inbox.click(); });
    assert.equal(env.runtime.store.getSnapshot().mode,'inbox');
    assert.deepEqual([inbox,workspaces].map((button) => button.getAttribute('aria-pressed')),['true','false']);
    assert.deepEqual(settingTitles(),['Sidebar view','Background','Global panels','Working section','Snooze shortcuts','Time format']);
    const workingSwitch = () => [...container.querySelectorAll('label')].find((label) => label.textContent === 'Working section').control;
    await act(async () => { workingSwitch().click(); });
    const editShortcuts = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Edit shortcuts');
    await act(async () => { editShortcuts.click(); });
    assert.equal(container.querySelector('.t3i-settings-editor').hidden,false);
    const {viewRevision} = env.runtime.store.getSnapshot();
    await act(async () => { inbox.click(); });
    assert.equal(env.runtime.store.getSnapshot().viewRevision,viewRevision);
    await act(async () => { workspaces.click(); });
    assert.equal(env.runtime.store.getSnapshot().mode,'native');
    assert.deepEqual([inbox,workspaces].map((button) => button.getAttribute('aria-pressed')),['false','true']);
    assert.deepEqual(settingTitles(),['Sidebar view']);
    assert.equal(container.querySelector('.t3i-settings-editor'),null);
    await act(async () => { inbox.click(); });
    assert.equal(workingSwitch().checked,false);
    assert.equal(env.runtime.store.getSnapshot().panelsPosition,'footer');
  } finally {
    await act(async () => { root.unmount(); });
    env.dispose();
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
  }
});

test('snooze settings serialize rapid edits and all menu entries use the saved options', async () => {
  const env = await clientHarness(['a','b'], {render:true,nativeMenus:true});
  const previousAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  env.runtime.locale = () => 'en-US';
  let mounted;
  try {
    const settingsEntry = env.registrations.find((entry) => entry.options.name === 'settings.section');
    assert.equal(settingsEntry.options.id,'t3-inbox-threads');
    assert.equal(env.runtime.openInboxSettings(),true);
    assert.deepEqual(env.openedSettings,['t3-inbox-threads']);
    const initial = {revision:1,presets:[],error:null};
    const snapshot = {...env.runtime.store.getSnapshot().remote,snoozeSettings:initial};
    env.host.currentSnapshot = structuredClone(snapshot);
    env.runtime.store.set({remote:snapshot});
    let release;
    const calls = [];
    env.remote.saveSnoozeSettings = async (request) => {
      calls.push(structuredClone(request));
      if (calls.length === 1) await new Promise((resolve) => { release = resolve; });
      return {ok:true,value:{status:'committed',settings:{revision:request.revision+1,presets:request.presets,error:null}}};
    };
    const {createRoot} = await import('react-dom/client');
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container); mounted = {container,root};
    await act(async () => { root.render(React.createElement(settingsEntry.component,{inbox:env.runtime})); });
    await act(async () => { env.runtime.store.set({remote:snapshot}); });
    const button = () => [...container.querySelectorAll('button')].find((el) => el.textContent === '+ Add option');
    assert.equal(button(),undefined);
    const editShortcuts = [...container.querySelectorAll('button')].find((el) => el.textContent === 'Edit shortcuts');
    await act(async () => { env.runtime.openInboxSettings({editSnooze:true}); });
    assert.equal(editShortcuts.getAttribute('aria-expanded'),'true');
    assert.equal(container.querySelector('.t3i-settings-editor')?.classList.contains('t3i-settings-subpanel'),true);
    assert.equal(env.runtime.store.getSnapshot().editSnoozeShortcuts,false);
    await act(async () => { button().click(); button().click(); });
    assert.equal(container.querySelectorAll('.t3i-settings-option[role="group"]').length,2);
    assert.equal(calls.length,1);
    assert.deepEqual(calls[0],{revision:1,presets:[{kind:'after',minutes:60}]});
    await act(async () => { release(); await new Promise((resolve) => setImmediate(resolve)); });
    assert.equal(calls.length,2);
    assert.deepEqual(calls[1],{revision:2,presets:[{kind:'after',minutes:60},{kind:'after',minutes:180}]});
    assert.equal(env.runtime.store.getSnapshot().remote.snoozeSettings.revision,3);
    const native = env.menuRegistrations.find((entry) => entry.id === 't3inbox.snooze').resolve({sessionId:'b'})[0].children;
    assert.equal(native.length,3);
    assert.match(native[0].label,/In 1 hour/);
    assert.equal(native[2].label,'Custom…');
    const firstEdit = container.querySelector('.t3i-settings-option[role="group"] button[aria-expanded="false"]');
    await act(async () => { firstEdit.click(); });
    assert.equal(firstEdit.closest('.t3i-settings-option')?.querySelector('.t3i-settings-option-fields')?.hidden,false);
    assert.equal(container.querySelectorAll('input[aria-label="Amount"]').length,1);
    const amount = container.querySelector('input[aria-label="Amount"]');
    assert.equal(container.querySelector('[aria-label="Decrease"]').disabled,true,'minimum disables decrease');
    amount.focus();
    const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    await act(async () => { nativeSet.call(amount,'45'); amount.dispatchEvent(new window.Event('input',{bubbles:true})); });
    assert.equal(calls.length,2,'typing alone does not save');
    await act(async () => { amount.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); });
    assert.equal(calls.at(-1).presets[0].minutes,2700);
    assert.equal(calls.at(-1).revision,3);
    assert.equal(container.querySelector('input[aria-label="Amount"]') === amount,true,'own save echo preserves field identity');
    assert.equal(document.activeElement === amount,true);
    await act(async () => { container.querySelector('[aria-label="Increase"]').click(); });
    assert.equal(calls.at(-1).presets[0].minutes,2760,'step commits immediately');
    await act(async () => { nativeSet.call(amount,'2.6'); amount.dispatchEvent(new window.Event('input',{bubbles:true})); amount.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); });
    assert.equal(calls.at(-1).presets[0].minutes,180,'fraction rounds on commit');
    await act(async () => { nativeSet.call(amount,'99999'); amount.dispatchEvent(new window.Event('input',{bubbles:true})); amount.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); });
    assert.equal(calls.at(-1).presets[0].minutes,43200,'amount clamps to maximum');
    assert.equal(container.querySelector('[aria-label="Increase"]').disabled,true,'maximum disables increase');
    env.remote.saveSnoozeSettings = async () => ({ok:false,error:new Error("domain 'internal' table 'settings' failed")});
    const originalError = console.error;
    const logs = [];
    console.error = (...args) => logs.push(args);
    try {
      await act(async () => { container.querySelector('[aria-label="Remove snooze option 1"]').click(); await new Promise((resolve) => setImmediate(resolve)); });
      assert.equal(container.querySelector('[role="alert"]').textContent,'Could not save Snooze options. Please try again.');
      assert.equal(container.querySelectorAll('.t3i-settings-option[role="group"]').length,2,'failed save rolls back');
      assert.match(String(logs[0][1]),/domain 'internal'/);
    } finally { console.error = originalError; }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousAct;
    env.dispose();
  }
});

test('custom settings drive inline and fallback Snooze menus, including an empty list', async () => {
  const env = await clientHarness(['a','b'],{render:true});
  const oldAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  env.runtime.locale = () => 'en-US';
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const snapshot = {...env.runtime.store.getSnapshot().remote,snoozeSettings:{revision:1,presets:[{kind:'after',minutes:2}],error:null}};
    await act(async () => { env.runtime.store.set({remote:snapshot}); });
    const row = mounted.container.querySelector('[data-session-id="b"] .t3i-row');
    const trigger = row.querySelector('.t3i-snooze-action');
    const actions = [];
    env.runtime.act = (card,kind,data) => actions.push({card:card.sessionId,kind,...data});
    const before = Date.now();
    await act(async () => { trigger.click(); });
    let menu = document.querySelector('.t3i-snooze-menu');
    assert.match(menu.textContent,/In 2 minutes/);
    await act(async () => { menu.querySelector('[role="menuitem"]').click(); });
    assert.equal(actions[0].kind,'snooze');
    assert.ok(Date.parse(actions[0].until) >= before+120000);
    await act(async () => { row.dispatchEvent(new window.MouseEvent('contextmenu',{bubbles:true,cancelable:true})); });
    await act(async () => { mounted.container.querySelector('.t3i-context-menu [aria-haspopup="menu"]').click(); });
    menu = mounted.container.querySelector('.t3i-context-submenu');
    assert.match(menu.textContent,/In 2 minutes/);
    await act(async () => { menu.querySelector('[role="menuitem"]').click(); });
    assert.equal(actions.length,2);
    await act(async () => { env.runtime.store.set({remote:{...snapshot,snoozeSettings:{revision:2,presets:[],error:null}}}); trigger.click(); });
    menu = document.querySelector('.t3i-snooze-menu');
    assert.equal(menu.querySelectorAll('[role="menuitem"]').length,1);
    assert.equal(menu.querySelector('[role="separator"]'),null);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldAct;
    env.dispose();
  }
});

test('expanding a large Settled section interpolates Show more with the host locale contract', async () => {
  const env = await clientHarness(Array.from({length:41}, (_, i) => `session-${i}`), {render:true});
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.workspaces.set({
      items: [
        { workspaceId:'ws-a', title:'Alpha', path:'/ws-a' },
        { workspaceId:'ws-b', title:'Beta', path:'/ws-b' },
      ],
      pinnedSessionIds:[],
      archivedSessionIds:[],
    });
    const remote = structuredClone(env.runtime.store.getSnapshot().remote);
    remote.cards = remote.cards.map((card, i) => ({
      ...card,
      section:i === 0 ? 'active' : 'settled',
      workspaceId:i === 0 || i <= 20 ? 'ws-a' : 'ws-b',
      workspaceTitle:i === 0 || i <= 20 ? 'Alpha' : 'Beta',
      settledAt:2000 + i,
    }));
    for (const locale of ['en', 'zh']) {
      // Desktop app.asar: @deepseek-ai/dsh-client-locale/lib/client.js,
      // LocaleRuntime.translate. Keep lookup and interpolation semantics in sync.
      const desktopLocale = {
        snapshot:{active:locale},
        fallbackChain: (active) => [active],
        lookup: (ns, key, chain) => ns === 'dsh-t3-inbox' ? env.dictionaries[chain[0]][key] : undefined,
        translate(ns, key, params) {
          const chain = this.fallbackChain(this.snapshot.active);
          const template = this.lookup(ns, key, chain) ?? (ns !== 'common' ? this.lookup('common', key, chain) : undefined) ?? key;
          if (!params) return template;
          return template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
        },
      };
      const showMoreText = (count) => locale === 'zh' ? `再显示 ${count} 个` : `Show ${count} more`;
      env.runtime.locale = () => locale;
      const t = (key, params) => desktopLocale.translate('dsh-t3-inbox', key, params);
      mounted = await mountBrowser(env, {t});
      await act(async () => { env.runtime.store.set({remote, settledOpen:false, workspaceId:'', workspaceIds:[]}); });
      const settledHeader = () => mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title');
      const settledItems = () => mounted.container.querySelectorAll('.t3i-item[data-shelf="settled"]');
      const settledMore = () => mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more');
      await act(async () => { settledHeader().click(); });
      assert.equal(settledItems().length, 10);
      assert.equal(settledMore().textContent, showMoreText(25));
      await act(async () => { settledMore().click(); });
      assert.equal(settledItems().length, 35);
      assert.equal(settledMore().textContent, showMoreText(5));
      await act(async () => { env.runtime.setWorkspaceFilter(['ws-a']); });
      assert.equal(settledItems().length, 10);
      assert.equal(settledMore().textContent, showMoreText(10));
      await act(async () => { env.runtime.setWorkspaceFilter([]); });
      assert.equal(settledItems().length, 10);
      assert.equal(settledMore().textContent, showMoreText(25));
      await act(async () => { settledMore().click(); });
      assert.equal(settledItems().length, 35);
      assert.equal(settledMore().textContent, showMoreText(5));
      await act(async () => { settledMore().click(); });
      assert.equal(settledItems().length, 40);
      assert.equal(settledMore(), null);
      await act(async () => { mounted.root.unmount(); });
      mounted = null;
      env.runtime.store.set({settledOpen:false, workspaceId:'', workspaceIds:[]});
    }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('opening a cold card silently prepares without Load status UI', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    let activated = false;
    env.host.prepareLimit = (fn) => fn();
    env.host.readMember = async (id) => ({
      sessionId:id, label:id, progress:completed(id), pendingInput:[], cold:id === 'b' && !activated,
      runtime:{running:false,queue:id === 'b' && !activated ? null : [],completeness:id === 'b' && !activated ? 'unavailable' : 'complete'},
    });
    env.host.ctx.sessionController.resolveAgent = async (id) => { assert.equal(id, 'b'); activated = true; return {agent:{}}; };
    await env.host.refresh();
    env.runtime.store.set({remote:structuredClone(env.host.currentSnapshot)});
    let request;
    env.remote.prepare = async (value) => {
      request = value;
      return { ok:true, value:await env.host.prepare(value, new AbortController().signal) };
    };
    mounted = await mountBrowser(env);
    const card = () => mounted.container.querySelector('[data-session-id="b"]');
    assert.ok(card().querySelector('[data-tone="done"]'));
    assert.equal(card().querySelector('button[aria-label="Load status"]'), null);
    assert.equal(card().querySelector('.t3i-preview-hint'), null);
    await act(async () => {
      env.runtime.openCard(env.runtime.store.getSnapshot().remote.cards.find((item) => item.sessionId === 'b'));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(request, {sessionId:'b'});
    assert.equal(card().querySelector('button[aria-label="Load status"]'), null);
    assert.equal(env.sessions.getSnapshot().byId.b.id, 'b', 'openCard still navigates to the session');
    const warm = env.runtime.store.getSnapshot().remote.cards.find((item) => item.sessionId === 'b');
    assert.ok(warm?.context, 'silent prepare should obtain writeContext');
    assert.equal(warm.completeness, 'complete');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('visited cold cards stay quiet with no Load status or unavailable copy', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.host.readMember = async (id) => ({
      sessionId:id, label:id, progress:completed(id), pendingInput:[], cold:id === 'b',
      runtime:{running:false,queue:id === 'b' ? null : [],completeness:id === 'b' ? 'unavailable' : 'complete'},
    });
    await env.host.refresh();
    env.runtime.store.set({remote:structuredClone(env.host.currentSnapshot)});
    await act(async () => { env.runtime.markVisited('b'); });
    mounted = await mountBrowser(env);
    const card = mounted.container.querySelector('[data-session-id="b"]');
    const corner = card.querySelector('.t3i-card-meta');
    assert.ok(corner);
    assert.equal(corner.querySelectorAll('[data-tone]').length, 0, 'cold must not paint Not loaded / Unavailable');
    assert.equal(corner.querySelectorAll('.t3i-row-time').length, 1);
    assert.equal(card.querySelector('button[aria-label="Load status"]'), null);
    assert.equal(card.querySelector('.t3i-preview-hint'), null);
    assert.equal([...card.querySelectorAll('button')].some((el) => /Status temporarily unavailable|Load status/i.test(el.getAttribute('aria-label') ?? '')), false);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('card keyboard activation and child actions stay independent with valid button markup', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.workspaces.set({ items:[], pinnedSessionIds:['b'], archivedSessionIds:[] });
    mounted = await mountBrowser(env);
    const row = () => mounted.container.querySelector('[data-session-id="b"] .t3i-row');
    assert.equal(row().getAttribute('role'), 'button');
    assert.equal(row().tabIndex, 0);
    assert.equal(mounted.container.querySelector('button button'), null);
    assert.equal(mounted.container.querySelector('[data-section-header="pinned"]'), null, 'headless groups must not leave an invisible tab stop');
    assert.equal(mounted.container.querySelector('[data-section-header="active"]'), null);
    const opened = [];
    const actions = [];
    env.runtime.openCard = (card) => opened.push(card.sessionId);
    env.runtime.pin = (card, pinned) => actions.push({ kind:'pin', sessionId:card.sessionId, pinned });
    env.runtime.act = (card, kind) => actions.push({ kind, sessionId:card.sessionId });
    const key = (el, value) => el.dispatchEvent(new window.KeyboardEvent('keydown', { key:value, bubbles:true, cancelable:true }));
    await act(async () => { key(row(), 'Enter'); key(row(), ' '); });
    assert.deepEqual(opened, ['b','b']);
    await act(async () => {
      const pin = row().querySelector('.t3i-pin');
      key(pin, 'Enter');
      pin.click();
      row().querySelector('.t3i-snooze-action').click();
    });
    assert.deepEqual(opened, ['b','b'], 'Pin and Snooze must not open the session');
    assert.equal(document.querySelectorAll('.t3i-snooze-menu').length, 1);
    assert.deepEqual(actions, [{ kind:'pin', sessionId:'b', pinned:false }]);
    await act(async () => {
      const remote = structuredClone(env.runtime.store.getSnapshot().remote);
      const card = remote.cards.find((item) => item.sessionId === 'b');
      card.woke = true;
      card.newResult = false;
      env.runtime.store.set({ remote });
    });
    await act(async () => { row().querySelector('button[data-tone="woke"]').click(); });
    assert.deepEqual(actions.at(-1), { kind:'ack-woke', sessionId:'b' });
    assert.equal(opened.length, 2);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Snooze menus scope keyboard navigation and restore focus without opening a card', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const row = mounted.container.querySelector('[data-session-id="b"] .t3i-row');
    const other = mounted.container.querySelector('[data-session-id="a"] .t3i-row');
    const trigger = row.querySelector('.t3i-snooze-action');
    const opened = [], actions = [];
    env.runtime.openCard = (card) => opened.push(card.sessionId);
    env.runtime.act = (card, kind) => actions.push([card.sessionId,kind]);
    const key = async (element, value) => {
      const event = new window.KeyboardEvent('keydown', { key:value, bubbles:true, cancelable:true });
      await act(async () => { element.dispatchEvent(event); });
      return event;
    };
    await act(async () => { trigger.focus(); trigger.click(); });
    let menu = document.querySelector('.t3i-snooze-menu');
    let items = [...menu.querySelectorAll('[role="menuitem"]')];
    assert.equal(document.activeElement, menu);
    assert.equal(trigger.getAttribute('aria-controls'), menu.id);
    assert.equal(trigger.getAttribute('aria-haspopup'), 'menu');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    await key(menu, 'ArrowDown'); assert.equal(document.activeElement, items[0]);
    await key(items[0], 'ArrowUp'); assert.equal(document.activeElement, items.at(-1));
    await key(items.at(-1), 'ArrowDown'); assert.equal(document.activeElement, items[0]);
    await key(items[0], 'End'); assert.equal(document.activeElement, items.at(-1));
    await key(items.at(-1), 'Home'); assert.equal(document.activeElement, items[0]);
    const outsideEscape = await key(other, 'Escape');
    assert.equal(outsideEscape.defaultPrevented, false);
    assert.ok(document.querySelector('.t3i-snooze-menu'));
    const enter = await key(items[0], 'Enter');
    const space = await key(items[0], ' ');
    assert.equal(enter.defaultPrevented, false, 'native button activation remains available');
    assert.equal(space.defaultPrevented, false);
    assert.deepEqual(opened, []);
    await key(items[0], 'Escape');
    assert.equal(document.activeElement, trigger);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(document.querySelector('.t3i-snooze-menu'), null);
    await act(async () => { trigger.click(); });
    menu = document.querySelector('.t3i-snooze-menu');
    await act(async () => { menu.querySelector('[data-custom]').click(); });
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog?.contains(document.activeElement), 'Custom owns focus after the menu closes');
    await key(document.activeElement, 'Escape');
    assert.equal(document.querySelector('[role="dialog"]'), null);
    await act(async () => { trigger.click(); });
    await act(async () => { document.querySelector('.t3i-snooze-menu [data-custom]').click(); });
    const edit = [...document.querySelectorAll('[role="dialog"] button')].find((button) => button.textContent?.includes('Edit snooze options'));
    await act(async () => { edit.click(); });
    assert.deepEqual(env.openedSettings,['t3-inbox-threads']);
    assert.equal(env.runtime.store.getSnapshot().editSnoozeShortcuts,true);
    assert.equal(document.querySelector('[role="dialog"]'),null);

    await act(async () => { row.dispatchEvent(new window.MouseEvent('contextmenu', { bubbles:true, cancelable:true })); });
    const context = mounted.container.querySelector('.t3i-context-menu');
    const parent = context.querySelector('[aria-haspopup="menu"]');
    parent.focus();
    await key(parent, 'ArrowRight');
    let submenu = context.querySelector('.t3i-context-submenu');
    items = [...submenu.querySelectorAll('[role="menuitem"]')];
    assert.equal(parent.getAttribute('aria-controls'), submenu.id);
    assert.equal(document.activeElement, items[0]);
    await key(items[0], 'ArrowUp'); assert.equal(document.activeElement, items.at(-1));
    await key(items.at(-1), 'ArrowDown'); assert.equal(document.activeElement, items[0]);
    await key(items[0], 'End'); assert.equal(document.activeElement, items.at(-1));
    await key(items.at(-1), 'Home'); assert.equal(document.activeElement, items[0]);
    await key(items[0], 'Escape');
    assert.equal(document.activeElement, parent);
    assert.equal(context.querySelector('.t3i-context-submenu'), null);
    assert.equal(parent.getAttribute('aria-expanded'), 'false');
    await act(async () => { parent.click(); });
    submenu = context.querySelector('.t3i-context-submenu');
    const choice = submenu.querySelector('[role="menuitem"]');
    assert.equal(document.activeElement, choice, 'keyboard-style activation enters the submenu');
    await key(choice, ' ');
    await act(async () => { choice.click(); });
    assert.deepEqual(actions, [['b','snooze']], 'one native activation executes one action');
    assert.deepEqual(opened, []);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('inline Snooze popup anchors, flips, clamps and cleans up when closed', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  const oldObserver = globalThis.ResizeObserver;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  let observer;
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.observed = []; this.disconnected = false; observer = this; }
    observe(element) { this.observed.push(element); }
    disconnect() { this.disconnected = true; }
  };
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const row = mounted.container.querySelector('[data-session-id="b"] .t3i-row');
    const trigger = row.querySelector('.t3i-snooze-action');
    const list = trigger.closest('.t3i-scroll');
    let anchor = {left:260,right:280,top:80,bottom:102,width:20,height:22};
    trigger.getBoundingClientRect = () => anchor;
    list.getBoundingClientRect = () => ({left:0,right:320,top:40,bottom:460,width:320,height:420});
    Object.defineProperty(window, 'innerWidth', {value:500,writable:true,configurable:true});
    Object.defineProperty(window, 'innerHeight', {value:500,writable:true,configurable:true});
    const prototype = window.HTMLElement.prototype;
    const originalRect = prototype.getBoundingClientRect;
    prototype.getBoundingClientRect = function () {
      return this.classList.contains('t3i-snooze-menu')
        ? {left:0,right:200,top:0,bottom:190,width:200,height:190}
        : originalRect.call(this);
    };
    const originalAdd = window.addEventListener.bind(window);
    const originalRemove = window.removeEventListener.bind(window);
    const tracked = new Set();
    window.addEventListener = (type, fn, options) => { if (type === 'resize' || type === 'scroll') tracked.add(fn); return originalAdd(type,fn,options); };
    window.removeEventListener = (type, fn, options) => { tracked.delete(fn); return originalRemove(type,fn,options); };
    try {
      await act(async () => { trigger.click(); });
      let popup = document.querySelector('.t3i-snooze-menu');
      assert.equal(popup.parentElement, document.body, 'the popup is portaled above the sidebar stacking context');
      assert.equal(mounted.container.contains(popup), false);
      assert.equal(window.getComputedStyle(popup).position, 'fixed');
      assert.equal(window.getComputedStyle(popup).outline, 'none');
      assert.equal(popup.style.left, '80px'); assert.equal(popup.style.top, '106px');
      assert.equal(popup.style.visibility, 'visible');
      assert.equal(document.activeElement, popup);
      await act(async () => { popup.dispatchEvent(new window.KeyboardEvent('keydown', {key:'ArrowDown',bubbles:true,cancelable:true})); });
      const focused = popup.querySelector('[role="menuitem"]');
      assert.equal(document.activeElement, focused);
      await act(async () => { focused.dispatchEvent(new window.MouseEvent('pointerdown', {bubbles:true})); });
      assert.equal(document.querySelector('.t3i-snooze-menu'), popup, 'pointer down inside the portal is not an outside click');
      assert.equal(window.getComputedStyle(focused).gap, '8px');
      assert.equal(window.getComputedStyle(focused).outline, 'none');
      const focusRule = [...document.querySelector('style[data-t3-inbox]').sheet.cssRules].find((rule) => rule.selectorText?.includes('.t3i-snooze-menu .t3i-preset:focus,'));
      assert.ok(focusRule?.style.background, 'focused menu items receive a background highlight');
      assert.equal(observer.observed.length, 3);
      assert.equal(tracked.size, 2);
      anchor = {left:260,right:280,top:400,bottom:422,width:20,height:22};
      await act(async () => { list.dispatchEvent(new window.Event('scroll')); });
      assert.equal(popup.style.top, '206px', 'flips above when below has insufficient space');
      window.innerWidth = 180;
      anchor = {left:80,right:100,top:200,bottom:222,width:20,height:22};
      await act(async () => { window.dispatchEvent(new window.Event('resize')); });
      assert.equal(popup.style.left, '16px', 'clamps to viewport margin');
      assert.equal(popup.style.top, '226px');
      window.innerHeight = 160;
      anchor = {left:80,right:100,top:70,bottom:92,width:20,height:22};
      await act(async () => { observer.callback(); });
      assert.equal(popup.style.maxHeight, '50px', 'limits height to the larger available side');
      assert.equal(popup.style.top, '16px');
      const activeObserver = observer;
      anchor = {left:80,right:100,top:470,bottom:492,width:20,height:22};
      await act(async () => { list.dispatchEvent(new window.Event('scroll')); });
      assert.equal(document.querySelector('.t3i-snooze-menu'), null);
      assert.equal(activeObserver.disconnected, true);
      assert.equal(tracked.size, 0);
      anchor = {left:80,right:100,top:70,bottom:92,width:20,height:22};
      await act(async () => { trigger.click(); });
      popup = document.querySelector('.t3i-snooze-menu');
      await act(async () => { popup.dispatchEvent(new window.KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true})); });
      assert.equal(document.activeElement, trigger);
      assert.equal(observer.disconnected, true);
      assert.equal(tracked.size, 0);
      await act(async () => { trigger.click(); });
      const outsideObserver = observer;
      await act(async () => { document.body.dispatchEvent(new window.MouseEvent('pointerdown', {bubbles:true})); });
      assert.equal(document.querySelector('.t3i-snooze-menu'), null);
      assert.equal(outsideObserver.disconnected, true);
      assert.equal(tracked.size, 0);
      await act(async () => { trigger.click(); });
      const unmountObserver = observer;
      await act(async () => { mounted.root.unmount(); });
      mounted = null;
      assert.equal(document.querySelector('.t3i-snooze-menu'), null);
      assert.equal(unmountObserver.disconnected, true);
      assert.equal(tracked.size, 0);
    } finally {
      prototype.getBoundingClientRect = originalRect;
      window.addEventListener = originalAdd; window.removeEventListener = originalRemove;
    }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.ResizeObserver = oldObserver;
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('actual Snooze menus share T3 defaults and preserve displayed wake times', async () => {
  const env = await clientHarness(['a', 'b'], { render:true, nativeMenus:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  const RealDate = globalThis.Date;
  const oldTZ = process.env.TZ;
  process.env.TZ = 'America/New_York';
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let now = new RealDate(2026, 10, 13, 14, 10).getTime(); // Friday
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  };
  env.runtime.locale = () => 'en-US';
  let mounted;
  try {
    mounted = await mountBrowser(env, { t:(key) => env.dictionaries.en[key] ?? key });
    const row = mounted.container.querySelector('[data-session-id="b"] .t3i-row');
    const trigger = row.querySelector('.t3i-snooze-action');
    const actions = [];
    env.runtime.act = (card, kind, data) => actions.push({card:card.sessionId,kind,...data});
    const setTime = (year, month, day, hour, minute, second = 0) => { now = new RealDate(year, month - 1, day, hour, minute, second).getTime(); };
    const localISO = (year, month, day, hour, minute, second = 0) => new RealDate(year, month - 1, day, hour, minute, second).toISOString();
    const open = async () => { await act(async () => { trigger.click(); }); return document.querySelector('.t3i-snooze-menu'); };
    const choices = (menu) => [...menu.querySelectorAll('button:not([data-custom])')];
    const names = (menu) => choices(menu).map((button) => button.firstChild.textContent);
    const close = async (menu) => { await act(async () => { menu.dispatchEvent(new window.KeyboardEvent('keydown', {key:'Escape',bubbles:true,cancelable:true})); }); };
    let menu = await open();
    assert.deepEqual(names(menu), ['In 1 hour','In 3 hours','This evening','Tomorrow','Next week']);
    assert.match(choices(menu).at(-1).lastChild.textContent, /^Mon\s/);
    assert.doesNotMatch(choices(menu)[3].lastChild.textContent, /Sat/);
    await close(menu);

    setTime(2026,11,13,17,30);
    menu = await open(); assert.deepEqual(names(menu), ['This evening','In 1 hour','In 3 hours','Tomorrow','Next week']); await close(menu);
    setTime(2026,11,13,18,0);
    menu = await open(); assert.deepEqual(names(menu), ['In 1 hour','In 3 hours','Tomorrow','Next week']); await close(menu);
    setTime(2026,11,15,7,1); // Sunday: both Monday presets coincide.
    menu = await open(); assert.deepEqual(names(menu), ['In 1 hour','In 3 hours','This evening','Tomorrow']); await close(menu);
    setTime(2026,11,16,10,0); // Monday means the following Monday.
    menu = await open();
    await act(async () => { choices(menu).at(-1).click(); });
    assert.equal(actions.at(-1).until, localISO(2026,11,23,9,0));

    setTime(2026,11,13,15,0,25); // 3 hours ties 18:00 by minute; duration wins.
    menu = await open();
    assert.deepEqual(names(menu), ['In 1 hour','In 3 hours','Tomorrow','Next week']);
    setTime(2026,11,13,15,30,25);
    await act(async () => { choices(menu)[1].click(); });
    assert.equal(actions.at(-1).until, localISO(2026,11,13,18,30,25));

    setTime(2026,11,15,23,59);
    menu = await open();
    assert.match(choices(menu)[0].lastChild.textContent, /^Mon\s/);
    setTime(2026,11,16,0,1);
    await act(async () => { env.runtime.store.set({ actionError:null }); });
    assert.ok(names(menu).includes('Tomorrow'), 'rerender preserves the displayed day');
    await act(async () => { choices(menu).find((button) => button.firstChild.textContent === 'Tomorrow').click(); });
    assert.equal(actions.at(-1).until, localISO(2026,11,16,9,0));

    setTime(2026,11,13,17,59);
    menu = await open();
    setTime(2026,11,13,18,0);
    const count = actions.length;
    await act(async () => { choices(menu).find((button) => button.firstChild.textContent === 'This evening').click(); });
    assert.equal(actions.length, count);
    assert.match(env.runtime.store.getSnapshot().actionError, /time has passed/);

    // Spring DST: tomorrow is the next calendar date, not 24 elapsed hours.
    setTime(2026,3,7,23,30);
    menu = await open();
    await act(async () => { choices(menu).find((button) => button.firstChild.textContent === 'Tomorrow').click(); });
    assert.equal(actions.at(-1).until, localISO(2026,3,8,9,0));

    // Fallback submenu and native registrations use the same preset resolution and pick rules.
    setTime(2026,11,13,14,10);
    await act(async () => { row.dispatchEvent(new window.MouseEvent('contextmenu', {bubbles:true,cancelable:true})); });
    const context = mounted.container.querySelector('.t3i-context-menu');
    await act(async () => { context.querySelector('[aria-haspopup="menu"]').click(); });
    const submenu = context.querySelector('.t3i-context-submenu');
    assert.deepEqual(names(submenu), ['In 1 hour','In 3 hours','This evening','Tomorrow','Next week']);
    setTime(2026,11,13,14,25);
    await act(async () => { choices(submenu)[0].click(); });
    assert.equal(actions.at(-1).until, localISO(2026,11,13,15,25));
    setTime(2026,11,13,14,10);
    const resolve = env.menuRegistrations.find((entry) => entry.id === 't3inbox.snooze').resolve;
    const native = resolve({sessionId:'b'})[0].children;
    assert.deepEqual(native.slice(0,5).map((item) => item.label.replace(/\s*\([^)]*\)$/, '')), ['In 1 hour','In 3 hours','This evening','Tomorrow','Next week']);
    assert.match(native[0].label, /\(.+\)$/);
    setTime(2026,11,13,14,25);
    native[0].run();
    assert.equal(actions.at(-1).until, localISO(2026,11,13,15,25));
    setTime(2026,11,13,18,0);
    const nativeCount = actions.length;
    await act(async () => { native[2].run(); });
    assert.equal(actions.length, nativeCount);
    assert.match(env.runtime.store.getSnapshot().actionError, /time has passed/);
    env.runtime.locale = () => 'zh-CN';
    setTime(2026,11,13,14,10);
    const chinese = resolve({sessionId:'b'})[0].children;
    assert.deepEqual(chinese.slice(0,5).map((item) => item.label.replace(/\s*\([^)]*\)$/, '')), ['1 小时后','3 小时后','今天晚上','明天','下周']);
    assert.match(chinese[4].label, /周一/);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.Date = RealDate;
    if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ;
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('session previews show the current model through same-route and cross-route switches', async () => {
  const env = await clientHarness(['a'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const readMember = env.host.readMember;
    let progress = foldProgress(completed('a'), {
      type:'request/context', seq:11, time:3000, data:{ provider:'moonshot', model:'moonshot/kimi-k2' },
    });
    env.host.readMember = async (id) => {
      const member = await readMember(id);
      return { ...member, header:{ config:{ provider:'legacy-provider', model:'outdated-model' } }, progress };
    };
    const emitRoute = async () => {
      const revision = env.host.currentSnapshot.revision + 1;
      await env.host.refresh();
      await act(async () => {
        env.emitSnapshot({ ...env.host.currentSnapshot, revision });
        await new Promise((resolve) => setImmediate(resolve));
      });
    };
    await emitRoute();
    mounted = await mountBrowser(env,{t:enTranslator(env)});
    const item = mounted.container.querySelector('.t3i-item[data-session-id="a"]');
    await act(async () => {
      item.dispatchEvent(new window.MouseEvent('mouseover',{bubbles:true}));
      await new Promise((resolve) => setTimeout(resolve,180));
    });
    const assertModel = (model) => {
      const preview = document.querySelector('.t3i-preview');
      assert.ok(preview);
      assert.deepEqual([...preview.querySelectorAll('.t3i-preview-row .t3i-preview-text')].map((line) => line.textContent),['a',model]);
      assert.equal(preview.querySelector('.t3i-glyph'),null);
      assert.equal(item.querySelector('.t3i-glyph, .t3i-provider-stack'),null);
    };
    assertModel('kimi-k2');
    progress = foldProgress(progress,{
      type:'model/selection', seq:12, time:3001, data:{ provider:'moonshot', model:'moonshot/kimi-k2.5' },
    });
    await emitRoute();
    assertModel('kimi-k2.5');
    progress = foldProgress(progress,{
      type:'model/selection', seq:13, time:3002, data:{ provider:'deepseek', model:'deepseek-v4.1-flash' },
    });
    await emitRoute();
    assertModel('deepseek-v4.1-flash');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

for (const injectSharedModel of [false, true]) {
  test(`rendered SessionCard shows Done or visited time (${injectSharedModel ? 'shared' : 'local'} status)`, async () => {
    const env = await clientHarness(['a', 'b'], { render:true, injectSharedModel });
    const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    let mounted;
    try {
      mounted = await mountBrowser(env);
      assert.equal(env.runtime.cardStatusSource(), injectSharedModel ? 'shared' : 'local');
      const corner = () => mounted.container.querySelector('[data-session-id="b"] .t3i-card-meta');
      assert.ok(corner());
      assert.equal(corner().querySelectorAll('[data-tone="done"]').length, 1);
      assert.equal(corner().querySelectorAll('.t3i-row-time').length, 0);
      await act(async () => { env.runtime.markVisited('b'); });
      assert.equal(env.runtime.store.getSnapshot().remote.cards.find((item) => item.sessionId === 'b').newResult, true);
      assert.equal(corner().querySelectorAll('[data-tone="done"]').length, 0);
      const times = corner().querySelectorAll('.t3i-row-time');
      assert.equal(times.length, 1);
      assert.ok(times[0].textContent);
    } finally {
      if (mounted) await act(async () => { mounted.root.unmount(); });
      globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
      env.dispose();
    }
  });
}

test('a viewed completion advances the visit and a background completion shows Done', async () => {
  const env = await clientHarness(['a','b'],{render:true,storage:true});
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env,{t:enTranslator(env)});
    const readMember = env.host.readMember;
    let progress = completed('a');
    env.host.readMember = async (id) => {
      const member = await readMember(id);
      return id === 'a' ? {...member,progress} : member;
    };
    const sendEvent = async (event) => {
      progress = foldProgress(progress,event);
      const revision = env.host.currentSnapshot.revision + 1;
      await env.host.refresh();
      await act(async () => {
        env.emitSnapshot({...env.host.currentSnapshot,revision});
        await new Promise((resolve) => setImmediate(resolve));
      });
    };
    const card = () => env.runtime.store.getSnapshot().remote.cards.find((row) => row.sessionId === 'a');
    const visit = () => env.runtime.store.getSnapshot().visited.a;
    const corner = () => mounted.container.querySelector('[data-session-id="a"] .t3i-card-meta');
    const start = (turn,seq) => sendEvent({type:'turn/start',seq,time:Date.now(),data:{turn}});
    const finish = (turn,seq,time) => sendEvent({type:'turn/end',seq,time,data:{turn,reason:{kind:'completed'}}});

    await start(2,11);
    assert.ok(corner().querySelector('[data-tone="working"]'));
    const viewedCompletion = Math.max(Date.now(),visit() + 1);
    await finish(2,12,viewedCompletion);
    assert.equal(card().newResult,true);
    assert.equal(visit(),viewedCompletion);
    assert.equal(JSON.parse(localStorage.getItem('dsh-t3-inbox:visited')).a,viewedCompletion);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve,2100)); });
    assert.equal(corner().querySelector('[data-tone="done"]'),null);
    assert.equal(corner().querySelector('.t3i-row-time')?.textContent,'now');

    await start(3,13);
    const earlierCompletion = Date.now();
    await act(async () => { env.runtime.openSession('b'); });
    const departedAt = visit();
    await finish(3,14,earlierCompletion);
    assert.equal(env.runtime.isUnread(card()),false,'completion before navigation may arrive late');
    await start(4,15);
    await finish(4,16,departedAt + 1);
    assert.equal(visit(),departedAt);
    assert.equal(env.runtime.cardCornerMeta(card()).statusLabel,'done');
    await act(async () => { env.runtime.openSession('a'); });
    assert.equal(env.runtime.isUnread(card()),false);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('open project filter tracks sidebar resizing and stops observing when closed', async () => {
  const env = await clientHarness(['a'], { render:true });
  const oldObserver = globalThis.ResizeObserver;
  const oldRaf = globalThis.requestAnimationFrame;
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = (callback) => { callback(); return 1; };
  let observer;
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observer = this; }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; }
  };
  let rootWidth = 300;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const root = mounted.container.querySelector('.t3i-root');
    const anchor = mounted.container.querySelector('.t3i-filter-anchor');
    root.getBoundingClientRect = () => ({ left:0, right:rootWidth, width:rootWidth });
    anchor.getBoundingClientRect = () => ({ left:rootWidth - 95, bottom:50 });
    const trigger = () => mounted.container.querySelector('[aria-label="Filter threads by project"][aria-haspopup="dialog"]');
    await act(async () => { trigger().click(); });
    const popover = () => mounted.container.querySelector('.t3i-filter-popover');
    assert.ok(popover());
    assert.deepEqual([popover().style.left, popover().style.top, popover().style.width], ['22px', '54px', '272px']);
    assert.equal(observer.targets.length, 2);
    rootWidth = 220;
    await act(async () => { observer.callback(); });
    assert.deepEqual([popover().style.left, popover().style.top, popover().style.width], ['6px', '54px', '208px']);
    await act(async () => { trigger().click(); });
    assert.equal(popover(), null);
    assert.equal(observer.disconnected, true);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.ResizeObserver = oldObserver;
    globalThis.requestAnimationFrame = oldRaf;
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('installed stylesheet aligns wide shell bleed, wide backgrounds, symmetric 8px padding, and borderless footer', async () => {
  const env = await clientHarness(['a'], { render:true });
  try {
    const style = document.querySelector('style[data-t3-inbox]');
    assert.ok(style?.sheet);
    const rules = [...style.sheet.cssRules];
    const findRule = (selector) => rules.find((rule) => rule.selectorText === selector);

    const rootRule = findRule('.t3i-root');
    assert.ok(rootRule);
    assert.equal(rootRule.style.getPropertyValue('background'), '');
    assert.equal(rootRule.style.getPropertyValue('user-select'), 'none');

    assert.equal(findRule('html[data-t3-inbox-background="t3"] body')?.style.getPropertyValue('--t3i-sidebar-background'), '#fafafa');
    assert.equal(findRule('html[data-t3-inbox-background="t3"] body[data-ds-dark-theme]')?.style.getPropertyValue('--t3i-sidebar-background'), '#000000');
    const sidebarBackgroundRule = rules.find((rule) => rule.style?.getPropertyValue('background-color') === 'var(--t3i-sidebar-background)');
    assert.ok(sidebarBackgroundRule?.selectorText.includes('.t3i-root[data-wide="true"]'));
    assert.ok(sidebarBackgroundRule.selectorText.includes('.kB3qhq_root'));
    assert.ok(sidebarBackgroundRule.selectorText.includes('.kB3qhq_topStrip'));
    assert.ok(sidebarBackgroundRule.selectorText.includes('.kB3qhq_panelList'));
    assert.ok(!sidebarBackgroundRule.selectorText.includes('="host"'));

    const regionRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_regionArea');
    assert.equal(regionRule?.style.getPropertyValue('flex'), '1');
    assert.equal(regionRule?.style.getPropertyValue('min-height'), '0');
    assert.equal(regionRule?.style.getPropertyValue('margin'), '0 calc(-1 * var(--dsh-sidebar-inline-padding, 8px)) -6px');
    assert.equal(regionRule?.style.getPropertyValue('padding'), '0');

    const scrollRegionRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_scrollRegion');
    assert.equal(scrollRegionRule?.style.getPropertyValue('margin'), '0 calc(-1 * var(--dsh-sidebar-inline-padding, 8px)) -6px');
    assert.equal(scrollRegionRule?.style.getPropertyValue('container-type'), 'normal');

    const scrollAreaRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_scrollArea');
    assert.equal(scrollAreaRule?.style.getPropertyValue('display'), 'flex');
    assert.equal(scrollAreaRule?.style.getPropertyValue('flex-direction'), 'column');
    assert.equal(scrollAreaRule?.style.getPropertyValue('flex'), '1');
    assert.equal(scrollAreaRule?.style.getPropertyValue('min-height'), '0');
    assert.equal(scrollAreaRule?.style.getPropertyValue('margin'), '0');
    assert.equal(scrollAreaRule?.style.getPropertyValue('overflow'), 'hidden');

    const nestedRegionRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_scrollRegion .kB3qhq_regionArea');
    assert.equal(nestedRegionRule?.style.getPropertyValue('flex'), '1');
    assert.equal(nestedRegionRule?.style.getPropertyValue('min-height'), '0');
    assert.equal(nestedRegionRule?.style.getPropertyValue('margin'), '0');

    const hiddenChromeRule = rules.find((rule) => rule.selectorText?.includes('.kB3qhq_newSessionRow') && rule.selectorText?.includes('.kB3qhq_scrollFade'));
    assert.ok(hiddenChromeRule);
    assert.equal(hiddenChromeRule.selectorText?.includes('.kB3qhq_logoRow'), false);
    assert.equal(hiddenChromeRule.style.getPropertyValue('display'), 'none');

    const topStripRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_topStrip');
    assert.equal(topStripRule?.style.getPropertyValue('height'), '44px');
    assert.equal(topStripRule?.style.getPropertyValue('padding'), '6px 12px 0');

    const inlineLogoRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_topStrip + .kB3qhq_logoRow');
    assert.equal(inlineLogoRule?.style.getPropertyValue('height'), '44px');
    assert.equal(inlineLogoRule?.style.getPropertyValue('margin'), '-44px calc(44px - var(--dsh-sidebar-inline-padding, 8px)) 0 calc(88px - var(--dsh-sidebar-inline-padding, 8px))');
    assert.equal(inlineLogoRule?.style.getPropertyValue('padding'), '6px 0 0');

    const fullscreenLogoRule = findRule('html[data-t3-inbox="wide"][data-fullscreen] .kB3qhq_topStrip + .kB3qhq_logoRow');
    assert.equal(fullscreenLogoRule?.style.getPropertyValue('margin'), '-44px calc(12px - var(--dsh-sidebar-inline-padding, 8px)) 0 calc(48px - var(--dsh-sidebar-inline-padding, 8px))');

    assert.equal(findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brand')?.style.getPropertyValue('container-type'), 'inline-size');
    assert.equal(findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandMark')?.style.getPropertyValue('display'), 'none');
    const brandNameSvgRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg');
    assert.equal(brandNameSvgRule?.style.getPropertyValue('height'), '18px');
    assert.equal(brandNameSvgRule?.style.getPropertyValue('width'), 'auto');
    assert.equal(brandNameSvgRule?.style.getPropertyValue('overflow'), 'visible');
    assert.equal(findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > rect')?.style.getPropertyValue('display'), 'none');
    const badgeGroupRule = findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"]');
    assert.equal(badgeGroupRule?.style.getPropertyValue('clip-path'), 'none');
    assert.equal(badgeGroupRule?.style.getPropertyValue('transform-box'), 'fill-box');
    assert.equal(badgeGroupRule?.style.getPropertyValue('transform'), 'translate(-5.5px, 2.3px) scale(1.24)');
    assert.equal(findRule('html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"] path')?.style.getPropertyValue('fill'), 'var(--dsw-alias-label-secondary)');
    assert.equal(findRule('html[data-t3-inbox="wide"] body[data-ds-dark-theme] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"] path')?.style.getPropertyValue('fill'), 'color-mix(in srgb, var(--dsw-alias-label-primary) 58%, transparent)');
    assert.ok(style.textContent.includes('@container (max-width: 120px) { html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandMark { display:inline-flex; } html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName { display:none; } }'));

    const railIconRule = findRule('.t3i-root:not([data-wide="true"]) .t3i-icon-button');
    assert.equal(railIconRule?.style.getPropertyValue('width'), '36px');
    assert.equal(railIconRule?.style.getPropertyValue('height'), '36px');

    assert.equal(findRule('.t3i-head')?.style.getPropertyValue('padding'), '8px');
    assert.equal(findRule('.t3i-title-row')?.style.getPropertyValue('gap'), '4px');
    assert.equal(findRule('.t3i-head-actions')?.style.getPropertyValue('gap'), '0');
    assert.equal(findRule('.t3i-scroll')?.style.getPropertyValue('padding'), '0 8px 8px');
    assert.equal(findRule('.t3i-scroll')?.style.getPropertyValue('gap'), '1px');
    assert.equal(findRule('.t3i-list')?.style.getPropertyValue('margin'), '0');
    assert.equal(findRule('.t3i-section-header')?.style.getPropertyValue('margin'), '0');
    assert.equal(findRule('.t3i-section-right')?.style.getPropertyValue('gap'), '8px');
    assert.equal(findRule('.t3i-section-count')?.style.getPropertyValue('font-weight'), '400');
    assert.equal(findRule('.t3i-show-more')?.style.getPropertyValue('min-height'), '36px');
    assert.equal(findRule('.t3i-show-more')?.style.getPropertyValue('font-size'), '14px');
    assert.equal(findRule('.t3i-foot')?.style.getPropertyValue('gap'), '4px');
    assert.equal(findRule('.t3i-foot .t3i-icon-button')?.style.getPropertyValue('width'), '32px');
    assert.equal(findRule('.t3i-foot .t3i-icon-button')?.style.getPropertyValue('height'), '32px');
    const footRule = findRule('.t3i-foot');
    assert.equal(footRule?.style.getPropertyValue('padding'), '4px 8px 8px');
    assert.equal(footRule?.style.getPropertyValue('border-top'), '0');
    assert.equal(findRule('.t3i-item[data-variant="compact"][data-section="snoozed"][data-recede="true"] .t3i-row-title'), undefined);
    const snoozedRecedeRule = findRule('.t3i-item[data-variant="compact"][data-section="snoozed"][data-recede="true"]:not([data-selected="true"]):not([data-sweep]):not(:hover):not(:focus-within) .t3i-row:not([aria-current="page"]) .t3i-row-title');
    assert.equal(snoozedRecedeRule?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    const compactHoverRule = findRule('.t3i-item[data-variant="compact"]:hover .t3i-row-title, .t3i-item[data-variant="compact"]:focus-within .t3i-row-title, .t3i-item[data-variant="compact"] .t3i-row[aria-current="page"] .t3i-row-title');
    assert.equal(compactHoverRule?.style.getPropertyValue('color'), 'var(--dsw-alias-label-primary)');
  } finally {
    env.dispose();
  }
});

test('mounted InboxBrowser sets data-wide="true" only when wide', async () => {
  const env = await clientHarness(['a'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, { wide:true });
    const root = () => mounted.container.querySelector('.t3i-root');
    assert.equal(root().getAttribute('data-wide'), 'true');

    await act(async () => {
      mounted.root.render(React.createElement(env.browser.component, { ...browserProps(env), wide:false }));
    });
    assert.equal(root().hasAttribute('data-wide'), false);
    assert.equal(root().getAttribute('data-wide'), null);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('header actions wrap in t3i-head-actions and Lucide icons render with strokeWidth 2 primitives', async () => {
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const env = await clientHarness(['a', 'b', ...Array.from({ length: 12 }, (_, i) => `s${i}`)], { injectSharedModel: true, render: true });
  let mounted;
  try {
    env.workspaces.set({ items: [], pinnedSessionIds: ['a'], archivedSessionIds: [] });
    for (let i = 0; i < 12; i += 1) await settle(env.runtime, `s${i}`);
    mounted = await mountBrowser(env);

    const actions = mounted.container.querySelector('.t3i-title-row .t3i-head-actions');
    assert.ok(actions);
    const controls = actions.querySelectorAll('button.t3i-icon-button');
    assert.equal(controls.length, 3);

    const filterSvg = controls[0]?.querySelector('svg');
    const folderSvg = controls[1]?.querySelector('svg');
    const composeSvg = controls[2]?.querySelector('svg');
    assert.equal(filterSvg?.getAttribute('stroke-width'), '2');
    assert.equal(folderSvg?.getAttribute('stroke-width'), '2');
    assert.equal(composeSvg?.getAttribute('stroke-width'), '2');
    assert.deepEqual(
      [...folderSvg.querySelectorAll('path')].map((el) => el.getAttribute('d')),
      ['M12 10v6', 'M9 13h6', 'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    );

    const pinnedSvg = mounted.container.querySelector('.t3i-item[data-shelf="pinned"] .t3i-pin-on');
    assert.equal(pinnedSvg?.getAttribute('stroke-width'), '2');
    assert.deepEqual(
      [...pinnedSvg.querySelectorAll('path')].map((el) => el.getAttribute('d')),
      ['M12 17v5', 'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'],
    );

    const settledToggle = mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title');
    assert.ok(settledToggle);
    await act(async () => { settledToggle.click(); });
    const showMore = mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more');
    assert.ok(showMore);
    assert.equal(showMore.querySelector('svg')?.getAttribute('width'), '16');
    assert.equal(showMore.querySelector('svg')?.getAttribute('height'), '16');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('settled row renders icon-only Undo2 slim action inside row and commits restore without opening session', async () => {
  const env = await clientHarness(['a', 'b'], { render:true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    await settle(env.runtime, 'b');
    mounted = await mountBrowser(env, { t:(key) => env.dictionaries.en[key] ?? key });
    await act(async () => {
      mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title').click();
    });

    const item = mounted.container.querySelector('[data-session-id="b"]');
    assert.ok(item);
    assert.equal(item.getAttribute('data-variant'), 'compact');
    assert.equal(item.querySelector('.t3i-row-actions'), null);

    const row = item.querySelector('.t3i-row');
    const slot = row.querySelector('.t3i-slim-slot');
    assert.ok(slot);
    assert.ok(slot.querySelector('.t3i-row-time'));

    const action = slot.querySelector('.t3i-slim-action');
    assert.ok(action);
    assert.equal(action.textContent, '');
    assert.equal(action.getAttribute('aria-label'), 'Un-settle thread');
    assert.deepEqual(
      [...action.querySelectorAll('svg path')].map((path) => path.getAttribute('d')),
      ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11'],
    );

    await act(async () => {
      action.click();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });

    assert.deepEqual(env.openSessionCalls, []);
    assert.equal(env.runtime.store.getSnapshot().lastAction?.kind, 'restore');
    assert.equal(env.runtime.store.getSnapshot().lastAction?.phase, 'committed');
    assert.equal(env.runtime.store.getSnapshot().lastAction?.effect, 'effective');
    assert.equal(env.table.get('b').settledAt, null);
    assert.equal(
      env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b')?.section,
      'active',
    );
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('re-running failed or limited sessions renders Working status and suppresses stale HoverCard error', async () => {
  for (const injectSharedModel of [false, true]) {
    const env = await clientHarness(['a', 'b'], { injectSharedModel, render: true });
    const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    let mounted;
    try {
      env.host.readMember = async (id) => {
        let state = initialProgress(0, id);
        state = foldProgress(state, { type: 'turn/start', seq: 1, time: 1001, data: { turn: 1 } });
        state = foldProgress(state, { type: 'turn/end', seq: 2, time: 2002, data: { turn: 1, reason: { kind: id === 'a' ? 'error' : 'max-tokens' } } });
        state = foldProgress(state, { type: 'turn/start', seq: 3, time: 3003, data: { turn: 2 } });
        return { sessionId: id, label: id, progress: state, runtime: { running: true, queue: [], completeness: 'complete' }, pendingInput: [] };
      };
      env.host.running.add('a');
      env.host.running.add('b');
      await env.host.refresh();
      await env.runtime.syncSnapshot();
      mounted = await mountBrowser(env);

      // Working defaults collapsed: active route session ('a') renders via routeThreadOnly, 'b' stays hidden until expanded.
      assert.ok(mounted.container.querySelector('.t3i-item[data-session-id="a"]'));
      assert.equal(mounted.container.querySelector('.t3i-item[data-session-id="b"]'), null);
      await act(async () => {
        mounted.container.querySelector('[data-section-header="working"] .t3i-section-title').click();
      });

      for (const id of ['a', 'b']) {
        const item = mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
        assert.ok(item);
        assert.equal(item.getAttribute('data-failed-read'), null);
        assert.equal(item.querySelector('.t3i-status')?.getAttribute('data-tone'), 'working');
        await act(async () => {
          window.dispatchEvent(new window.CustomEvent('t3i-force-preview', { detail: { sessionId: id } }));
        });
        assert.ok(document.querySelector('.t3i-preview'));
        assert.equal(Boolean(document.querySelector('.t3i-preview .t3i-preview-error')), false);
        assert.equal(Boolean(document.querySelector('.t3i-preview .t3i-preview-warning')), false);
      }

      // Running card carrying treeError also suppresses HoverCard error while Working.
      await act(async () => {
        const remote = structuredClone(env.runtime.store.getSnapshot().remote);
        const card = remote.cards.find((item) => item.sessionId === 'a');
        card.treeError = 'Subagent tree temporarily unavailable';
        env.runtime.store.set({ remote });
        window.dispatchEvent(new window.CustomEvent('t3i-force-preview', { detail: { sessionId: 'a' } }));
      });
      const runningTreeErr = mounted.container.querySelector('.t3i-item[data-session-id="a"]');
      assert.equal(runningTreeErr.querySelector('.t3i-status')?.getAttribute('data-tone'), 'working');
      assert.ok(document.querySelector('.t3i-preview'));
      assert.equal(Boolean(document.querySelector('.t3i-preview .t3i-preview-error')), false);
    } finally {
      if (mounted) await act(async () => { mounted.root.unmount(); });
      window.dispatchEvent(new window.CustomEvent('t3i-force-preview', { detail: { clear: true } }));
      globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
      env.dispose();
    }
  }
});

test('pinned sessions settle directly from row action and native menu, and pin failures surface a friendly toast', async () => {
  const env = await clientHarness(['a', 'b'], { render: true, nativeMenus: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.workspaces.set({ items: [], pinnedSessionIds: ['b'], archivedSessionIds: [] });
    mounted = await mountBrowser(env);

    const settleBtn = () => mounted.container.querySelector('[data-session-id="b"] .t3i-primary-action');
    assert.equal(settleBtn().disabled, false, 'Pinned card Settle button must stay enabled');
    assert.doesNotMatch(settleBtn().title ?? '', /unpin.*before/i);

    await act(async () => {
      settleBtn().click();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(env.workspaces.getSnapshot().pinnedSessionIds, []);
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b')?.section, 'settled');

    // Re-open, pin again, and settle via native menu.
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b'), 'restore');
      env.workspaces.set({ items: [], pinnedSessionIds: ['b'], archivedSessionIds: [] });
      await new Promise((resolve) => setImmediate(resolve));
    });
    const settleResolve = env.menuRegistrations.find((entry) => entry.id === 't3inbox.settle').resolve;
    const menuItems = settleResolve({ sessionId: 'b' });
    assert.equal(menuItems.length, 1);
    assert.equal(menuItems[0].id, 'settle');
    await act(async () => {
      menuItems[0].run();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(env.workspaces.getSnapshot().pinnedSessionIds, []);
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b')?.section, 'settled');

    // When unpin fails, settle must abort without mutating table and show a sanitized toast.
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b'), 'restore');
      env.workspaces.set({ items: [], pinnedSessionIds: ['b'], archivedSessionIds: [] });
      await new Promise((resolve) => setImmediate(resolve));
    });
    let actCalls = 0;
    const realAct = env.remote.act;
    env.remote.act = async (...args) => { actCalls += 1; return realAct(...args); };
    env.remote.pin = async () => ({ ok: false, error: new Error('Host IPC pin_session rejected: table locked') });
    const originalWarn = console.warn;
    const warns = [];
    console.warn = (...args) => warns.push(args);
    try {
      await act(async () => {
        settleBtn().click();
        await new Promise((resolve) => setImmediate(resolve));
        await new Promise((resolve) => setImmediate(resolve));
      });
    } finally {
      console.warn = originalWarn;
      env.remote.act = realAct;
    }
    assert.equal(actCalls, 0);
    assert.deepEqual(env.workspaces.getSnapshot().pinnedSessionIds, ['b']);
    assert.deepEqual(env.runtime.store.getSnapshot().pendingActions, {});
    let toast = document.querySelector('.t3i-toast[role="alert"]');
    assert.ok(toast);
    assert.doesNotMatch(toast.textContent, /IPC|table locked|pin_session/);
    assert.match(warns.map((w) => String(w[1] ?? w[0])).join(' '), /table locked/);

    // Transport exception during unpin also reports a sanitized toast and releases pendingActions.
    env.remote.pin = async () => { throw new Error('IPC socket ECONNRESET'); };
    console.warn = (...args) => warns.push(args);
    try {
      await act(async () => {
        settleBtn().click();
        await new Promise((resolve) => setImmediate(resolve));
        await new Promise((resolve) => setImmediate(resolve));
      });
    } finally {
      console.warn = originalWarn;
      env.remote.act = realAct;
    }
    assert.deepEqual(env.runtime.store.getSnapshot().pendingActions, {});
    toast = document.querySelector('.t3i-toast[role="alert"]');
    assert.ok(toast);
    assert.match(toast.textContent, /取消置顶会话失败/);
    assert.doesNotMatch(toast.textContent, /ECONNRESET|IPC socket/);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('cold pinned Input card preserves client pendingInteraction overlay after prepare during direct Settle', async () => {
  const env = await clientHarness(['a', 'b'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    let activated = false;
    env.host.prepareLimit = (fn) => fn();
    env.host.readMember = async (id) => ({
      sessionId: id, label: id, progress: completed(id), pendingInput: [], cold: id === 'b' && !activated,
      runtime: {
        running: id === 'b' && activated,
        queue: id === 'b' && !activated ? null : [],
        completeness: id === 'b' && !activated ? 'unavailable' : 'complete',
      },
    });
    env.host.ctx.sessionController.resolveAgent = async (id) => { assert.equal(id, 'b'); activated = true; return { agent: {} }; };
    await env.host.refresh();
    env.workspaces.set({ items: [], pinnedSessionIds: ['b'], archivedSessionIds: [] });
    env.sessions.set({ byId: { a: { id: 'a', retainedBy: { mainView: 1 } }, b: { id: 'b', pendingInteraction: 'question' } } });
    env.runtime.store.set({ remote: structuredClone(env.host.currentSnapshot) });
    env.remote.prepare = async (value) => ({ ok: true, value: await env.host.prepare(value, new AbortController().signal) });

    let actArgs = null;
    env.remote.act = async (request) => { actArgs = request; return { ok: true, value: { status: 'committed', effect: 'effective', revision: request.revision + 1 } }; };

    mounted = await mountBrowser(env);
    const settleBtn = mounted.container.querySelector('[data-session-id="b"] .t3i-primary-action');
    assert.equal(settleBtn.disabled, false);
    await act(async () => {
      settleBtn.click();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(env.workspaces.getSnapshot().pinnedSessionIds, []);
    assert.equal(actArgs?.kind, 'settle');
    assert.equal(actArgs?.sessionId, 'b');
    assert.equal(document.querySelector('.t3i-toast'), null);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('header renders no notice banners and errors appear in a sanitized floating toast', async () => {
  const env = await clientHarness(['a', 'b'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  const originalWarn = console.warn;
  const warns = [];
  console.warn = (...args) => warns.push(args);
  try {
    env.runtime.locale = () => 'en';
    env.sessions.set({ byId: { a: { id: 'a', pendingInteraction: 'question', retainedBy: { mainView: 1 } } } });
    mounted = await mountBrowser(env);

    // Searching away a needsYou card must not inject Reveal banners or any .t3i-notice.
    assert.equal(mounted.container.querySelectorAll('.t3i-notice').length, 0);
    await act(async () => { env.runtime.changeView({ search: 'b' }); });
    assert.equal(mounted.container.querySelectorAll('.t3i-notice').length, 0);
    await act(async () => { env.runtime.changeView({ search: '' }); });

    // Stale commit answer -> friendly title + description, raw status suppressed from DOM.
    const origAct = env.remote.act;
    env.remote.act = async () => ({ ok: true, value: { status: 'stale', message: 'The Inbox record changed' } });
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b'), 'settle');
    });
    let toast = document.querySelector('.t3i-toast[role="alert"]');
    assert.ok(toast);
    assert.match(toast.textContent, /Failed to settle thread/);
    assert.match(toast.textContent, /This thread changed before the action could complete/);
    assert.doesNotMatch(toast.textContent, /Inbox record changed/);
    await act(async () => { toast.querySelector('.t3i-toast-close').click(); });
    assert.equal(document.querySelector('.t3i-toast'), null);

    // not-found commit answer -> friendly missing-thread copy.
    env.remote.act = async () => ({ ok: true, value: { status: 'not-found' } });
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b'), 'settle');
    });
    env.remote.act = origAct;
    toast = document.querySelector('.t3i-toast[role="alert"]');
    assert.ok(toast);
    assert.match(toast.textContent, /That thread is no longer available/);
    await act(async () => { toast.querySelector('.t3i-toast-close').click(); });

    // Snapshot error renders friendly refresh toast and clears on recovery.
    const cleanSnap = structuredClone(env.runtime.store.getSnapshot().remote);
    await act(async () => {
      env.emitSnapshot({ ...cleanSnap, phase: 'unavailable', error: 'SQLITE_BUSY in domain/inbox', revision: cleanSnap.revision + 1 });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(mounted.container.querySelectorAll('.t3i-notice').length, 0);
    assert.doesNotMatch(mounted.container.textContent, /SQLITE_BUSY/);
    toast = document.querySelector('.t3i-toast[role="alert"]');
    assert.ok(toast);
    assert.match(toast.textContent, /Unable to refresh threads/);
    assert.doesNotMatch(toast.textContent, /SQLITE_BUSY/);
    await act(async () => {
      env.emitSnapshot({ ...cleanSnap, phase: 'ready', error: null, revision: cleanSnap.revision + 2 });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(document.querySelector('.t3i-toast'), null, 'recovery snapshot clears refresh toast');
    assert.equal(env.runtime.store.getSnapshot().actionError, null, 'recovery snapshot clears refresh actionError');
  } finally {
    console.warn = originalWarn;
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('native and fallback context menus track settled, snoozed, woken, approval, and workspace filter states', async () => {
  const env = await clientHarness(['a', 'b'], { render: true, nativeMenus: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.runtime.locale = () => 'en';
    await act(async () => {
      env.workspaces.set({
        items: [{ workspaceId: 'ws-a', title: 'Alpha Repo', path: '/ws-a' }],
        pinnedSessionIds: [],
        archivedSessionIds: [],
      });
      const remote = structuredClone(env.host.currentSnapshot);
      remote.cards = remote.cards.map((card) => card.sessionId === 'a' ? { ...card, workspaceId: 'ws-a', workspaceTitle: 'Alpha Repo' } : card);
      remote.revision += 1;
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    const getMenu = (id) => env.menuRegistrations.find((entry) => entry.id === id).resolve;

    // Approval overlay from sessions store reaches menuCard() even without raw remote.needsYou.
    await act(async () => {
      env.sessions.set({ byId: { a: { id: 'a', pendingInteraction: 'approval', retainedBy: { mainView: 1 } } } });
    });
    const approvalSnooze = getMenu('t3inbox.snooze')({ sessionId: 'a' });
    assert.equal(approvalSnooze.length, 1);
    assert.equal(approvalSnooze[0].disabled, true);
    assert.equal(approvalSnooze[0].children, undefined);

    // Filter menu toggles between "Filter by Alpha Repo" and "Show all projects".
    let filterItem = getMenu('t3inbox.filter')({ sessionId: 'a' });
    assert.equal(filterItem[0].label, 'Filter by Alpha Repo');
    await act(async () => { filterItem[0].run(); });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, ['ws-a']);
    filterItem = getMenu('t3inbox.filter')({ sessionId: 'a' });
    assert.equal(filterItem[0].label, 'Show all projects');
    await act(async () => { filterItem[0].run(); });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, []);

    // Settle -> Un-settle in native menu.
    await act(async () => {
      await settle(env.runtime, 'b');
      await new Promise((resolve) => setImmediate(resolve));
    });
    const settleMenu = getMenu('t3inbox.settle')({ sessionId: 'b' });
    assert.equal(settleMenu[0].id, 'unsettle');
    assert.equal(settleMenu[0].label, 'Un-settle thread');
    await act(async () => {
      settleMenu[0].run();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b')?.section, 'active');

    // Snooze -> Wake thread in native menu, and woken active card retains Settle + Snooze.
    const until = new Date(Date.now() + 3_600_000).toISOString();
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'b'), 'snooze', { until });
      await new Promise((resolve) => setImmediate(resolve));
    });
    const wakeMenu = getMenu('t3inbox.snooze')({ sessionId: 'b' });
    assert.equal(wakeMenu.length, 1);
    assert.equal(wakeMenu[0].id, 'wake');
    assert.equal(wakeMenu[0].label, 'Wake thread');
    await act(async () => {
      wakeMenu[0].run();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });

    // Simulate woken active card carrying historical snooze object: UI & menu treat it as active, not snoozed.
    await act(async () => {
      const remote = structuredClone(env.runtime.store.getSnapshot().remote);
      const card = remote.cards.find((item) => item.sessionId === 'b');
      card.woke = true;
      card.snoozed = false;
      card.section = 'active';
      card.snooze = { until, exception: null };
      env.runtime.store.set({ remote });
    });
    const wokenPrimary = mounted.container.querySelector('[data-session-id="b"] .t3i-primary-action');
    assert.equal(wokenPrimary.getAttribute('aria-label'), 'Settle');
    assert.ok(mounted.container.querySelector('[data-session-id="b"] .t3i-status-slot-actions button[aria-label="Snooze thread"]'));
    const wokenSnoozeMenu = getMenu('t3inbox.snooze')({ sessionId: 'b' });
    assert.equal(wokenSnoozeMenu[0].id, 'snooze');
    assert.ok(Array.isArray(wokenSnoozeMenu[0].children));
    assert.equal(wokenSnoozeMenu[0].children.at(-1).id, 'snooze-custom');
    assert.equal(wokenSnoozeMenu[0].children.at(-1).separatorBefore, true);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('fallback context menu exposes Un-settle, Wake, Mark unread, and project filter toggles', async () => {
  const env = await clientHarness(['a', 'b'], { render: true, nativeMenus: false });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.runtime.locale = () => 'en';
    await act(async () => {
      env.workspaces.set({
        items: [{ workspaceId: 'ws-a', title: 'Alpha Repo', path: '/ws-a' }],
        pinnedSessionIds: [],
        archivedSessionIds: [],
      });
      const remote = structuredClone(env.host.currentSnapshot);
      remote.cards = remote.cards.map((card) => card.sessionId === 'a' ? { ...card, workspaceId: 'ws-a', workspaceTitle: 'Alpha Repo' } : card);
      remote.revision += 1;
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    const labels = (container) => [...container.querySelectorAll('.t3i-context-menu [role="menuitem"]')].map((el) => el.textContent);
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a"]').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    assert.ok(labels(mounted.container).includes('Filter by Alpha Repo'));
    assert.ok(labels(mounted.container).includes('Mark unread'));
    await act(async () => {
      [...mounted.container.querySelectorAll('.t3i-context-menu [role="menuitem"]')].find((el) => el.textContent === 'Filter by Alpha Repo').click();
    });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, ['ws-a']);
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a"]').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    assert.ok(labels(mounted.container).includes('Show all projects'));
    await act(async () => {
      [...mounted.container.querySelectorAll('.t3i-context-menu [role="menuitem"]')].find((el) => el.textContent === 'Show all projects').click();
    });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, []);

    // Settle 'b' and expand Settled section -> right-click shows Un-settle thread.
    await act(async () => { await settle(env.runtime, 'b'); });
    await act(async () => { mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title').click(); });
    await act(async () => {
      mounted.container.querySelector('[data-session-id="b"]').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    assert.ok(labels(mounted.container).includes('Un-settle thread'));

    // Snooze 'a' -> right-click shows Wake thread.
    const until = new Date(Date.now() + 3_600_000).toISOString();
    await act(async () => {
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'a'), 'snooze', { until });
    });
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a"]').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    assert.ok(labels(mounted.container).includes('Wake thread'));
    await act(async () => {
      [...mounted.container.querySelectorAll('.t3i-context-menu [role="menuitem"]')].find((el) => el.textContent === 'Wake thread').click();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'a')?.section, 'active');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Snoozed non-pinned rows render slim 36px wake controls, recede when read, and keep Pinned snoozed as full card', async () => {
  const env = await clientHarness(['a', 'b', 'c'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const until = new Date(Date.now() + 3_600_000).toISOString();
    await act(async () => {
      env.runtime.markVisited('b');
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'b'), 'snooze', { until });
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'c'), 'snooze', { until });
      await env.runtime.pin(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'c'), true);
      env.runtime.store.set({ snoozedOpen: true });
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    const slimItem = () => mounted.container.querySelector('.t3i-item[data-session-id="b"]');
    assert.equal(slimItem().getAttribute('data-variant'), 'compact');
    assert.equal(slimItem().getAttribute('data-section'), 'snoozed');
    assert.equal(slimItem().getAttribute('data-recede'), 'true');
    assert.equal(slimItem().querySelector('.t3i-card-top'), null);
    assert.equal(slimItem().querySelector('.t3i-ws-name'), null);
    assert.ok(slimItem().querySelector('.t3i-slim-wake svg'));
    assert.match(slimItem().querySelector('.t3i-slim-wake').textContent, /1h/);
    const wakeBtn = slimItem().querySelector('.t3i-slim-action');
    assert.equal(wakeBtn.getAttribute('aria-label'), 'Wake thread now');

    // Unread snoozed row clears recede; read snoozed row recedes again.
    await act(async () => {
      await env.runtime.markUnread(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'b'));
    });
    assert.equal(slimItem().getAttribute('data-recede'), null);
    await act(async () => {
      env.runtime.markVisited('b');
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'b'), 'clear-unread');
    });
    assert.equal(slimItem().getAttribute('data-recede'), 'true');

    // Pinned + snoozed card stays full card variant inside Pinned shelf.
    const pinnedItem = mounted.container.querySelector('.t3i-item[data-session-id="c"]');
    assert.equal(pinnedItem.getAttribute('data-variant'), 'card');
    assert.equal(pinnedItem.querySelector('.t3i-primary-action')?.getAttribute('aria-label'), 'Wake');

    // Clicking Wake thread now commits wake without switching active session ('a').
    await act(async () => {
      wakeBtn.click();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(env.openSessionCalls, []);
    assert.equal(env.runtime.store.getSnapshot().currentSessionId, 'a');
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'b')?.section, 'active');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Working, Snoozed, and Settled sections default collapsed, persist in localStorage, and show routeThreadOnly + non-duplicating Settled page 2', async () => {
  const map = new Map();
  const storage = {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: (key) => { map.delete(key); },
  };
  const ids = ['w0', 'w1', 'z0', 'z1', ...Array.from({ length: 12 }, (_, i) => `s${i}`)];
  let env = await clientHarness(ids, { render: true, storage });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const view0 = env.runtime.store.getSnapshot();
    assert.equal(view0.workingOpen, false);
    assert.equal(view0.snoozedOpen, false);
    assert.equal(view0.settledOpen, false);

    const remote = structuredClone(view0.remote);
    const future = new Date(Date.now() + 3_600_000).toISOString();
    remote.cards = remote.cards.map((card) => {
      if (card.sessionId.startsWith('w')) return { ...card, section: 'working', running: true };
      if (card.sessionId.startsWith('z')) return { ...card, section: 'snoozed', snoozed: true, snoozeEffect: { active: true, until: future } };
      const idx = Number(card.sessionId.slice(1));
      return { ...card, section: 'settled', settledAt: 100_000 - idx * 1000 };
    });
    remote.revision += 1;
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    await act(async () => {
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
    });

    // w0 is active route session: Working collapsed shows only w0.
    const visibleIds = (sectionId) => [...mounted.container.querySelectorAll(`.t3i-item[data-shelf="${sectionId}"]`)].map((el) => el.getAttribute('data-session-id'));
    assert.deepEqual(visibleIds('working'), ['w0']);
    assert.deepEqual(visibleIds('snoozed'), []);
    assert.deepEqual(visibleIds('settled'), []);
    assert.equal(mounted.container.querySelector('.t3i-show-more'), null);

    // Switch active session to z0 -> Snoozed collapsed shows only z0.
    await act(async () => {
      env.sessions.set({ byId: { z0: { id: 'z0', retainedBy: { mainView: 1 } } } });
    });
    assert.deepEqual(visibleIds('working'), []);
    assert.deepEqual(visibleIds('snoozed'), ['z0']);

    // Switch active session to s11 (Settled page 2) -> collapsed shows only s11; open shows page 1 (s0..s9) + s11 without duplicate.
    await act(async () => {
      env.sessions.set({ byId: { s11: { id: 's11', retainedBy: { mainView: 1 } } } });
    });
    assert.deepEqual(visibleIds('settled'), ['s11']);
    await act(async () => {
      mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title').click();
    });
    const openSettled = visibleIds('settled');
    assert.equal(openSettled.length, 11);
    assert.equal(openSettled.filter((id) => id === 's11').length, 1);
    assert.equal(mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more').textContent, 'Show 1 more');
    await act(async () => {
      mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more').click();
    });
    assert.equal(visibleIds('settled').length, 12);
    assert.equal(visibleIds('settled').filter((id) => id === 's11').length, 1);

    // Non-conversation panel hides routeThreadOnly when collapsed.
    await act(async () => {
      mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title').click();
      env.panel.set({ activePanelId: 'settings' });
    });
    assert.deepEqual(visibleIds('settled'), []);
    await act(async () => { env.panel.set({ activePanelId: null }); });

    // Toggle working and snoozed open and confirm localStorage persists across fresh clientHarness.
    await act(async () => {
      mounted.container.querySelector('[data-section-header="working"] .t3i-section-title').click();
      mounted.container.querySelector('[data-section-header="snoozed"] .t3i-section-title').click();
    });
    assert.equal(storage.getItem('dsh-t3-inbox:working-expanded'), 'true');
    assert.equal(storage.getItem('dsh-t3-inbox:snoozed-expanded'), 'true');
    assert.equal(storage.getItem('dsh-t3-inbox:settled-expanded'), 'false');

    await act(async () => { mounted.root.unmount(); });
    mounted = null;
    env.dispose();

    env = await clientHarness(['a', 'b'], { render: true, storage });
    const reloadedView = env.runtime.store.getSnapshot();
    assert.equal(reloadedView.workingOpen, true);
    assert.equal(reloadedView.snoozedOpen, true);
    assert.equal(reloadedView.settledOpen, false);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Settled rows sort and display settledAt while SearchResultRow retains cardActivityAt, and active cards use 12px SnoozeAction', async () => {
  const env = await clientHarness(['a', 'b', 'c'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const minuteBase = Math.floor(Date.now() / 60_000) * 60_000;
    const remote = structuredClone(env.runtime.store.getSnapshot().remote);
    remote.cards = remote.cards.map((card) => {
      if (card.sessionId === 'b') {
        const p = structuredClone(card.progress);
        p.latestResult.time = minuteBase - 3 * 3_600_000;
        p.turn.end.time = minuteBase - 3 * 3_600_000;
        return { ...card, section: 'settled', settledAt: minuteBase - 2 * 60_000, sortAt: minuteBase - 3 * 3_600_000, progress: p };
      }
      if (card.sessionId === 'c') {
        const p = structuredClone(card.progress);
        p.latestResult.time = minuteBase - 10 * 60_000;
        p.turn.end.time = minuteBase - 10 * 60_000;
        return { ...card, section: 'settled', settledAt: null, sortAt: minuteBase - 10 * 60_000, progress: p };
      }
      return card;
    });
    remote.revision += 1;
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    await act(async () => {
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
      env.runtime.store.set({ settledOpen: true });
    });

    // Active card 'a' renders compact 12px SnoozeAction instead of .t3i-icon-button.
    const activeCard = mounted.container.querySelector('[data-session-id="a"]');
    const snoozeSvg = activeCard.querySelector('.t3i-status-slot-actions .t3i-snooze-action svg');
    assert.ok(snoozeSvg);
    assert.equal(snoozeSvg.getAttribute('width'), '12');
    assert.equal(activeCard.querySelector('.t3i-status-slot-actions .t3i-icon-button'), null);

    // Settled sorts 'b' (settled 2m ago) ahead of 'c' (fallback activity 10m ago) and displays 2m.
    const settledOrder = [...mounted.container.querySelectorAll('.t3i-item[data-shelf="settled"]')].map((el) => el.getAttribute('data-session-id'));
    assert.deepEqual(settledOrder, ['b', 'c']);
    assert.match(mounted.container.querySelector('[data-session-id="b"] .t3i-row-time').textContent, /2/);

    // Searching 'b' shows SearchResultRow with cardActivityAt (3h / 3 小时) instead of settledAt (2m).
    await act(async () => { env.runtime.changeView({ search: 'b' }); });
    const searchTime = mounted.container.querySelector('.t3i-search-row .t3i-search-time')?.textContent ?? '';
    assert.match(searchTime, /3/);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('ThreadHoverCard opens at 150ms, closes on mouseleave/scroll/drag, and works on compact rows', async () => {
  const env = await clientHarness(['a', 'b', 'c', 'd'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const until = new Date(Date.now() + 3_600_000).toISOString();
    const remote = structuredClone(env.runtime.store.getSnapshot().remote);
    remote.cards = remote.cards.map((card) => {
      const withModel = { ...card, modelId:'deepseek-chat' };
      if (card.sessionId === 'c') return { ...withModel, section: 'snoozed', snoozed: true, snoozeEffect: { active: true, until } };
      if (card.sessionId === 'd') return { ...withModel, section: 'settled', settledAt: 5000 };
      return withModel;
    });
    remote.revision += 1;
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    await act(async () => {
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
      env.runtime.store.set({ snoozedOpen: true, settledOpen: true });
    });

    const item = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
    const preview = () => document.querySelector('.t3i-preview');
    const hoverWait = (ms) => act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); });

    // Opens at 150ms (not visible at 60ms, visible by 190ms).
    await act(async () => { item('b').dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })); });
    await hoverWait(60);
    assert.equal(preview(), null);
    await hoverWait(130);
    assert.match(preview()?.textContent ?? '', /deepseek-chat/);

    // Mouse leave clears immediately (0ms).
    await act(async () => { item('b').dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true })); });
    assert.equal(preview(), null);

    // Scroll dismisses open hover preview.
    await act(async () => { item('b').dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })); });
    await hoverWait(180);
    assert.ok(preview());
    await act(async () => {
      mounted.container.querySelector('.t3i-scroll').dispatchEvent(new window.Event('scroll'));
    });
    assert.equal(preview(), null);

    // Drag start dismisses open hover preview.
    await act(async () => { item('b').dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })); });
    await hoverWait(180);
    assert.ok(preview());
    await act(async () => {
      item('b').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 10, clientY: 10, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 25, clientY: 10, bubbles: true }));
    });
    assert.equal(preview(), null);
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mouseup', { bubbles: true }));
    });

    // Compact Snoozed and Settled rows also trigger hover preview.
    for (const id of ['c', 'd']) {
      await act(async () => { item(id).dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })); });
      await hoverWait(180);
      assert.match(preview()?.textContent ?? '', /deepseek-chat/);
      await act(async () => { item(id).dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true })); });
    }

  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('ctx.shortcuts registers DSH-safe profiles, traverses orderedSessionIds without wrapping, and toggles active settle/pin with modal guards', async () => {
  const ids = ['p0', 'a0', 'w0', 'w1', 'z0', 'z1', ...Array.from({ length: 12 }, (_, i) => `s${i}`)];
  const env = await clientHarness(ids, { render: true, shortcuts: { platform: 'macos', runtime: 'desktop' } });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  env.runtime.locale = () => 'en';
  let mounted;
  try {
    const cmds = env.shortcuts.commands;
    assert.equal(cmds.size, 13);
    assert.equal([...cmds.keys()].some((k) => k.includes('undo')), false);

    // Check web:linux omission on previous/next/settle/pin and all web:* omission on jump1..9.
    for (const id of ['t3inbox.thread.previous', 't3inbox.thread.next', 't3inbox.thread.settle', 't3inbox.thread.pin']) {
      const def = cmds.get(id).defaults;
      assert.equal(def['web:linux'], undefined);
      assert.ok(def['desktop:macos']);
      assert.ok(def['web:macos']);
    }
    for (let i = 1; i <= 9; i++) {
      const def = cmds.get(`t3inbox.thread.jump${i}`).defaults;
      assert.equal(def['web:macos'], undefined);
      assert.equal(def['web:windows'], undefined);
      assert.equal(def['web:linux'], undefined);
      assert.ok(def['desktop:macos']);
    }

    await act(async () => {
      await env.runtime.pin(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'p0'), true);
      env.host.running.add('w0');
      env.host.running.add('w1');
      await env.host.refresh();
      await env.runtime.syncSnapshot();
      const future = new Date(Date.now() + 3_600_000).toISOString();
      for (const id of ['z0', 'z1']) {
        await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === id), 'snooze', { until: future });
      }
      for (let i = 11; i >= 0; i--) {
        await settle(env.runtime, `s${i}`);
      }
      env.sessions.set({ byId: { p0: { id: 'p0', retainedBy: { mainView: 1 } } } });
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    // Collapsed Working/Snoozed/Settled: visible order is [p0 (pinned), a0 (active)] because p0 is active route.
    assert.deepEqual(env.runtime.orderedSessionIds(), ['p0', 'a0']);

    // Guard matrix: pass on terminal, settings modal, collapsed rail, native mode, filter open, combobox expanded for pin; allow sidebar modal.
    assert.equal(env.shortcuts.dispatch('t3inbox.thread.next', { region: 'terminal', modal: null, target: null }).status, 'pass');
    assert.equal(env.shortcuts.dispatch('t3inbox.thread.next', { region: 'page', modal: 'settings', target: null }).status, 'pass');
    await act(async () => {
      assert.equal(env.shortcuts.dispatch('t3inbox.thread.next', { region: 'page', modal: 'sidebar', target: null }).status, 'handled');
    });
    assert.equal(env.openSessionCalls.at(-1), 'a0');

    // Pin guard skips when focus is inside expanded combobox.
    const combo = document.createElement('input');
    combo.setAttribute('role', 'combobox');
    combo.setAttribute('aria-expanded', 'true');
    assert.equal(env.shortcuts.dispatch('t3inbox.thread.pin', { region: 'editable', modal: null, target: combo }).status, 'pass');
    // Without combobox, Cmd+Shift+P toggles pin on current session (a0).
    await act(async () => {
      assert.equal(env.shortcuts.dispatch('t3inbox.thread.pin', { region: 'page', modal: null, target: null }).status, 'handled');
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.workspaces.getSnapshot().pinnedSessionIds.includes('a0'), true);

    // Non-wrapping previous at top (a0) stays at a0; switch active to w0 (collapsed Working) -> ordered includes w0.
    await act(async () => { env.sessions.set({ byId: { a0: { id: 'a0', retainedBy: { mainView: 1 } } } }); });
    env.openSessionCalls.length = 0;
    await act(async () => {
      env.shortcuts.dispatch('t3inbox.thread.previous', { region: 'page', modal: null, target: null });
    });
    assert.deepEqual(env.openSessionCalls, []);

    await act(async () => { env.sessions.set({ byId: { w0: { id: 'w0', retainedBy: { mainView: 1 } } } }); });
    assert.deepEqual(env.runtime.orderedSessionIds(), ['a0', 'p0', 'w0']);
    // Cmd+Shift+S on running w0 shows settleBusy ErrorToast instead of settling.
    await act(async () => {
      env.shortcuts.dispatch('t3inbox.thread.settle', { region: 'page', modal: null, target: null });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.match(env.runtime.store.getSnapshot().errorToast?.description ?? '', /working/);

    // Expand Settled (page 1 = s0..s9), switch to s0 -> Cmd+Shift+S restores s0.
    await act(async () => {
      mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title').click();
      env.sessions.set({ byId: { s0: { id: 's0', retainedBy: { mainView: 1 } } } });
    });
    assert.equal(env.runtime.orderedSessionIds().length, 12);
    await act(async () => {
      env.shortcuts.dispatch('t3inbox.thread.settle', { region: 'page', modal: null, target: null });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's0')?.section, 'active');

    // Mode switch & wide=false pass.
    await act(async () => { env.runtime.noteWide(false); });
    assert.equal(env.shortcuts.dispatch('t3inbox.thread.next', { region: 'page', modal: null, target: null }).status, 'pass');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Hold-Cmd shows ⌘1..9 jump badges after 200ms, reflects live catalog remaps, suppresses on search/modal/release, and jumps cleanly', async () => {
  const env = await clientHarness(['a', 'b', 'c'], { render: true, shortcuts: { platform: 'macos', runtime: 'desktop' } });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  const wait = (ms) => act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); });
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    // Holding Meta shows badges after 200ms (not before).
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Meta', metaKey: true, bubbles: true }));
    });
    await wait(110);
    assert.equal(mounted.container.querySelectorAll('[data-jump-hint]').length, 0);
    await wait(130);
    const hints = [...mounted.container.querySelectorAll('[data-jump-hint]')].map((el) => el.textContent);
    assert.deepEqual(hints, ['⌘1', '⌘2', '⌘3']);
    assert.equal(mounted.container.querySelector('[data-session-id="a"] .t3i-status-slot')?.getAttribute('data-jump'), 'true');

    // Live catalog unbind of jump2 hides badge 2 while keeping 1 & 3.
    const nextCatalog = env.shortcuts.catalog.getSnapshot().map((row) =>
      row.id === 't3inbox.thread.jump2' ? { ...row, binding: null, keys: [] } : row);
    await act(async () => { env.shortcuts.setCatalog(nextCatalog); });
    assert.deepEqual([...mounted.container.querySelectorAll('[data-jump-hint]')].map((el) => el.textContent), ['⌘1', '⌘3']);

    // Pressing another key or releasing Meta clears badges immediately.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'Meta', metaKey: false, bubbles: true }));
    });
    assert.equal(mounted.container.querySelectorAll('[data-jump-hint]').length, 0);

    // Search query suppresses jump badges even if Meta is held > 200ms.
    await act(async () => { env.runtime.changeView({ search: 'a' }); });
    await act(async () => { window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Meta', metaKey: true, bubbles: true })); });
    await wait(230);
    assert.equal(mounted.container.querySelectorAll('[data-jump-hint]').length, 0);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'Meta', metaKey: false, bubbles: true }));
      env.runtime.changeView({ search: '' });
    });

    // Jump to #2 opens 'b' and clears multi-selection.
    await act(async () => { env.runtime.toggleSelect('c'); });
    assert.deepEqual(env.runtime.store.getSnapshot().selectedIds, ['c']);
    await act(async () => {
      env.shortcuts.dispatch('t3inbox.thread.jump2', { region: 'page', modal: null, target: null });
    });
    assert.equal(env.openSessionCalls.at(-1), 'b');
    assert.deepEqual(env.runtime.store.getSnapshot().selectedIds, []);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Narrowed Undo Notice shows Settled/Snoozed/Unpinned, filters stale remote receipts + 5s TTL expiry, re-pins settled pinned, and claims/releases Cmd+Z', async () => {
  const env = await clientHarness(['a', 'b', 'c', 'd'], { render: true, shortcuts: { platform: 'macos', runtime: 'desktop' } });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const footUndo = () => mounted.container.querySelector('.t3i-foot-undo');
    const card = (id) => env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === id);

    // Non-undoable actions (mark-unread, restore, wake, pin(true)) never produce FootUndo.
    await act(async () => {
      await env.runtime.markUnread(card('b'));
      await env.runtime.pin(card('c'), true);
      await env.runtime.act(card('d'), 'settle');
    });
    assert.match(footUndo().textContent, /Settled/);
    assert.equal(footUndo().querySelector('button').textContent, '⌘Z to undo');

    // Restore invalidates Settled notice AND restore receipt never resurrects FootUndo on follow/snapshot.
    await act(async () => {
      await env.runtime.act(card('d'), 'restore');
    });
    assert.equal(footUndo()?.getAttribute('data-live'), 'false');
    assert.equal(footUndo()?.getAttribute('aria-hidden'), 'true');
    assert.ok(env.host.currentSnapshot.receipts.some((r) => r.kind === 'restore'));
    await act(async () => {
      env.emitSnapshot({ ...env.host.currentSnapshot, revision: env.host.currentSnapshot.revision + 1 });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo:not([aria-hidden="true"])')), false, 'Stale restore receipt must not resurrect FootUndo');

    // Settle a previously pinned card ('c'), verify undo re-pins it!
    await act(async () => { await env.runtime.act(card('c'), 'settle'); });
    assert.match(footUndo().textContent, /Settled/);

    // Cmd+Z while search <input> is focused still undoes while shortcutClaimed=true, and re-pins 'c'.
    const searchInput = mounted.container.querySelector('.t3i-search');
    searchInput.focus();
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(card('c').section, 'active');
    assert.equal(env.workspaces.getSnapshot().pinnedSessionIds.includes('c'), true);
    assert.equal(footUndo()?.getAttribute('aria-hidden'), 'true');

    // After pressing another key or 'input' event inside <input>, Cmd+Z is released back to the input (not consumed).
    await act(async () => { await env.runtime.act(card('b'), 'settle'); });
    assert.ok(footUndo());
    await act(async () => {
      searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    const ev = new window.KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true, cancelable: true });
    let dispatched;
    await act(async () => {
      searchInput.dispatchEvent(ev);
      dispatched = ev;
    });
    assert.equal(dispatched.defaultPrevented, false, 'Input keeps native Cmd+Z after user edits text');
    assert.ok(footUndo());

    // observeFixedInput fallback triggers undo on page when defaultPrevented=false.
    let consumed = false;
    await act(async () => {
      env.shortcuts.emitFixedInput({
        type: 'keydown',
        gesture: { code: 'KeyZ', meta: true, control: false, alt: false, shift: false, repeat: false, composing: false, defaultPrevented: false },
        context: { region: 'page', modal: null, target: document.body },
        consume: () => { consumed = true; },
      });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(consumed, true);
    assert.equal(card('b').section, 'active');
    assert.equal(footUndo()?.getAttribute('aria-hidden'), 'true');

    // Direct unpin shows Unpinned, Cmd+Z re-pins, and stale receipt TTL expires without waiting for publishSnapshot.
    await act(async () => { await env.runtime.pin(card('c'), false); });
    assert.equal(footUndo().querySelector('.t3i-foot-undo-text').textContent, 'Unpinned,');
    await act(async () => {
      await env.runtime.undo(env.runtime.store.getSnapshot().undo);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.workspaces.getSnapshot().pinnedSessionIds.includes('c'), true);

    // Stale settle receipt auto-expires after its short TTL without a snapshot push.
    const shortOp = 'short-op-ttl-check';
    const shortExp = Date.now() + 70;
    const staleSnap = structuredClone(env.host.currentSnapshot);
    staleSnap.cards = staleSnap.cards.map((c) => (c.sessionId === 'd' ? { ...c, section: 'settled' } : c));
    staleSnap.receipts = [{ operationId: shortOp, sessionId: 'd', kind: 'settle', expiresAt: shortExp }];
    staleSnap.revision += 1;
    await act(async () => {
      env.emitSnapshot(staleSnap);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.ok(mounted.container.querySelector('.t3i-foot-undo:not([aria-hidden="true"])'));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 110)); });
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo:not([aria-hidden="true"])')), false, 'Client timer clears expired FootUndo without waiting for publishSnapshot');
    // Re-emitting the expired receipt in a snapshot never resurrects FootUndo.
    staleSnap.revision += 1;
    await act(async () => {
      env.emitSnapshot(staleSnap);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo:not([aria-hidden="true"])')), false);
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); });
    assert.equal(Boolean(footUndo()), false, 'FootUndo unmounts cleanly after 200ms fade-out');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Multi-select (Cmd+click, Shift+click, Escape) drives native & fallback batch context menus with coParkingKeys and grouped undo', async () => {
  const env = await clientHarness(['a', 'b', 'c', 'd', 'e'], { render: true, nativeMenus: true, openContextMenus: true, shortcuts: { platform: 'macos', runtime: 'desktop' } });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  env.runtime.locale = () => 'en';
  let mounted;
  try {
    await act(async () => {
      await env.runtime.pin(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a'), true);
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    const row = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"] .t3i-row`);
    const item = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);

    // Cmd+click 'a' and Shift+click 'c' -> selects a, b, c without switching session!
    await act(async () => {
      row('a').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
    });
    await act(async () => {
      row('c').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
    });
    assert.deepEqual(env.openSessionCalls, []);
    assert.equal(item('b').getAttribute('data-selected'), 'true');
    assert.equal(item('b').getAttribute('data-recede'), null);

    // Native batch menu opens t3inbox-batch with Unpin (1), Settle (3), Snooze (3), Mark unread (3).
    await act(async () => {
      item('b').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 80 }));
    });
    assert.equal(env.openedContextMenus.at(-1).target.kind, 't3inbox-batch');
    assert.deepEqual(env.openedContextMenus.at(-1).target.value.sessionIds, ['a', 'b', 'c']);
    const batchProvider = env.menuRegistrations.find((m) => m.id === 't3inbox.batch');
    const resolvedBatch = batchProvider.resolve({ sessionIds: ['a', 'b', 'c'] });
    assert.deepEqual(resolvedBatch.map((i) => i.label), ['Unpin (1)', 'Settle (3)', 'Snooze (3)', 'Mark unread (3)']);

    // Escape clears selection.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.deepEqual(env.runtime.store.getSnapshot().selectedIds, []);

    // Fallback batch context menu (without ctx.contextMenus.open): batch-settle a, b, c skips b/c via coParkingKeys and opens 'd' + shows "Settled 3, ⌘Z to undo"!
    const envFb = await clientHarness(['a', 'b', 'c', 'd'], { render: true, nativeMenus: false });
    try {
      await act(async () => { mounted.root.unmount(); });
      mounted = await mountBrowser(envFb, { t: enTranslator(envFb) });
      const fbRow = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"] .t3i-row`);
      const fbItem = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
      await act(async () => {
        fbRow('a').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
      });
      await act(async () => {
        fbRow('c').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
      });
      await act(async () => {
        fbItem('b').dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 80 }));
      });
      const menu = mounted.container.querySelector('.t3i-context-menu[data-batch="true"]');
      assert.ok(menu);
      const settleBtn = [...menu.querySelectorAll('[role="menuitem"]')].find((b) => b.textContent === 'Settle (3)');
      await act(async () => {
        settleBtn.click();
        await new Promise((resolve) => setImmediate(resolve));
        await new Promise((resolve) => setImmediate(resolve));
      });
      assert.equal(envFb.openSessionCalls.at(-1), 'd', 'coParkingKeys advances past b and c directly to d');
      assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Settled 3,');
    } finally {
      envFb.dispose();
    }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Press-and-hold Settle/Un-settle sweep spans same section at >=6px with verb badges, aborts on Escape, and suppresses synthetic click', async () => {
  const env = await clientHarness(['a', 'b', 'c', 's0', 's1'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    await act(async () => {
      await settle(env.runtime, 's0');
      await settle(env.runtime, 's1');
      if (env.runtime.store.getSnapshot().undo) env.runtime.dismissUndo(env.runtime.store.getSnapshot().undo.id);
      env.sessions.set({ byId: { a: { id: 'a', retainedBy: { mainView: 1 } } } });
      env.openSessionCalls.length = 0;
      env.runtime.store.set({ settledOpen: true });
    });

    const scroll = mounted.container.querySelector('.t3i-scroll');
    scroll.getBoundingClientRect = () => ({ top: 0, bottom: 400, left: 0, right: 280, width: 280, height: 400 });
    const tops = { a: 10, b: 70, c: 130, s0: 210, s1: 250 };
    for (const [id, top] of Object.entries(tops)) {
      const el = mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
      el.getBoundingClientRect = () => ({ top, bottom: top + 36, left: 8, right: 272, width: 264, height: 36 });
    }
    const item = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);

    // Pointerdown on a's Settle button + move < 6px -> no sweep yet.
    const settleA = item('a').querySelector('.t3i-primary-action');
    await act(async () => {
      settleA.dispatchEvent(new window.MouseEvent('pointerdown', { button: 0, clientX: 240, clientY: 20, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 240, clientY: 23, bubbles: true }));
    });
    assert.equal(mounted.container.querySelectorAll('.t3i-sweep-badge').length, 0);

    // Move >= 6px down to s0 -> sweeps a, b, c (all active) and excludes s0 (different section).
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 240, clientY: 220, bubbles: true }));
    });
    assert.equal(item('a').getAttribute('data-sweep'), 'settle');
    assert.equal(item('b').getAttribute('data-sweep'), 'settle');
    assert.equal(item('c').getAttribute('data-sweep'), 'settle');
    assert.equal(item('s0').getAttribute('data-sweep'), null);
    assert.equal(item('a').querySelector('.t3i-sweep-badge')?.textContent, 'Settle');

    // Escape cancels cleanly without mutating.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(mounted.container.querySelectorAll('.t3i-sweep-badge').length, 0);
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a')?.section, 'active');

    // Sweep a..b and release pointerup -> settles both a and b with grouped undo and skips b in nextCandidate.
    await act(async () => {
      settleA.dispatchEvent(new window.MouseEvent('pointerdown', { button: 0, clientX: 240, clientY: 20, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 240, clientY: 80, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a')?.section, 'settled');
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'b')?.section, 'settled');
    assert.equal(env.openSessionCalls.at(-1), 'c');
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Settled 2,');

    // Re-seed bounding rects matching top-to-bottom settled order (s1 above s0) and sweep Un-settle across s1..s0.
    for (const [id, top] of Object.entries({ s1: 210, s0: 250 })) {
      const el = mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
      el.getBoundingClientRect = () => ({ top, bottom: top + 36, left: 8, right: 272, width: 264, height: 36 });
    }
    const unsettleS1 = item('s1').querySelector('.t3i-slim-action');
    await act(async () => {
      unsettleS1.dispatchEvent(new window.MouseEvent('pointerdown', { button: 0, clientX: 250, clientY: 220, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 250, clientY: 260, bubbles: true }));
    });
    assert.equal(item('s1').getAttribute('data-sweep'), 'unsettle');
    assert.equal(item('s0').getAttribute('data-sweep'), 'unsettle');
    assert.equal(item('s1').querySelector('.t3i-sweep-badge')?.textContent, 'Un-settle');
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's0')?.section, 'active');
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')?.section, 'active');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('FootUndo stays hidden during in-flight stream receipt, becomes immediately enabled + Cmd+Z active on commit, and never falls back to raw undoButtonPlain', async () => {
  const env = await clientHarness(['a', 'b'], { render: true, shortcuts: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    let releaseSnapshot;
    const origSnapshot = env.remote.snapshot;
    let blockSnapshot = true;
    env.remote.snapshot = async () => {
      if (blockSnapshot) {
        await new Promise((resolve) => { releaseSnapshot = resolve; });
      }
      return origSnapshot();
    };

    // Start settling 'a'. Host act commits immediately and emitSnapshot pushes the receipt while act() is in flight.
    const settlePromise = settle(env.runtime, 'a');
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    const midSnap = structuredClone(env.host.currentSnapshot);
    midSnap.revision = (midSnap.revision ?? 0) + 1;
    await act(async () => {
      env.emitSnapshot(midSnap);
      await new Promise((resolve) => setImmediate(resolve));
    });
    // Even with a fresh settle receipt delivered by follow() while pendingActions['a']=1, FootUndo must not fade in disabled.
    assert.equal(env.runtime.store.getSnapshot().pendingActions.a, 1);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo[data-live="true"]')), false);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo')), false);

    // Unblock delayed snapshot: FootUndo renders immediately with disabled === false and Cmd+Z works right away.
    await act(async () => {
      blockSnapshot = false;
      releaseSnapshot?.();
      await settlePromise;
    });
    const undoBtn = mounted.container.querySelector('.t3i-foot-undo button');
    assert.ok(undoBtn);
    assert.equal(undoBtn.disabled, false);

    // Pressing Cmd+Z immediately undoes 'a' without dropping.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a')?.section, 'active');

    // When stream surfaces a non-pending settle receipt (e.g., reconnect/external commit), shortcutClaimed is set so Cmd+Z works.
    await act(async () => {
      await settle(env.runtime, 'b');
      env.runtime.dismissUndo(env.runtime.store.getSnapshot().undo.id);
    });
    const externalSnap = structuredClone(env.host.currentSnapshot);
    externalSnap.revision = (externalSnap.revision ?? 0) + 1;
    externalSnap.receipts = [{ operationId: 'ext-op-b', sessionId: 'b', kind: 'settle', committedAt: Date.now(), expiresAt: Date.now() + 4500, revision: 1 }];
    await act(async () => {
      env.emitSnapshot(externalSnap);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Settled,');
    const extEvent = new window.KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true, cancelable: true });
    await act(async () => { window.dispatchEvent(extEvent); });
    assert.equal(extEvent.defaultPrevented, true);

    // Missing shortcut label falls back to localized Undo ('Undo' / '撤销'), never raw 'undoButtonPlain'.
    await act(async () => { mounted.root.unmount(); });
    mounted = null;
    const envNoShortcuts = await clientHarness(['x', 'y'], { render: true, shortcuts: false });
    try {
      envNoShortcuts.runtime.undoShortcutLabel = () => '';
      const m2 = await mountBrowser(envNoShortcuts, { t: enTranslator(envNoShortcuts) });
      try {
        await act(async () => { await settle(envNoShortcuts.runtime, 'x'); });
        assert.equal(m2.container.querySelector('.t3i-foot-undo button')?.textContent, 'Undo');
      } finally {
        await act(async () => { m2.root.unmount(); });
      }
      const mZh = await mountBrowser(envNoShortcuts, { t: (key) => envNoShortcuts.dictionaries.zh[key] ?? key });
      try {
        await act(async () => { await settle(envNoShortcuts.runtime, 'y'); });
        assert.equal(mZh.container.querySelector('.t3i-foot-undo button')?.textContent, '撤销');
      } finally {
        await act(async () => { mZh.root.unmount(); });
      }
    } finally {
      envNoShortcuts.dispose();
    }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Mixed warm + cold actMany prepares cold cards before atomic batch FootUndo, Cmd+Z undoes all without stranding, and sweep blocks HoverCard', async () => {
  const env = await clientHarness(['a', 'coldB', 'c'], { render: true, shortcuts: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    let coldWarm = false;
    env.host.prepareLimit = (fn) => fn();
    const coldOrigRead = env.host.readMember;
    env.host.readMember = async (id) => {
      if (id === 'coldB' && !coldWarm) {
        return { sessionId: id, label: id, progress: completed(id), pendingInput: [], cold: true, runtime: { running: false, queue: null, completeness: 'unavailable' } };
      }
      return coldOrigRead(id);
    };
    let releasePrepare;
    env.host.ctx.sessionController.resolveAgent = async (id) => {
      assert.equal(id, 'coldB');
      await new Promise((resolve) => { releasePrepare = resolve; });
      coldWarm = true;
      return { agent: {} };
    };
    env.remote.prepare = async (value) => ({ ok: true, value: await env.host.prepare(value, new AbortController().signal) });
    await env.host.refresh();
    env.runtime.store.set({ remote: structuredClone(env.host.currentSnapshot) });

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    const seenUndoTexts = [];
    const offStore = env.runtime.store.subscribe(() => {
      const u = env.runtime.store.getSnapshot().undo;
      if (u) seenUndoTexts.push(`${u.action}:${u.count}`);
    });

    const cards = ['a', 'coldB', 'c'].map((id) => env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === id));
    const batchPromise = env.runtime.actMany(cards, 'settle');
    for (let i = 0; i < 8 && !releasePrepare; i++) await new Promise((resolve) => setImmediate(resolve));
    assert.ok(releasePrepare, 'coldB prepare should have started before warm siblings emit undo');
    // Neither warm sibling should have emitted a partial Settled 1/Settled 2 FootUndo while coldB prepares.
    assert.deepEqual(seenUndoTexts, []);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo[data-live="true"]')), false);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo')), false);

    await act(async () => {
      releasePrepare();
      await batchPromise;
    });
    offStore();

    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Settled 3,');
    assert.equal(mounted.container.querySelector('.t3i-foot-undo button')?.disabled, false);
    assert.ok(!seenUndoTexts.includes('Settled:2'), 'must never emit partial Settled 2 before coldB finishes');
    for (const id of ['a', 'coldB', 'c']) {
      assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === id)?.section, 'settled');
    }

    // Pressing Cmd+Z undoes ALL 3 together (none stranded in settled).
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    for (const id of ['a', 'coldB', 'c']) {
      assert.equal(env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === id)?.section, 'active');
    }

    // Active sweep suppresses 150ms ThreadHoverCard on swept rows and clears data-t3i-sweeping afterwards.
    const scroll = mounted.container.querySelector('.t3i-scroll');
    scroll.getBoundingClientRect = () => ({ top: 0, bottom: 400, left: 0, right: 280, width: 280, height: 400 });
    for (const [id, top] of Object.entries({ a: 10, coldB: 70, c: 130 })) {
      const el = mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
      el.getBoundingClientRect = () => ({ top, bottom: top + 36, left: 8, right: 272, width: 264, height: 36 });
    }
    const itemA = mounted.container.querySelector('.t3i-item[data-session-id="a"]');
    const itemB = mounted.container.querySelector('.t3i-item[data-session-id="coldB"]');
    const settleA = itemA.querySelector('.t3i-primary-action');
    await act(async () => {
      settleA.dispatchEvent(new window.MouseEvent('pointerdown', { button: 0, clientX: 240, clientY: 20, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('pointermove', { clientX: 240, clientY: 80, bubbles: true }));
      itemB.dispatchEvent(new window.MouseEvent('pointerenter', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 180));
    });
    assert.equal(document.body.getAttribute('data-t3i-sweeping'), 'true');
    assert.equal(document.querySelector('.t3i-preview'), null);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(document.body.getAttribute('data-t3i-sweeping'), null);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Cmd+Shift+P unpin preserves Unpinned FootUndo across lagging workspaces.list updates and external re-pin invalidates once synced, while jump1..4 match commandPattern', async () => {
  const env = await clientHarness(['a', 'b', 'c', 'd'], { render: true, shortcuts: { platform: 'macos', runtime: 'desktop' } });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    // Pin 'a' via workspaces and keep 'a' retained in mainView.
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: ['a'], archivedSessionIds: [] });
      env.sessions.set({ byId: { a: { id: 'a', retainedBy: { mainView: 1 } } } });
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    // Simulate cross-channel lag: remote.pin commits unpin and follow() refreshes BEFORE workspaces.list drops 'a'.
    const origPin = env.remote.pin;
    let delayedWorkspaceSync;
    env.remote.pin = async (req) => {
      if (!req.pinned) {
        delayedWorkspaceSync = () => {
          const cur = env.workspaces.getSnapshot();
          env.workspaces.set({ ...cur, pinnedSessionIds: cur.pinnedSessionIds.filter((id) => id !== req.sessionId) });
        };
        return { ok: true, value: { pinned: false } };
      }
      return origPin(req);
    };

    await act(async () => {
      env.shortcuts.dispatch('t3inbox.thread.pin', { region: 'page', modal: null, target: null });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Unpinned,');

    // A follow() snapshot arriving while workspaces.list STILL holds 'a' must NOT invalidate Unpinned.
    const snapBeforeSync = structuredClone(env.host.currentSnapshot);
    snapBeforeSync.revision = (snapBeforeSync.revision ?? 0) + 1;
    await act(async () => {
      env.emitSnapshot(snapBeforeSync);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Unpinned,');

    // Once workspaces.list syncs the unpin ('a' removed), Unpinned remains visible; then an external re-pin invalidates it.
    await act(async () => { delayedWorkspaceSync(); });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, 'Unpinned,');
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: ['a'], archivedSessionIds: [] });
    });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo')?.getAttribute('data-live'), 'false');
    assert.equal(mounted.container.querySelector('.t3i-foot-undo')?.getAttribute('aria-hidden'), 'true');

    // Every registered shortcut ID satisfies DSH Electron main commandPattern and jump1..4 navigate orderedSessionIds.
    const commandPattern = /^[a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z][a-zA-Z0-9-]*)+$/u;
    for (const id of env.shortcuts.commands.keys()) {
      assert.equal(commandPattern.test(id), true, `${id} must satisfy Electron commandPattern`);
    }
    env.openSessionCalls.length = 0;
    for (const [idx, expected] of [[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd']]) {
      await act(async () => { env.shortcuts.dispatch(`t3inbox.thread.jump${idx}`, { region: 'page', modal: null, target: null }); });
      assert.equal(env.openSessionCalls.at(-1), expected);
    }
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('CustomSnoozeModal renders glass 384px dialog, MonthCalendar nested Escape, NumberField stepper, validation, and batch snooze', async () => {
  const env = await clientHarness(['a', 'b'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const rowA = mounted.container.querySelector('[data-session-id="a"] .t3i-row');
    const snoozeBtnA = rowA.querySelector('.t3i-snooze-action');
    snoozeBtnA.focus();
    await act(async () => { snoozeBtnA.click(); });
    await act(async () => { document.querySelector('.t3i-snooze-menu [data-custom]').click(); });

    const dialog = document.querySelector('[data-shortcut-modal="t3i-custom-snooze"][role="dialog"]');
    assert.ok(dialog);
    assert.equal(dialog.getAttribute('aria-modal'), 'true');
    assert.ok(dialog.querySelector('.t3i-modal-close'));
    assert.ok(dialog.querySelector('.t3i-modal-edit-options'));
    assert.equal(dialog.contains(document.activeElement), true);

    // Open MonthCalendar popover, check 7-col grid, outside days, today dot, month nav, and nested Escape.
    const dateBtn = dialog.querySelector('.t3i-date-trigger');
    await act(async () => { dateBtn.click(); });
    const popover = dialog.querySelector('.t3i-calendar-popover[role="dialog"]');
    assert.ok(popover);
    assert.equal(popover.querySelectorAll('.t3i-cal-weekday').length, 7);
    assert.ok(popover.querySelector('.t3i-cal-day[data-today="true"]'));
    assert.ok(popover.querySelector('.t3i-cal-day[data-outside="true"]'));
    const nextMonthBtn = popover.querySelector('[aria-label="Next month"]');
    const prevMonthBtn = popover.querySelector('[aria-label="Previous month"]');
    assert.ok(nextMonthBtn && prevMonthBtn);
    const captionBefore = popover.querySelector('.t3i-cal-caption')?.textContent;
    await act(async () => { nextMonthBtn.click(); });
    assert.notEqual(popover.querySelector('.t3i-cal-caption')?.textContent, captionBefore);
    await act(async () => { prevMonthBtn.click(); });
    assert.equal(popover.querySelector('.t3i-cal-caption')?.textContent, captionBefore);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(dialog.querySelector('.t3i-calendar-popover') === null, true, 'First Escape closes calendar popover only');
    assert.equal(document.activeElement === dateBtn, true, 'Escape from calendar restores focus to date trigger');
    assert.ok(document.querySelector('[data-shortcut-modal="t3i-custom-snooze"]'));

    // Submitting a past date/time surfaces validation error and preserves dialog.
    const timeInput = dialog.querySelector('input[type="time"]');
    const dateNow = new Date();
    const pastTime = '00:00';
    // Navigate calendar to verify past day is disabled if visible and submit 00:00 when > 00:00.
    if (dateNow.getHours() > 0 || dateNow.getMinutes() > 0) {
      await act(async () => { dateBtn.click(); });
      const todayCell = dialog.querySelector('.t3i-cal-day[data-today="true"]');
      await act(async () => { todayCell.click(); });
      await act(async () => { dateBtn.click(); });
      const anyPast = [...dialog.querySelectorAll('.t3i-cal-day:not([data-outside="true"])')].find((b) => b.disabled);
      if (anyPast) assert.equal(anyPast.disabled, true);
      await act(async () => {
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      });
      await act(async () => {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(timeInput, pastTime);
        timeInput.dispatchEvent(new window.Event('input', { bubbles: true }));
        timeInput.dispatchEvent(new window.Event('change', { bubbles: true }));
      });
      await act(async () => {
        dialog.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      });
      assert.ok(dialog.querySelector('.t3i-custom-snooze-error[role="alert"]'));
    }

    // Switch to Duration mode, test NumberField stepper [-]/[+], and submit.
    const durationTab = [...dialog.querySelectorAll('.t3i-mode-chip')].find((b) => b.textContent === 'Duration');
    await act(async () => { durationTab.click(); });
    const amountInput = dialog.querySelector('.t3i-number-input');
    const incBtn = dialog.querySelector('[aria-label="Increase duration"]');
    const decBtn = dialog.querySelector('[aria-label="Decrease duration"]');
    assert.equal(amountInput.value, '2');
    await act(async () => { incBtn.click(); });
    assert.equal(amountInput.value, '3');
    await act(async () => { decBtn.click(); });
    assert.equal(amountInput.value, '2');

    // Second Escape closes dialog cleanly and restores focus to previous button.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(document.querySelector('[data-shortcut-modal="t3i-custom-snooze"]') === null, true);
    await Promise.resolve();
    assert.equal(document.activeElement === snoozeBtnA, true, 'Second Escape restores focus to snooze trigger');

    // Batch custom snooze commits snooze on both selected sessions.
    const acted = [];
    const origActMany = env.runtime.actMany;
    env.runtime.actMany = async (cardsArg, kind, extra) => {
      acted.push([cardsArg.map((c) => c.sessionId), kind, extra]);
      return origActMany(cardsArg, kind, extra);
    };
    await act(async () => { env.runtime.openCustomSnoozeBatch(['a', 'b']); });
    const batchDialog = document.querySelector('[data-shortcut-modal="t3i-custom-snooze"]');
    assert.ok(batchDialog.textContent.includes('2 snoozed threads'));
    const batchDurationTab = [...batchDialog.querySelectorAll('.t3i-mode-chip')].find((b) => b.textContent === 'Duration');
    await act(async () => { batchDurationTab.click(); });
    await act(async () => {
      batchDialog.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(acted.length, 1);
    assert.deepEqual(acted[0][0], ['a', 'b']);
    assert.equal(acted[0][1], 'snooze');
    assert.ok(Date.parse(acted[0][2].until) > Date.now() + 60 * 60_000);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Unified sidebar drag shows elevated row, inline verb pill, 24px boundaries, 36px placeholders, Escape cancel, order save, and Settled drop', async () => {
  const storageMap = new Map();
  const storage = {
    getItem(k) { return storageMap.has(k) ? storageMap.get(k) : null; },
    setItem(k, v) { storageMap.set(k, String(v)); },
    removeItem(k) { storageMap.delete(k); },
  };
  const env = await clientHarness(['p1', 'a1', 'a2', 'w1'], { render: true, storage });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const proto = window.HTMLElement.prototype;
  const origGetRect = proto.getBoundingClientRect;
  let mounted;
  try {
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: ['p1'], archivedSessionIds: [] });
    });
    const snap = structuredClone(env.host.currentSnapshot);
    const makeSort = (id, sortAt, extras = {}) => ({
      ...snap.cards[0],
      sessionId: id,
      title: `Session ${id}`,
      section: 'active',
      sortAt,
      pinned: id === 'p1',
      ...extras,
    });
    snap.cards = [
      makeSort('p1', 400, { pinned: true }),
      makeSort('a1', 300),
      makeSort('a2', 200),
      makeSort('w1', 100, { section: 'working', running: true }),
    ];
    snap.revision = (snap.revision ?? 0) + 1;

    const rectByDragId = {
      'sidebar-marker-pinned-header': { top: 0, bottom: 0, left: 0, right: 260, width: 260, height: 0 },
      p1: { top: 0, bottom: 64, left: 0, right: 260, width: 260, height: 64 },
      'sidebar-marker-pinned-divider': { top: 64, bottom: 64, left: 0, right: 260, width: 260, height: 0 },
      a1: { top: 64, bottom: 128, left: 0, right: 260, width: 260, height: 64 },
      a2: { top: 128, bottom: 192, left: 0, right: 260, width: 260, height: 64 },
      'sidebar-marker-active-placeholder': { top: 64, bottom: 64, left: 0, right: 260, width: 260, height: 0 },
      'sidebar-marker-working-header': { top: 420, bottom: 452, left: 0, right: 260, width: 260, height: 32 },
      w1: { top: 452, bottom: 516, left: 0, right: 260, width: 260, height: 64 },
      'sidebar-marker-settled-header': { top: 468, bottom: 500, left: 0, right: 260, width: 260, height: 32 },
      'sidebar-marker-settled-placeholder': { top: 500, bottom: 500, left: 0, right: 260, width: 260, height: 0 },
    };
    proto.getBoundingClientRect = function () {
      if (this.classList?.contains('t3i-scroll')) return { top: 0, bottom: 508, left: 0, right: 260, width: 260, height: 508 };
      const id = this.getAttribute?.('data-drag-item-id');
      if (id && rectByDragId[id]) return rectByDragId[id];
      return origGetRect.call(this);
    };

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: ['p1'], archivedSessionIds: [] });
      env.emitSnapshot(snap);
    });

    // Working row is not draggable (expand Working to inspect row, then collapse again), and sub-threshold (<6px) movement does not trigger drag.
    await act(async () => { env.runtime.toggleShelf('working'); });
    const itemW1 = mounted.container.querySelector('[data-session-id="w1"]');
    assert.equal(itemW1.getAttribute('data-drag-enabled'), null);
    await act(async () => { env.runtime.toggleShelf('working'); });
    const itemA2 = mounted.container.querySelector('[data-session-id="a2"]');
    assert.equal(itemA2.getAttribute('data-drag-enabled'), 'true');
    await act(async () => {
      itemA2.dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 160, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 157, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 40, clientY: 157, bubbles: true }));
    });
    assert.equal(document.body.getAttribute('data-t3i-dragging'), null);

    // Drag a2 UP into Pinned (clamps above Pinned label, shows Pin pill, targets sidebar-pinned-header, then Settled placeholder, then Escape).
    await act(async () => {
      itemA2.dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 160, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 10, bubbles: true }));
    });
    assert.equal(document.body.getAttribute('data-t3i-dragging'), 'true');
    assert.equal(mounted.container.querySelector('[data-session-id="a2"]').getAttribute('data-dragging'), 'true');
    assert.equal(mounted.container.querySelector('[data-session-id="a2"] .t3i-inline-drop-verb')?.textContent, 'Pin');
    assert.equal(mounted.container.querySelector('[data-testid="sidebar-pinned-header"]')?.getAttribute('data-target'), 'true');
    assert.equal(mounted.container.querySelector('[data-session-id="a2"]').style.transform, 'translate3d(0, -104px, 0)', 'Dragged row clamps cleanly below 24px Pinned header');
    assert.equal(mounted.container.querySelector('[data-session-id="a1"]').getAttribute('data-drag-peer'), 'true');
    assert.ok(mounted.container.querySelector('[data-session-id="p1"]').style.transform.includes('translate3d'));

    // Move onto Settled header -> 36px Settled placeholder box appears and settled-header gets drop target + Settle verb.
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 472, bubbles: true }));
    });
    assert.equal(mounted.container.querySelector('[data-session-id="a2"] .t3i-inline-drop-verb')?.textContent, 'Settle');
    const settledPlaceholder = mounted.container.querySelector('[data-testid="sidebar-settled-placeholder"]');
    assert.equal(settledPlaceholder?.getAttribute('data-target'), 'true');
    assert.ok(settledPlaceholder?.querySelector('.t3i-drop-placeholder-box'));
    assert.equal(mounted.container.querySelector('[data-testid="sidebar-settled-header"]')?.getAttribute('data-drop-target'), 'true');

    // Escape cancels cleanly with no mutations.
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(document.body.getAttribute('data-t3i-dragging'), null);
    assert.equal(storage.getItem('dsh-t3-inbox:pinned-order'), null);
    assert.equal(storage.getItem('dsh-t3-inbox:order'), null);

    // Drag p1 inside Pinned keeps inline pin icon, crossing divider switches to Unpin and hides pin icon, then Escape cancels.
    const itemP1 = mounted.container.querySelector('[data-session-id="p1"]');
    await act(async () => {
      itemP1.dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 32, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 40, bubbles: true }));
    });
    assert.ok(mounted.container.querySelector('[data-session-id="p1"] .t3i-pin'), 'showPin stays visible over Pinned with no drop verb');
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 130, bubbles: true }));
    });
    assert.equal(mounted.container.querySelector('[data-session-id="p1"] .t3i-inline-drop-verb')?.textContent, 'Unpin');
    assert.equal(mounted.container.querySelector('[data-testid="sidebar-pinned-divider"]')?.getAttribute('data-target'), 'true');
    assert.equal(mounted.container.querySelector('[data-session-id="p1"] .t3i-pin') === null, true);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });

    // Drag a2 toward a1 inside time-ordered Active: suppresses synthetic click, does NOT write order storage, preserves time order.
    env.openSessionCalls.length = 0;
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a2"]').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 190, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 120, bubbles: true }));
    });
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 40, clientY: 120, bubbles: true }));
      mounted.container.querySelector('[data-session-id="a2"] .t3i-row').click();
    });
    assert.deepEqual(env.openSessionCalls, [], 'Follow-up click right after drag release is suppressed');
    assert.equal(storage.getItem('dsh-t3-inbox:pinned-order'), null);
    assert.equal(storage.getItem('dsh-t3-inbox:order'), null);
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="active"]')].map((el) => el.getAttribute('data-session-id')),
      ['a1', 'a2'],
    );

    // Pin a2 above p1 via drag into Pinned: writes dsh-t3-inbox:pinned-order = ['a2', 'p1'], orders Pinned DOM,
    // unpinning removes 'a2' from storage, and Undo restores pin + order.
    storage.setItem('dsh-t3-inbox:order', JSON.stringify(['legacy']));
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a2"]').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 160, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 10, bubbles: true }));
    });
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 40, clientY: 10, bubbles: true }));
    });
    assert.equal(storage.getItem('dsh-t3-inbox:order'), null, 'legacy dsh-t3-inbox:order is cleaned up');
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['a2', 'p1']);
    await act(async () => {
      const nextSnap = structuredClone(snap);
      nextSnap.cards = [
        makeSort('p1', 400, { pinned: true }),
        makeSort('a2', 200, { pinned: true }),
        makeSort('a1', 300),
        makeSort('w1', 100, { section: 'working', running: true }),
      ];
      nextSnap.revision += 1;
      env.emitSnapshot(nextSnap);
    });
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="pinned"]')].map((el) => el.getAttribute('data-session-id')),
      ['a2', 'p1'],
    );
    await act(async () => {
      const cardA2 = env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a2');
      await env.runtime.pin({ ...cardA2, pinned: true }, false);
    });
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['p1']);
    await act(async () => { env.runtime.undoLatest(); });
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['a2', 'p1']);
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: ['p1'], archivedSessionIds: [] });
      env.emitSnapshot(snap);
    });

    // Cross-shelf drop of a1 onto Settled triggers runtime.act(..., 'settle').
    const acted = [];
    env.runtime.act = async (cardArg, kind) => { acted.push([cardArg.sessionId, kind]); return { ok: true }; };
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a1"]').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 96, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 472, bubbles: true }));
    });
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 40, clientY: 472, bubbles: true }));
    });
    assert.deepEqual(acted, [['a1', 'settle']]);

    // Synchronous fast-flick drag (mousedown -> mousemove -> mouseup inside ONE act() before useLayoutEffect commit) still commits.
    const fastPinned = [];
    env.runtime.pin = async (cardArg, pinned) => { fastPinned.push([cardArg.sessionId, pinned]); return { ok: true }; };
    await act(async () => {
      mounted.container.querySelector('[data-session-id="a2"]').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 160, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 140, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 40, clientY: 10, bubbles: true }));
    });
    assert.deepEqual(fastPinned, [['a2', true]]);
  } finally {
    proto.getBoundingClientRect = origGetRect;
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('useWorkingGrace return tracker bubbles completed Working thread to #1 in Active after 2s grace', async () => {
  const env = await clientHarness(['older-work', 'newer-idle'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const snap = structuredClone(env.host.currentSnapshot);
    snap.cards = [
      { ...snap.cards[0], sessionId: 'older-work', title: 'Older work', section: 'working', running: true, createdAt: 10_000, progress: null, result: null, members: [] },
      { ...snap.cards[1], sessionId: 'newer-idle', title: 'Newer idle', section: 'active', running: false, createdAt: 50_000, progress: null, result: null, members: [] },
    ];
    snap.revision += 1;
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const s = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(s) : s;
      },
      useSessions: (select) => {
        const s = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(s) : s;
      },
    });
    await act(async () => { env.emitSnapshot(snap); });
    // Expand Working shelf so we can inspect the row's status/timer during the 2s placement grace.
    await act(async () => { env.runtime.store.set({ workingOpen: true }); });
    assert.equal(mounted.container.querySelector('.t3i-item[data-session-id="older-work"]')?.getAttribute('data-working'), 'true');

    // Working thread finishes without bumping latestResult -> stays in Working for 2s grace.
    const doneSnap = structuredClone(snap);
    doneSnap.cards[0].section = 'active';
    doneSnap.cards[0].running = false;
    doneSnap.revision += 1;
    await act(async () => { env.emitSnapshot(doneSnap); });
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="active"]')].map((el) => el.getAttribute('data-session-id')),
      ['newer-idle'],
    );
    const graceRow = mounted.container.querySelector('.t3i-item[data-session-id="older-work"]');
    assert.equal(graceRow?.getAttribute('data-shelf'), 'working', 'row stays on Working shelf during 2s grace');
    assert.equal(graceRow?.getAttribute('data-working'), null, 'Working status clears immediately during 2s grace');
    assert.equal(graceRow?.querySelector('.t3i-status-time'), null, 'WorkingDuration unmounts immediately during 2s grace');

    // Once 2s grace expires, observedReturnAt bubbles older-work to #1 in Active above newer-idle.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2100));
    });
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="active"]')].map((el) => el.getAttribute('data-session-id')),
      ['older-work', 'newer-idle'],
    );
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('live Client sessions.byId running=false stops Working timer immediately before Host snapshot arrives', async () => {
  const env = await clientHarness(['solo-run', 'parent-run'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const startedAt = Date.now() - 5_000;
    const snap = structuredClone(env.host.currentSnapshot);
    snap.cards = [
      {
        ...snap.cards[0],
        sessionId: 'solo-run',
        title: 'Solo worker',
        section: 'working',
        running: true,
        waiting: false,
        progress: { sessionId: 'solo-run', turn: { start: { seq: 1, time: startedAt, turn: 1 }, end: null } },
        runtime: { running: true, queue: [], completeness: 'complete', startedAt },
        members: [{ sessionId: 'solo-run', runtime: { running: true, queue: [] } }],
      },
      {
        ...snap.cards[1],
        sessionId: 'parent-run',
        title: 'Parent with subagent',
        section: 'working',
        running: true,
        waiting: false,
        progress: { sessionId: 'parent-run', turn: { start: { seq: 1, time: startedAt, turn: 1 }, end: null } },
        runtime: { running: true, queue: [], completeness: 'complete', startedAt },
        members: [
          { sessionId: 'parent-run', runtime: { running: true, queue: [] } },
          { sessionId: 'child-run', runtime: { running: true, queue: [] } },
        ],
      },
    ];
    snap.revision += 1;
    env.sessions.set({
      phase: 'ready',
      byId: {
        'solo-run': { id: 'solo-run', running: true, retainedBy: { mainView: 1 } },
        'parent-run': { id: 'parent-run', running: true },
      },
    });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const s = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(s) : s;
      },
      useSessions: (select) => {
        const s = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(s) : s;
      },
    });
    await act(async () => {
      env.emitSnapshot(snap);
      env.runtime.store.set({ workingOpen: true });
    });

    const soloBefore = mounted.container.querySelector('.t3i-item[data-session-id="solo-run"]');
    assert.equal(soloBefore?.getAttribute('data-working'), 'true');
    assert.ok(soloBefore?.querySelector('.t3i-status-time'), 'timer ticks while live Client running=true');

    // Simulate api-session/status(id, false) arriving in Client before Host rebuilds snapshot.
    await act(async () => {
      env.sessions.set({
        phase: 'ready',
        byId: {
          'solo-run': { id: 'solo-run', running: false, retainedBy: { mainView: 1 } },
          'parent-run': { id: 'parent-run', running: false },
        },
      });
    });

    const soloAfter = mounted.container.querySelector('.t3i-item[data-session-id="solo-run"]');
    assert.equal(soloAfter?.getAttribute('data-shelf'), 'working', 'solo card holds shelf placement during grace');
    assert.equal(soloAfter?.getAttribute('data-working'), null, 'solo card clears Working immediately on live idle');
    assert.equal(soloAfter?.querySelector('.t3i-status-time'), null, 'solo timer stops immediately on live idle');

    const parentAfter = mounted.container.querySelector('.t3i-item[data-session-id="parent-run"]');
    assert.equal(parentAfter?.querySelector('.t3i-status')?.getAttribute('data-tone'), 'waiting', 'parent with active child switches to Waiting');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Contextual empty states and SearchResultRow active/settled styling + hover preview behave per T3', async () => {
  const env = await clientHarness(['a1', 's1'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let addProjectCalls = 0;
  let mounted;
  try {
    env.runtime.addProject = async () => { addProjectCalls += 1; };
    const emptySnap = structuredClone(env.host.currentSnapshot);
    emptySnap.cards = [];
    emptySnap.revision = (emptySnap.revision ?? 0) + 1;
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    // 1. Zero projects -> "No projects yet" + outline "+ Add project" CTA.
    await act(async () => {
      env.workspaces.set({ items: [], pinnedSessionIds: [], archivedSessionIds: [] });
      env.emitSnapshot(emptySnap);
    });
    assert.equal(mounted.container.querySelector('.t3i-empty-contextual p')?.textContent, 'No projects yet');
    const addBtn = mounted.container.querySelector('.t3i-empty-add');
    assert.ok(addBtn);
    await act(async () => { addBtn.click(); });
    assert.equal(addProjectCalls, 1);

    // 2. Projects exist -> unfiltered, single-project, and multi-project contextual empty copy.
    await act(async () => {
      env.workspaces.set({
        items: [
          { workspaceId: 'ws-alpha', title: 'Alpha', path: '/tmp/alpha' },
          { workspaceId: 'ws-beta', title: 'Beta', path: '/tmp/beta' },
        ],
        pinnedSessionIds: [],
        archivedSessionIds: [],
      });
    });
    assert.equal(mounted.container.querySelector('.t3i-empty-contextual p')?.textContent, 'No threads yet');
    await act(async () => { env.runtime.setWorkspaceFilter(['ws-alpha']); });
    assert.equal(mounted.container.querySelector('.t3i-empty-contextual p')?.textContent, 'No threads in Alpha yet');
    await act(async () => { env.runtime.setWorkspaceFilter(['ws-alpha', 'ws-beta']); });
    assert.equal(mounted.container.querySelector('.t3i-empty-contextual p')?.textContent, 'No threads in these projects yet');

    // 3. SearchResultRow aria-current="page", data-settled="true", and 150ms ThreadHoverPreview.
    await act(async () => { env.runtime.setWorkspaceFilter([]); });
    const searchSnap = structuredClone(env.host.currentSnapshot);
    searchSnap.cards = [
      { ...env.host.currentSnapshot.cards[0], sessionId: 'a1', title: 'Match Active', section: 'active', workspaceId: 'ws-alpha', workspaceTitle: 'Alpha' },
      { ...env.host.currentSnapshot.cards[1], sessionId: 's1', title: 'Match Settled', section: 'settled', settledAt: '2026-11-16T09:00:00.000Z', workspaceId: 'ws-alpha', workspaceTitle: 'Alpha' },
    ];
    searchSnap.revision = (searchSnap.revision ?? 0) + 2;
    await act(async () => {
      env.sessions.set({ byId: { s1: { id: 's1', retainedBy: { mainView: 1 } } } });
      env.emitSnapshot(searchSnap);
      env.runtime.changeView({ search: 'Match' });
    });
    const rows = [...mounted.container.querySelectorAll('.t3i-search-row')];
    assert.equal(rows.length, 2);
    const settledSearchRow = rows.find((r) => r.textContent.includes('Match Settled'));
    const activeSearchRow = rows.find((r) => r.textContent.includes('Match Active'));
    assert.equal(settledSearchRow.getAttribute('data-settled'), 'true');
    assert.equal(settledSearchRow.getAttribute('aria-current'), 'page');
    assert.equal(activeSearchRow.getAttribute('aria-current'), null);

    await act(async () => {
      settledSearchRow.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 180));
    });
    assert.ok(document.querySelector('.t3i-preview'), 'SearchResultRow hover opens ThreadHoverPreview at 150ms');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Audit P0+P1 fixes: top-of-Pinned placement, Pin promotion, Settled Mark unread + disabled zero-result, installSidebarTree, Search clear + scroll, Batch Un-settle/Wake + undo safety + prepare toast, and drag horizontal bounds', async () => {
  const storageMap = new Map();
  const storage = {
    getItem(k) { return storageMap.has(k) ? storageMap.get(k) : null; },
    setItem(k, v) { storageMap.set(k, String(v)); },
    removeItem(k) { storageMap.delete(k); },
  };
  const env = await clientHarness(['p1', 'a1', 's1', 'z1', 'zero'], { render: true, nativeMenus: true, openContextMenus: false, storage });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const proto = window.HTMLElement.prototype;
  const origGetRect = proto.getBoundingClientRect;
  let mounted;
  try {
    // Wire remote.pin to real host.pin so Pin promotion commits on Host table + workspaces.
    env.host.ctx.workspaceRegistry = {
      list: () => [],
      pinSession: async (id) => {
        const cur = env.workspaces.getSnapshot();
        env.workspaces.set({ ...cur, pinnedSessionIds: [...new Set([...cur.pinnedSessionIds, id])] });
      },
      unpinSession: async (id) => {
        const cur = env.workspaces.getSnapshot();
        env.workspaces.set({ ...cur, pinnedSessionIds: cur.pinnedSessionIds.filter((item) => item !== id) });
      },
    };
    let pinRev = 1000;
    env.remote.pin = async (req, signal) => {
      const value = await env.host.pin(req, signal);
      pinRev += 1;
      env.emitSnapshot({ ...env.host.currentSnapshot, revision: pinRev });
      return { ok: true, value };
    };

    // Setup zero-result progress on 'zero'.
    const origReadMember = env.host.readMember;
    env.host.readMember = async (id, label, sig) => {
      if (id === 'zero') {
        return { sessionId: 'zero', label: 'Zero', progress: initialProgress(0, 'zero'), runtime: { running: false, queue: [], completeness: 'complete' }, pendingInput: [] };
      }
      return origReadMember(id, label, sig);
    };
    await env.host.refresh();
    await act(async () => {
      await settle(env.runtime, 's1');
      await env.runtime.act(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'z1'), 'snooze', { until: new Date(Date.now() + 3_600_000).toISOString() });
      await env.host.pin({ sessionId: 'p1', pinned: true });
      await env.host.refresh();
      pinRev += 1;
      env.emitSnapshot({ ...env.host.currentSnapshot, revision: pinRev });
    });

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const item = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);

    // 1. Mark unread on Settled card keeps it in Settled with data-unread="true"; zero-result card disables Mark unread.
    await act(async () => { env.runtime.markVisited('s1'); });
    await act(async () => { await env.runtime.markUnread(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')); });
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')?.section, 'settled');
    const unreadMenu = env.menuRegistrations.find((m) => m.id === 't3inbox.unread').resolve;
    assert.equal(unreadMenu({ sessionId: 'zero' })[0].disabled, true);
    assert.equal(unreadMenu({ sessionId: 's1' })[0].disabled, false);

    // 2. Pinning a Settled card ('s1') promotes it out of Settled, renders full card in Pinned, and prepends to pinned-order (#1).
    await act(async () => {
      await env.runtime.pin(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1'), true);
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['s1', 'p1']);
    assert.equal(item('s1').getAttribute('data-variant'), 'card');
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')?.section, 'active');
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="pinned"]')].map((el) => el.getAttribute('data-session-id')),
      ['s1', 'p1'],
    );
    await act(async () => {
      await env.runtime.pin(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1'), false);
      await settle(env.runtime, 's1');
      if (env.runtime.store.getSnapshot().undo) env.runtime.dismissUndo(env.runtime.store.getSnapshot().undo.id);
    });

    // 3. Re-mark 's1' unread after re-settling to verifySettled expanded row shows data-unread="true".
    await act(async () => { await env.runtime.markUnread(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')); });

    // 4. installSidebarTree: ArrowDown / Home / End / ArrowRight (expand Settled -> focus child) / ArrowLeft (return to header -> collapse) / Shift+F10 contextmenu.
    const rowP1 = item('p1').querySelector('.t3i-row');
    rowP1.focus();
    await act(async () => {
      rowP1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    });
    const settledHeader = mounted.container.querySelector('[data-section-header="settled"] .t3i-section-title');
    assert.equal(document.activeElement === settledHeader, true, 'End moves to Settled header');
    assert.equal(settledHeader.getAttribute('aria-expanded'), 'false');
    await act(async () => {
      settledHeader.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });
    assert.equal(settledHeader.getAttribute('aria-expanded'), 'true', 'ArrowRight expands Settled shelf');
    assert.equal(item('s1').getAttribute('data-unread'), 'true');
    await act(async () => {
      settledHeader.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });
    const rowS1 = item('s1').querySelector('.t3i-row');
    assert.equal(document.activeElement === rowS1, true, 'Second ArrowRight focuses first Settled child');

    let contextFired = 0;
    rowS1.addEventListener('contextmenu', () => { contextFired += 1; }, { once: true });
    await act(async () => {
      rowS1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true }));
      rowS1.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true }));
    });
    assert.equal(contextFired, 1, 'Shift+F10 opens contextmenu on keyup');

    await act(async () => {
      rowS1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    });
    assert.equal(document.activeElement === settledHeader, true, 'ArrowLeft on child returns to Settled header');
    await act(async () => {
      settledHeader.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    });
    assert.equal(settledHeader.getAttribute('aria-expanded'), 'false', 'ArrowLeft on expanded header collapses Settled');

    // 5. Search UX: Enter & click clear search query; ArrowDown calls scrollIntoView.
    let scrolledCalls = 0;
    const searchInput = mounted.container.querySelector('.t3i-search');
    await act(async () => { env.runtime.changeView({ search: 'a1' }); });
    const searchRow = mounted.container.querySelector('.t3i-search-row');
    assert.ok(searchRow);
    searchRow.scrollIntoView = () => { scrolledCalls += 1; };
    await act(async () => {
      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    });
    assert.equal(scrolledCalls >= 1, true, 'ArrowDown scrolls active SearchResultRow into view');
    await act(async () => {
      searchInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    assert.equal(env.runtime.store.getSnapshot().search, '', 'Enter clears search query');
    assert.equal(env.openSessionCalls.at(-1), 'a1');

    // 6. Batch menu exposes Un-settle (1) and Wake (1), and prepare failure inside runtime.act surfaces errorToast.
    const batchResolve = env.menuRegistrations.find((m) => m.id === 't3inbox.batch').resolve;
    const settledBatch = batchResolve({ sessionIds: ['s1'] });
    assert.deepEqual(settledBatch.map((i) => i.id), ['unsettle-batch', 'snooze-batch', 'mark-unread-batch']);
    const snoozedBatch = batchResolve({ sessionIds: ['z1'] });
    assert.equal(snoozedBatch.some((i) => i.id === 'wake-batch' && i.label === '唤醒（1）'), true);

    env.runtime.prepare = async () => false;
    await act(async () => {
      const res = await env.runtime.act({ sessionId: 'cold-missing', completeness: 'unavailable', context: null, treeError: null }, 'settle');
      assert.equal(res.committed, false);
    });
    assert.ok(env.runtime.store.getSnapshot().errorToast, 'prepare failure surfaces errorToast');
    env.runtime.dismissError();

    // 7. undo() uses direct return value of act() and never re-pins a failed item 2 using stale lastAction from item 1.
    let repinnedIds = [];
    const origPin = env.runtime.pin;
    env.runtime.pin = async (cardArg, pinned, opts) => {
      repinnedIds.push([cardArg.sessionId, pinned]);
      return origPin(cardArg, pinned, opts);
    };
    const origAct = env.runtime.act;
    env.runtime.act = async (cardArg, kind, extra) => {
      if (kind === 'undo' && extra?.targetOperationId === 'op-fail') return { committed: false };
      if (kind === 'undo' && extra?.targetOperationId === 'op-ok') return { committed: true };
      return origAct(cardArg, kind, extra);
    };
    await act(async () => {
      await env.runtime.undo({
        id: 'u-batch',
        items: [
          { id: 'u1', operationId: 'op-fail', sessionId: 'a1', kind: 'settle', wasPinned: true, expiresAt: Date.now() + 5000 },
          { id: 'u2', operationId: 'op-ok', sessionId: 'p1', kind: 'settle', wasPinned: true, expiresAt: Date.now() + 5000 },
        ],
      });
    });
    assert.deepEqual(repinnedIds, [['p1', true]], 'only committed undo re-pins; failed op-fail must not reuse op-ok committed status');

    // 8. Horizontal drag out-of-bounds suppresses drop and cancels without pinning.
    const scroll = mounted.container.querySelector('.t3i-scroll');
    proto.getBoundingClientRect = function () {
      if (this === scroll) return { top: 0, bottom: 500, left: 0, right: 260, width: 260, height: 500 };
      const dragId = this.getAttribute?.('data-drag-item-id');
      if (dragId === 'a1') return { top: 80, bottom: 144, left: 0, right: 260, width: 260, height: 64 };
      if (dragId === 'p1') return { top: 0, bottom: 64, left: 0, right: 260, width: 260, height: 64 };
      if (dragId === 'sidebar-marker-pinned-divider') return { top: 64, bottom: 64, left: 0, right: 260, width: 260, height: 0 };
      return origGetRect.call(this);
    };
    const pinsBefore = repinnedIds.length;
    await act(async () => {
      item('a1').dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 100, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 340, clientY: 10, bubbles: true }));
    });
    assert.equal(item('a1').querySelector('.t3i-inline-drop-verb')?.textContent ?? null, null, 'out-of-bounds clientX suppresses drop verb');
    await act(async () => {
      window.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 340, clientY: 10, bubbles: true }));
    });
    assert.equal(repinnedIds.length, pinsBefore, 'releasing outside horizontal sidebar bounds cancels drop without pinning');

    // 9. External workspace pin (e.g. DSH native context-menu "Pin session") prepends to #1, promotes Settled -> Active on unpin, and syncs pinned-order.
    let remotePinCalls = 0;
    const prevRemotePin = env.remote.pin;
    env.remote.pin = async (req, signal) => {
      remotePinCalls += 1;
      return prevRemotePin(req, signal);
    };
    await act(async () => {
      const cur = env.workspaces.getSnapshot();
      env.workspaces.set({ ...cur, pinnedSessionIds: [...cur.pinnedSessionIds, 's1'] });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(remotePinCalls, 1, 'external pin of Settled card triggers host pin promotion');
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['s1', 'p1']);
    assert.deepEqual(
      [...mounted.container.querySelectorAll('.t3i-item[data-shelf="pinned"]')].map((el) => el.getAttribute('data-session-id')),
      ['s1', 'p1'],
    );
    assert.equal(item('s1').getAttribute('data-variant'), 'card');
    assert.equal(env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 's1')?.section, 'active');

    await act(async () => {
      const cur = env.workspaces.getSnapshot();
      env.workspaces.set({ ...cur, pinnedSessionIds: cur.pinnedSessionIds.filter((id) => id !== 's1') });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(JSON.parse(storage.getItem('dsh-t3-inbox:pinned-order')), ['p1']);
    assert.ok(mounted.container.querySelector('.t3i-item[data-shelf="active"][data-session-id="s1"]'), 'unpinning previously Settled external pin stays in Active');
    assert.equal(Boolean(mounted.container.querySelector('.t3i-item[data-shelf="settled"][data-session-id="s1"]')), false);
  } finally {
    proto.getBoundingClientRect = origGetRect;
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('P2 parity: accent and hit CSS, comma aria-label, project filter badge+keyboard, search combobox, modal Tab trap, calendar nav, Settings i18n/whenLabel, and FootUndo fade-out', async () => {
  const env = await clientHarness(['a1', 'a2', 's1'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    const now = Date.now();
    env.workspaces.set({
      items: [
        { workspaceId: 'ws-alpha', title: 'Alpha', path: '/tmp/alpha' },
        { workspaceId: 'ws-beta', title: 'Beta', path: '/tmp/beta' },
      ],
      pinnedSessionIds: [],
      archivedSessionIds: [],
    });
    const snap = structuredClone(env.host.currentSnapshot);
    snap.cards = snap.cards.map((c) => {
      if (c.sessionId === 'a1') return { ...c, title: 'Alpha Quiet Thread', workspaceId: 'ws-alpha', workspaceTitle: 'Alpha', newResult: false };
      if (c.sessionId === 'a2') return { ...c, title: 'Beta Done Thread', workspaceId: 'ws-beta', workspaceTitle: 'Beta', newResult: true, result: { time: now - 1000, reason: { kind: 'completed' } } };
      return { ...c, title: 'Settled Item', section: 'settled', workspaceId: 'ws-alpha', workspaceTitle: 'Alpha', settledAt: now - 5000 };
    });
    snap.revision += 1;
    env.emitSnapshot(snap);

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const cur = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(cur) : cur;
      },
      useSessions: (select) => {
        const cur = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(cur) : cur;
      },
    });

    // 1. Stylesheet rules for accent, Snooze action, search highlights, and scroll fade.
    const styleText = [...document.head.querySelectorAll('style[data-t3-inbox]')].map((s) => s.textContent).join('\n');
    assert.match(styleText, /--t3i-accent:#1b4ed8/);
    assert.match(styleText, /--t3i-accent:#346bf1/);
    assert.match(styleText, /\.t3i-snooze-action\s*\{[^}]*height:20px/);
    assert.match(styleText, /\.t3i-hit\s*\{\s*background:#ffde8b/);
    assert.match(styleText, /\.t3i-scroll:has\(:focus-visible\)/);

    // 2. Dynamic scrollFade sets --t3i-fade-top/--t3i-fade-bottom on scrollable container.
    const scrollEl = mounted.container.querySelector('.t3i-scroll');
    Object.defineProperty(scrollEl, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(scrollEl, 'scrollHeight', { configurable: true, value: 400 });
    Object.defineProperty(scrollEl, 'scrollTop', { configurable: true, writable: true, value: 0 });
    await act(async () => { scrollEl.dispatchEvent(new window.Event('scroll', { bubbles: true })); });
    assert.equal(scrollEl.style.getPropertyValue('--t3i-fade-top'), '0px');
    assert.equal(scrollEl.style.getPropertyValue('--t3i-fade-bottom'), '12px');
    scrollEl.scrollTop = 100;
    await act(async () => { scrollEl.dispatchEvent(new window.Event('scroll', { bubbles: true })); });
    assert.equal(scrollEl.style.getPropertyValue('--t3i-fade-top'), '12px');
    assert.equal(scrollEl.style.getPropertyValue('--t3i-fade-bottom'), '12px');

    // 3. T3 row aria-label: [title, status, workspace].join(', ') without relative time.
    assert.equal(mounted.container.querySelector('[data-sidebar-row="thread:a1"]')?.getAttribute('aria-label'), 'Alpha Quiet Thread, Alpha');
    assert.equal(mounted.container.querySelector('[data-sidebar-row="thread:a2"]')?.getAttribute('aria-label'), 'Beta Done Thread, Done, Beta');

    // 4. Project filter popover: Folder icon on All, badge instead of check, query hides All + autoHighlight, Shift+Enter multi-selects, Enter selects & closes.
    const filterBtn = mounted.container.querySelector('.t3i-project-filter');
    await act(async () => { filterBtn.click(); });
    const popover = mounted.container.querySelector('.t3i-filter-popover');
    assert.ok(popover.querySelector('.t3i-project-option .t3i-project-badge'), 'Active scope option renders badge inside icon wrapper');
    assert.equal(Boolean(popover.querySelector('.t3i-project-check')), false, 'Old trailing check icon is replaced by corner badge');
    const allOpt = popover.querySelectorAll('.t3i-project-option')[0];
    assert.equal(allOpt.textContent.trim(), 'All projects');
    assert.ok(allOpt.querySelector('.t3i-project-icon-wrap svg'));

    const projectInput = popover.querySelector('.t3i-project-query-input');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(projectInput, 'Beta');
      projectInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    const filteredOpts = [...popover.querySelectorAll('.t3i-project-option')];
    assert.equal(filteredOpts.length, 1, 'Non-empty project search hides All workspaces');
    assert.equal(filteredOpts[0].getAttribute('data-highlighted'), 'true', 'First match is autoHighlighted');
    assert.ok(filteredOpts[0].textContent.includes('Beta'));

    // Shift+Enter toggles multi-select without closing popover.
    await act(async () => {
      projectInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true }));
    });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, ['ws-beta']);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-filter-popover')), true);

    // Clear project filter & select Alpha with Enter.
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(projectInput, 'Alpha');
      projectInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await act(async () => {
      projectInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    assert.deepEqual(env.runtime.store.getSnapshot().workspaceIds, ['ws-alpha']);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-filter-popover')), false);
    await act(async () => { env.runtime.setWorkspaceFilter([]); });

    // 5. Search combobox ARIA + active descendant.
    const searchInput = mounted.container.querySelector('.t3i-search');
    assert.equal(searchInput.getAttribute('role'), 'combobox');
    assert.equal(searchInput.getAttribute('aria-autocomplete'), 'list');
    assert.equal(searchInput.getAttribute('aria-controls'), 't3i-search-results');
    assert.equal(searchInput.getAttribute('aria-expanded'), 'false');
    await act(async () => { env.runtime.changeView({ search: 'Thread' }); });
    assert.equal(searchInput.getAttribute('aria-expanded'), 'true');
    assert.equal(searchInput.getAttribute('aria-activedescendant'), 't3i-search-hit-0');
    assert.equal(mounted.container.querySelector('#t3i-search-results #t3i-search-hit-0 .t3i-hit')?.textContent, 'Thread');
    await act(async () => { env.runtime.changeView({ search: '' }); });

    // 6. CustomSnoozeModal cyclic Tab/Shift+Tab focus trap & MonthCalendar grid keyboard nav.
    await act(async () => { env.runtime.openCustomSnooze('a1', document.body); });
    const modal = document.querySelector('.t3i-modal');
    assert.ok(modal);
    const focusables = () => [...modal.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.getAttribute('tabindex') !== '-1' && !el.closest('[inert],[aria-hidden="true"]'));
    const list0 = focusables();
    list0[list0.length - 1].focus();
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    });
    assert.equal(document.activeElement === list0[0], true, 'Tab on last modal control wraps to first');
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    });
    assert.equal(document.activeElement === list0[list0.length - 1], true, 'Shift+Tab on first control wraps to last');

    const dateBtn = modal.querySelector('.t3i-date-trigger');
    await act(async () => { dateBtn.click(); });
    const grid = modal.querySelector('.t3i-cal-grid[role="grid"]');
    assert.ok(grid);
    const initialCell = grid.querySelector('.t3i-cal-day[tabindex="0"]');
    assert.ok(initialCell);
    const initialAria = initialCell.getAttribute('aria-label');
    initialCell.focus();
    await act(async () => {
      initialCell.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });
    const nextCell = grid.querySelector('.t3i-cal-day[tabindex="0"]');
    assert.notEqual(nextCell?.getAttribute('aria-label'), initialAria);
    await act(async () => { env.runtime.closeCustomSnooze(); });

    // 7. SnoozeSettingsSection zh localization (with t prop) + whenLabel disambiguation on collision.
    const { createRoot } = await import('react-dom/client');
    const snoozeSection = env.registrations.find((entry) => entry.options?.id === 't3-inbox-threads')?.component;
    assert.ok(snoozeSection);
    const zhContainer = document.createElement('div');
    document.body.append(zhContainer);
    const zhRoot = createRoot(zhContainer);
    const zhT = (key, params) => {
      let text = String(env.dictionaries.zh?.[key] ?? env.dictionaries.en?.[key] ?? key);
      if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
      return text;
    };
    const collisionSnap = structuredClone(env.host.currentSnapshot);
    collisionSnap.snoozeSettings = {
      revision: 3,
      presets: [
        { kind: 'at', day: 'monday', time: '09:00' },
        { kind: 'at', day: 'monday', time: '14:00' },
      ],
    };
    collisionSnap.revision += 1;
    await act(async () => { env.emitSnapshot(collisionSnap); });
    await act(async () => { zhRoot.render(React.createElement(snoozeSection, { inbox: env.runtime, t: zhT })); });
    assert.deepEqual([...zhContainer.querySelectorAll('.t3i-settings-pref-title')].map((label) => label.textContent),[
      '侧栏视图','背景','全局面板','运行中分组','暂缓快捷选项','时间格式',
    ]);
    assert.deepEqual([...zhContainer.querySelectorAll('.t3i-settings-view-option')].map((button) => button.textContent),[
      '收件箱视图','工作区视图',
    ]);
    await act(async () => {
      [...zhContainer.querySelectorAll('button')].find((button) => button.textContent === '编辑快捷选项').click();
    });
    assert.ok(zhContainer.textContent.includes('+ 添加选项'));
    assert.deepEqual([...zhContainer.querySelectorAll('.t3i-settings-option .t3i-settings-pref-title')].map((label) => label.textContent).sort(),[
      '周一 09:00','周一 14:00',
    ]);
    await act(async () => { zhRoot.unmount(); });
    zhContainer.remove();

    // 8. FootUndo plays 200ms fade-out (data-live="false", aria-hidden="true") before unmounting.
    const a1 = env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'a1');
    await act(async () => { await env.runtime.act(a1, 'settle'); });
    assert.ok(mounted.container.querySelector('.t3i-foot-undo'));
    await act(async () => {
      env.runtime.dismissUndo(env.runtime.store.getSnapshot().undo.id);
    });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo')?.getAttribute('data-live'), 'false');
    assert.equal(mounted.container.querySelector('.t3i-foot-undo')?.getAttribute('aria-hidden'), 'true');
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 260)); });
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-undo')), false);
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('P3-A parity: worktree icon, Waiting status, F2/dblclick rename, full-text search, + multi-workspace menu, Behavior/Display settings, and Batch Archive', async () => {
  const renameCalls = [];
  const searchCalls = [];
  const archiveCalls = [];
  let failRename = false;
  let searchResultItems = [];
  const env = await clientHarness(['a1', 'a2', 'w1'], {
    render: true,
    renameSession: async (sessionId, title) => {
      renameCalls.push({ sessionId, title });
      if (failRename) return { ok: false, error: new Error('Rename denied') };
      return { ok: true, value: { title, seq: 1 } };
    },
    searchSessions: async (query, signal) => {
      searchCalls.push({ query, aborted: signal?.aborted });
      return { ok: true, value: { items: searchResultItems, hasMore: false } };
    },
    archiveSession: async (sessionId, opts) => {
      archiveCalls.push({ sessionId, opts });
      return { ok: true };
    },
  });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  let settingsRoot;
  let settingsHost;
  try {
    const now = Date.now();
    env.workspaces.set({
      items: [
        { workspaceId: 'ws-1', title: 'Repo One', path: '/tmp/repo1' },
        { workspaceId: 'ws-2', title: 'Repo Two', path: '/tmp/repo2' },
      ],
      pinnedSessionIds: [],
      archivedSessionIds: [],
    });
    const snap = structuredClone(env.host.currentSnapshot);
    snap.snoozeSettings = { revision: 1, presets: [{ kind: 'after', minutes: 60 }] };
    snap.cards = snap.cards.map((c) => {
      if (c.sessionId === 'a1') return { ...c, title: 'Main Branch Session', workspaceId: 'ws-1', workspaceTitle: 'Repo One', branch: 'feat/wt', worktree: true };
      if (c.sessionId === 'a2') return { ...c, title: 'Normal Session', workspaceId: 'ws-2', workspaceTitle: 'Repo Two', branch: 'main', worktree: false };
      return {
        ...c,
        title: 'Parent Delegator',
        workspaceId: 'ws-1',
        workspaceTitle: 'Repo One',
        section: 'working',
        running: true,
        waiting: true,
        members: [{ id: 'w1', progress: { turn: { end: { time: now - 4000 } } } }],
      };
    });
    snap.revision += 1;
    env.emitSnapshot(snap);

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const cur = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(cur) : cur;
      },
      useSessions: (select) => {
        const cur = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(cur) : cur;
      },
    });

    // 1. Git Worktree branch badge title & Waiting subagent status slot.
    const wtBranch = mounted.container.querySelector('[data-session-id="a1"] .t3i-card-meta-branch');
    assert.equal(wtBranch?.getAttribute('title'), 'Worktree: feat/wt');
    assert.equal(wtBranch?.querySelectorAll('circle').length, 2, 'Worktree uses folderGit2 circles');
    const normBranch = mounted.container.querySelector('[data-session-id="a2"] .t3i-card-meta-branch');
    assert.equal(normBranch?.getAttribute('title'), null);

    await act(async () => { env.runtime.toggleShelf('working'); });
    const waitingStatus = mounted.container.querySelector('[data-session-id="w1"] .t3i-status');
    assert.equal(waitingStatus?.getAttribute('data-tone'), 'waiting');
    assert.ok(waitingStatus?.textContent.includes('Waiting'));

    // 2. Inline rename via F2, Escape cancel, Enter submit + error toast on failure.
    const row1 = mounted.container.querySelector('[data-sidebar-row="thread:a1"]');
    row1.focus();
    await act(async () => {
      row1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true }));
    });
    let renameInput = mounted.container.querySelector('[data-session-id="a1"] .t3i-rename-input');
    assert.ok(renameInput, 'F2 opens inline rename input');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(renameInput, 'Renamed First');
      renameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await act(async () => {
      renameInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(renameCalls, [{ sessionId: 'a1', title: 'Renamed First' }]);
    assert.equal(Boolean(mounted.container.querySelector('.t3i-rename-input')), false);

    // Double-click also starts rename and Escape cancels without calling rename.
    await act(async () => {
      row1.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    });
    renameInput = mounted.container.querySelector('[data-session-id="a1"] .t3i-rename-input');
    assert.ok(renameInput, 'dblclick opens inline rename input');
    await act(async () => {
      renameInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    assert.equal(renameCalls.length, 1);

    failRename = true;
    await act(async () => {
      row1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true }));
    });
    renameInput = mounted.container.querySelector('[data-session-id="a1"] .t3i-rename-input');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(renameInput, 'Will Fail');
      renameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
      renameInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(document.querySelector('.t3i-toast-title')?.textContent, '重命名会话失败');
    failRename = false;
    await act(async () => { env.runtime.dismissError(); });

    // 3. Debounced ctx.sessions.search full-text result with .t3i-search-excerpt.
    searchResultItems = [{ sessionId: 'a2', snippet: 'contains needle inside body' }];
    await act(async () => { env.runtime.changeView({ search: 'needle' }); });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 190)); });
    assert.equal(searchCalls.some((c) => c.query === 'needle'), true);
    const excerpt = mounted.container.querySelector('[data-session-id="a2"].t3i-search-row .t3i-search-excerpt');
    assert.ok(excerpt, 'Full-text hit renders .t3i-search-excerpt');
    assert.equal(excerpt.querySelector('.t3i-hit')?.textContent, 'needle');
    await act(async () => { env.runtime.changeView({ search: '' }); });

    // 4. Multi-workspace '+' button opens "New thread in…" menu; Shift+Click skips menu.
    const newBtn = mounted.container.querySelector('button[aria-label="New thread"]');
    await act(async () => { newBtn.click(); });
    const newMenu = mounted.container.querySelector('.t3i-new-menu');
    assert.ok(newMenu);
    assert.equal(newMenu.querySelector('.t3i-new-menu-label')?.textContent, 'New thread in…');
    const menuChoices = [...newMenu.querySelectorAll('.t3i-project-option')];
    assert.equal(menuChoices.length, 2);
    await act(async () => { menuChoices[1].click(); });
    assert.equal(env.startSessionCalls.at(-1), 'ws-2');
    assert.equal(Boolean(mounted.container.querySelector('.t3i-new-menu')), false);
    await act(async () => {
      newBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
    });
    assert.equal(env.startSessionCalls.at(-1), 'ws-1', 'Shift+Click bypasses picker and starts directly');

    // 5. Settings Behavior ("Working section" off -> folds w1 into Active) & Display ("Time format").
    const { createRoot } = await import('react-dom/client');
    const snoozeSection = env.registrations.find((entry) => entry.options?.id === 't3-inbox-threads')?.component;
    settingsHost = document.createElement('div');
    document.body.append(settingsHost);
    settingsRoot = createRoot(settingsHost);
    await act(async () => { settingsRoot.render(React.createElement(snoozeSection, { inbox: env.runtime })); });
    const workingToggle = [...settingsHost.querySelectorAll('label')].find((label) => label.textContent.startsWith('Working section')).control;
    assert.equal(workingToggle?.checked, true);
    await act(async () => { workingToggle.click(); });
    assert.equal(env.runtime.store.getSnapshot().workingShelfEnabled, false);
    assert.equal(Boolean(mounted.container.querySelector('[data-section-header="working"]')), false, 'Working section removed when disabled');
    assert.ok(mounted.container.querySelector('.t3i-item[data-shelf="active"][data-session-id="w1"]'), 'Waiting thread folds into Active');
    const timeSelect = settingsHost.querySelector('select[value="locale"], select');
    const fmtSelect = [...settingsHost.querySelectorAll('select')].find((el) => [...el.options].some((o) => o.value === '24-hour'));
    assert.ok(fmtSelect);
    await act(async () => {
      fmtSelect.value = '24-hour';
      fmtSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
    assert.equal(env.runtime.store.getSnapshot().timeFormat, '24-hour');
    const snoozeTrigger = mounted.container.querySelector('[data-session-id="a1"] .t3i-snooze-action');
    await act(async () => { snoozeTrigger.click(); });
    const whenText = document.querySelector('.t3i-snooze-menu .t3i-preset-when')?.textContent ?? '';
    assert.doesNotMatch(whenText, /\b(AM|PM)\b/);
    await act(async () => { settingsRoot.unmount(); });
    settingsHost.remove();
    settingsRoot = null;
    settingsHost = null;
    env.runtime.setWorkingShelfEnabled(true);
    env.runtime.setTimeFormat('locale');

    // 6. Batch Archive menu item present when archiveSession capability exists.
    await act(async () => { env.runtime.toggleSelect('a1'); env.runtime.toggleSelect('a2'); });
    const rowA1 = mounted.container.querySelector('[data-session-id="a1"] .t3i-row');
    await act(async () => {
      rowA1.dispatchEvent(new window.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 40 }));
    });
    const archiveItem = [...document.querySelectorAll('.t3i-context-menu[data-batch="true"] [role="menuitem"]')].find((el) => el.textContent.includes('Archive (2)'));
    assert.ok(archiveItem);
    await act(async () => {
      archiveItem.click();
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.deepEqual(archiveCalls, [
      { sessionId: 'a1', opts: { stopActivity: true } },
      { sessionId: 'a2', opts: { stopActivity: true } },
    ]);
  } finally {
    if (settingsRoot) await act(async () => { settingsRoot.unmount(); });
    settingsHost?.remove();
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('flat sidebar list motion runs FLIP, variant fade/ghost cleanup, drag release handoff, shelf-toggle skip, Working dim on .t3i-row, and prefers-reduced-motion', async () => {
  const env = await clientHarness(['a1', 'a2', 'w1'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const proto = window.HTMLElement.prototype;
  const origAnimate = proto.animate;
  const origOffsetTop = Object.getOwnPropertyDescriptor(proto, 'offsetTop');
  const origOffsetHeight = Object.getOwnPropertyDescriptor(proto, 'offsetHeight');
  const origOffsetWidth = Object.getOwnPropertyDescriptor(proto, 'offsetWidth');
  const origGetRect = proto.getBoundingClientRect;
  const origMatchMedia = window.matchMedia;
  const prevGetComputedStyle = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  const origElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => null;
  let reducedMatches = false;
  const animateCalls = [];
  let visualOffsetBySession = new Map();
  let mounted;
  try {
    const listIndexTop = (el) => {
      const list = el.parentElement;
      if (!list || !list.classList?.contains('t3i-list')) return 0;
      const children = [...list.children].filter((child) => !child.hasAttribute('data-t3i-motion-ghost'));
      let y = 0;
      for (const child of children) {
        const h = child.classList.contains('t3i-drag-boundary') || child.classList.contains('t3i-drop-placeholder')
          ? 0
          : child.classList.contains('t3i-section-header') || child.classList.contains('t3i-list-more')
            ? 32
            : child.getAttribute('data-variant') === 'compact' ? 36 : 64;
        if (child === el) return y;
        y += h > 0 ? h + 1 : 0;
      }
      return 0;
    };
    const itemHeight = (el) => {
      if (el.classList?.contains('t3i-drag-boundary') || el.classList?.contains('t3i-drop-placeholder')) return 0;
      if (el.classList?.contains('t3i-section-header') || el.classList?.contains('t3i-list-more')) return 32;
      if (el.classList?.contains('t3i-item')) return el.getAttribute('data-variant') === 'compact' ? 36 : 64;
      return 0;
    };
    Object.defineProperty(proto, 'offsetTop', { configurable: true, get() { return listIndexTop(this); } });
    Object.defineProperty(proto, 'offsetHeight', { configurable: true, get() { return itemHeight(this); } });
    Object.defineProperty(proto, 'offsetWidth', { configurable: true, get() { return 260; } });
    proto.getBoundingClientRect = function getBoundingClientRect() {
      if (this.classList?.contains('t3i-list') || this.classList?.contains('t3i-scroll')) {
        return { top: 40, bottom: 640, left: 0, right: 260, width: 260, height: 600 };
      }
      const sid = this.getAttribute?.('data-session-id');
      const top = 40 + listIndexTop(this) + (sid ? (visualOffsetBySession.get(sid) ?? 0) : 0);
      const h = itemHeight(this);
      return { top, bottom: top + h, left: 0, right: 260, width: 260, height: h };
    };
    proto.animate = function animate(keyframes, timing) {
      const listeners = new Map();
      const record = {
        target: this,
        sessionId: this.getAttribute('data-session-id'),
        isGhost: this.getAttribute('data-t3i-motion-ghost') === 'true',
        keyframes,
        timing,
        playState: 'running',
        cancelled: false,
        effect: { getComputedTiming: () => ({ progress: 0.25 }) },
        addEventListener(type, fn) { listeners.set(type, fn); },
        finish() {
          record.playState = 'finished';
          listeners.get('finish')?.();
        },
        cancel() { record.cancelled = true; record.playState = 'idle'; },
      };
      animateCalls.push(record);
      return record;
    };
    window.matchMedia = (query) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMatches : false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    });

    const now = Date.now();
    const snap = structuredClone(env.host.currentSnapshot);
    snap.cards = snap.cards.map((c) => {
      if (c.sessionId === 'a1') return { ...c, title: 'Alpha', createdAt: now - 3000, updatedAt: now - 3000 };
      if (c.sessionId === 'a2') return { ...c, title: 'Beta', createdAt: now - 6000, updatedAt: now - 6000 };
      return { ...c, title: 'Worker', section: 'working', running: true, createdAt: now - 1000, updatedAt: now - 1000 };
    });
    snap.revision += 1;
    env.emitSnapshot(snap);

    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const cur = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(cur) : cur;
      },
      useSessions: (select) => {
        const cur = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(cur) : cur;
      },
    });

    // 1. Flat <ul class="t3i-list" role="presentation"> with direct <li> children and bottom-anchor shelf header.
    const list = mounted.container.querySelector('ul.t3i-list[role="presentation"]');
    assert.ok(list, 'renders flat <ul> list');
    assert.equal(list.querySelector('[data-section-header="working"]')?.getAttribute('data-bottom-anchor'), 'true');
    assert.equal(animateCalls.length, 0, 'initial mount does not animate');

    // 2. Working dim CSS targets .t3i-row (not <li>) and reduced-motion covers motion rules.
    const cssText = document.querySelector('style[data-t3-inbox]')?.textContent ?? '';
    assert.match(cssText, /\.t3i-item\[data-recede="true"\]\[data-working="true"\] \.t3i-row \{ opacity:\.7;/);
    assert.match(cssText, /@keyframes t3i-pop-in/);
    assert.match(cssText, /@keyframes t3i-dialog-in/);
    assert.match(cssText, /@keyframes t3i-toast-in/);
    assert.match(cssText, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.t3i-item\[data-recede="true"\]\[data-working="true"\] \.t3i-row/);

    // 3. Expanding a shelf skips FLIP/fade animation so rows do not glide over headers.
    await act(async () => {
      mounted.container.querySelector('[data-section-header="working"] .t3i-section-title').click();
    });
    assert.equal(animateCalls.length, 0, 'shelf expand skips list animation');
    const workingItem = mounted.container.querySelector('.t3i-item[data-session-id="w1"]');
    assert.equal(workingItem?.getAttribute('data-working'), 'true');
    assert.equal(workingItem?.getAttribute('data-recede'), 'true');

    // 4. Pinning a2 moves it above a1 and runs 150ms ease-out FLIP on both rows.
    await act(async () => {
      const cur = env.workspaces.getSnapshot();
      env.workspaces.set({ ...cur, pinnedSessionIds: ['a2'] });
      await new Promise((resolve) => setImmediate(resolve));
    });
    const moveAnims = animateCalls.filter((c) => !c.isGhost && c.keyframes[0]?.transform?.startsWith('translateY(') && !('opacity' in c.keyframes[0]));
    assert.ok(moveAnims.some((c) => c.sessionId === 'a2'), 'moved row a2 animates FLIP');
    assert.ok(moveAnims.some((c) => c.sessionId === 'a1'), 'displaced row a1 animates FLIP');
    assert.deepEqual(moveAnims[0].timing, { duration: 150, easing: 'ease-out' });
    for (const anim of animateCalls) anim.finish();
    animateCalls.length = 0;

    // 5. Settling a1 while Settled is open remounts card->compact, spawns a sanitized ghost fadeOut, and fades in the compact row.
    await act(async () => { env.runtime.toggleShelf('settled'); });
    animateCalls.length = 0;
    const oldA1Node = mounted.container.querySelector('.t3i-item[data-session-id="a1"]');
    await act(async () => { await settle(env.runtime, 'a1'); });
    const newA1Node = mounted.container.querySelector('.t3i-item[data-session-id="a1"]');
    assert.notEqual(newA1Node, oldA1Node, 'card->compact switch remounts <li>');
    assert.equal(newA1Node?.getAttribute('data-variant'), 'compact');
    const ghostAnim = animateCalls.find((c) => c.isGhost);
    assert.ok(ghostAnim, 'exiting card spawns fadeOut ghost');
    assert.equal(ghostAnim.target.getAttribute('aria-hidden'), 'true');
    assert.equal(ghostAnim.target.getAttribute('data-session-id'), null);
    assert.equal(ghostAnim.target.querySelector('[data-sidebar-row]'), null);
    assert.equal(env.inspect.query('getViewState').rendered.roots[0].rows, 3, 'getViewState excludes motion ghosts');
    const enterAnim = animateCalls.find((c) => !c.isGhost && c.sessionId === 'a1' && c.keyframes[0]?.opacity === 0);
    assert.ok(enterAnim, 'entering compact row fades in');
    ghostAnim.finish();
    assert.equal(list.querySelector('[data-t3i-motion-ghost="true"]'), null, 'ghost removed on finish');
    for (const anim of animateCalls) anim.finish();
    animateCalls.length = 0;

    // 6. Drag release hands off visual transform offset via release() -> FLIP glide.
    const rowA2 = mounted.container.querySelector('[data-session-id="a2"]');
    await act(async () => {
      rowA2.dispatchEvent(new window.MouseEvent('mousedown', { button: 0, clientX: 40, clientY: 50, bubbles: true }));
      window.dispatchEvent(new window.MouseEvent('mousemove', { clientX: 40, clientY: 68, bubbles: true }));
    });
    animateCalls.length = 0;
    visualOffsetBySession.set('a2', 24);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    visualOffsetBySession.clear();
    const releaseAnim = animateCalls.find((c) => c.sessionId === 'a2' && c.keyframes[0]?.transform === 'translateY(24px)');
    assert.ok(releaseAnim, 'drag release glides from released visual offset to final layout top');
    for (const anim of animateCalls) anim.finish();
    animateCalls.length = 0;

    // 7. Reduced motion suppresses all WAAPI list animations.
    reducedMatches = true;
    await act(async () => { mounted.root.unmount(); });
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      useWorkspaces: (select) => {
        const cur = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(cur) : cur;
      },
      useSessions: (select) => {
        const cur = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(cur) : cur;
      },
    });
    animateCalls.length = 0;
    await act(async () => {
      const cur = env.workspaces.getSnapshot();
      env.workspaces.set({ ...cur, pinnedSessionIds: [] });
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(animateCalls.length, 0, 'prefers-reduced-motion suppresses list FLIP and fades');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    proto.animate = origAnimate;
    if (origOffsetTop) Object.defineProperty(proto, 'offsetTop', origOffsetTop);
    else delete proto.offsetTop;
    if (origOffsetHeight) Object.defineProperty(proto, 'offsetHeight', origOffsetHeight);
    else delete proto.offsetHeight;
    if (origOffsetWidth) Object.defineProperty(proto, 'offsetWidth', origOffsetWidth);
    else delete proto.offsetWidth;
    proto.getBoundingClientRect = origGetRect;
    window.matchMedia = origMatchMedia;
    if (prevGetComputedStyle) Object.defineProperty(globalThis, 'getComputedStyle', prevGetComputedStyle);
    else delete globalThis.getComputedStyle;
    document.elementFromPoint = origElementFromPoint;
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('Chinese i18n parity aligns T3 terminology, relative times, working elapsed, snooze labels, FootUndo, and dictionary completeness', async () => {
  const env = await clientHarness(
    ['input1', 'approval1', 'work1', 'wait1', 'done1', 'limit1', 'fail1', 'woke1', 'now1', 'min1', 'hr1', 'day1', 'snz1', 'snz2', ...Array.from({ length: 12 }, (_, i) => `stl${i}`)],
    { render: true, nativeMenus: true, shortcuts: true },
  );
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    env.runtime.locale = () => 'zh-CN';
    const zhT = (key, params) => {
      let text = String(env.dictionaries.zh?.[key] ?? key);
      if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
      return text;
    };
    // Verify 1:1 key parity and zero unintended English leftovers in zh dictionary.
    assert.deepEqual(Object.keys(env.dictionaries.zh).sort(), Object.keys(env.dictionaries.en).sort());
    for (const [key, val] of Object.entries(env.dictionaries.zh)) {
      const stripped = String(val).replace(/\{[a-zA-Z]+\}/g, '').replace(/\b(T3 Inbox|T3|DSH|Shift)\b/g, '');
      assert.doesNotMatch(stripped, /[A-Za-z]{4,}/, `zh.${key} must not contain leftover English: ${val}`);
    }

    const now = Date.now();
    const minuteBase = Math.floor(now / 60_000) * 60_000;
    env.workspaces.set({
      items: [{ workspaceId: 'ws-zh', title: '中文项目', path: '/tmp/zh-proj' }],
      pinnedSessionIds: [],
      archivedSessionIds: [],
    });
    const remote = structuredClone(env.host.currentSnapshot);
    remote.snoozeSettings = {
      revision: 2,
      presets: [
        { kind: 'after', minutes: 45 },
        { kind: 'after', minutes: 2 * 1440 },
        { kind: 'at', day: 'today', time: '23:59' },
        { kind: 'at', day: 'tomorrow', time: '09:00' },
        { kind: 'at', day: 'tuesday', time: '09:00' },
        { kind: 'at', day: 'monday', time: '09:00' },
      ],
      error: null,
    };
    remote.cards = remote.cards.map((card) => {
      const base = { ...card, workspaceId: 'ws-zh', workspaceTitle: '中文项目' };
      const p = structuredClone(base.progress);
      if (card.sessionId === 'input1') return { ...base, needsYou: true, pending: [{ sessionId: 'input1', kind: 'question', identity: null }] };
      if (card.sessionId === 'approval1') return { ...base, needsYou: true, pending: [{ sessionId: 'approval1', kind: 'approval', identity: null }] };
      if (card.sessionId === 'work1') {
        p.turn = { start: { time: now - 15_000 }, end: null };
        return { ...base, section: 'working', running: true, progress: p, branch: 'feat/zh-wt', worktree: true };
      }
      if (card.sessionId === 'wait1') {
        p.turn = { start: { time: now - 130_000 }, end: { time: now - 125_000 } };
        return { ...base, section: 'working', running: true, waiting: true, progress: p, members: [{ sessionId: 'wait1', progress: p }, { sessionId: 'child1', runtime: { running: true } }] };
      }
      if (card.sessionId === 'done1') return { ...base, newResult: true, result: { time: now - 10_000, reason: { kind: 'completed' } } };
      if (card.sessionId === 'limit1') return { ...base, newResult: false, result: { time: now - 10_000, reason: { kind: 'max-tokens' } } };
      if (card.sessionId === 'fail1') return { ...base, newResult: false, result: { time: now - 10_000, reason: { kind: 'error' } } };
      if (card.sessionId === 'woke1') return { ...base, woke: true, newResult: false };
      if (card.sessionId === 'now1') {
        p.latestResult.time = now - 5_000; p.turn.end.time = now - 5_000;
        return { ...base, newResult: false, progress: p };
      }
      if (card.sessionId === 'min1') {
        p.latestResult.time = minuteBase - 7 * 60_000; p.turn.end.time = minuteBase - 7 * 60_000;
        return { ...base, newResult: false, progress: p };
      }
      if (card.sessionId === 'hr1') {
        p.latestResult.time = minuteBase - 3 * 3_600_000; p.turn.end.time = minuteBase - 3 * 3_600_000;
        return { ...base, newResult: false, progress: p };
      }
      if (card.sessionId === 'day1') {
        p.latestResult.time = minuteBase - 5 * 86_400_000; p.turn.end.time = minuteBase - 5 * 86_400_000;
        return { ...base, newResult: false, progress: p };
      }
      if (card.sessionId === 'snz1') return { ...base, section: 'snoozed', snoozed: true, snooze: { until: new Date(now + 15 * 60_000 + 30_000).toISOString() }, snoozeEffect: { active: true } };
      if (card.sessionId === 'snz2') return { ...base, section: 'snoozed', snoozed: true, snooze: { until: new Date(now - 5_000).toISOString() }, snoozeEffect: { active: true } };
      const idx = Number(card.sessionId.slice(3));
      return { ...base, section: 'settled', settledAt: minuteBase - (idx + 1) * 60_000 };
    });
    remote.revision += 1;
    await act(async () => {
      env.emitSnapshot(remote);
      env.runtime.store.set({ workingOpen: true, snoozedOpen: true, settledOpen: true });
    });

    mounted = await mountBrowser(env, {
      t: zhT,
      useWorkspaces: (select) => {
        const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot);
        return select ? select(snap) : snap;
      },
      useSessions: (select) => {
        const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot);
        return select ? select(snap) : snap;
      },
    });

    // Search aria-label, section headers, and Show more.
    assert.equal(mounted.container.querySelector('.t3i-search')?.getAttribute('aria-label'), '搜索会话');
    assert.equal(mounted.container.querySelector('[data-section-header="working"] .t3i-section-label')?.textContent, '运行中');
    assert.equal(mounted.container.querySelector('[data-section-header="snoozed"] .t3i-section-label')?.textContent, '已暂缓');
    assert.equal(mounted.container.querySelector('[data-section-header="settled"] .t3i-section-label')?.textContent, '已收尾');
    assert.equal(mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more')?.textContent, '再显示 2 个');

    // Status labels and working elapsed times.
    assert.match(mounted.container.querySelector('[data-session-id="input1"] .t3i-status')?.textContent ?? '', /^待输入/);
    assert.match(mounted.container.querySelector('[data-session-id="approval1"] .t3i-status')?.textContent ?? '', /^待批准/);
    assert.match(mounted.container.querySelector('[data-session-id="work1"] .t3i-status')?.textContent ?? '', /^运行中\d+ 秒$/);
    assert.equal(mounted.container.querySelector('[data-session-id="work1"] .t3i-card-meta-branch')?.getAttribute('title'), '工作树：feat/zh-wt');
    assert.match(mounted.container.querySelector('[data-session-id="wait1"] .t3i-status')?.textContent ?? '', /^等待中\d+ 分钟$/);
    assert.equal(mounted.container.querySelector('[data-session-id="done1"] .t3i-status')?.textContent, '完成');
    assert.equal(mounted.container.querySelector('[data-session-id="limit1"] .t3i-status')?.textContent, '受限');
    assert.equal(mounted.container.querySelector('[data-session-id="fail1"] .t3i-status')?.textContent, '失败');
    assert.equal(mounted.container.querySelector('[data-session-id="woke1"] .t3i-status')?.textContent, '已唤醒');

    // Relative times across Active & Snoozed wake remaining.
    assert.equal(mounted.container.querySelector('[data-session-id="now1"] .t3i-row-time')?.textContent, '刚刚');
    assert.equal(mounted.container.querySelector('[data-session-id="min1"] .t3i-row-time')?.textContent, '7 分钟');
    assert.equal(mounted.container.querySelector('[data-session-id="hr1"] .t3i-row-time')?.textContent, '3 小时');
    assert.equal(mounted.container.querySelector('[data-session-id="day1"] .t3i-row-time')?.textContent, '5 天');
    assert.match(mounted.container.querySelector('[data-session-id="snz1"] .t3i-slim-wake')?.textContent ?? '', /^\d+ 分钟$/);
    assert.equal(mounted.container.querySelector('[data-session-id="snz2"] .t3i-slim-wake')?.textContent, '现在');

    // Project filter "所有项目".
    await act(async () => { mounted.container.querySelector('.t3i-project-filter')?.click(); });
    assert.equal(mounted.container.querySelector('.t3i-filter-popover .t3i-project-option')?.textContent?.trim(), '所有项目');
    await act(async () => { mounted.container.querySelector('.t3i-project-filter')?.click(); });

    // Custom snooze presets in both inline Snooze menu and native t3inbox.snooze menu.
    await act(async () => { mounted.container.querySelector('[data-session-id="now1"] .t3i-snooze-action')?.click(); });
    const inlineLabels = [...document.querySelectorAll('.t3i-snooze-menu button:not([data-custom])')].map((b) => b.firstChild.textContent);
    assert.ok(inlineLabels.includes('45 分钟后'));
    assert.ok(inlineLabels.includes('2 天后'));
    assert.ok(inlineLabels.includes('明天'));
    const nativeSnooze = env.menuRegistrations.find((m) => m.id === 't3inbox.snooze').resolve({ sessionId: 'now1' })[0].children;
    assert.ok(nativeSnooze.some((item) => item.label.startsWith('45 分钟后 (')));
    assert.ok(nativeSnooze.some((item) => item.label.startsWith('2 天后 (')));

    // FootUndo Chinese summary & shortcut label (1 and 2 items).
    const nowCard = env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'now1');
    const minCard = env.runtime.store.getSnapshot().remote.cards.find((c) => c.sessionId === 'min1');
    await act(async () => { await env.runtime.act(nowCard, 'settle'); });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, '已收尾，');
    assert.equal(mounted.container.querySelector('.t3i-foot-undo button')?.textContent, '按 ⌘Z 撤销');
    await act(async () => { await env.runtime.act(minCard, 'settle'); });
    assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, '已收尾 2 个，');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('all 8 official DSH locales register symmetrically with T3 plurals, status vs section disambiguation, and metadata JSONs', async () => {
  const OFFICIAL_LOCALES = ['en', 'zh', 'ja', 'es', 'fr', 'de', 'ru', 'pt'];
  const dictEnv = await clientHarness(['n0'], { render: false, shortcuts: true });
  try {
    // 1. Dictionary completeness, placeholder parity, and clean plain strings across all 8 locales.
    assert.deepEqual(Object.keys(dictEnv.dictionaries).sort(), [...OFFICIAL_LOCALES].sort());
    const enDict = dictEnv.dictionaries.en;
    const enKeys = Object.keys(enDict).sort();
    const placeholdersOf = (str) => [...String(str).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const lang of OFFICIAL_LOCALES) {
      const dict = dictEnv.dictionaries[lang];
      assert.ok(dict, `missing dictionary for ${lang}`);
      assert.deepEqual(Object.keys(dict).sort(), enKeys, `key mismatch for ${lang}`);
      for (const key of enKeys) {
        const val = dict[key];
        assert.equal(typeof val, 'string', `${lang}.${key} must be a string`);
        assert.ok(val.trim().length > 0, `${lang}.${key} must not be empty`);
        assert.doesNotMatch(val.replace(/\{\w+\}/g, ''), /[{}\[\]]/, `${lang}.${key} must not contain raw ICU syntax: ${val}`);
        const expectedPh = placeholdersOf(enDict[key]).filter((p) => !(key === 'undoScreenSummary' && lang !== 'en' && p === 'plural'));
        assert.deepEqual(placeholdersOf(val), expectedPh, `placeholder mismatch for ${lang}.${key}`);
      }
      if (lang === 'zh' || lang === 'ja' || lang === 'ru') {
        for (const key of enKeys) {
          const stripped = String(dict[key]).replace(/\{\w+\}/g, '').replace(/\b(T3 Inbox|T3|DSH|Shift)\b/g, '');
          assert.doesNotMatch(stripped, /[A-Za-z]{4,}/, `${lang}.${key} contains unexpected English text: ${dict[key]}`);
        }
      }
      // Validate locale/<lang>.json plugin metadata files.
      const metaPath = path.join(process.cwd(), 'locale', `${lang}.json`);
      const parsedMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      assert.equal(typeof parsedMeta?.meta?.title, 'string', `${metaPath} missing meta.title`);
      assert.ok(parsedMeta.meta.title.trim().length > 0);
      assert.equal(typeof parsedMeta?.meta?.description, 'string', `${metaPath} missing meta.description`);
      assert.ok(parsedMeta.meta.description.trim().length > 0);
    }
  } finally {
    dictEnv.dispose();
  }

  const cases = [
    {
      lang: 'ja', runtimeLocale: 'ja-JP',
      workingSection: '作業中', snoozedSection: 'スヌーズ中', settledSection: '対応済み', showMore2: 'さらに 2 件表示',
      workStatus: /^作業中\d+秒$/, waitStatus: /^待機中\d+分$/, input: '入力待ち', approval: '承認待ち', done: '完了', limited: '上限', failed: '失敗',
      worktree: 'ワークツリー: feat/multi',
      now: 'たった今', min7: '7分', hr3: '3時間', day5: '5日', wakeNow: '今すぐ',
      presets: ['1 時間後', '3 時間後', '5 時間後', '2 日後', '明日'],
      undo1: '対応済み、', undoBtn: '⌘Z で元に戻す', undo2: '対応済み 2 件、',
    },
    {
      lang: 'de', runtimeLocale: 'de-DE',
      workingSection: 'In Arbeit', snoozedSection: 'Zurückgestellt', settledSection: 'Erledigt', showMore2: '2 weitere anzeigen', showMore1: '1 weiteren anzeigen',
      workStatus: /^Arbeitet\d+ s$/, waitStatus: /^Wartet\d+ Min\.$/, input: 'Eingabe', approval: 'Genehmigung', done: 'Fertig', limited: 'Limitiert', failed: 'Fehlgeschlagen',
      worktree: 'Worktree: feat/multi',
      now: 'jetzt', min7: '7 Min.', hr3: '3 Std.', day5: '5 T.', wakeNow: 'jetzt',
      presets: ['In 1 Stunde', 'In 3 Stunden', 'In 5 Stunden', 'In 2 Tagen', 'Morgen'],
      undo1: 'Erledigt,', undoBtn: '⌘Z zum Rückgängigmachen', undo2: '2 erledigt,',
    },
    {
      lang: 'es', runtimeLocale: 'es-ES',
      workingSection: 'En curso', snoozedSection: 'Pospuestos', settledSection: 'Resueltos', showMore2: 'Mostrar 2 más',
      workStatus: /^Trabajando\d+ s$/, waitStatus: /^Esperando\d+ min$/, input: 'Respuesta', approval: 'Aprobación', done: 'Hecho', limited: 'Limitado', failed: 'Falló',
      worktree: 'Worktree: feat/multi',
      now: 'ahora', min7: '7 min', hr3: '3 h', day5: '5 d', wakeNow: 'ahora',
      presets: ['En 1 hora', 'En 3 horas', 'En 5 horas', 'En 2 días', 'Mañana'],
      undo1: 'Resuelto,', undoBtn: '⌘Z para deshacer', undo2: 'Resueltos 2,',
    },
    {
      lang: 'fr', runtimeLocale: 'fr-FR',
      workingSection: 'En cours', snoozedSection: 'Reportés', settledSection: 'Clos', showMore2: 'Afficher 2 de plus',
      workStatus: /^En cours\d+ s$/, waitStatus: /^En attente\d+ min$/, input: 'Réponse', approval: 'Approbation', done: 'Terminé', limited: 'Limité', failed: 'Échec',
      worktree: 'Worktree : feat/multi',
      now: 'maintenant', min7: '7 min', hr3: '3 h', day5: '5 j', wakeNow: 'maintenant',
      presets: ['Dans 1 heure', 'Dans 3 heures', 'Dans 5 heures', 'Dans 2 jours', 'Demain'],
      undo1: 'Clos,', undoBtn: '⌘Z pour annuler', undo2: '2 clos,',
    },
    {
      lang: 'ru', runtimeLocale: 'ru-RU',
      workingSection: 'В работе', snoozedSection: 'Отложенные', settledSection: 'Разобранные', showMore2: 'Показать ещё 2',
      workStatus: /^Работает\d+ с$/, waitStatus: /^Ожидает\d+ мин$/, input: 'Ввод', approval: 'Подтверждение', done: 'Готово', limited: 'Лимит', failed: 'Ошибка',
      worktree: 'Рабочее дерево: feat/multi',
      now: 'сейчас', min7: '7 мин', hr3: '3 ч', day5: '5 д', wakeNow: 'сейчас',
      presets: ['Через 1 час', 'Через 3 часа', 'Через 5 часов', 'Через 2 дня', 'Завтра'],
      undo1: 'Разобран,', undoBtn: '⌘Z — отменить', undo2: 'Разобрано: 2,',
    },
    {
      lang: 'pt', runtimeLocale: 'pt-BR',
      workingSection: 'Trabalhando', snoozedSection: 'Adiadas', settledSection: 'Concluídas', showMore2: 'Mostrar mais 2',
      workStatus: /^Trabalhando\d+s$/, waitStatus: /^Aguardando\d+min$/, input: 'Resposta', approval: 'Aprovação', done: 'Pronta', limited: 'Limitada', failed: 'Falhou',
      worktree: 'Worktree: feat/multi',
      now: 'agora', min7: '7min', hr3: '3h', day5: '5d', wakeNow: 'agora',
      presets: ['Em 1 hora', 'Em 3 horas', 'Em 5 horas', 'Em 2 dias', 'Amanhã'],
      undo1: 'Concluída,', undoBtn: '⌘Z para desfazer', undo2: '2 concluídas,',
    },
  ];

  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    for (const c of cases) {
      const env = await clientHarness(
        ['work1', 'wait1', 'done1', 'limit1', 'fail1', 'input1', 'approval1', 'now1', 'min1', 'hr1', 'day1', 'snz1', 'snz2', ...Array.from({ length: 12 }, (_, i) => `stl${i}`)],
        { render: true, nativeMenus: true, shortcuts: true },
      );
      let mounted;
      try {
        const now = Date.now();
        const minuteBase = Math.floor(now / 60_000) * 60_000;
        const buildRemote = (settledCount = 12) => {
          const r = structuredClone(env.host.currentSnapshot);
          r.snoozeSettings = {
            revision: 3,
            presets: [
              { kind: 'after', minutes: 60 },
              { kind: 'after', minutes: 180 },
              { kind: 'after', minutes: 5 * 60 },
              { kind: 'after', minutes: 2 * 1440 },
              { kind: 'at', day: 'tomorrow', time: '09:00' },
            ],
            error: null,
          };
          r.cards = r.cards.filter((card) => !card.sessionId.startsWith('stl') || Number(card.sessionId.slice(3)) < settledCount).map((card) => {
            const base = { ...card, workspaceId: 'ws-i18n', workspaceTitle: 'Repo' };
            const p = structuredClone(base.progress);
            if (card.sessionId === 'input1') return { ...base, needsYou: true, pending: [{ sessionId: 'input1', kind: 'question', identity: null }] };
            if (card.sessionId === 'approval1') return { ...base, needsYou: true, pending: [{ sessionId: 'approval1', kind: 'approval', identity: null }] };
            if (card.sessionId === 'work1') {
              p.turn = { start: { time: now - 15_000 }, end: null };
              return { ...base, section: 'working', running: true, progress: p, branch: 'feat/multi', worktree: true };
            }
            if (card.sessionId === 'wait1') {
              p.turn = { start: { time: now - 130_000 }, end: { time: now - 125_000 } };
              return { ...base, section: 'working', running: true, waiting: true, progress: p, members: [{ sessionId: 'wait1', progress: p }, { sessionId: 'child1', runtime: { running: true } }] };
            }
            if (card.sessionId === 'done1') return { ...base, section: 'active', newResult: true, result: { time: now - 10_000, reason: { kind: 'completed' } } };
            if (card.sessionId === 'limit1') return { ...base, section: 'active', newResult: false, result: { time: now - 10_000, reason: { kind: 'max-tokens' } } };
            if (card.sessionId === 'fail1') return { ...base, section: 'active', newResult: false, result: { time: now - 10_000, reason: { kind: 'error' } } };
            if (card.sessionId === 'now1') { p.latestResult.time = now - 5_000; p.turn.end.time = now - 5_000; return { ...base, section: 'active', newResult: false, progress: p }; }
            if (card.sessionId === 'min1') { p.latestResult.time = minuteBase - 7 * 60_000; p.turn.end.time = minuteBase - 7 * 60_000; return { ...base, section: 'active', newResult: false, progress: p }; }
            if (card.sessionId === 'hr1') { p.latestResult.time = minuteBase - 3 * 3_600_000; p.turn.end.time = minuteBase - 3 * 3_600_000; return { ...base, section: 'active', newResult: false, progress: p }; }
            if (card.sessionId === 'day1') { p.latestResult.time = minuteBase - 5 * 86_400_000; p.turn.end.time = minuteBase - 5 * 86_400_000; return { ...base, section: 'active', newResult: false, progress: p }; }
            if (card.sessionId === 'snz1') return { ...base, section: 'snoozed', snoozed: true, snooze: { until: new Date(now + 15 * 60_000 + 30_000).toISOString() }, snoozeEffect: { active: true } };
            if (card.sessionId === 'snz2') return { ...base, section: 'snoozed', snoozed: true, snooze: { until: new Date(now - 5_000).toISOString() }, snoozeEffect: { active: true } };
            const idx = Number(card.sessionId.slice(3));
            return { ...base, section: 'settled', settledAt: minuteBase - (idx + 1) * 60_000 };
          });
          r.revision += 1;
          return r;
        };

        env.runtime.locale = () => c.runtimeLocale;
        env.workspaces.set({ items: [{ workspaceId: 'ws-i18n', title: 'Repo', path: '/tmp/repo' }], pinnedSessionIds: [], archivedSessionIds: [] });
        await act(async () => {
          env.emitSnapshot(buildRemote(12));
          env.runtime.store.set({ workingOpen: true, snoozedOpen: true, settledOpen: true });
        });
        const tr = (key, params) => {
          let text = String(env.dictionaries[c.lang]?.[key] ?? key);
          if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v));
          return text;
        };
        mounted = await mountBrowser(env, {
          t: tr,
          useWorkspaces: (select) => { const snap = React.useSyncExternalStore(env.workspaces.subscribe, env.workspaces.getSnapshot); return select ? select(snap) : snap; },
          useSessions: (select) => { const snap = React.useSyncExternalStore(env.sessions.subscribe, env.sessions.getSnapshot); return select ? select(snap) : snap; },
        });

        assert.equal(mounted.container.querySelector('[data-section-header="working"] .t3i-section-label')?.textContent, c.workingSection, `${c.lang} working section`);
        assert.equal(mounted.container.querySelector('[data-section-header="snoozed"] .t3i-section-label')?.textContent, c.snoozedSection, `${c.lang} snoozed section`);
        assert.equal(mounted.container.querySelector('[data-section-header="settled"] .t3i-section-label')?.textContent, c.settledSection, `${c.lang} settled section`);
        assert.equal(mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more')?.textContent, c.showMore2, `${c.lang} showMore 2`);

        assert.match(mounted.container.querySelector('[data-session-id="work1"] .t3i-status')?.textContent ?? '', c.workStatus, `${c.lang} work status`);
        assert.match(mounted.container.querySelector('[data-session-id="wait1"] .t3i-status')?.textContent ?? '', c.waitStatus, `${c.lang} wait status`);
        assert.match(mounted.container.querySelector('[data-session-id="input1"] .t3i-status')?.textContent ?? '', new RegExp(`^${c.input}`), `${c.lang} input`);
        assert.match(mounted.container.querySelector('[data-session-id="approval1"] .t3i-status')?.textContent ?? '', new RegExp(`^${c.approval}`), `${c.lang} approval`);
        assert.equal(mounted.container.querySelector('[data-session-id="done1"] .t3i-status')?.textContent, c.done, `${c.lang} done`);
        assert.equal(mounted.container.querySelector('[data-session-id="limit1"] .t3i-status')?.textContent, c.limited, `${c.lang} limited`);
        assert.equal(mounted.container.querySelector('[data-session-id="fail1"] .t3i-status')?.textContent, c.failed, `${c.lang} failed`);
        assert.equal(mounted.container.querySelector('[data-session-id="work1"] .t3i-card-meta-branch')?.getAttribute('title'), c.worktree, `${c.lang} worktree`);

        assert.equal(mounted.container.querySelector('[data-session-id="now1"] .t3i-row-time')?.textContent, c.now, `${c.lang} now`);
        assert.equal(mounted.container.querySelector('[data-session-id="min1"] .t3i-row-time')?.textContent, c.min7, `${c.lang} 7m`);
        assert.equal(mounted.container.querySelector('[data-session-id="hr1"] .t3i-row-time')?.textContent, c.hr3, `${c.lang} 3h`);
        assert.equal(mounted.container.querySelector('[data-session-id="day1"] .t3i-row-time')?.textContent, c.day5, `${c.lang} 5d`);
        assert.equal(mounted.container.querySelector('[data-session-id="snz2"] .t3i-slim-wake')?.textContent, c.wakeNow, `${c.lang} wakeNow`);

        if (c.showMore1) {
          await act(async () => { env.emitSnapshot(buildRemote(11)); });
          assert.equal(mounted.container.querySelector('[data-section-more="settled"] .t3i-show-more')?.textContent, c.showMore1, `${c.lang} showMore 1`);
          await act(async () => { env.emitSnapshot(buildRemote(12)); });
        }

        // Open Snooze menu and verify dynamic presets including pluralization.
        await act(async () => { mounted.container.querySelector('[data-session-id="now1"] .t3i-snooze-action')?.click(); });
        const labels = [...document.querySelectorAll('.t3i-snooze-menu button:not([data-custom])')].map((b) => b.firstChild.textContent);
        for (const expectedPreset of c.presets) {
          assert.ok(labels.includes(expectedPreset), `${c.lang} missing preset "${expectedPreset}" in ${JSON.stringify(labels)}`);
        }
        await act(async () => { document.querySelector('.t3i-snooze-menu')?.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });

        // FootUndo 1 and 2 items.
        const nowCard = env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'now1');
        const minCard = env.runtime.store.getSnapshot().remote.cards.find((card) => card.sessionId === 'min1');
        await act(async () => { await env.runtime.act(nowCard, 'settle'); });
        assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, c.undo1, `${c.lang} undo1`);
        assert.equal(mounted.container.querySelector('.t3i-foot-undo button')?.textContent, c.undoBtn, `${c.lang} undoBtn`);
        await act(async () => { await env.runtime.act(minCard, 'settle'); });
        assert.equal(mounted.container.querySelector('.t3i-foot-undo .t3i-foot-undo-text')?.textContent, c.undo2, `${c.lang} undo2`);
      } finally {
        if (mounted) await act(async () => { mounted.root.unmount(); });
        env.dispose();
      }
    }
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
  }
});

test('non-worktree branch line omits card icon while worktree keeps folderGit2 and hover preview keeps branch icon', async () => {
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const env = await clientHarness(['wt', 'local', 'undef', 'nobranch'], { render:true });
  let mounted;
  try {
    const snap = env.runtime.store.getSnapshot().remote;
    env.emitSnapshot({
      ...snap,
      revision: snap.revision + 1,
      cards: snap.cards.map((card) => {
        if (card.sessionId === 'wt') return { ...card, title: 'Worktree Thread', branch: 'feat/wt', worktree: true };
        if (card.sessionId === 'local') return { ...card, title: 'Local Branch Thread', branch: 'lab/notch-panel-dark', worktree: false };
        if (card.sessionId === 'undef') return { ...card, title: 'Implicit Local Thread', branch: 'main' };
        return { ...card, title: 'No Branch Thread', branch: null, worktree: false };
      }),
    });
    mounted = await mountBrowser(env, { wide:true, t:enTranslator(env) });

    const wtBranch = mounted.container.querySelector('[data-session-id="wt"] .t3i-card-meta-branch');
    assert.ok(wtBranch, 'worktree branch row renders');
    assert.equal(wtBranch.getAttribute('title'), 'Worktree: feat/wt');
    const wtSvg = wtBranch.querySelector('svg');
    assert.ok(wtSvg, 'worktree branch row renders folderGit2 icon');
    assert.equal(wtSvg.getAttribute('width'), '14');
    assert.equal(wtSvg.querySelectorAll('circle').length, 2, 'worktree uses folderGit2 circles');
    assert.equal(wtBranch.querySelector('.t3i-card-meta-branch-text')?.textContent, 'feat/wt');

    const localBranch = mounted.container.querySelector('[data-session-id="local"] .t3i-card-meta-branch');
    assert.ok(localBranch, 'non-worktree branch row renders');
    assert.equal(localBranch.getAttribute('title'), null);
    assert.equal(localBranch.querySelector('svg'), null, 'non-worktree branch row renders no icon');
    assert.equal(localBranch.querySelector('.t3i-card-meta-branch-text')?.textContent, 'lab/notch-panel-dark');

    const undefBranch = mounted.container.querySelector('[data-session-id="undef"] .t3i-card-meta-branch');
    assert.ok(undefBranch, 'implicit non-worktree branch row renders');
    assert.equal(undefBranch.querySelector('svg'), null, 'undefined worktree renders no icon');
    assert.equal(undefBranch.querySelector('.t3i-card-meta-branch-text')?.textContent, 'main');

    assert.equal(mounted.container.querySelector('[data-session-id="nobranch"] .t3i-card-meta-line'), null, 'branchless card omits meta line');

    // Hover preview card still shows a 12px branch icon for non-worktree branches (matching T3 SidebarThreadTooltip).
    const localItem = mounted.container.querySelector('[data-session-id="local"]');
    await act(async () => {
      localItem.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
    const preview = document.querySelector('.t3i-preview');
    assert.ok(preview, 'hover preview opens');
    const previewBranchRow = [...preview.querySelectorAll('.t3i-preview-row')].find((row) => row.textContent?.includes('lab/notch-panel-dark'));
    assert.ok(previewBranchRow, 'hover preview includes branch row');
    assert.ok(previewBranchRow.querySelector('svg'), 'hover preview retains branch icon');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    env.dispose();
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
  }
});

test('light-gray host visual hierarchy separates surfaces, keeps receding metadata subordinate, and preserves T3/dark modes', async () => {
  const env = await clientHarness(['a'], { render:true });
  try {
    const style = document.querySelector('style[data-t3-inbox]');
    assert.ok(style?.sheet);
    const rules = [...style.sheet.cssRules];
    const findRule = (selector) => rules.find((rule) => rule.selectorText === selector);

    // 1. Default (host light-gray) surface & text tokens on .t3i-root.
    const rootRule = findRule('.t3i-root');
    assert.ok(rootRule);
    assert.match(rootRule.style.getPropertyValue('--t3i-row-hover'), /--dsw-alias-interactive-bg-hover/);
    assert.match(rootRule.style.getPropertyValue('--t3i-control-hover'), /--dsw-alias-interactive-bg-hover/);
    assert.match(rootRule.style.getPropertyValue('--t3i-row-active'), /color-mix\(in srgb, var\(--dsw-alias-bg-layer-1, #fff\) 86%, transparent\)/);
    assert.match(rootRule.style.getPropertyValue('--t3i-row-selected'), /color-mix\(in srgb, var\(--dsw-alias-bg-layer-1, #fff\) 72%, transparent\)/);
    assert.ok(!rootRule.style.getPropertyValue('--t3i-row-active-shadow').includes('79.4%'), 'host active shadow avoids heavy contrast-boosted border');
    assert.equal(rootRule.style.getPropertyValue('--t3i-secondary-label').trim(), 'var(--dsw-alias-label-secondary)');
    assert.equal(rootRule.style.getPropertyValue('--t3i-settled-title').trim(), 'var(--t3i-secondary-label)');

    // 2. T3 light background restores zinc-25 hover, #fff active/selected, and zinc-200/70 inset ring.
    const t3Rule = findRule('html[data-t3-inbox-background="t3"] .t3i-root');
    assert.ok(t3Rule);
    assert.equal(t3Rule.style.getPropertyValue('--t3i-row-hover').trim(), 'oklch(99.2% 0 0)');
    assert.equal(t3Rule.style.getPropertyValue('--t3i-row-active').trim(), '#fff');
    assert.equal(t3Rule.style.getPropertyValue('--t3i-row-selected').trim(), '#fff');
    assert.match(t3Rule.style.getPropertyValue('--t3i-row-active-shadow'), /oklch\(92% \.004 286\.32\) 70%/);

    // 3. Dark theme overrides both host and T3 modes with higher specificity and stepped metadata < receding title.
    const darkRule = findRule('html body[data-ds-dark-theme] .t3i-root');
    assert.ok(darkRule);
    assert.ok(rules.indexOf(darkRule) > rules.indexOf(t3Rule), 'dark theme rule follows t3 light override');
    assert.equal(darkRule.style.getPropertyValue('--t3i-row-active-shadow').trim(), 'none');
    assert.match(darkRule.style.getPropertyValue('--t3i-row-hover'), /8%/);
    assert.match(darkRule.style.getPropertyValue('--t3i-row-active'), /11%/);
    assert.match(darkRule.style.getPropertyValue('--t3i-secondary-label'), /58%/);
    assert.match(darkRule.style.getPropertyValue('--t3i-recede-title'), /75%/);

    // 4. Icon button hover uses --t3i-control-hover (not opaque --dsw-alias-bg-layer-2); rows use --t3i-row-*.
    assert.equal(findRule('.t3i-icon-button:hover')?.style.getPropertyValue('background'), 'var(--t3i-control-hover)');
    assert.equal(findRule('.t3i-search-wrap:hover:not(:focus-within)')?.style.getPropertyValue('background'), 'var(--t3i-row-hover)');
    assert.equal(findRule('.t3i-show-more:hover')?.style.getPropertyValue('background'), 'var(--t3i-row-hover)');
    assert.equal(findRule('.t3i-foot-undo button:hover')?.style.getPropertyValue('background'), 'var(--t3i-control-hover)');

    // 5. Receding cards do NOT override workspace name or time to inherit title color.
    assert.equal(findRule('.t3i-item[data-recede="true"] .t3i-ws-name'), undefined);
    assert.equal(findRule('.t3i-item[data-recede="true"] .t3i-row-time'), undefined);
    assert.equal(findRule('.t3i-ws-name')?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    assert.equal(findRule('.t3i-row-time')?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    assert.equal(findRule('.t3i-card-meta-line')?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    assert.equal(findRule('.t3i-item[data-recede="true"] .t3i-row-title')?.style.getPropertyValue('color'), 'var(--t3i-recede-title)');

    // 6. Settled read rows & compact timestamps remain legible via --t3i-secondary-label while search timestamps retain 85% dimming.
    const settledReadRule = findRule('.t3i-item[data-variant="compact"][data-section="settled"]:not([data-unread="true"]):not([data-selected="true"]):not([data-sweep]):not(:hover):not(:focus-within) .t3i-row:not([aria-current="page"]) .t3i-row-title');
    assert.equal(settledReadRule?.style.getPropertyValue('color'), 'var(--t3i-settled-title)');
    assert.equal(findRule('.t3i-item[data-variant="compact"] .t3i-row-time')?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    assert.equal(rootRule.style.getPropertyValue('--t3i-settled-time').trim(), '');
    assert.equal(findRule('.t3i-search-time')?.style.getPropertyValue('color'), 'color-mix(in srgb, var(--t3i-secondary-label) 85%, transparent)');
    assert.equal(darkRule.style.getPropertyValue('--t3i-settled-title').trim(), '', 'dark mode inherits --t3i-settled-title');

    // 7. Snoozed receding rows & default status use --t3i-secondary-label (not raw --dsw-alias-label-secondary which is brighter than receding titles in dark mode).
    const snoozedRecedeRule = findRule('.t3i-item[data-variant="compact"][data-section="snoozed"][data-recede="true"]:not([data-selected="true"]):not([data-sweep]):not(:hover):not(:focus-within) .t3i-row:not([aria-current="page"]) .t3i-row-title');
    assert.equal(snoozedRecedeRule?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');
    assert.equal(findRule('.t3i-status')?.style.getPropertyValue('color'), 'var(--t3i-secondary-label)');

    // 8. Dragging surface follows and overrides hover/selected/active row rules without losing its elevated background or shadow.
    const activeRowRule = rules.find((rule) => rule.selectorText?.includes('.t3i-row[aria-current="page"]') && rule.style.getPropertyValue('background') === 'var(--t3i-row-active)');
    const draggingRowRule = findRule('.t3i-root .t3i-item[data-variant][data-dragging="true"] .t3i-row');
    assert.ok(activeRowRule && draggingRowRule);
    assert.ok(rules.indexOf(draggingRowRule) > rules.indexOf(activeRowRule), 'dragging row rule follows active/hover/selected surface rules');
    assert.equal(draggingRowRule.style.getPropertyValue('background'), 'var(--t3i-dragging-bg)');
    assert.equal(draggingRowRule.style.getPropertyValue('box-shadow'), 'var(--t3i-dragging-shadow)');

    // 9. Stacked multi-project filter monograms preserve their tinted tile over an adaptive cutout ring instead of a stark white #f9fafb sticker.
    const scopeStackRule = findRule('.t3i-scope-stack .t3i-mono + .t3i-mono');
    assert.ok(scopeStackRule);
    assert.match(scopeStackRule.style.getPropertyValue('background'), /linear-gradient\([\s\S]*14%[\s\S]*var\(--t3i-scope-cutout\)/);
    assert.equal(scopeStackRule.style.getPropertyValue('box-shadow'), '0 0 0 2px var(--t3i-scope-cutout)');
    assert.match(rootRule.style.getPropertyValue('--t3i-scope-cutout'), /color-mix\(/);
    assert.equal(t3Rule.style.getPropertyValue('--t3i-scope-cutout').trim(), 'var(--t3i-sidebar-background)');
    assert.equal(findRule('html[data-t3-inbox-background="custom"] .t3i-root')?.style.getPropertyValue('--t3i-scope-cutout').trim(), 'var(--t3i-sidebar-background)');
    assert.equal(findRule('.t3i-project-filter[data-active="true"]:not(:hover):not([aria-expanded="true"])')?.style.getPropertyValue('background'), 'transparent');

    // 10. Branch text wrapper uses display:flex (matching T3) and menu hover uses translucent interactive fill (visible on light #fff menus).
    assert.equal(findRule('.t3i-card-meta-branch-text')?.style.getPropertyValue('display'), 'flex');
    assert.match(findRule('.t3i-context-item:hover')?.style.getPropertyValue('background') ?? '', /--dsw-alias-interactive-bg-hover/);
    assert.match(findRule('.t3i-preset:hover, .t3i-preset[data-selected="true"]')?.style.getPropertyValue('background') ?? '', /--dsw-alias-interactive-bg-hover/);
  } finally {
    env.dispose();
  }
});

test('Optimistic settle moves card immediately before Host reply and rolls back on failure', async () => {
  const env = await clientHarness(['a', 'b'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let mounted;
  try {
    mounted = await mountBrowser(env);
    const itemA = () => mounted.container.querySelector('.t3i-item[data-session-id="a"]');
    const itemB = () => mounted.container.querySelector('.t3i-item[data-session-id="b"]');
    const settledCount = () => mounted.container.querySelector('.t3i-section-header[data-section-header="settled"] .t3i-section-count')?.textContent;
    assert.equal(settledCount(), undefined);
    assert.equal(itemA()?.getAttribute('data-section'), 'active');

    // Hold RPC BEFORE Host commits or emits follow so only optimisticCards can move 'a'.
    let releaseRpcA;
    const origAct = env.remote.act;
    env.remote.act = async (request, signal) => {
      await new Promise((resolve) => { releaseRpcA = resolve; });
      return origAct(request, signal);
    };

    const settleBtnA = itemA()?.querySelector('.t3i-primary-action');
    assert.equal(Boolean(settleBtnA), true);
    await act(async () => {
      settleBtnA.click();
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(itemA()?.getAttribute('data-section'), 'settled', 'card moves optimistically to Settled before RPC returns');
    assert.equal(itemA()?.getAttribute('data-variant'), 'compact');
    assert.equal(settledCount(), '1');

    await act(async () => {
      releaseRpcA();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(Boolean(itemA()), false, 'settled active card leaves collapsed Settled shelf after forward navigation');
    assert.equal(settledCount(), '1');
    assert.equal(Boolean(document.querySelector('.t3i-toast')), false);

    // Reject RPC for 'b' and verify optimistic move rolls back with error toast.
    let releaseRpcB;
    env.remote.act = async () => {
      await new Promise((resolve) => { releaseRpcB = resolve; });
      return { ok: true, value: { status: 'not-eligible', message: 'busy' } };
    };
    const settleBtnB = itemB()?.querySelector('.t3i-primary-action');
    assert.equal(Boolean(settleBtnB), true);
    await act(async () => {
      settleBtnB.click();
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(itemB()?.getAttribute('data-section'), 'settled', 'card moves optimistically while RPC is in flight');
    assert.equal(itemB()?.getAttribute('data-variant'), 'compact');
    assert.equal(settledCount(), '2');

    await act(async () => {
      releaseRpcB();
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    });
    assert.equal(itemB()?.getAttribute('data-section'), 'active', 'failed settle rolls optimistic card back to Active');
    assert.equal(itemB()?.getAttribute('data-variant'), 'card');
    assert.equal(settledCount(), '1');
    assert.equal(Boolean(document.querySelector('.t3i-toast')), true, 'failed settle surfaces error toast after rollback');
  } finally {
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});

test('T3 floating hover tooltips on Snooze, Settle, Un-settle, Wake, Unpin, Woke, and Header/Footer buttons with warm handoff and dismiss rules', async () => {
  const env = await clientHarness(['p1', 'a1', 'w1', 'r1', 'z1', 's1'], { render: true });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  env.runtime.locale = () => 'zh-CN';
  const prevGetComputedStyle = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  const origElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => null;
  const proto = window.HTMLElement.prototype;
  const origGetRect = proto.getBoundingClientRect;
  let mounted;
  try {
    env.workspaces.set({
      items: [
        { workspaceId: 'ws-a', title: 'Alpha', path: '/ws-a' },
        { workspaceId: 'ws-b', title: 'Beta', path: '/ws-b' },
      ],
      pinnedSessionIds: ['p1'],
      archivedSessionIds: [],
    });
    const zhT = (key, vars) => {
      let text = String(env.dictionaries.zh?.[key] ?? key);
      for (const [k, v] of Object.entries(vars ?? {})) text = text.replaceAll(`{${k}}`, String(v));
      return text;
    };
    const remote = structuredClone(env.host.currentSnapshot);
    remote.revision = (remote.revision ?? 0) + 1;
    const now = Date.now();
    remote.cards = remote.cards.map((card) => {
      if (card.sessionId === 'p1') return { ...card, pinned: true, section: 'active', workspaceId: 'ws-a', workspaceTitle: 'Alpha' };
      if (card.sessionId === 'a1') return { ...card, section: 'active', workspaceId: 'ws-a', workspaceTitle: 'Alpha', modelId: 'deepseek-chat' };
      if (card.sessionId === 'w1') return { ...card, section: 'active', woke: true, workspaceId: 'ws-a', workspaceTitle: 'Alpha' };
      if (card.sessionId === 'r1') return { ...card, section: 'working', running: true, canSettle: false, workspaceId: 'ws-a', workspaceTitle: 'Alpha' };
      if (card.sessionId === 'z1') return { ...card, section: 'snoozed', snoozed: true, snooze: { until: new Date(now + 15 * 60_000).toISOString() }, snoozeEffect: { active: true }, workspaceId: 'ws-a', workspaceTitle: 'Alpha' };
      return { ...card, section: 'settled', settledAt: now - 60_000, workspaceId: 'ws-a', workspaceTitle: 'Alpha' };
    });
    mounted = await mountBrowser(env, { t: zhT });
    await act(async () => {
      env.emitSnapshot(remote);
      await new Promise((resolve) => setImmediate(resolve));
      env.runtime.store.set({ workingOpen: true, snoozedOpen: true, settledOpen: true });
    });

    const hoverWait = (ms) => act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); });
    const tipInfo = () => {
      const tip = document.querySelector('.t3i-tooltip');
      return {
        exists: Boolean(tip),
        count: document.querySelectorAll('.t3i-tooltip').length,
        previewExists: Boolean(document.querySelector('.t3i-preview')),
        role: tip?.getAttribute('role') ?? null,
        side: tip?.getAttribute('data-side') ?? null,
        instant: tip?.getAttribute('data-instant') ?? null,
        text: tip?.textContent ?? null,
        sub: tip?.querySelector('.t3i-tooltip-sub')?.textContent ?? null,
        left: tip?.style?.left ?? null,
        top: tip?.style?.top ?? null,
      };
    };
    const item = (id) => mounted.container.querySelector(`.t3i-item[data-session-id="${id}"]`);
    const hoverIn = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true })); }); };
    const hoverOut = async (el) => { await act(async () => { el.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true })); }); };

    // 1. No native HTML title attribute on tooltipped action buttons.
    const snoozeBtnA = item('a1')?.querySelector('.t3i-snooze-action');
    const settleBtnA = item('a1')?.querySelector('.t3i-primary-action');
    const unsettleBtnS = item('s1')?.querySelector('.t3i-slim-action');
    const wakeBtnZ = item('z1')?.querySelector('.t3i-slim-action');
    const unpinBtnP = item('p1')?.querySelector('.t3i-pin');
    const dismissWokeBtn = item('w1')?.querySelector('button.t3i-status[data-tone="woke"]');
    assert.equal(Boolean(snoozeBtnA && settleBtnA && unsettleBtnS && wakeBtnZ && unpinBtnP && dismissWokeBtn), true);
    assert.equal(snoozeBtnA.getAttribute('title'), null);
    assert.equal(settleBtnA.getAttribute('title'), null);
    assert.equal(unsettleBtnS.getAttribute('title'), null);
    assert.equal(wakeBtnZ.getAttribute('title'), null);
    assert.equal(unpinBtnP.getAttribute('title'), null);
    assert.equal(dismissWokeBtn.getAttribute('title'), null);

    // 2. Snooze button opens floating tooltip at 150ms (not 60ms) with portal in document.body.
    await hoverIn(snoozeBtnA);
    await hoverWait(60);
    assert.equal(tipInfo().exists, false);
    await hoverWait(130);
    const snoozeTip = tipInfo();
    assert.equal(snoozeTip.exists, true);
    assert.equal(snoozeTip.role, 'tooltip');
    assert.equal(snoozeTip.text, '暂缓会话');
    assert.equal(snoozeTip.instant, null);

    // 3. Mouse leave closes immediately, and adjacent Settle button opens immediately (warm <400ms handoff).
    await hoverOut(snoozeBtnA);
    assert.equal(tipInfo().exists, false);
    await hoverIn(settleBtnA);
    const warmSettleTip = tipInfo();
    assert.equal(warmSettleTip.exists, true);
    assert.equal(warmSettleTip.instant, 'true');
    assert.equal(warmSettleTip.text, '收尾会话');
    await hoverOut(settleBtnA);
    assert.equal(tipInfo().exists, false);

    // Wait out 400ms warm window before checking cold timing on Settled compact Un-settle button.
    await hoverWait(420);
    await hoverIn(unsettleBtnS);
    await hoverWait(60);
    assert.equal(tipInfo().exists, false);
    await hoverWait(130);
    assert.equal(tipInfo().text, '取消会话收尾');
    await hoverOut(unsettleBtnS);

    // 4. Compact Wake, Unpin, Dismiss Woke, and disabled Settle button tooltips.
    await hoverIn(wakeBtnZ);
    assert.equal(tipInfo().text, '立即唤醒会话');
    await hoverOut(wakeBtnZ);

    await hoverIn(unpinBtnP);
    assert.equal(tipInfo().text, '取消置顶会话');
    await hoverOut(unpinBtnP);

    await hoverIn(dismissWokeBtn);
    assert.equal(tipInfo().text, '忽略已唤醒通知');
    await hoverOut(dismissWokeBtn);

    const disabledSettleHost = item('r1')?.querySelector('.t3i-primary-action')?.closest('.t3i-tip-host');
    assert.equal(disabledSettleHost?.getAttribute('data-disabled'), 'true');
    assert.equal(item('r1')?.querySelector('.t3i-primary-action')?.disabled, true);
    await hoverIn(disabledSettleHost);
    assert.equal(tipInfo().text, '会话运行中时无法收尾');
    await hoverOut(disabledSettleHost);

    // 5. Outer ThreadHoverPreview preemption + intra-card button-to-body return + scroll-dismiss guard.
    await hoverWait(420);
    await hoverIn(item('a1'));
    await hoverWait(180);
    assert.equal(tipInfo().previewExists, true);
    await hoverIn(snoozeBtnA);
    const preemptTip = tipInfo();
    assert.equal(preemptTip.previewExists, false);
    assert.equal(preemptTip.exists, true);
    assert.equal(preemptTip.instant, 'true');
    assert.equal(preemptTip.text, '暂缓会话');

    // Moving pointer from Snooze button back onto card body closes button tooltip and re-opens .t3i-preview.
    const rowTitleA = item('a1')?.querySelector('.t3i-row-title');
    const wsNameA = item('a1')?.querySelector('.t3i-ws-name');
    assert.equal(Boolean(rowTitleA && wsNameA), true);
    await act(async () => {
      snoozeBtnA.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true, relatedTarget: rowTitleA }));
      rowTitleA.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true, relatedTarget: snoozeBtnA }));
    });
    const returnPreviewTip = tipInfo();
    assert.equal(returnPreviewTip.exists, false);
    assert.equal(returnPreviewTip.previewExists, true, 'moving from action button back to card body reopens ThreadHoverPreview');

    // Scroll dismisses .t3i-preview; moving between non-button elements inside the card stays closed.
    await act(async () => {
      mounted.container.querySelector('.t3i-scroll')?.dispatchEvent(new window.Event('scroll'));
    });
    assert.equal(tipInfo().previewExists, false);
    await act(async () => {
      rowTitleA.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true, relatedTarget: wsNameA }));
    });
    assert.equal(tipInfo().previewExists, false, 'moving between non-button elements inside card after scroll stays closed');
    await hoverOut(item('a1'));

    // Compact Settled row: leaving Un-settle button back onto card title reopens .t3i-preview.
    const rowTitleS = item('s1')?.querySelector('.t3i-row-title');
    assert.equal(Boolean(rowTitleS), true);
    await hoverWait(420);
    await hoverIn(unsettleBtnS);
    await hoverWait(180);
    assert.equal(tipInfo().text, '取消会话收尾');
    await act(async () => {
      unsettleBtnS.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true, relatedTarget: rowTitleS }));
      rowTitleS.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true, relatedTarget: unsettleBtnS }));
    });
    assert.equal(tipInfo().exists, false);
    assert.equal(tipInfo().previewExists, true, 'compact row button-to-body hover reopens ThreadHoverPreview');
    await hoverOut(item('s1'));

    // Re-hover Snooze button before opening Snooze menu in step 6.
    await hoverIn(snoozeBtnA);

    // 6. Opening Snooze menu suppresses/closes Snooze button tooltip.
    await act(async () => { snoozeBtnA.click(); });
    assert.equal(Boolean(document.querySelector('.t3i-snooze-menu')), true);
    assert.equal(tipInfo().exists, false);
    await hoverIn(snoozeBtnA);
    await hoverWait(180);
    assert.equal(tipInfo().exists, false, 'suppressed while Snooze menu is open');
    await act(async () => {
      document.querySelector('.t3i-snooze-menu')?.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    assert.equal(Boolean(document.querySelector('.t3i-snooze-menu')), false);

    // 7. Escape and scroll dismiss hovered tooltips; keyboard :focus-visible survives scroll and closes on blur.
    await hoverIn(settleBtnA);
    await hoverWait(180);
    assert.equal(tipInfo().text, '收尾会话');
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    assert.equal(tipInfo().exists, false);

    await hoverIn(settleBtnA);
    await hoverWait(180);
    assert.equal(tipInfo().exists, true);
    await act(async () => {
      mounted.container.querySelector('.t3i-scroll')?.dispatchEvent(new window.Event('scroll'));
    });
    assert.equal(tipInfo().exists, false);

    await act(async () => { settleBtnA.focus(); });
    assert.equal(tipInfo().text, '收尾会话');
    assert.equal(tipInfo().instant, 'true');
    await act(async () => {
      mounted.container.querySelector('.t3i-scroll')?.dispatchEvent(new window.Event('scroll'));
    });
    assert.equal(tipInfo().exists, true, 'keyboard :focus-visible tooltip survives scroll');
    await act(async () => { settleBtnA.blur(); });
    assert.equal(tipInfo().exists, false);

    // 8. Header & Footer action buttons + top-edge collision flip to side="bottom".
    const addProjBtn = mounted.container.querySelector('.t3i-head-actions button[aria-label="添加项目"]');
    const newThreadBtn = mounted.container.querySelector('.t3i-head-actions button[aria-label="新建会话"]');
    const settingsBtn = mounted.container.querySelector('.t3i-foot button[aria-label="设置"]');
    assert.equal(Boolean(addProjBtn && newThreadBtn && settingsBtn), true);
    assert.equal(addProjBtn.getAttribute('title'), null);
    assert.equal(newThreadBtn.getAttribute('title'), null);
    assert.equal(settingsBtn.getAttribute('title'), null);

    proto.getBoundingClientRect = function () {
      if (this === addProjBtn) return { left: 20, top: 8, right: 48, bottom: 36, width: 28, height: 28, x: 20, y: 8 };
      if (this.classList?.contains('t3i-tooltip')) return { left: 0, top: 0, right: 80, bottom: 26, width: 80, height: 26, x: 0, y: 0 };
      return origGetRect.call(this);
    };
    await hoverIn(addProjBtn);
    await hoverWait(180);
    const flippedTip = tipInfo();
    assert.equal(flippedTip.text, '添加项目');
    assert.equal(flippedTip.side, 'bottom');
    assert.equal(flippedTip.left, '5px');
    assert.equal(flippedTip.top, '40px');
    await hoverOut(addProjBtn);
    proto.getBoundingClientRect = origGetRect;

    await hoverIn(newThreadBtn);
    assert.equal(tipInfo().sub, '在当前项目中新建会话：Shift+单击');
    await hoverOut(newThreadBtn);

    await hoverIn(settingsBtn);
    assert.equal(tipInfo().text, '设置');
    await hoverOut(settingsBtn);

    const filterBtn = mounted.container.querySelector('.t3i-project-filter');
    assert.equal(filterBtn?.getAttribute('title'), null);
    await hoverIn(filterBtn);
    assert.equal(tipInfo().text, '按项目筛选会话');
    await act(async () => { filterBtn.click(); });
    assert.equal(Boolean(mounted.container.querySelector('.t3i-filter-popover')), true);
    assert.equal(tipInfo().exists, false, 'filter popover suppresses filter trigger tooltip');
    await act(async () => { filterBtn.click(); });

    await act(async () => { env.runtime.changeView({ search: 'a1' }); });
    const clearSearchBtn = mounted.container.querySelector('.t3i-search-clear');
    assert.equal(Boolean(clearSearchBtn), true);
    assert.equal(clearSearchBtn?.getAttribute('title'), null);
    await hoverIn(clearSearchBtn);
    await hoverWait(180);
    assert.equal(tipInfo().text, '清除会话搜索');
    await hoverOut(clearSearchBtn);
    await act(async () => { clearSearchBtn.click(); });

    // Inspect telemetry reports tooltipVisible & tooltipText while active.
    const settleAfterSearch = item('a1')?.querySelector('.t3i-primary-action');
    await hoverIn(settleAfterSearch);
    await hoverWait(180);
    const inspectRoot = env.inspect.query('getViewState', {})?.rendered?.roots?.[0];
    assert.equal(inspectRoot?.tooltipVisible, true);
    assert.equal(inspectRoot?.tooltipText, '收尾会话');
    assert.equal(tipInfo().count, 1);
  } finally {
    proto.getBoundingClientRect = origGetRect;
    document.elementFromPoint = origElementFromPoint;
    if (prevGetComputedStyle) Object.defineProperty(globalThis, 'getComputedStyle', prevGetComputedStyle);
    else delete globalThis.getComputedStyle;
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});



test('footer global panels render host icons, filter own switch, toggle active panel, overflow into More menu, and respect Global panels setting', async () => {
  let currentLang = 'en';
  const labelsByLang = {
    en: { plugins: 'Plugins', schedules: 'Automation tasks', alpha: 'Alpha', beta: 'Beta' },
    zh: { plugins: '插件', schedules: '自动化任务', alpha: '阿尔法', beta: '贝塔' },
  };
  const env = await clientHarness(['a'], {
    render: true,
    storage: true,
    hostPanels: [
      { id: 'schedules', order: 10, label: () => labelsByLang[currentLang].schedules },
      { id: 'plugins', order: 0, label: () => labelsByLang[currentLang].plugins },
    ],
  });
  const oldActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const prevGetComputedStyle = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  const origElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => null;
  const proto = window.HTMLElement.prototype;
  const origGetRect = proto.getBoundingClientRect;
  const hostSidebar = document.createElement('div');
  hostSidebar.className = 'kB3qhq_root';
  document.body.append(hostSidebar);
  const hostPanelsEl = document.createElement('nav');
  hostPanelsEl.className = 'kB3qhq_panelList';
  hostSidebar.append(hostPanelsEl);
  let mounted;
  try {
    mounted = await mountBrowser(env, {
      t: enTranslator(env),
      usePanelInfo: (select) => {
        const snap = React.useSyncExternalStore(env.panel.subscribe, env.panel.getSnapshot);
        return select ? select(snap) : snap;
      },
    });
    const footerPanels = () => [...mounted.container.querySelectorAll('.t3i-foot-panel')];
    const moreBtn = () => mounted.container.querySelector('.t3i-foot-panels-more');
    const moreMenu = () => mounted.container.querySelector('.t3i-foot-panels-menu');
    const footerAllButtons = () => [...mounted.container.querySelectorAll('.t3i-foot > button, .t3i-foot > .t3i-filter-anchor > button')];

    // 1. Default 'footer' mode hides top host panelList, filters out own 't3-inbox' switch, sorts by order, and renders factory icons.
    assert.equal(document.documentElement.getAttribute('data-t3-inbox-nav'), 'off');
    assert.equal(window.getComputedStyle(hostPanelsEl).display, 'none');
    assert.deepEqual(
      footerPanels().map((btn) => btn.getAttribute('data-panel-id')),
      ['plugins', 'schedules'],
    );
    assert.deepEqual(
      footerPanels().map((btn) => btn.getAttribute('aria-label')),
      ['Plugins', 'Automation tasks'],
    );
    assert.equal(Boolean(mounted.container.querySelector('.t3i-foot-panel[data-panel-id="t3-inbox"]')), false);
    assert.equal(Boolean(moreBtn()), false);
    assert.equal(
      footerPanels().every((btn) => Boolean(btn.querySelector(`.t3i-foot-panel-glyph svg[data-host-icon="${btn.getAttribute('data-panel-id')}"]`))),
      true,
    );

    // 2. Hover tooltip on footer panel button appears above trigger (side="top").
    const pluginsBtn = () => mounted.container.querySelector('.t3i-foot-panel[data-panel-id="plugins"]');
    proto.getBoundingClientRect = function () {
      if (this === pluginsBtn()) return { left: 48, top: 620, right: 80, bottom: 652, width: 32, height: 32, x: 48, y: 620 };
      if (this.classList?.contains('t3i-tooltip')) return { left: 0, top: 0, right: 70, bottom: 26, width: 70, height: 26, x: 0, y: 0 };
      return origGetRect.call(this);
    };
    await act(async () => {
      pluginsBtn().dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
    });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 180)); });
    const tipEl = document.body.querySelector('.t3i-tooltip');
    assert.equal(Boolean(tipEl), true);
    assert.equal(tipEl?.textContent, 'Plugins');
    assert.equal(tipEl?.getAttribute('data-side'), 'top');
    await act(async () => {
      pluginsBtn().dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true }));
    });
    proto.getBoundingClientRect = origGetRect;
    assert.equal(Boolean(document.body.querySelector('.t3i-tooltip')), false);

    // 3. Clicking activates & highlights panel; clicking again toggles back to null.
    await act(async () => { pluginsBtn().click(); });
    assert.equal(env.panel.getSnapshot().activePanelId, 'plugins');
    assert.equal(pluginsBtn().getAttribute('data-active'), 'true');
    assert.equal(pluginsBtn().getAttribute('aria-pressed'), 'true');
    assert.equal(pluginsBtn().getAttribute('aria-current'), 'page');
    await act(async () => { pluginsBtn().click(); });
    assert.equal(env.panel.getSnapshot().activePanelId, null);
    assert.equal(pluginsBtn().hasAttribute('data-active'), false);
    assert.equal(pluginsBtn().getAttribute('aria-pressed'), 'false');

    // 4. Locale change updates footer panel aria-label dynamically via ctx.locale.subscribe.
    currentLang = 'zh';
    await act(async () => { env.locale.set({ id: 'zh', active: 'zh-CN' }); });
    assert.deepEqual(
      footerPanels().map((btn) => btn.getAttribute('aria-label')),
      ['插件', '自动化任务'],
    );
    currentLang = 'en';
    await act(async () => { env.locale.set({ id: 'en', active: 'en-US' }); });

    // 5. Adding 2 more panels (4 total) caps inline footer buttons at 4 total (Settings + 2 + More) and moves overflow into More menu.
    let disposeAlpha;
    let disposeBeta;
    await act(async () => {
      disposeAlpha = env.ctx.slots.register({
        name: 'sidebar.panellist', id: 'alpha', order: 20, label: () => labelsByLang[currentLang].alpha,
      }, () => React.createElement('svg', { 'data-host-icon': 'alpha' }));
      disposeBeta = env.ctx.slots.register({
        name: 'sidebar.panellist', id: 'beta', order: 40, label: () => labelsByLang[currentLang].beta,
      }, null);
    });
    assert.deepEqual(footerPanels().map((btn) => btn.getAttribute('data-panel-id')), ['plugins', 'schedules']);
    assert.equal(Boolean(moreBtn()), true);
    assert.equal(footerAllButtons().length, 4);

    // Open More menu -> focuses first item, renders factory + fallback icons, ArrowDown/Up navigates, click selects & activates.
    await act(async () => { moreBtn().click(); });
    assert.equal(Boolean(moreMenu()), true);
    assert.equal(moreBtn().getAttribute('aria-expanded'), 'true');
    const menuItems = () => [...moreMenu().querySelectorAll('[role="menuitem"]')];
    assert.deepEqual(menuItems().map((el) => el.getAttribute('data-panel-id')), ['alpha', 'beta']);
    assert.equal(Boolean(menuItems()[0].querySelector('svg[data-host-icon="alpha"]')), true);
    assert.equal(menuItems()[1].querySelectorAll('.t3i-foot-panel-glyph svg rect').length, 4, 'missing factory component renders panels fallback icon');
    assert.equal(document.activeElement === menuItems()[0], true);
    await act(async () => {
      menuItems()[0].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    assert.equal(document.activeElement === menuItems()[1], true);
    await act(async () => {
      menuItems()[1].dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    });
    assert.equal(document.activeElement === menuItems()[0], true);
    await act(async () => { menuItems()[0].click(); });
    assert.equal(env.panel.getSnapshot().activePanelId, 'alpha');
    assert.equal(Boolean(moreMenu()), false);
    assert.equal(moreBtn().getAttribute('data-active'), 'true');

    // Re-opening More menu shows checkmark on active overflow item and focuses it; Escape closes & restores focus to More button.
    await act(async () => { moreBtn().click(); });
    assert.equal(menuItems()[0].getAttribute('data-active'), 'true');
    assert.equal(Boolean(menuItems()[0].querySelector('.t3i-foot-panel-check')), true);
    assert.equal(document.activeElement === menuItems()[0], true);
    await act(async () => {
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    assert.equal(Boolean(moreMenu()), false);
    assert.equal(document.activeElement === moreBtn(), true);

    // Selecting active overflow item again toggles back to null and clears active highlight.
    await act(async () => { moreBtn().click(); });
    await act(async () => { menuItems()[0].click(); });
    assert.equal(env.panel.getSnapshot().activePanelId, null);
    assert.equal(moreBtn().hasAttribute('data-active'), false);

    // Unregistering overflow panels restores inline layout and removes More button.
    await act(async () => { disposeAlpha?.(); disposeBeta?.(); });
    assert.equal(Boolean(moreBtn()), false);
    assert.deepEqual(footerPanels().map((btn) => btn.getAttribute('data-panel-id')), ['plugins', 'schedules']);

    // 6. Global panels setting 'top' moves panels back to host top list; 'hidden' hides both.
    await act(async () => { env.runtime.setPanelsPosition('top'); });
    assert.equal(document.documentElement.getAttribute('data-t3-inbox-nav'), 'on');
    assert.notEqual(window.getComputedStyle(hostPanelsEl).display, 'none');
    assert.equal(footerPanels().length, 0);
    assert.equal(env.inspect.query('getViewState', {})?.rendered?.roots?.[0]?.shell?.panelsPosition, 'top');

    await act(async () => { env.runtime.setPanelsPosition('hidden'); });
    assert.equal(document.documentElement.getAttribute('data-t3-inbox-nav'), 'off');
    assert.equal(window.getComputedStyle(hostPanelsEl).display, 'none');
    assert.equal(footerPanels().length, 0);
  } finally {
    proto.getBoundingClientRect = origGetRect;
    document.elementFromPoint = origElementFromPoint;
    if (prevGetComputedStyle) Object.defineProperty(globalThis, 'getComputedStyle', prevGetComputedStyle);
    else delete globalThis.getComputedStyle;
    hostSidebar.remove();
    if (mounted) await act(async () => { mounted.root.unmount(); });
    globalThis.IS_REACT_ACT_ENVIRONMENT = oldActEnvironment;
    env.dispose();
  }
});
