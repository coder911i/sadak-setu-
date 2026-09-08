# Sadak Setu — Maintenance Lifecycle & State Machine

Sadak Setu is built upon a deterministic, audited finite state machine. Maintenance cases cannot transition arbitrarily; all status updates require authorization, validation, and historical persistence.

## State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> OPEN : Inspector creates case from AI defect
    OPEN --> ASSIGNED : Admin assigns Maintenance Team
    ASSIGNED --> IN_PROGRESS : Team accepts & starts repair
    IN_PROGRESS --> REPAIR_SUBMITTED : Team uploads post-repair photo
    REPAIR_SUBMITTED --> AI_VERIFICATION : Dual-evidence AI audit runs

    AI_VERIFICATION --> VERIFIED : AI Confirms defect eradicated (>85% conf)
    AI_VERIFICATION --> RETURNED_TO_TEAM : AI Rejects repair (<50% defect reduction)
    AI_VERIFICATION --> REVIEW_REQUIRED : Low confidence / visual ambiguity

    REVIEW_REQUIRED --> VERIFIED : Supervisor manual approval
    REVIEW_REQUIRED --> RETURNED_TO_TEAM : Supervisor manual rejection

    RETURNED_TO_TEAM --> IN_PROGRESS : Team addresses deficiencies
    VERIFIED --> CLOSED : Authority marks case complete
    CLOSED --> REOPENED : Defect recurs within warranty period
    REOPENED --> ASSIGNED : Re-assigned for remediation
```

## State Machine Rules & Roles

| From State | Allowed Next State | Permitted Roles | Required Data / Action |
|---|---|---|---|
| `OPEN` | `ASSIGNED` | `ADMIN` | `teamId`, `expectedCompletionDate` |
| `ASSIGNED` | `IN_PROGRESS` | `MAINTENANCE_TEAM` | On-site arrival confirmation |
| `IN_PROGRESS` | `REPAIR_SUBMITTED` | `MAINTENANCE_TEAM` | `afterMediaUrl`, notes, GPS |
| `REPAIR_SUBMITTED` | `AI_VERIFICATION` | System / Internal | Automatic trigger of comparison |
| `AI_VERIFICATION` | `VERIFIED` | System / AI | High confidence resolution |
| `AI_VERIFICATION` | `RETURNED_TO_TEAM`| System / AI | Defect persists in photo |
| `AI_VERIFICATION` | `REVIEW_REQUIRED` | System / AI | Ambiguous visual delta |
| Any Verification | `VERIFIED` / `RETURNED` | `AUTHORITY`, `ADMIN`| Manual supervisor override with mandatory reason |
| `VERIFIED` | `CLOSED` | `AUTHORITY`, `ADMIN`| Final signoff |

Every transition is appended to `MaintenanceStatusHistory` with the user ID, timestamp, and transition rationale.
