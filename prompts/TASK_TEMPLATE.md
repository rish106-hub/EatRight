# Agent Task Prompt Template

Paste `prompts/SHARED_BOOTSTRAP.md`, then append:

```text
Agent role: Codex | Claude
Task ID:
Task title:
Branch:
Owned paths:
Dependencies already merged:
Required context files:
Requirement IDs:
Acceptance tests:
Explicit exclusions:
Staging access available: yes/no
Real Swiggy mutation possible in this task: no
Expected PR output:
```

Do not give two agents overlapping owned paths in the same iteration.
