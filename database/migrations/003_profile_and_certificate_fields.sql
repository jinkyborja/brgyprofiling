-- Additive migration for profile fields and certificate records not present in 001.
-- Inspect the target schema and back up the database before applying.
USE barangay_san_isidro;

ALTER TABLE residents
    ADD COLUMN education VARCHAR(80) NULL AFTER civil_status,
    ADD COLUMN disability VARCHAR(120) NULL AFTER education,
    ADD COLUMN religion VARCHAR(120) NULL AFTER disability;

ALTER TABLE officials
    ADD COLUMN email VARCHAR(254) NULL AFTER contact_number;

CREATE TABLE certificate_records (
    certificate_record_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    certificate_code VARCHAR(40) NOT NULL,
    request_id BIGINT UNSIGNED NULL,
    resident_id BIGINT UNSIGNED NULL,
    certificate_type VARCHAR(120) NOT NULL,
    recipient_name VARCHAR(200) NOT NULL,
    recipient_address VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    date_issued DATE NOT NULL,
    valid_until DATE NULL,
    status ENUM('Issued', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Pending',
    fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks TEXT NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    archived_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (certificate_record_id),
    UNIQUE KEY uq_certificate_records_code (certificate_code),
    KEY ix_certificate_records_status_date (status, date_issued, archived_at),
    KEY ix_certificate_records_recipient (recipient_name, date_issued),
    KEY ix_certificate_records_request (request_id),
    KEY ix_certificate_records_resident (resident_id),
    CONSTRAINT ck_certificate_records_fee
        CHECK (fee >= 0),
    CONSTRAINT fk_certificate_records_request
        FOREIGN KEY (request_id) REFERENCES document_requests (request_id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_certificate_records_resident
        FOREIGN KEY (resident_id) REFERENCES residents (resident_id)
        ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_certificate_records_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE=InnoDB;

INSERT INTO schema_migrations (version) VALUES ('003_profile_and_certificate_fields');
