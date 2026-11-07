# Brgy-profilling

## Production and deployment status

- Apache serves the root `index.html`, which now uses the prototype's visual style for a production login and resident account-request form. The other preview pages remain mock-only, are not connected to PHP/MySQL, and are excluded from the Docker image.
- Resident account requests are stored in the applied `barangay_san_isidro` schema with a hashed password, resident-only role, and `pending_approval` status. Login permits only active accounts with an assigned role. There is not yet an administrator approval interface or full role-based portal authorization.
- Existing signed-in PHP pages still query legacy `bgry_profiling` tables. They have not been adapted to the Aiven schema; dashboard statistics and data modules can fail against `barangay_san_isidro`.
- The Docker image binds Apache to Render's `PORT` (default `10000`), excludes preview/documentation and certificate files, and denies direct HTTP access to backend/configuration directories. Render still needs to be configured to deploy the `main` branch and supplied the `DB_*` environment values and Aiven CA Secret File described in [DATABASE-CONNECTION.md](./DATABASE-CONNECTION.md).

ISSUE TO FIX ##family.php and I already fix the ##don't touch it/family-handler.php

##ALL FUNCTIONS IS INSIDE THE SAID ISSUE

## Phase 11 refinement status

### Existing system assessment

- `index.html` is the login and resident account-request UI. Login authenticates through `bootstrap/login.php`; registration posts to `server/register.php`.
- The root pages `dashboard.php`, `family.php`, `resident.php`, `official.php`, `info.php`, and `certificate.php` are the primary signed-in interface.
- `family.php` reads and writes through `dont touch it/family-handler.php` and MySQL. The resident, official, and certificate pages currently use browser `localStorage`; they are not shared database records.
- `bootstrap/` contains a second, mostly placeholder set of pages and a duplicate registration endpoint. These are not the primary page set.
- Login now checks `users.account_status`, verifies `password_hash`, and requires an assigned role in `user_roles`. Registration can only assign `resident`, and requests await admin activation. Page-level role authorization, email verification, approval UI, password recovery, and role-specific dashboards are not implemented.
- `server/config.php` reads Aiven-compatible credentials and the TLS CA path from environment variables. The owner reports the `barangay_san_isidro` migration has been applied; the live connection was not verified. A verified barangay logo asset was not present.

### Prioritized improvement plan

1. **Shared design and current-page usability — implemented in this pass.** Use one tokenized responsive stylesheet, improve authentication accessibility, and remove misleading demo records and statistics.
2. **Existing feature reliability — partial.** Improve empty/error states and verify existing PHP/MySQL operations against the real configured database.
3. **Account and authorization policy — partial.** Resident-only account requests and role-aware login are connected to the proposed schema. Admin approval UI, per-page permission checks, and staff/admin portal workflows remain unimplemented; do not treat the old PHP pages as role-separated.
4. **Service workflows — pending.** Define and implement database-backed resident profiles, document requests, concerns, announcements, notifications, and status history.
5. **Full QA — pending.** Test each role and permitted action against the running PHP/MySQL application after the above workflows exist.

### Implemented changes

- Added a shared responsive design layer in `styles.css` for the login page and the six primary signed-in pages, using the requested color palette and an Inter/Poppins-first local font stack.
- Standardized the page shell, navigation spacing, cards, buttons, form controls, tables, and modal sizing.
- Added visible keyboard focus, keyboard-operable navigation items, current-page indicators, mobile menu state announcements, and Escape-to-close behavior.
- Consolidated the duplicate login submit handlers into `js/auth.js`; added password visibility controls, accessible status messages, field constraints, and duplicate-submit protection.
- Regenerated the session ID after successful login and made login/registration database errors generic to users while retaining diagnostic server logging.
- Added a resident account-request form and server handler that stores a hashed password, a resident profile, and only the resident role in one transaction. Accounts remain pending approval; the public endpoint cannot grant staff or administrator roles.
- Updated login to verify the new schema's password hash and account status, require an assigned role, and create a secure SameSite session. Logout now expires the session cookie.
- Routed logout through the server session endpoint on every primary signed-in page and surfaced failures rather than silently treating them as success.
- Removed fabricated dashboard activity and sample rows from resident, official, and certificate browser-storage views. Dashboard totals remain database queries and show an explicit error state on database failure.
- Replaced the unconfigured barangay profile and its static figures with an explicit setup message.
- Added explanatory browser-storage notices and helpful empty states to the relevant record lists.

### Frontend prototype page inventory

The following are designed mock screens in `ui-prototype.html`, not connected portals:

- **Resident (10):** Dashboard; Resident Profile; Household Information; Document Requests; My Requests; Request Details; Announcements; Report a Concern; Notifications; Account Settings.
- **Staff (9):** Dashboard; Resident Records; Household Records; Resident Verification; Assigned Requests; Concerns & Complaints; Announcements; Messages; Activity History.
- **Admin (11):** Dashboard; Resident Management; Household Management; Staff Management; Document Management; All Requests; Concerns & Complaints; Announcements; Reports & Analytics; Audit Logs; System Settings.
- **Public (7):** Homepage; Login; Registration; Forgot Password; Reset Password; Announcements; Contact. These are isolated mock routes in `public-preview.html`.
- **Authentication preview:** The prototype's extra forgot/reset and email-verification screens remain mock-only. The production sign-in and resident account request use PHP endpoints; requests remain pending until an administrator activates them.

### QA results and remaining recommendations

- Added `ui-prototype.html`, an isolated role-based front-end preview that does not connect to authentication, PHP handlers, or a database.
- The prototype includes Resident, Staff, and Administrator navigation groups and representative dashboard/list/detail/form screens for every requested navigation area.
- `all-pages-preview.html` is the local-only 37-page directory and QA dashboard. It links directly to the seven public previews and all 30 role-specific mock screens, reports legacy implementation status separately from mock design availability, and offers role/status filters and search.
- The directory is limited to `file:` and localhost origins. Its role switcher is a prototype control only, not a way to authenticate or access protected PHP data.
- The directory reports 37 planned pages, 14 related legacy screens (existing, partial, or closed), 23 missing legacy workflows, seven legacy screens with incomplete behavior, and 37 designed preview screens. Its per-page manual review boxes are kept in browser `localStorage` and are intentionally not pre-checked by automated smoke tests.
- Prototype interactions include role/page switching, collapsible and mobile navigation, a notification dropdown, searchable/filterable/paginated sample tables, record details, an illustrative document-request wizard, mock concern/announcement/document/profile forms, confirmation before sample cancellation, sample request status progression, toast feedback, and authentication-state screen previews.
- The document-request wizard includes service selection, purpose/details, optional PDF/JPEG/PNG attachment selection (5 MB each, local preview only), review, and a completion state. Chosen files are not uploaded or saved.
- Browser-tested the request wizard with a valid PDF, a disallowed file type, and an over-5-MB PDF; valid files appear in the review step, and invalid/oversized files are rejected with feedback.
- Resident “My requests” is scoped to the sample resident; the staff queue shows requests assigned to the sample staff account; administrator lists remain broader. These are demo filters, not authorization controls.
- The production login and account-request screens at `index.html` use the responsive split-screen visual language from the prototype. The extra mock authentication states remain unavailable in production.
- Browser-tested all 37 public and role-specific preview routes at 320, 375, 768, 1024, and 1440 CSS px (185 route/viewport checks): all routes had a heading, with no page-level horizontal overflow or JavaScript page errors. The catalog records each route as responsive-smoke-checked; this does not certify every visual or accessibility detail.
- Verified direct preview links, zero catalog route-target errors, directory role filtering and search, review-checkbox persistence/reset, and the reported page counts. Tested switching from Resident to Staff and Admin and navigating to assigned/all requests; the Staff table headers and cells align.
- Tested public preview form validation, password visibility, announcement search/filter/modal behavior, and mobile navigation. Request Details retains its demo request ID across refresh; returning to My Requests uses the existing back-navigation behavior.
- Also tested resident request scoping and required-field validation, the request review/completion flow, staff assignment columns, administrator pagination/search, settings submission feedback, notification dropdown, mock auth copy, Escape-to-close, and mobile sidebar open/navigate/close state.
- Fixed the mobile navigation scrim so it is hidden while the menu is closed; verified that request-detail links work at 320 px and that opening the Staff menu, navigating, and closing it works at 375 px.
- The existing sign-in page was previously browser-checked at the same target widths for password visibility, login error feedback, and duplicate-submit protection.
- The previous prototype smoke tests do not cover the new production registration flow. PHP/MySQL account-request and login endpoints were not exercised in this workspace.
- The page directory, preview catalog, public mock routes, and mock page actions are not connected to production PHP authorization or MySQL. Mock submissions, updates, and deletions are not permanently saved.
- Workspace diagnostics reported no errors in the changed files. No automated test suite or PHP CLI was available in this environment.
- PHP/MySQL authentication, family CRUD, role journeys, and authorization could not be integration-tested without the configured database and PHP server.
- Resident roles are assigned only by the registration endpoint, but the current authenticated PHP modules do not enforce role-specific permissions. Do not treat the current interface as complete Resident, Staff, or Admin portals.
- Resident, official, and certificate records still need migration from browser storage to authorized server-side persistence before they can support shared government workflows.
- Forgot/reset password and email verification are not implemented. The current UI does not pretend these workflows are available.
- Supply an approved barangay logo and verified profile/contact details before displaying them publicly.
- All prototype names, statistics, request statuses, announcements, staff details, and concerns are fictional sample data defined in `prototype.js`; interactions update only the current page’s in-memory demo state and are lost on refresh.
- See [UI-TO-DATABASE-MAPPING.md](./UI-TO-DATABASE-MAPPING.md) for the mock-screen/backend mapping. The separate proposed schema is documented in [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md), with the baseline SQL migration at [001_initial_schema.sql](./database/migrations/001_initial_schema.sql).

### Mock data and user-flow preview

- **Mock records:** resident and household references; staff assignments; document services/requirements/fees; eight example requests with illustrative statuses and staff assignments; concerns; announcements; messages; activity and audit events; notifications; dashboard metrics and report figures.
- **Resident flow preview:** sign-in design → closed account-request notice/mock verification states → resident dashboard → choose document → enter purpose/details and optional sample attachment → review → demo completion → track the resident’s sample requests. No account is verified and no request is submitted.
- **Staff flow preview:** sign in → assigned queue → inspect a sample record/update its illustrative status; resident verification and concern/activity pages are design-only. No staff account or permission is created.
- **Admin flow preview:** dashboard → browse resident/household/staff/document/request/concern lists → inspect reports/audit → preview system settings. Metrics and actions do not reflect or change live records.
- **Concern flow preview:** open the report form → required category/description validation → demo confirmation. Assignment, investigation, resolution, notification, and closure are not persisted workflows.

### Database schema and PHP operations

The owner approved database work and a separate initial schema has been produced for review. The schema and migration are **not yet applied**, and PHP has **not** been connected to the new database. See [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) for the ERD, table inventory, compatibility boundary, and safe application notes.

The following server operations remain unimplemented:

| Area | Candidate entities | Required server-side operations |
|---|---|---|
| Identity and access | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permission_overrides`, `staff_profiles`, email verification/reset tokens | Admin approval interface, account deactivation, email verification, password reset, and permission checks on every protected request (signup/login endpoints are implemented) |
| Residents and households | `residents`, `households`, `household_members`, `resident_verification_reviews` | Read/update a resident’s own profile and household; authorized staff/admin directory search, verification decisions, household CRUD, audit changes |
| Documents | `document_types`, `document_requirements`, `document_requests`, `document_request_assignments`, `request_attachments`, `request_status_history` | List available services, submit/cancel eligible requests, securely store and authorize attachment access, assign/review/correct/reject/approve/release, record status history |
| Concerns and communication | `concerns`, `concern_assignments`, `concern_attachments`, `concern_status_history`, `announcements`, `message_threads`, `thread_participants`, `messages`, `notifications` | Submit and scope concerns, assign/investigate/resolve/close, publish/audience-filter notices, read/send messages, create/mark notifications read |
| Oversight and configuration | `audit_logs`, `system_settings` | Write append-only audit events for privileged changes, authorize report queries/exports, validate and audit settings updates |

### Backend work needed per role page

- **Resident:** dashboard aggregates only the signed-in resident’s authorized records; profile/household reads and validated self-updates; document catalog reads and request/attachment submission, tracking, eligible cancellation and release instructions; announcement reads; concern submission and own-case tracking; messages/notifications read and mark-read; account settings/password updates.
- **Staff:** dashboard and queue restricted to assigned work; permission-scoped resident/household search; verification review decisions; assigned request document/attachment review and allowed status transitions; concern assignment/action/closure within permissions; announcement drafting; message handling; server-generated activity history.
- **Admin:** database-derived dashboard metrics; resident/household/staff CRUD and verification/activation; document catalog and requirements management; full request/concern oversight and assignments; announcement publishing; authorized reports; append-only audit-log viewing; validated system settings. Every action must enforce authorization on the server and audit sensitive changes.

### Database integration status

- Created the baseline schema script and schema documentation after the owner approved database work.
- The owner reports that the migration was applied to Aiven. The production login and registration endpoints now target its `users`, `residents`, `roles`, and `user_roles` tables; the live connection was not verified and no legacy-data migration was confirmed.
- `server/config.php` now requires environment variables for the Aiven host, port, database name, user, password, and CA certificate path. No credentials are stored in the repository. See [DATABASE-CONNECTION.md](./DATABASE-CONNECTION.md) for setup.
- Login checks active account status and requires a role; registration creates only pending resident accounts. There is no approval UI or page-level permission enforcement. Other CRUD, file-storage, and workflow integrations are not claimed.
- Before applying the migration or integrating PHP, review the schema/status transitions and confirm document fees/requirements, concern privacy, retention rules, and staff approval policy. Inspect and back up the existing database before planning any legacy data migration.

The legacy PHP pages are not replaced by these mock screens. Authentication now uses the new schema, but existing modules and their handlers still target legacy tables and need a deliberate integration pass.
