import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** Cache branch by gitdir HEAD mtime so snapshot rebuilds stay cheap. */
const cache = new Map();

/**
 * Resolve the current branch (or short detached SHA) and worktree flag for a working directory.
 * Reads `.git/HEAD` (and worktree `gitdir:` files) — no `git` subprocess.
 * @param {string | null | undefined} cwd
 * @returns {{ branch: string | null, isWorktree: boolean }}
 */
export function readGitInfo(cwd) {
  const empty = { branch: null, isWorktree: false };
  if (typeof cwd !== 'string' || !cwd.trim()) return empty;
  let dir;
  try { dir = resolve(cwd); } catch { return empty; }
  for (let depth = 0; depth < 12; depth += 1) {
    const gitPath = join(dir, '.git');
    if (!existsSync(gitPath)) {
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
      continue;
    }
    let headPath = join(gitPath, 'HEAD');
    let isWorktree = false;
    try {
      const gitStat = statSync(gitPath);
      if (gitStat.isFile()) {
        const text = readFileSync(gitPath, 'utf8');
        const match = text.match(/^gitdir:\s*(.+)\s*$/m);
        if (!match) return empty;
        const gitdir = resolve(dir, match[1].trim());
        headPath = join(gitdir, 'HEAD');
        isWorktree = !/(?:^|[\\/])\.git[\\/]modules(?:[\\/]|$)/.test(gitdir);
      }
      if (!existsSync(headPath)) return { branch: null, isWorktree };
      const mtime = statSync(headPath).mtimeMs;
      const hit = cache.get(headPath);
      if (hit && hit.mtime === mtime && hit.isWorktree === isWorktree) return { branch: hit.branch, isWorktree: hit.isWorktree };
      const head = readFileSync(headPath, 'utf8').trim();
      let branch = null;
      if (head.startsWith('ref: refs/heads/')) branch = head.slice('ref: refs/heads/'.length) || null;
      else if (head.startsWith('ref: ')) {
        const ref = head.slice(5);
        branch = ref.split('/').pop() || ref;
      } else if (/^[0-9a-f]{7,40}$/i.test(head)) branch = head.slice(0, 7);
      cache.set(headPath, { mtime, branch, isWorktree });
      return { branch, isWorktree };
    } catch {
      return empty;
    }
  }
  return empty;
}

/**
 * Resolve the current branch (or short detached SHA) for a working directory.
 * @param {string | null | undefined} cwd
 * @returns {string | null}
 */
export function readGitBranch(cwd) {
  return readGitInfo(cwd).branch;
}
