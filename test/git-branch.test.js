import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readGitBranch, readGitInfo } from '../lib/git-branch.js';

const pluginRoot = fileURLToPath(new URL('..', import.meta.url));

describe('readGitBranch', () => {
  it('reads the live plugin repo branch', () => {
    const branch = readGitBranch(pluginRoot);
    assert.equal(typeof branch, 'string');
    assert.ok(branch.length > 0);
  });

  it('returns null outside a git tree', () => {
    const dir = mkdtempSync(join(tmpdir(), 't3i-nogit-'));
    try {
      assert.equal(readGitBranch(dir), null);
      assert.equal(readGitBranch(null), null);
      assert.equal(readGitBranch(''), null);
      assert.deepEqual(readGitInfo(dir), { branch: null, isWorktree: false });
      assert.deepEqual(readGitInfo(null), { branch: null, isWorktree: false });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('parses detached HEAD as a short sha', () => {
    const dir = mkdtempSync(join(tmpdir(), 't3i-detach-'));
    try {
      mkdirSync(join(dir, '.git'));
      writeFileSync(join(dir, '.git', 'HEAD'), 'abcdef0123456789abcdef0123456789abcdef01\n');
      assert.equal(readGitBranch(dir), 'abcdef0');
      assert.deepEqual(readGitInfo(dir), { branch: 'abcdef0', isWorktree: false });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('follows worktree gitdir files', () => {
    const root = mkdtempSync(join(tmpdir(), 't3i-wt-'));
    try {
      const gitdir = join(root, 'actual-git');
      mkdirSync(gitdir);
      writeFileSync(join(gitdir, 'HEAD'), 'ref: refs/heads/feature/meta-line\n');
      const work = join(root, 'work');
      mkdirSync(work);
      writeFileSync(join(work, '.git'), `gitdir: ${gitdir}\n`);
      assert.equal(readGitBranch(work), 'feature/meta-line');
      assert.deepEqual(readGitInfo(work), { branch: 'feature/meta-line', isWorktree: true });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not misclassify git submodules (.git/modules/*) as worktrees', () => {
    const root = mkdtempSync(join(tmpdir(), 't3i-submod-'));
    try {
      const moduleGitdir = join(root, '.git', 'modules', 'deps', 'lib');
      mkdirSync(moduleGitdir, { recursive: true });
      writeFileSync(join(moduleGitdir, 'HEAD'), 'ref: refs/heads/release\n');
      const sub = join(root, 'deps', 'lib');
      mkdirSync(sub, { recursive: true });
      writeFileSync(join(sub, '.git'), `gitdir: ${moduleGitdir}\n`);
      assert.deepEqual(readGitInfo(sub), { branch: 'release', isWorktree: false });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
