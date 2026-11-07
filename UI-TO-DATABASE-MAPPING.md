# UI-to-Database Mapping (Planning Only)

This document maps the local mock screens to backend responsibilities. The proposed schema is documented separately in [`DATABASE-SCHEMA.md`](./DATABASE-SCHEMA.md), with DDL in [`database/migrations/001_initial_schema.sql`](./database/migrations/001_initial_schema.sql). This page is not itself a schema, migration, seed script, or permission implementation. All preview data is fictional and remains in browser memory.

## Shared records

| UI data object | Future entity concepts | Notes |
|---|---|---|
| Demo accounts and role switch | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permission_overrides`, `staff_profiles`, verification/reset token tables | Preview role switching never authenticates; production role selection must be server-authorized. |
| Resident directory/profile | `residents`, resident verification reviews and private attachment metadata | Minimize returned personal fields and enforce resident self-scope. |
| Household register | `households`, `household_members` | Staff/admin scopes and resident self-view differ. |
| Document catalog | Document types, requirements, fees, availability | Fees and requirements need barangay confirmation. |
| Requests and request detail | `document_types`, requirements, `document_requests`, assignments, attachments, status history | Preserve transition actor/time and only allow permitted transitions. |
| Concerns | `concerns`, assignments, attachments, concern status history | Privacy/visibility rules must be agreed before implementation. |
| Announcements | `announcements`, audience rules | Public and internal visibility must be distinct. |
| Messages/notifications | `message_threads`, participants, `messages`, `notifications` | The prototype does not send notifications or messages. |
| Activity and audit screens | `audit_logs` | Audit records should be server-generated and protected from ordinary edits. |
| Dashboard/report samples | Aggregate query results over authorized records | Replace illustrative metrics with authorized database aggregates. |
| Settings forms | `system_settings` and account preferences | Validate and audit privileged system-wide changes. |

## Page-to-backend operation map

| Role / screen | Future server operations |
|---|---|
| Public home / announcements / contact | Read only published public content and approved service information. |
| Login / registration / recovery / reset | Authenticate, keep public account creation disabled until policy changes, verify email where adopted, issue and consume expiring reset tokens, rotate sessions. |
| Resident dashboard | Fetch only the signed-in resident’s request, household, concern, announcement, and notification summaries. |
| Resident profile / household | Read and update permitted self-service fields; restrict household member access and audit changes. |
| Resident document request / request list / details | List active document services, validate requirements, accept secure attachments, create request, show only the owner’s history/status, and allow eligible cancellation. |
| Resident concern / notifications / settings | Submit and track own concern, mark own notifications read, update permitted account preferences/password. |
| Staff dashboard / resident & household records / verification | Query only records permitted to assigned staff; record verification decisions and reviewer/time. |
| Staff document requests / concerns | Load assigned queues, securely review attachments, enforce allowed status changes, record assignment/history and required explanations. |
| Staff announcements / messages / activity | Draft/publish only if permission is granted; send/read authorized messages; retrieve server-generated activity. |
| Admin dashboard / reports | Return database-derived aggregates with an explicit date range and authorized export behavior. |
| Admin residents / households / staff | Perform authorized CRUD, staff approval/role assignment/deactivation, and append audit records. |
| Admin all requests / documents / concerns | Manage document catalog, monitor and assign cases, enforce transition rules, and record workflow history. |
| Admin announcements / audit / system settings | Publish audience-scoped notices, read protected append-only audit entries, update validated settings with audit events. |

## Preview data keys currently represented

`prototype.js` uses `requests`, `residents`, `households`, `staff`, `concerns`, `announcements`, `documents`, `messages`, `activity`, and `audit` arrays. Dashboard counters and report metrics are intentionally illustrative. `public-preview.js` has a separate fictional public announcement list. IDs use demo labels; names are generic sample labels, not resident records.

## Integration boundary

The local preview pages use no PHP include, authentication endpoint, PDO connection, or MySQL query. Production login and resident account requests use separate PHP endpoints backed by the applied schema. The remaining mock actions are not production features. Do not wire browser mock actions directly to production endpoints.
