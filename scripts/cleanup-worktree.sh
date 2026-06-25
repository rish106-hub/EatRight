#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 ]] || { echo "Usage: $0 <worktree-path>" >&2; exit 1; }
worktree="$1"
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Run this inside the main EatRight repository." >&2; exit 1; }
branch="$(git -C "$worktree" branch --show-current 2>/dev/null || true)"
[[ -n "$branch" ]] || { echo "Could not determine branch for $worktree" >&2; exit 1; }

if [[ -n "$(git -C "$worktree" status --porcelain)" ]]; then
  echo "Worktree has uncommitted changes; refusing cleanup." >&2
  exit 1
fi

git -C "$repo_root" worktree remove "$worktree"
if git -C "$repo_root" merge-base --is-ancestor "$branch" main; then
  git -C "$repo_root" branch -d "$branch"
else
  echo "Removed worktree, but branch is not merged; retained branch: $branch"
fi
git -C "$repo_root" worktree prune
