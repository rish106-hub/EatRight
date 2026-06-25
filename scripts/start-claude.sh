#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Run this inside a task worktree." >&2; exit 1; }
branch="$(git -C "$repo_root" branch --show-current)"
[[ "$branch" != "main" && -n "$branch" ]] || { echo "Refusing to run a write agent on main. Create a task worktree first." >&2; exit 1; }

model="${CLAUDE_MODEL:-opus}"
effort="${CLAUDE_EFFORT:-medium}"
permission_mode="${CLAUDE_PERMISSION_MODE:-plan}"
session_name="${CLAUDE_SESSION_NAME:-$branch}"
prompt_file="${1:-}"

args=(--model "$model" --effort "$effort" --permission-mode "$permission_mode" --name "$session_name")

if [[ -n "$prompt_file" ]]; then
  [[ -f "$prompt_file" ]] || { echo "Prompt file not found: $prompt_file" >&2; exit 1; }
  exec claude "${args[@]}" "$(cat "$prompt_file")"
else
  exec claude "${args[@]}"
fi
