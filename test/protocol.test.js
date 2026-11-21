import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { TYPERT } from '../typert.js';

const validAction = {
  sessionId: 'a', operationId: 'operation-123', revision: 0, context: 'signed', kind: 'settle',
};

test('Host Typert manifest exposes strict unary and stream contracts', () => {
  assert.equal(TYPERT.package, 'dsh-t3-inbox');
  assert.equal(TYPERT.face, 'host');
  assert.equal(TYPERT.invocations.length, 6);
  const follow = TYPERT.invocations.find((item) => item.method === 'follow');
  assert.equal(follow.mode, 'stream');
  assert.equal(follow.cancellation.parameter, 'signal');
  const act = TYPERT.invocations.find((item) => item.method === 'act');
  assert.equal(act.invocation.kind, 'direct');
  assert.doesNotThrow(() => act.input({ strict: true }).create().parse({ request: validAction }));
  assert.throws(() => act.input({ strict: true }).create().parse({ request: { ...validAction, unexpected: true } }));
  assert.throws(() => act.input().create().parse({ request: { ...validAction, unexpected: true } }));
  const prepare = TYPERT.invocations.find((item) => item.method === 'prepare');
  assert.doesNotThrow(() => prepare.input({ strict:true }).create().parse({ request:{ sessionId:'a' } }));
  assert.throws(() => prepare.input({ strict:true }).create().parse({ request:{ sessionId:'a', extra:true } }));
  const save = TYPERT.invocations.find((item) => item.method === 'saveSnoozeSettings');
  assert.doesNotThrow(() => save.input({strict:true}).create().parse({request:{revision:0,presets:[]}}));
  assert.throws(() => save.input({strict:true}).create().parse({request:{revision:0,presets:[{kind:'after',minutes:43201}]}}));
});

test('Client mount receives strict descriptors before any view effect runs', async () => {
  let definition;
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true });
  globalThis.window = { __ModuleLoader__: { load: (value) => { definition = value; } } };
  await import('../client.js');
  const model = await import('../lib/model.js');
  const plugin = definition.factory((id) => {
    if (id === 'react') return { createElement: () => null };
    if (id === 'zod') return requireZod();
    if (id === 'dsh-t3-inbox/model') return model;
    throw new Error(`Unexpected external ${id}`);
  });
  let mounted;
  const ctx = {
    remote: { $mount: async (value) => { mounted = value; } },
    effect: () => {}, slots: { inject: () => {} }, locale: {}, on: () => {},
  };
  await plugin.apply(ctx);
  assert.equal(mounted.package, 'dsh-t3-inbox');
  assert.equal(mounted.descriptors.length, 6);
  for (const descriptor of mounted.descriptors) {
    assert.equal(descriptor.parameters[0].codec.mode, 'strict');
    assert.equal(descriptor.parameters[0].strictCodec.mode, 'strict');
    assert.equal(descriptor.cancellation.parameter, 'signal');
  }
  const act = mounted.descriptors.find((item) => item.method === 'act');
  assert.throws(() => act.parameters[0].codec.create().parse({ ...validAction, extra: true }));
  delete globalThis.window;
  if (localStorageDescriptor) Object.defineProperty(globalThis, 'localStorage', localStorageDescriptor);
  else delete globalThis.localStorage;
});

test('Package manifest keeps DSH host packages in peerDependencies, not dependencies', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(
    Object.keys(pkg.dependencies ?? {}).filter((name) => name.startsWith('@deepseek-ai/')),
    [],
  );
  assert.equal(typeof pkg.dependencies?.zod, 'string');
  assert.ok(pkg.dependencies.zod.length > 0);
  assert.equal(pkg.peerDependencies?.['@deepseek-ai/cordis'], '^4.1.0');
  assert.equal(pkg.peerDependencies?.['@deepseek-ai/dsh-typert-protocol'], '>=0.2.2-rc.1');
  assert.equal(typeof pkg.devDependencies?.['@deepseek-ai/cordis'], 'string');
  assert.ok(pkg.devDependencies['@deepseek-ai/cordis'].length > 0);
  assert.equal(typeof pkg.devDependencies?.['@deepseek-ai/dsh-typert-protocol'], 'string');
  assert.ok(pkg.devDependencies['@deepseek-ai/dsh-typert-protocol'].length > 0);
  assert.notEqual(pkg.private, true);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.icon, 'icon.svg');
  assert.equal(pkg.repository?.url, 'git+https://github.com/tungloong/dsh-t3-inbox.git');
  assert.equal(pkg.exports?.['./package.json'], './package.json');
  assert.equal(pkg.exports?.['./cordis.patch.yml'], './cordis.patch.yml');
  assert.equal(pkg.publishConfig?.access, 'public');
  assert.ok(Array.isArray(pkg.files) && pkg.files.includes('LICENSE'));
  assert.ok(readFileSync(new URL('../LICENSE', import.meta.url), 'utf8').includes('Copyright (c) 2026 tungloong'));
});

function requireZod() {
  return globalThis.__t3TestZod;
}

// Resolve through the package's installed dependency without adding a browser bundle.
const { z } = await import('zod');
globalThis.__t3TestZod = { z };
