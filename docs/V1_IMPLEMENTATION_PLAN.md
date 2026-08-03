# Admin Panel V1 — Phase-1 Implementation Plan

Version: V1 Phase-1
Date: 2026-08-02

Overview
- Purpose: Prepare and document a safe, stepwise Phase-1 plan for introducing a locked Admin Panel V1 while guaranteeing the live selling website continues to operate exactly as today.
- Constraints:
  - V1 only.
  - No modifications to working features in Phase-1 unless explicitly authorized.
  - All Phase-1 work is documentation and the creation of isolated admin skeleton files only. No changes to registration, checkout, payment, my library, demo book, downloads, wallet, or selling flow.

Phase-1 Objectives
1. Create and record the Phase-1 Implementation Plan and changelog in docs/.
2. Produce a read-only Gap Analysis (inventory of integration points and schema needs) and record findings here.
3. Create the minimal, safest admin skeleton files (client-side only) that do not run automatically nor alter existing behavior.
4. Prepare exact SQL ALTER statements and a Phase-2 patch plan (will be drafted in Phase-1 but not executed until approved).

Phase-1 Deliverables (created in this iteration)
- docs/V1_IMPLEMENTATION_PLAN.md (this file)
- docs/CHANGELOG.md (new changelog entry for Phase-1)
- js/admin-auth.js (safe skeleton, not referenced by public pages)
- js/admin-dashboard.js (safe skeleton, not referenced by public pages)

Gap Analysis (read-only summary)
- Existing authoritative DB integration point: js/supabase.js — all profile, purchases, download logs and registration helpers live here.
- Session management: session.js — site-wide session abstraction uses localStorage keys AI_USER, AI_PROFILE, AI_SESSION. Admin auth should use this for identifying the currently logged-in profile.
- Registration flow: registration.js already supports a source URL param and calls registerUser(formData) — safe for later attribution capture.
- Checkout flow: checkout.js builds orderData and calls registerUser() before payment. This ensures attribution saved at checkout if we pass it.
- Purchases: purchases.js reads purchases table using supabase client. Admin read-only UI can reuse same client methods.

Immediate Gap items for Phase-2 (do not implement now):
- DB schema additions: purchases.{acquisition_source, referrer_profile_id, tracking_token, utm_*}, profiles.is_admin, download_logs.{acquisition_source,tracking_token,referrer_profile_id}, all NULLABLE or with safe defaults.
- Admin auth server-side enforcement: require Supabase RLS or a secure server-side admin token for privileged queries. Phase-1 will only design the approach.

Phase-1 Tasks (explicit)
- Task A: Documentation (create this file and docs/CHANGELOG.md).
- Task B: Create admin-skeleton JS files (admin-auth.js, admin-dashboard.js) that are inert and not included in any public page. These are placeholders for Phase-2.
- Task C: Draft SQL ALTER statements (kept in Phase-1 docs, not executed).
- Task D: Produce Phase-2 patch plan (line-level edits, tests, rollback). Drafted in Phase-1 docs but not executed.

Acceptance criteria for Phase-1
- The docs files exist at docs/V1_IMPLEMENTATION_PLAN.md and docs/CHANGELOG.md with exact approved content.
- The admin-skeleton files exist under js/ and do not alter public pages or flows.
- No existing file is modified.
- No database changes are executed.
- A Gap Analysis is captured in this document.

Testing and Verification (Phase-1)
- Confirm that the new docs and admin JS files exist and contain the planned content.
- Confirm git status (no modified files other than new files created).
- Confirm that no public page references the new admin JS files (no automatic execution).

Future Phase-2 (high level, not implemented in Phase-1)
- Add read-only admin helper functions to js/supabase.js (only used by /admin pages).
- Create static admin pages (admin/dashboard.html, admin/users.html, admin/purchases.html) and protect them with a secure admin-auth mechanism (server-side or RLS enforced).
- Add DB columns for attribution (NULLABLE) and add attribution capture in script.js (first-touch) and propagate attribution in registration and checkout flows via feature-flag.
- QA in staging, then gradual rollout with monitoring and rollback plan.

Notes & Constraints (must be followed)
- Do not touch payment/checkout/registration/demo/book/my-library/downloads/wallet/selling flow in Phase-1.
- All Phase-1 changes are reversible and non-invasive (create-only; no edits to existing files).
- All V2 or V3 ideas are to be left as TODO comments in admin skeleton files only.

Contact
- Reply to this message to approve Phase-2 planning or to request modifications to Phase-1 artifacts.

Task-2 completed in Phase-1: Admin Panel skeleton created. See docs/CHANGELOG.md for created files list.

Update: The Admin Panel V1 UI has been extended to a full responsive Phase-1 placeholder experience with dashboard, reports, users, purchases, downloads, and admin auth screens.

Decisions made during Admin UI Completion (recorded):
- Admin UI will remain entirely client-side in V1 and use a local dummy-data provider (js/admin-api.js). No server-side keys or service_role tokens will be added.
- Admin pages are intentionally static files under /admin and must be deployed only to a protected area in Phase-2. Do NOT expose these under the public site until server-side auth and RLS are implemented.
- Global search is implemented as a custom DOM event (admin:global-search) to avoid tight coupling between header and page modules.
- Sidebar submenus are expandable client-side only. Permission gating will be implemented in Phase-2 server-side or at render time after a secure auth check.

Next steps (Phase-2 preparation):
- Implement secure server-side admin authentication and RLS-protected endpoints before enabling admin pages in production.
- Replace js/admin-api.js dummy provider with secured endpoints or server-proxied Supabase queries.
- Add export and charting modules (CSV/Excel export, chart library integration) as needed.

Phase-1 Foundation Extension (implemented)
- Scope: add non-invasive core helpers for a future Universal Share Engine without altering the current website, registration, payments, admin UI, or user flows.
- Files introduced:
  - js/share-engine-core.js: asset normalization, share token generation, attribution payload construction, visitor-id helpers, and report-summary shaping.
  - js/permissions-core.js: permission normalization, module visibility checks, and action-level permission helpers.
  - js/lead-owner-core.js: permanent lead-owner assignment helpers and history-entry construction.
- Design notes:
  - These modules are pure utility layers and are not wired into any existing page or flow yet.
  - They are safe to keep in place for Phase-2 integration and can be imported later by existing modules without changing current behavior.
  - The implementation deliberately avoids touching current registration, checkout, payment, library, downloads, or admin UI code paths.
- Verification:
  - JavaScript syntax was checked for each new module.
  - No public page was modified.
  - No database changes were executed.
  - No existing functionality was altered.

End of Phase-1 Implementation Plan

Phase-2 Implementation (implemented)
- Scope: extend the existing registration and checkout flows with additive attribution capture while preserving all current behavior.
- Files changed:
  - js/supabase.js: added safe share-context helpers, local persistence, and registration attribution capture that feeds profile creation and future share-event tracking without breaking current flows.
  - js/registration.js: added URL-based share/referral context capture and preservation during registration.
  - js/checkout.js: added checkout-side attribution capture and order payload enrichment using the same context helpers.
- Safety notes:
  - No existing UI structure or business flow was removed or replaced.
  - Attribution is captured as metadata and stored locally first; the Supabase helper gracefully tolerates missing tables or connection issues.
  - This keeps the system backward-compatible while preparing for later admin reporting and share analytics.

End of Phase-1 Implementation Plan
