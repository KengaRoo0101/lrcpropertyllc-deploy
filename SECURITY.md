# Security Policy

LRC Property LLC treats security, ownership, user trust, and safe AI-assisted workflows as core operating requirements for this web ecosystem.

## Supported Scope

This policy applies to the LRC Property LLC web ecosystem in this repository, including:

- The LRC parent-company homepage
- Formed.
- Off Shoot
- JobsAI.
- SocialScan
- Be Happy.
- Careers and admin-facing support surfaces
- Shared Levi agent UI and workflow helpers

## Current Public Posture

The live site is public. Admin, API, payment, and access routes remain protected.

Current safeguards include:

- Admin access protection through `ADMIN_ACCESS_CODE`
- API JSON responses marked `noindex`, `nofollow`, and `noarchive`
- `robots.txt` allowing public pages while disallowing admin, API, access, and Stripe webhook routes
- Lead storage routed through the configured Cloudflare KV binding
- Public guidance against submitting secrets, passwords, full tax identifiers, banking information, or unrelated sensitive records

## Reporting a Vulnerability

Do not post secrets, passwords, access codes, private user data, or exploit details in a public GitHub issue.

To report a suspected issue, contact:

- `admin@lrcpropertyllc.com`

Please include:

- The affected page or route
- A short description of the issue
- Steps to reproduce, if safe to share
- Whether any data was exposed, modified, or submitted
- Browser/device details when relevant

## Handling Reports

LRC Property LLC will review reports and prioritize fixes based on impact, exploitability, and affected users.

Potential security issues may include:

- Bypass of preview password protection
- Unauthorized access to admin or lead data
- Exposure of secrets or private configuration
- Broken approval gates for actions that submit, send, publish, purchase, file, or change access
- Cross-site scripting or script injection
- Incorrect handling of private user submissions

## Not a Public Advisory by Default

Internal hardening work, preview password rotation, UI click fixes, cache-busting changes, and protected-site deployment updates should not be published as public vulnerability advisories unless there is a confirmed exploitable issue or confirmed unauthorized access.

Use a private security note or internal issue for routine hardening.

## Safe Operating Rules

- Do not commit passwords, API keys, access codes, private customer data, or `.env` style secrets.
- Do not expose the preview password in source files, logs, screenshots, public issues, or public advisories.
- Do not bypass paywalls, access controls, or browser safety warnings.
- Keep AI-assisted actions behind clear approval when they involve submissions, messages, payments, publishing, filings, permissions, or access changes.
- Keep ownership, copyright, and intellectual-property notices visible in user-facing legal pages.

## Advisory Template

If a confirmed vulnerability requires an advisory, use the following conservative structure.

### Impact

Describe what was vulnerable, who was affected, whether data was exposed or modified, and whether there is evidence of unauthorized access.

### Patches

List the commit, deployment, or version where the issue was fixed.

### Workarounds

Describe any temporary mitigation that does not require upgrading, such as disabling a route, rotating a secret, removing an exposed file, or keeping the site behind preview access.

### References

Link only to safe public references. Do not include secrets, private logs, private user data, or exploit instructions.

### Affected Products

List the affected LRC product or shared module.

### Severity

Assign severity based on actual impact and exploitability. If there is no confirmed exploit or exposure, keep the matter private as hardening rather than filing a public advisory.
