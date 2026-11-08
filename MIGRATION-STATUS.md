# PHP-to-SvelteKit Migration Status

## Status

The migration is **in progress and not ready for deployment or cutover**. The PHP application remains in the repository. No production database migration has been run, no records have been imported, and no deployment has been made.

## Existing-system inventory

| Area | Existing implementation | Data/backend notes |
|---|---|---|
| Sign-in and account requests | `index.html`, `bootstrap/login.php`, `server/register.php` | PHP session and MySQL account operations. |
| Dashboard | `dashboard.php` | Reads legacy `bgry_profiling` tables. |
| Residents | `resident.php` and related JavaScript | Records were kept in browser `localStorage`; they are not shared server-side records. |
| Households/families | `family.php`, `dont touch it/family-handler.php` | PHP/MySQL-backed legacy workflow. Preserve this handler until parity and data compatibility are verified. |
| Officials | `official.php` and related JavaScript | Records were kept in browser `localStorage`. |
| Certificates | `certificate.php` and related JavaScript | Records were kept in browser `localStorage`; the legacy print action displayed an alert rather than generating a document. |
| Information/profile | `info.php` | Existing page; no SvelteKit equivalent yet. |
| Secondary PHP endpoints/pages | `bootstrap/` | Includes a mostly placeholder/duplicate page set; it is not safe to delete based on names alone. |
| Database settings/session helpers | `server/config.php`, `server/session.php` | PHP-specific connection and session handling. |
| Database schema | `database/migrations/001_initial_schema.sql` | Creates `barangay_san_isidro`, explicitly separate from the legacy `bgry_profiling` database. It is not proof that the live database has this schema. |

This inventory is based on repository source inspection. The deployed database and its live contents have not been independently inspected.

## Implemented SvelteKit surface

The new application is alongside, not in place of, the PHP application:

| SvelteKit route | Implemented behavior |
|---|---|
| `/` | Database-backed sign-in and resident account registration. |
| `/logout` | Server-side session logout. |
| `/dashboard` | Database-backed summary page. |
| `/residents` | Resident CRUD and household-member linkage. |
| `/households` | Household and head/member management. |
| `/officials` | Official roster management, including contact details. |
| `/users` | Account approval/status and role management with safeguards. |
| `/certificates` | Document requests and workflow status transitions; admin certificate register CRUD, search/filter, archive/restore. |
| `/certificates/[certificateId]` | Admin-only printable preview for issued certificate records. |
| `/info` | Barangay profile read/update through the `system_settings` JSON record, with explicit empty state until verified values are entered. |
| `/announcements` | Role/audience-filtered published announcements; administrator draft, publish, edit, and archive controls. |
| `/concerns` | Resident submission and own-record reads; admin/staff views, administrator assignment, assigned-staff workflow updates, history, and notifications. |
| `/messages` | Participant-only message threads, role-limited thread creation, replies, read positions, and notifications. The supplied schema grants base messaging permissions to staff and administrators, not residents. |
| `/notifications` | Per-account notification list and read/mark-all-read actions, scoped to the signed-in user. |

Authentication uses opaque server-managed sessions, PHP bcrypt `$2y$` prefix compatibility, and server-side role checks. This has not been validated against a PHP-generated production hash or the live database.

## Database compatibility and data preservation

- The new server connection requires `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_SSL_CA`; TLS certificate verification is enabled.
- Migrations `002_app_sessions.sql` and `003_profile_and_certificate_fields.sql` are additive proposals. They have **not** been applied.
- Migration `001` creates a separate schema and does not migrate the legacy `bgry_profiling` tables. Confirm the actual target schema and take a backup before reviewing any migration.
- Resident, official, and certificate browser-storage records are origin-specific. They are not automatically available to a new Vercel origin. No export/import or reconciliation tool has been implemented.
- No SQL has been run against production, and no database records have been changed by this migration work.
- The printable certificate is a generic preview using the recorded fields. It has no approved seal, official branding, or verified signature data; approve the template before official use.

## Remaining work before parity or deployment

1. Inspect and map the actual deployed database, legacy table definitions, and existing records. Review migrations against that schema before applying anything.
2. Implement and test a reviewed, non-destructive transfer for existing MySQL records and browser `localStorage` records.
3. Implement the remaining resident-verification review and attachment-storage workflows, document-catalog management, and other legacy workflows identified by the final page-by-page comparison.
4. Confirm route-level permissions for every workflow and test all roles against the actual database.
5. Validate certificate wording, approval/signature requirements, and any official template with the barangay.
6. Run database integration tests using approved test accounts/data, browser tests at desktop/mobile sizes, and the complete deployment build.
7. Obtain user approval before any production migration, PHP removal, or Vercel cutover.

## Validation performed

- `npm run check`: passed with 0 errors and 0 warnings before subsequent certificate-filter, notifications, announcements, concerns, messaging, and information-route edits. A final check is currently blocked because the local Windows Node executable exits with code `-1073741502` before printing diagnostics.
- `npm test`: passed earlier (2 password-hash compatibility tests); tests were not rerun after the recent route additions because Node stopped starting. These are unit tests, not live PHP/database integration tests.
- `git diff --check`: passed.
- `npm run build`: could not be verified. The command exited with Windows code `-1073741502` without build output; afterward the local Node executable also failed to start. This is not a successful build and does not establish whether the application can build on Vercel.
- No live database, login, CRUD, permission, print, or browser-layout test has been completed.

## Vercel setup when the remaining work is complete

1. Keep the official Vercel adapter configured in `vite.config.ts`; use the package's `npm run build` script and a supported Node.js 22+ runtime.
2. Add the six database variables as server-only Vercel environment variables. Set `DB_SSL_CA` to the trusted CA PEM contents and keep certificate verification enabled. Do not put credentials in client-side variables or commit a filled-in `.env` file.
3. Ensure the managed MySQL provider allows connections from the Vercel deployment and supports the configured TLS CA.
4. Review and apply only the approved additive migrations after verifying the target schema and backup.
5. Deploy only after the outstanding migrations, integration tests, data transfer, and user approval are complete. No deployment was performed by this work.
