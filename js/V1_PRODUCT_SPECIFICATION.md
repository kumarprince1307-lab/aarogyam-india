# Aarogyam India V1 Product Specification (LOCK)

This document becomes part of the project documentation.

This is now the official V1 roadmap.


---

## V1 Goal

The objective is NOT to build a developer platform.

The objective is to build a production-ready website for real users.

The website must be simple, fast, mobile-first and easy for farmers.

Everything should focus on:

**Visitor → Registration → Purchase → Reader → Download → Return**

Nothing else.


---

## V1 PWA

Convert the entire website into a Progressive Web App.

However, only implement features required for current users.

The PWA should include:

- Home
- Book Details
- Checkout
- Payment Success
- Login
- My Library
- Reader
- Download
- Profile


No Wallet.

No Rewards.

No Notifications.

No Offline Reader.

Those belong to V2.


---

## PWA Install Experience

The website should intelligently encourage installation.

**Requirements:**

When a visitor opens the website, detect whether the app is already installed.

If not, show a beautiful install popup.

Example:

> **Install Aarogyam India App**
>
> ✔️ Faster
>
> ✔️ Better Reading
>
> ✔️ Easy Access
>
> [Install Now] [Maybe Later]

Never force installation.

Use standard PWA install APIs.


---

## Installation Analytics

Record PWA installation events.

Admin should know:

- Total Install Requests
- Successful Installs
- Install Rejected
- Install Rate

This is required.


---

## User Authentication

Current session system is temporary.

V1 requires a proper Login page.

Create:

- `login.html`
- `login.css`
- `login.js`

The login system must become the common entry point.

Every protected page should use it.

Example:

- Reader
- Download
- My Library
- Profile
- Purchased Books

All should use one common session.


---

## Purchase Flow

The purchase flow must become stable.

Current bugs around:

- Purchase Modal
- Download Modal
- Access Validation

...must be fixed before V1 Lock.

No new features until these are stable.


---

## Admin Panel V1

Keep it simple.

No dashboard charts.

No analytics graphs.

No complicated management.

Only essential information.

**Admin should be able to view:**

### Users
- Name
- Mobile
- Email
- Registration Date
- State
- District
- Books Purchased
- Downloads
- Last Login

### Purchase History
- Book
- Amount
- Date
- Payment Status
- Transaction ID

### Download History
- User
- Book
- Download Count
- Date

### Visitor Source
Track where users come from.

Examples:
- Direct
- WhatsApp
- Facebook
- Instagram
- YouTube
- Google
- Referral
- Unknown

Store this for every visitor if possible.

### Business Report
Admin should see:
- Daily Users
- New Registrations
- Purchases
- Downloads
- Conversion Rate
- Most Viewed Book
- Most Purchased Book
- Install Count


---

## Documentation Rules

Whenever a feature is added, update:

- `PROJECT.md`
- `CHANGELOG.md`
- `DEVLOG.md`
- `TODO.md`
- `UI_AUDIT.md`

Never leave documentation outdated.


---

## Development Rule

Build V1 only.

Keep everything simple.

Avoid unnecessary features.

Do not redesign working modules.

**Fix bugs first.**

Then improve UI.

Then complete Admin.

Then PWA.

Then V1 Lock.


---

## Final Principle

Every engineering decision must answer one question:

**"Will this make the experience easier for a real farmer using the Aarogyam India website?"**

If the answer is No, do not include it in V1.

---

## Engineering Rule

A module must never be marked as Complete until the entire user workflow has been tested end-to-end and all existing related functionality has been verified to still work.