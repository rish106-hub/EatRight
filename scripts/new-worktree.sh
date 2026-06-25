#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <codex|claude|human> <FMD-###> <slug>" >&2
  echo "Example: $0 codex FMD-001 repo-bootstrap" >&2
  exit 1
}

[[ $# -eq 3 ]] || usage
agent="$1"
task_id="$2"
slug="$3"

case "$agent" in codex|claude|human) ;; *) usage ;; esac
[[ "$task_id" =~ ^FMD-[0-9]{3}$ ]] || usage
[[ "$slug" =~ ^[a-z0-9-]+$ ]] || usage

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Run this inside the EatRight git repository." >&2; exit 1; }

repo_name="$(basename "$repo_root")"
repo_parent="$(dirname "$repo_root")"
branch="${agent}/${task_id}-${slug}"
worktree="${repo_parent}/${repo_name}-${agent}-${task_id}"

if [[ -n "$(git -C "$repo_root" status --porcelain)" ]]; then
  echo "Main checkout has uncommitted changes. Commit or stash them first." >&2
  exit 1
fi

git -C "$repo_root" fetch --prune origin 2>/dev/null || true
git -C "$repo_root" switch main
git -C "$repo_root" pull --ff-only origin main 2>/dev/null || true

if [[ -e "$worktree" ]]; then
  echo "Worktree path already exists: $worktree" >&2
  exit 1
fi

if git -C "$repo_root" show-ref --verify --quiet "refs/heads/$branch"; then
  git -C "$repo_root" worktree add "$worktree" "$branch"
else
  git -C "$repo_root" worktree add "$worktree" -b "$branch" main
fi

printf '\nCreated:\n  branch:   %s\n  worktree: %s\n' "$branch" "$worktree"
printf '\nNext:\n  cd %q\n' "$worktree"
