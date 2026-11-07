-- Barangay San Isidro Information Management System
-- MySQL 8.0.16+ / InnoDB / utf8mb4
-- Apply once to a new, empty database. This schema is separate from the
-- existing legacy database named bgry_profiling.

CREATE DATABASE barangay_san_isidro
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE barangay_san_isidro;

SET time_zone = '+00:00';

CREATE TABLE schema_migrations (
    version VARCHAR(100) NOT NULL,
    applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (version)
) ENGINE=InnoDB;

CREATE TABLE roles (
    role_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    role_code VARCHAR(40) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    description VARCHAR(255) NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (role_id),
    UNIQUE KEY uq_roles_code (role_code)
) ENGINE=InnoDB;

CREATE TABLE permissions (
    permission_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    permission_code VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    PRIMARY KEY (permission_id),
    UNIQUE KEY uq_permissions_code (permission_code)
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status ENUM(
        'pending_email',
        'pending_approval',
        'active',
        'suspended',
        'deactivated'
    ) NOT NULL DEFAULT 'pending_approval',
    email_verified_at DATETIME(3) NULL,
    last_login_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    KEY ix_users_status_created (account_status, created_at)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
    role_id SMALLINT UNSIGNED NOT NULL,
    permission_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
        ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions (permission_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id, role_id),
    KEY ix_user_roles_role (role_id, user_id),
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_user_roles_assigned_by
        FOREIGN KEY (assigned_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE user_permission_overrides (
    user_id BIGINT UNSIGNED NOT NULL,
    permission_id SMALLINT UNSIGNED NOT NULL,
    effect ENUM('allow', 'deny') NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (user_id, permission_id),
    KEY ix_user_permission_overrides_permission (permission_id, user_id),
    CONSTRAINT fk_user_permission_overrides_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_user_permission_overrides_permission
        FOREIGN KEY (permission_id) REFERENCES permissions (permission_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_user_permission_overrides_assigned_by
        FOREIGN KEY (assigned_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE staff_profiles (
    staff_profile_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    staff_code VARCHAR(40) NOT NULL,
    job_title VARCHAR(120) NULL,
    department VARCHAR(120) NULL,
    staff_status ENUM('pending_approval', 'active', 'inactive') NOT NULL DEFAULT 'pending_approval',
    approved_by_user_id BIGINT UNSIGNED NULL,
    approved_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (staff_profile_id),
    UNIQUE KEY uq_staff_profiles_user (user_id),
    UNIQUE KEY uq_staff_profiles_code (staff_code),
    KEY ix_staff_profiles_status_title (staff_status, job_title),
    CONSTRAINT fk_staff_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_staff_profiles_approver
        FOREIGN KEY (approved_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE email_verification_tokens (
    token_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash BINARY(32) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    used_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (token_id),
    UNIQUE KEY uq_email_verification_token_hash (token_hash),
    KEY ix_email_verification_user_expiry (user_id, expires_at),
    CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
    token_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash BINARY(32) NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    used_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (token_id),
    UNIQUE KEY uq_password_reset_token_hash (token_hash),
    KEY ix_password_reset_user_expiry (user_id, expires_at),
    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE residents (
    resident_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    resident_code VARCHAR(40) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20) NULL,
    birth_date DATE NULL,
    sex VARCHAR(32) NULL,
    civil_status VARCHAR(32) NULL,
    contact_number VARCHAR(32) NULL,
    verification_status ENUM(
        'unverified',
        'pending_review',
        'needs_information',
        'verified',
        'rejected'
    ) NOT NULL DEFAULT 'unverified',
    record_status ENUM('active', 'inactive', 'deceased') NOT NULL DEFAULT 'active',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (resident_id),
    UNIQUE KEY uq_residents_user (user_id),
    UNIQUE KEY uq_residents_code (resident_code),
    KEY ix_residents_name (last_name, first_name, middle_name),
    KEY ix_residents_verification (verification_status, record_status),
    CONSTRAINT fk_residents_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE households (
    household_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    household_code VARCHAR(40) NOT NULL,
    household_name VARCHAR(160) NULL,
    address_line VARCHAR(255) NOT NULL,
    purok VARCHAR(80) NULL,
    city_municipality VARCHAR(120) NULL,
    province VARCHAR(120) NULL,
    postal_code VARCHAR(20) NULL,
    archived_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (household_id),
    UNIQUE KEY uq_households_code (household_code),
    KEY ix_households_purok (purok, archived_at)
) ENGINE=InnoDB;

CREATE TABLE household_members (
    household_member_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    household_id BIGINT UNSIGNED NOT NULL,
    resident_id BIGINT UNSIGNED NOT NULL,
    relationship_to_head VARCHAR(40) NULL,
    is_head BOOLEAN NOT NULL DEFAULT FALSE,
    joined_on DATE NOT NULL,
    left_on DATE NULL,
    active_resident_id BIGINT UNSIGNED
        GENERATED ALWAYS AS (
            CASE WHEN left_on IS NULL THEN resident_id ELSE NULL END
        ) STORED,
    active_household_head_id BIGINT UNSIGNED
        GENERATED ALWAYS AS (
            CASE WHEN left_on IS NULL AND is_head = TRUE THEN household_id ELSE NULL END
        ) STORED,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (household_member_id),
    UNIQUE KEY uq_household_members_active_resident (active_resident_id),
    UNIQUE KEY uq_household_members_active_head (active_household_head_id),
    KEY ix_household_members_household (household_id, left_on),
    KEY ix_household_members_resident (resident_id, left_on),
    CONSTRAINT ck_household_member_dates
        CHECK (left_on IS NULL OR left_on >= joined_on),
    CONSTRAINT fk_household_members_household
        FOREIGN KEY (household_id) REFERENCES households (household_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_household_members_resident
        FOREIGN KEY (resident_id) REFERENCES residents (resident_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE resident_verification_reviews (
    review_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    resident_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending_review', 'needs_information', 'verified', 'rejected') NOT NULL,
    review_notes TEXT NULL,
    submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    reviewed_by_user_id BIGINT UNSIGNED NULL,
    reviewed_at DATETIME(3) NULL,
    PRIMARY KEY (review_id),
    KEY ix_resident_reviews_resident_date (resident_id, submitted_at),
    KEY ix_resident_reviews_queue (status, submitted_at),
    KEY ix_resident_reviews_reviewer (reviewed_by_user_id, reviewed_at),
    CONSTRAINT fk_resident_reviews_resident
        FOREIGN KEY (resident_id) REFERENCES residents (resident_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_resident_reviews_reviewer
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE resident_verification_attachments (
    attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    review_id BIGINT UNSIGNED NOT NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    detected_mime_type VARCHAR(120) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    sha256 BINARY(32) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (attachment_id),
    UNIQUE KEY uq_resident_verification_storage_key (storage_key),
    KEY ix_resident_verification_files_review (review_id, created_at),
    CONSTRAINT fk_resident_verification_files_review
        FOREIGN KEY (review_id) REFERENCES resident_verification_reviews (review_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_resident_verification_files_uploader
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE officials (
    official_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    official_code VARCHAR(40) NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20) NULL,
    position_title VARCHAR(120) NOT NULL,
    term_start DATE NULL,
    term_end DATE NULL,
    contact_number VARCHAR(32) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (official_id),
    UNIQUE KEY uq_officials_code (official_code),
    UNIQUE KEY uq_officials_user (user_id),
    KEY ix_officials_active_term (is_active, term_start, term_end),
    CONSTRAINT ck_official_term_dates
        CHECK (term_end IS NULL OR term_start IS NULL OR term_end >= term_start),
    CONSTRAINT fk_officials_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE document_types (
    document_type_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    document_code VARCHAR(40) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    fee DECIMAL(10, 2) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (document_type_id),
    UNIQUE KEY uq_document_types_code (document_code),
    KEY ix_document_types_availability (is_available, name),
    CONSTRAINT ck_document_types_fee
        CHECK (fee IS NULL OR fee >= 0),
    CONSTRAINT fk_document_types_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE document_requirements (
    requirement_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    document_type_id BIGINT UNSIGNED NOT NULL,
    requirement_text VARCHAR(500) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    display_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (requirement_id),
    UNIQUE KEY uq_document_requirement_order (document_type_id, display_order),
    CONSTRAINT fk_document_requirements_type
        FOREIGN KEY (document_type_id) REFERENCES document_types (document_type_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE document_requests (
    request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_code VARCHAR(40) NOT NULL,
    resident_id BIGINT UNSIGNED NOT NULL,
    document_type_id BIGINT UNSIGNED NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    resident_notes TEXT NULL,
    status ENUM(
        'submitted',
        'queued',
        'in_review',
        'correction_required',
        'approved',
        'rejected',
        'ready_for_release',
        'released',
        'cancelled'
    ) NOT NULL DEFAULT 'submitted',
    submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    release_instructions TEXT NULL,
    released_at DATETIME(3) NULL,
    PRIMARY KEY (request_id),
    UNIQUE KEY uq_document_requests_code (request_code),
    KEY ix_document_requests_resident_date (resident_id, submitted_at),
    KEY ix_document_requests_status_date (status, submitted_at),
    KEY ix_document_requests_type_status (document_type_id, status),
    CONSTRAINT fk_document_requests_resident
        FOREIGN KEY (resident_id) REFERENCES residents (resident_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_document_requests_type
        FOREIGN KEY (document_type_id) REFERENCES document_types (document_type_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE document_request_assignments (
    assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    staff_user_id BIGINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    unassigned_at DATETIME(3) NULL,
    PRIMARY KEY (assignment_id),
    KEY ix_request_assignments_staff_active (staff_user_id, unassigned_at, assigned_at),
    KEY ix_request_assignments_request (request_id, assigned_at),
    CONSTRAINT ck_request_assignment_dates
        CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at),
    CONSTRAINT fk_request_assignments_request
        FOREIGN KEY (request_id) REFERENCES document_requests (request_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_request_assignments_staff
        FOREIGN KEY (staff_user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_request_assignments_assigner
        FOREIGN KEY (assigned_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE request_attachments (
    attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    requirement_id BIGINT UNSIGNED NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    detected_mime_type VARCHAR(120) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    sha256 BINARY(32) NOT NULL,
    uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (attachment_id),
    UNIQUE KEY uq_request_attachments_storage_key (storage_key),
    KEY ix_request_attachments_request (request_id, uploaded_at),
    KEY ix_request_attachments_requirement (requirement_id),
    CONSTRAINT fk_request_attachments_request
        FOREIGN KEY (request_id) REFERENCES document_requests (request_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_request_attachments_requirement
        FOREIGN KEY (requirement_id) REFERENCES document_requirements (requirement_id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_request_attachments_uploader
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE request_status_history (
    history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    from_status ENUM(
        'submitted',
        'queued',
        'in_review',
        'correction_required',
        'approved',
        'rejected',
        'ready_for_release',
        'released',
        'cancelled'
    ) NULL,
    to_status ENUM(
        'submitted',
        'queued',
        'in_review',
        'correction_required',
        'approved',
        'rejected',
        'ready_for_release',
        'released',
        'cancelled'
    ) NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    reason TEXT NULL,
    changed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (history_id),
    KEY ix_request_history_request_date (request_id, changed_at),
    KEY ix_request_history_actor_date (changed_by_user_id, changed_at),
    CONSTRAINT fk_request_history_request
        FOREIGN KEY (request_id) REFERENCES document_requests (request_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_request_history_actor
        FOREIGN KEY (changed_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE concerns (
    concern_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    concern_code VARCHAR(40) NOT NULL,
    resident_id BIGINT UNSIGNED NOT NULL,
    category VARCHAR(80) NOT NULL,
    subject VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    status ENUM(
        'submitted',
        'assigned',
        'investigating',
        'awaiting_resident',
        'resolved',
        'closed',
        'rejected',
        'cancelled'
    ) NOT NULL DEFAULT 'submitted',
    submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    closed_at DATETIME(3) NULL,
    PRIMARY KEY (concern_id),
    UNIQUE KEY uq_concerns_code (concern_code),
    KEY ix_concerns_resident_date (resident_id, submitted_at),
    KEY ix_concerns_status_priority_date (status, priority, submitted_at),
    CONSTRAINT fk_concerns_resident
        FOREIGN KEY (resident_id) REFERENCES residents (resident_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE concern_assignments (
    assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    concern_id BIGINT UNSIGNED NOT NULL,
    staff_user_id BIGINT UNSIGNED NOT NULL,
    assigned_by_user_id BIGINT UNSIGNED NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    unassigned_at DATETIME(3) NULL,
    PRIMARY KEY (assignment_id),
    KEY ix_concern_assignments_staff_active (staff_user_id, unassigned_at, assigned_at),
    KEY ix_concern_assignments_concern (concern_id, assigned_at),
    CONSTRAINT ck_concern_assignment_dates
        CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at),
    CONSTRAINT fk_concern_assignments_concern
        FOREIGN KEY (concern_id) REFERENCES concerns (concern_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_concern_assignments_staff
        FOREIGN KEY (staff_user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_concern_assignments_assigner
        FOREIGN KEY (assigned_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE concern_attachments (
    attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    concern_id BIGINT UNSIGNED NOT NULL,
    uploaded_by_user_id BIGINT UNSIGNED NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    detected_mime_type VARCHAR(120) NOT NULL,
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    sha256 BINARY(32) NOT NULL,
    uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (attachment_id),
    UNIQUE KEY uq_concern_attachments_storage_key (storage_key),
    KEY ix_concern_attachments_concern (concern_id, uploaded_at),
    CONSTRAINT fk_concern_attachments_concern
        FOREIGN KEY (concern_id) REFERENCES concerns (concern_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_concern_attachments_uploader
        FOREIGN KEY (uploaded_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE concern_status_history (
    history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    concern_id BIGINT UNSIGNED NOT NULL,
    from_status ENUM(
        'submitted',
        'assigned',
        'investigating',
        'awaiting_resident',
        'resolved',
        'closed',
        'rejected',
        'cancelled'
    ) NULL,
    to_status ENUM(
        'submitted',
        'assigned',
        'investigating',
        'awaiting_resident',
        'resolved',
        'closed',
        'rejected',
        'cancelled'
    ) NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    reason TEXT NULL,
    changed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (history_id),
    KEY ix_concern_history_concern_date (concern_id, changed_at),
    KEY ix_concern_history_actor_date (changed_by_user_id, changed_at),
    CONSTRAINT fk_concern_history_concern
        FOREIGN KEY (concern_id) REFERENCES concerns (concern_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_concern_history_actor
        FOREIGN KEY (changed_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE announcements (
    announcement_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(180) NOT NULL,
    body TEXT NOT NULL,
    audience ENUM('public', 'residents', 'staff', 'all_users') NOT NULL,
    target_purok VARCHAR(80) NULL,
    status ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
    publish_at DATETIME(3) NULL,
    published_at DATETIME(3) NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    published_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (announcement_id),
    KEY ix_announcements_publication (status, audience, publish_at),
    KEY ix_announcements_author (created_by_user_id, created_at),
    CONSTRAINT fk_announcements_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_announcements_publisher
        FOREIGN KEY (published_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE message_threads (
    thread_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    subject VARCHAR(180) NOT NULL,
    created_by_user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (thread_id),
    KEY ix_message_threads_creator_date (created_by_user_id, created_at),
    CONSTRAINT fk_message_threads_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE thread_participants (
    thread_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    last_read_at DATETIME(3) NULL,
    PRIMARY KEY (thread_id, user_id),
    KEY ix_thread_participants_user_read (user_id, last_read_at),
    CONSTRAINT fk_thread_participants_thread
        FOREIGN KEY (thread_id) REFERENCES message_threads (thread_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_thread_participants_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE messages (
    message_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    thread_id BIGINT UNSIGNED NOT NULL,
    sender_user_id BIGINT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    sent_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (message_id),
    KEY ix_messages_thread_date (thread_id, sent_at),
    KEY ix_messages_sender_date (sender_user_id, sent_at),
    CONSTRAINT fk_messages_thread
        FOREIGN KEY (thread_id) REFERENCES message_threads (thread_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    notification_type VARCHAR(60) NOT NULL,
    title VARCHAR(180) NOT NULL,
    body VARCHAR(1000) NOT NULL,
    related_entity_type VARCHAR(60) NULL,
    related_entity_id BIGINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    read_at DATETIME(3) NULL,
    PRIMARY KEY (notification_id),
    KEY ix_notifications_user_unread (user_id, read_at, created_at),
    KEY ix_notifications_related (related_entity_type, related_entity_id),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    audit_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    actor_user_id BIGINT UNSIGNED NULL,
    action_code VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NULL,
    request_id VARCHAR(80) NULL,
    ip_address VARBINARY(16) NULL,
    user_agent VARCHAR(500) NULL,
    metadata JSON NULL,
    occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (audit_log_id),
    KEY ix_audit_logs_date (occurred_at),
    KEY ix_audit_logs_actor_date (actor_user_id, occurred_at),
    KEY ix_audit_logs_entity_date (entity_type, entity_id, occurred_at),
    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE system_settings (
    setting_key VARCHAR(120) NOT NULL,
    setting_value JSON NOT NULL,
    description VARCHAR(255) NULL,
    updated_by_user_id BIGINT UNSIGNED NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (setting_key),
    KEY ix_system_settings_updated_by (updated_by_user_id, updated_at),
    CONSTRAINT fk_system_settings_updater
        FOREIGN KEY (updated_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

INSERT INTO roles (role_code, display_name, description) VALUES
    ('resident', 'Resident', 'Resident self-service access.'),
    ('staff', 'Staff', 'Assigned barangay operational access.'),
    ('admin', 'Administrator', 'Administrative access; must be granted by an authorized administrator.');

INSERT INTO permissions (permission_code, description) VALUES
    ('announcements.read', 'Read announcements visible to the account role.'),
    ('concerns.self.create', 'Submit a concern for the signed-in resident.'),
    ('concerns.self.read', 'Read concerns belonging to the signed-in resident.'),
    ('concerns.assigned.read', 'Read concerns assigned to the staff member.'),
    ('concerns.assigned.update', 'Update permitted states for assigned concerns.'),
    ('documents.manage', 'Manage the document catalog and requirements.'),
    ('households.read', 'Read household records within server-authorized scope.'),
    ('messages.read', 'Read messages in threads the user participates in.'),
    ('messages.send', 'Send messages in threads the user participates in.'),
    ('notifications.self.read', 'Read and update the signed-in user notifications.'),
    ('reports.read', 'Read authorized aggregate reports.'),
    ('requests.self.cancel', 'Cancel eligible requests belonging to the signed-in resident.'),
    ('requests.self.create', 'Create document requests for the signed-in resident.'),
    ('requests.self.read', 'Read requests belonging to the signed-in resident.'),
    ('requests.assigned.read', 'Read document requests assigned to the staff member.'),
    ('requests.assigned.update', 'Review and update permitted assigned requests.'),
    ('residents.read', 'Read resident records within server-authorized scope.'),
    ('residents.self.read', 'Read the signed-in resident profile.'),
    ('residents.self.update', 'Update permitted fields in the signed-in resident profile.'),
    ('residents.verify', 'Review and record resident verification decisions.'),
    ('staff.manage', 'Manage staff accounts, roles, and permission overrides.'),
    ('system.audit.read', 'Read protected audit history.'),
    ('system.settings.manage', 'Manage validated system settings.'),
    ('users.manage', 'Manage resident accounts and administrative account status.');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles AS r
JOIN permissions AS p ON p.permission_code IN (
    'announcements.read',
    'concerns.self.create',
    'concerns.self.read',
    'notifications.self.read',
    'requests.self.cancel',
    'requests.self.create',
    'requests.self.read',
    'residents.self.read',
    'residents.self.update'
)
WHERE r.role_code = 'resident';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles AS r
JOIN permissions AS p ON p.permission_code IN (
    'announcements.read',
    'concerns.assigned.read',
    'concerns.assigned.update',
    'households.read',
    'messages.read',
    'messages.send',
    'notifications.self.read',
    'requests.assigned.read',
    'requests.assigned.update',
    'residents.read',
    'residents.verify'
)
WHERE r.role_code = 'staff';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles AS r
JOIN permissions AS p
WHERE r.role_code = 'admin';

INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');
