# Universal Share Engine V1: Official Implementation Plan

Version: 2.0
Date: 2026-08-04

---

## 1. Overview

This document is the single source of truth for the Universal Share Engine V1. It merges the official 11-point V1 architecture with the foundational work already completed. The purpose is to create a comprehensive, multi-level referral and attribution system and the corresponding admin and user-facing modules to manage it.

This plan supersedes all previous share-related planning and aligns development with the official V1 goals for sharing, referral, and marketing analytics.

---

## 2. Official V1 Universal Share Engine Workflow

The following 11-point workflow is the locked, official standard for the V1 implementation.

1.  **Documentation Audit:** Understand the complete Share Engine documentation.
2.  **Final Share Engine Blueprint:** Visitor → Landing Page → Share Button → Share Link → Referral Detection → Registration → Internal User ID → Referral Save → Admin Reports.
3.  **Universal Share Coverage:** Must support Book, Demo Book, Product, Webinar, Agriculture, Health, Beauty, Business, Education, Digital AI, and All Landing Pages.
4.  **Referral Tree:** Support a multi-level `A → B → C` team structure.
5.  **Marketing Analytics:** Track Shares, Visitors, Clicks, Registration, Demo, Purchase, Referral, and Conversion.
6.  **Admin Share Module:** Includes Dashboard, Reports, Top Sharers, Referral Tree, Marketing Analytics, Conversion, and Share Management.
7.  **Coding & Integration:** To begin only after this blueprint is formally approved.
8.  **End-to-End Testing:** Cover Book, Demo Book, Registration, Landing Page, Referral, Admin, and Database interactions.
9.  **Git Workflow:** Feature Branch → Testing → Pull Request → Main Merge.
10. **Production Launch:** Online Testing (Mobile, Desktop) → Verification → Launch.
11. **User Profile & Privacy (`myprofile.html`):** Includes User Share History, Referral Summary, Team Summary, Registration Count, and Purchase Count, with admin-controlled visibility for private user data.

---

## 3. Architectural Deep Dive & V1 Gaps

This section details the new architectural requirements and how they expand upon the existing foundation.

### 3.1. Referral Tree (Point 4)

The existing foundation supports only a single-level `referrer_profile_id`. The V1 standard requires a database schema and business logic capable of supporting a multi-level referral tree (e.g., A refers B, who refers C). This will involve significant changes to `supabase.js` helpers and the user profile data structure to store and query parent/child relationships efficiently. This is the basis for the "Team Structure."

### 3.2. Admin Share Module (Point 6)

The current Admin Panel is a static, client-side skeleton with dummy data. The V1 standard requires a full-featured, data-driven module with secure, server-side authentication and RLS.

The new required components are:
- **Dashboard:** High-level overview of share-related KPIs.
- **Reports:** Detailed, filterable reports on all tracked marketing analytics.
- **Top Sharers:** Leaderboards for users generating the most traffic and conversions.
- **Referral Tree Explorer:** A UI to visualize user hierarchy and team structures.
- **Marketing Analytics:** Views for all metrics listed in Point 5.
- **Share Management:** Tools for admins to manage shareable campaigns or links.

### 3.3. User Profile & Privacy (Point 11)

A new or updated `myprofile.html` page is required. This page will serve as a user's personal dashboard for their sharing activity.

Key features include:
- **User Share History:** A log of assets the user has shared.
- **Referral & Team Summary:** High-level statistics on their referral network.
- **Counts:** Key metrics like Registration Count and Purchase Count from their referrals.
- **Privacy Controls:** The module must feature admin-controlled visibility settings to show or hide sensitive user data (State, District, Mobile, etc.) from other users in the referral tree.

---

## 4. Implementation Plan

Development will proceed in phases, with documentation approval required before coding begins for each phase.

-   **Phase 1: Schema & Backend:** Design and implement the new database schema for the multi-level referral tree. Update `supabase.js` with secure helpers for managing the tree and tracking all new analytics events.
-   **Phase 2: Admin Module:** Build out the complete, data-driven Admin Share Module with all required reports and visualizations. This includes replacing the dummy data provider (`js/admin-api.js`) with secure, RLS-protected endpoints.
-   **Phase 3: Frontend Integration:** Implement the user-facing "Share Button" on all required assets (Point 3). Update the registration flow to correctly handle the new referral tree logic.
-   **Phase 4: User Profile Module:** Build the `myprofile.html` page with all specified features and privacy controls.
-   **Phase 5: Testing & Launch:** Conduct rigorous end-to-end testing (Point 8) and follow the official Git (Point 9) and Launch (Point 10) workflows.

---

## Appendix: Completed Foundational Work (Historical Context)

The following notes are preserved from previous implementation phases and describe the foundational attribution system upon which the Universal Share Engine will be built.

### A.1. Initial Gap Analysis (Read-Only Summary)

-   **DB Integration:** `js/supabase.js` is the authoritative integration point.
-   **Session Management:** `session.js` uses `localStorage` and can be used for admin auth.
-   **Attribution Capture:** `registration.js` and `checkout.js` were already prepared for URL-based attribution capture.

### A.2. Phase-1 Foundation Extension (Implemented)

This phase added non-invasive core helpers for a future share engine.
-   **Files Introduced:**
    -   `js/share-engine-core.js`: For asset normalization, token generation, payload construction, and report shaping.
    -   `js/permissions-core.js`: For permission normalization and checks.
    -   `js/lead-owner-core.js`: For lead ownership assignment.
-   **Notes:** These are pure utility layers, not yet wired into user-facing flows.

### A.3. Phase-2 Attribution Integration (Implemented)

This phase extended existing flows with additive attribution capture.
-   **Files Changed:**
    -   `js/supabase.js`: Added safe share-context helpers and local persistence.
    -   `js/registration.js`: Added URL-based share/referral context capture.
    -   `js/checkout.js`: Added checkout-side attribution capture.
-   **Safety Notes:** The changes were backward-compatible and did not alter existing business flows, providing a safe foundation for the single-level attribution that must now be upgraded.

### A.4. Admin Panel Skeleton (Implemented)

- **UI Status:** A responsive, client-side placeholder UI was created for the admin panel (`/admin` folder).
- **Data Status:** The UI is powered by a local dummy-data provider (`js/admin-api.js`). No server-side keys or connections were implemented. It is not production-ready.
