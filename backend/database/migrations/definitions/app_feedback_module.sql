CREATE TABLE app_report_t (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_username VARCHAR(100),
    user_id BIGINT,
    jamaah_id BIGINT,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    contact VARCHAR(120),
    images_json TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'baru',
    admin_notes TEXT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_report_t_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT app_report_t_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE SET NULL
);

CREATE INDEX app_report_t_category_index ON app_report_t (category);
CREATE INDEX app_report_t_status_index ON app_report_t (status);
CREATE INDEX app_report_t_user_id_index ON app_report_t (user_id);
CREATE INDEX app_report_t_jamaah_id_index ON app_report_t (jamaah_id);
CREATE INDEX app_report_t_created_at_index ON app_report_t (created_at DESC);

CREATE TABLE app_feedback_t (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(32) NOT NULL,
    reporter_name VARCHAR(150) NOT NULL,
    reporter_username VARCHAR(100),
    user_id BIGINT,
    jamaah_id BIGINT,
    contact VARCHAR(120),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    rating SMALLINT,
    role_label VARCHAR(120),
    images_json TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'baru',
    admin_notes TEXT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_feedback_t_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT app_feedback_t_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE SET NULL
);

CREATE INDEX app_feedback_t_kind_index ON app_feedback_t (kind);
CREATE INDEX app_feedback_t_status_index ON app_feedback_t (status);
CREATE INDEX app_feedback_t_is_published_index ON app_feedback_t (is_published);
CREATE INDEX app_feedback_t_user_id_index ON app_feedback_t (user_id);
CREATE INDEX app_feedback_t_created_at_index ON app_feedback_t (created_at DESC);

CREATE TABLE app_poll_t (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP(0) WITHOUT TIME ZONE,
    ends_at TIMESTAMP(0) WITHOUT TIME ZONE,
    created_by BIGINT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_poll_t_created_by_foreign
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX app_poll_t_is_active_index ON app_poll_t (is_active);

CREATE TABLE app_poll_option_t (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    urutan INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT app_poll_option_t_poll_id_foreign
        FOREIGN KEY (poll_id) REFERENCES app_poll_t (id) ON DELETE CASCADE
);

CREATE INDEX app_poll_option_t_poll_id_index ON app_poll_option_t (poll_id);

CREATE TABLE app_poll_vote_t (
    id BIGSERIAL PRIMARY KEY,
    poll_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_poll_vote_t_poll_id_foreign
        FOREIGN KEY (poll_id) REFERENCES app_poll_t (id) ON DELETE CASCADE,
    CONSTRAINT app_poll_vote_t_option_id_foreign
        FOREIGN KEY (option_id) REFERENCES app_poll_option_t (id) ON DELETE CASCADE,
    CONSTRAINT app_poll_vote_t_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT app_poll_vote_t_poll_user_unique UNIQUE (poll_id, user_id)
);

CREATE INDEX app_poll_vote_t_poll_id_index ON app_poll_vote_t (poll_id);
CREATE INDEX app_poll_vote_t_option_id_index ON app_poll_vote_t (option_id);
