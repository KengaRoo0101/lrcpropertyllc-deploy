# LRC Property LLC Site

Productive Node/Express site and Cloudflare Pages/Worker package for the LRC Property LLC site family.

## Productive Flow

```bash
npm install
npm start
npm run check
```

`npm run check` runs the full launch-day verification:

- checkout configuration diagnostic
- checkout safe-hold regression
- public route/body regression

Safe hold is a passing state. Checkout must stay unavailable. No real-world payments are active.

## Public Path

Use one path first:

1. Open LRC.
2. Start with Formed.
3. Build the first offer artifact.
4. Request scoped approval at the gate.
5. Keep checkout unavailable. No real-world payments are active on this site.

Supporting tools remain available from the LRC umbrella, but they should not pull the user back into pathway loops.

## Checkout Rules

Public checkout fails closed. Real-world payments are inactive in code and config.

Current payment rule:

- no payment checkout sessions
- no real-world payments
- no paid access unlocks
- review and contact paths only

Do not enable checkout unless the owner explicitly reverses the no-payment rule in code and config.

Older live-payment readiness requirements, kept only as historical context:

- `CHECKOUT_ENABLED=true`
- `STRIPE_SECRET_KEY` is a live Stripe key or properly scoped live restricted key
- `STRIPE_PRICE_ID` is a live active Stripe price
- `STRIPE_WEBHOOK_SECRET` is configured
- the deployment has refreshed
- owner approval has been given
- the no-payment rule has been explicitly reversed

Keep secrets out of chat and public files.

Use this only if the no-payment rule is explicitly reversed later:

```bash
npm run check:checkout-config -- --require-live
```

Live-payment verification is not part of the current operating path.

## Guardrails

- Do not process real-world payments from the site.
- Require scoped approval for refund, subscription change, upload, deletion, publishing, filing, booking, access change, or external submission.
- Keep secret values out of chat, logs, public files, and diagnostic output.
- Agents prepare drafts, route work, generate local previews, request scoped access when needed, and continue once the guarded action is approved.
- Approved access is task-scoped: one purpose, one allowed action, one result log.
- Admin review works without completing a financial transaction.

## Key Paths

- `/` parent LRC route
- `/suite/` LRC Suite hub and product ecosystem overview
- `/ai-suite/` guided AI Suite onboarding and user-owned asset buildout
- `/formed/` active business-builder result path
- `/offshoot/` product lab / route guide
- `/jobsai/` job, resume, and role tooling
- `/socialscan/` public-presence review
- `/careers/` career opportunities and applicant intake
- `/behappy/` daily support and reflection tool
- `/product-lab/` secondary tools and prototype routes
- `/admin/` local/admin review
- `/ninja/` work manager
- `/success.html` checkout return page, held because real-world payments are inactive
- `/cancel.html` safe checkout return page

## Shared Suite Assets

- `/assets/lrc-system.css` contains the shared draft-mode shell, suite page styling, product-guide sections, focus states, and visual placeholder styles.
- `/assets/lrc-agent.js` contains the local-only intent routing and agent job runner. One owner-start action runs the local job from intake to route, starter artifact, review handoff, checklist, and approval gate. It does not perform external actions.
- `/assets/lrc-suite.js` adds the shared Suite link, product overview sections, FAQ/privacy notes, footer links, and simple form honeypots on public product pages.
- `/assets/lrc-suite-card.svg` is the local safe visual placeholder used for suite cards, visual proof panels, and Open Graph previews.
- `/404.html` provides a safe missing-page route back to Home and the LRC Suite.

## Safe Audits

Run these before deploy or before a broader suite copy pass:

```bash
npm run audit:links
npm run audit:alt
npm run audit:metadata
npm run audit:suite
```

The audit scripts are read-only. They report broken internal links, missing image alt attributes, missing metadata/H1 structure, and ecosystem route regressions. They do not send messages, post content, charge payments, publish, delete, or change accounts.

## Agent Job Runner

Public product pages use `Run local agent job` as the shared action. The job runner can:

- infer the page/product default job when the user has not typed a request
- route to the right workspace
- prepare the starter artifact
- show what work the agent completed
- produce a review handoff and checklist
- stop before payment, filing, publishing, messaging, upload, deletion, account access, checkout, or external change

This is intended to make the pages behave like working agents instead of button-only apps, while preserving the owner-approval boundary.

## Production Notes

Cloudflare needs:

- `LRC_LEADS` KV binding
- `ADMIN_ACCESS_CODE`
- `PUBLIC_URL=https://www.lrcpropertyllc.com`
- Stripe secrets are not needed while real-world payments are inactive

Run `npm run check` before deploy.

## GitHub and Live Deployment

Canonical GitHub repo:

- `KengaRoo0101/lrcpropertyllc-deploy`
- default branch: `main`

Cloudflare Pages project:

- project name: `lrcsite`
- live domain: `https://www.lrcpropertyllc.com`
- current live project mode: direct upload through Wrangler

Before publishing:

```bash
npm run check
npm run audit:suite
```

The live upload bundle should exclude local-only and source-support paths:

- dotfiles and `.github/`
- `node_modules/`
- `data/`
- `scripts/`
- `src/`
- `server.js`
- `package.json`
- `package-lock.json`
- Markdown files
- local secrets and admin-access files

GitHub Actions checks the site on pushes and pull requests. The manual Cloudflare deploy workflow is intentionally `workflow_dispatch` only. It requires repository secrets for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` before it can deploy.
