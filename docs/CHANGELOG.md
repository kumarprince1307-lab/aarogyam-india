# CHANGELOG — Admin Panel V1

## [Unreleased] — Phase-1 (2026-08-02)
- Added: Phase-1 Implementation Plan at docs/V1_IMPLEMENTATION_PLAN.md. This file contains the Phase-1 plan, Gap Analysis, deliverables, and acceptance criteria.
- Added: Admin skeleton client files (js/admin-auth.js, js/admin-dashboard.js) as inert placeholders for Phase-2 work.

No production code or DB changes performed in Phase-1.

Phase-1 Task-2 (2026-08-02): Created Admin Panel V1 skeleton and file structure (safe, non-functional placeholders). Files created:
- admin/index.html
- admin/dashboard.html
- admin/users.html
- admin/purchases.html
- admin/downloads.html
- admin/reports.html
- admin/settings.html
- admin/README.md
- css/admin-panel.css
- css/admin-components.css
- js/admin-main.js
- js/admin-router.js
- js/admin-api.js
- js/admin-auth-client.js
- js/admin-utils.js
- js/admin-pages-dashboard.js
- js/admin-pages-users.js
- js/admin-pages-purchases.js
- js/admin-pages-downloads.js
- js/admin-pages-reports.js
- js/admin-components-header.js
- js/admin-components-sidebar.js
- js/admin-components-kpi.js
- js/admin-components-data-table.js

Notes: These are skeletons only and do not connect to Supabase, nor change existing website behavior.

## [Unreleased] — Admin UI Completion (2026-08-02)
- Completed: Full Admin Panel V1 UI (client-side, dummy data only). Pages updated for mobile-first responsive layout and expanded navigation.
- Added: Expandable sidebar menu with submenus and mobile hamburger toggle (js/admin-components-sidebar.js, css/admin-components.css).
- Added: Header controls: hamburger, search (global event), notifications, refresh, dark-mode placeholder, profile dropdown (js/admin-components-header.js).
- Enhanced: Dashboard with top-books, quick actions, activity, lead source visuals and responsive two-column layout (js/admin-pages-dashboard.js, css/admin-components.css).
- Integrated: Global search event into Users, Purchases, and Reports pages (js/admin-pages-users.js, js/admin-pages-purchases.js, js/admin-pages-reports.js).
- Created: Admin auth UI placeholders (admin/login.html, admin/register.html, admin/forgot-password.html) — UI only, no auth logic.
- Styling: Improved admin-panel.css and admin-components.css for fixed sidebar + header layout and responsive behavior.
- Updated: docs/V1_IMPLEMENTATION_PLAN.md to record progress and decisions.

Notes: All admin changes are UI-only, use dummy/mock data (js/admin-api.js). No Supabase or production logic modified. Keep admin pages isolated until Phase-2 server-side auth and API integration.

## [Unreleased] — Admin UI Completion
- Completed Admin Panel V1 UI modules with responsive dashboard, reports, users, purchases, downloads, and user details pages.
- Added admin auth placeholder pages: admin/login.html, admin/register.html, admin/forgot-password.html.
- Enhanced reports page with daily and total report cards, search and status filters, support for loading/empty/error states.
- Added user detail purchase history and activity timeline using dummy data.

## [Unreleased] — Phase-1 Share Engine Foundation (2026-08-03)
- Added: js/share-engine-core.js with additive helpers for asset normalization, share token generation, attribution payload creation, visitor-id persistence, and report-summary shaping.
- Added: js/permissions-core.js with additive helpers for normalized permissions, module visibility checks, and action-level permission evaluation.
- Added: js/lead-owner-core.js with additive helpers for permanent lead-owner assignment and lead-history entry creation.
- Updated: docs/V1_IMPLEMENTATION_PLAN.md to record the non-invasive Phase-1 foundation work.
- Notes: No existing public flow, registration, checkout, payment, download, library, or admin UI code was modified. The foundation is ready for later Phase-2 integration.

## [Unreleased] — Phase-2 Attribution Capture (2026-08-03)
- Extended: js/supabase.js to capture share/referral attribution from URL parameters and stored context, persist it locally, and pass it into registration/profile creation without breaking existing flows.
- Extended: js/registration.js to read share/referral context from the URL and preserve it through the registration process.
- Extended: js/checkout.js to preserve attribution context through checkout and store it with the current order payload.
- Notes: The implementation remains additive and safe. Existing registration, checkout, and payment logic continue to work; attribution is captured as metadata and stored locally first, with future database persistence handled through the same safe helper path.
