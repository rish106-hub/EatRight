# Architecture Decision Records

Create one file per durable decision:

```text
NNNN-short-title.md
```

Template:

```md
# ADR-NNNN: Title

Status: Proposed | Accepted | Superseded | Rejected
Date:
Owners:

## Context

## Decision

## Alternatives considered

## Consequences

## Requirements/tests affected

## Migration or rollback
```

Do not use an ADR for routine implementation detail. Use it when the decision changes boundaries, data, security, deployment, or long-term architecture.
