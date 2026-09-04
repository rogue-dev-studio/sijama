CREATE TABLE absensi_sesi_t (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    ref_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    opened_by BIGINT NOT NULL,
    opened_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    closed_at TIMESTAMP(0) WITHOUT TIME ZONE,
    status VARCHAR(255) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT absensi_sesi_t_opened_by_foreign
        FOREIGN KEY (opened_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE INDEX absensi_sesi_t_type_ref_id_index ON absensi_sesi_t (type, ref_id);
CREATE INDEX absensi_sesi_t_status_index ON absensi_sesi_t (status);
CREATE INDEX absensi_sesi_t_opened_at_idx ON absensi_sesi_t (opened_at);
