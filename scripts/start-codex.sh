#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Run this inside a task worktree." >&2; exit 1; }
branch="$(git -C "$repo_root" branch --show-current)"
[[ "$branch" != "main" && -n "$branch" ]] || { echo "Refusing to run a write agent on main. Create a task worktree first." >&2; exit 1; }

model="${CODEX_MODEL:-gpt-5.5}"
effort="${CODEX_REASONING_EFFORT:-high}"
prompt_file="${1:-}"

args=(--model "$model" -c "model_reasoning_effort=\"$effort\"" --sandbox workspace-write --ask-for-approval on-request)

if [[ -n "$prompt_file" ]]; then
  [[ -f "$prompt_file" ]] || { echo "Prompt file not found: $prompt_file" >&2; exit 1; }
  exec codex "${args[@]}" "$(cat "$prompt_file")"
else
  exec codex "${args[@]}"
fi
