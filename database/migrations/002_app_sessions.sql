-- Additive migration required for durable sessions on serverless deployments.
-- Apply only after reviewing the target database; this does not alter existing rows.
USE barangay_san_isidro;

CREATE TABLE app_sessions (
    token_hash BINARY(32) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    last_seen_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (token_hash),
    KEY ix_app_sessions_user_expiry (user_id, expires_at),
    KEY ix_app_sessions_expiry (expires_at),
    CONSTRAINT fk_app_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB;

INSERT INTO schema_migrations (version) VALUES ('002_app_sessions');
