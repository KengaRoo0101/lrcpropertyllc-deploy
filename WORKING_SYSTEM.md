# LRC Working System

The system should feel like one working path, not a catalog.

## Finish Line

The finished product is:

1. LRC opens as the parent route.
2. Formed. produces the active business artifact first.
3. The artifact shows customer, offer, outcome, and next safe move.
4. The user approves before launch, publishing, filing, sending, or external action.
5. Checkout stays unavailable. No real-world payments are active.
6. Admin can review requests and signals without requiring a payment.

## One Useful Path

Default public flow:

```text
LRC Home → Recommended Route → Starter Artifact → Owner Approval → Preview, Contact, or Checkout
```

Supporting tools stay reachable, but they should support the active path instead of sending the user back into selection loops. Keep the work local until one clear output exists.

## Current Public Tools

- Formed. Business Builder: first offer, launch direction, approval-safe next move.
- JobsAI Work Match: role, applicant, resume, and matching support.
- Untapped Market Finder: audience, gap, and first-offer signal.
- SocialScan Trust Check: public profile and trust cleanup.
- Off Shoot Route Guide: reroute stalled work into a useful next path.
- Be Happy Daily Support: daily check-in, resources, and self-owned progress tools.
- Careers: applicant intake.
- Ninja: work manager across tasks, agents, blockers, approvals, and results.

## Backend Routes

Keep the backend centralized:

```text
POST /api/lead
POST /api/intake
POST /api/agent
POST /api/agent/activity
GET  /api/admin/summary
GET  /api/admin/checkout-diagnostic
GET  /api/admin/export
GET  /api/checkout-status
POST /create-checkout-session
GET  /api/health
```

Retired paths should not come back unless there is a clear product need.

## Agent Rules

Agents can:

- open the right local tool
- focus or prefill safe fields
- draft a local preview
- report status, blocker, approval status, allowed action, and result
- route to another LRC tool when that is clearly better

Agents ask for scoped approval before:

- refund or subscription change
- deletion
- upload
- external form submission
- publishing or posting
- filing
- sending messages
- booking or canceling
- access or permission changes
- sensitive-data transmission

Ninja can receive scoped access for the approved task. The rule is clear scope, clear approval,
one allowed action at a time, and a result log after the action.

## Checkout Rules

Checkout fails closed by default. Real-world payments are inactive.

Current payment rule:

- no payment checkout sessions
- no real-world payments
- no paid access unlocks
- review and contact paths only

Do not enable checkout unless the owner explicitly reverses this no-payment rule in code and config.

Older live-checkout requirements, kept only as historical context:

- `CHECKOUT_ENABLED=true`
- live `STRIPE_SECRET_KEY` or properly scoped live restricted key
- live active `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- refreshed deployment
- owner approval
- explicit reversal of the no-payment rule

Safe hold is use-ready. It should communicate clearly that real-world payments are inactive and avoid broken payment states.

## Verification

Use one command for launch-day readiness:

```bash
npm run check
```

That command runs:

- checkout configuration diagnostic
- payment hold regression
- ecosystem route/body regression

Payment checkout verification is not part of the current operating path.

## Admin

Local admin:

```text
http://localhost:3000/admin/
```

Production admin:

```text
https://www.lrcpropertyllc.com/admin/
```

Do not publish admin codes or secret values.
