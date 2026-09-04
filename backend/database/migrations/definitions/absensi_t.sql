CREATE TABLE absensi_t (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    jamaah_id BIGINT NOT NULL,
    method VARCHAR(255) NOT NULL,
    matched_distance DOUBLE PRECISION,
    recorded_by BIGINT NOT NULL,
    recorded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT absensi_t_session_id_foreign
        FOREIGN KEY (session_id) REFERENCES absensi_sesi_t (id) ON DELETE CASCADE,
    CONSTRAINT absensi_t_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE RESTRICT,
    CONSTRAINT absensi_t_recorded_by_foreign
        FOREIGN KEY (recorded_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX absensi_t_session_id_jamaah_id_unique ON absensi_t (session_id, jamaah_id);
CREATE INDEX absensi_t_jamaah_id_index ON absensi_t (jamaah_id);
CREATE INDEX absensi_t_recorded_at_index ON absensi_t (recorded_at);
CREATE INDEX absensi_t_recorded_by_index ON absensi_t (recorded_by);
CREATE INDEX absensi_t_recorded_jamaah_idx ON absensi_t (recorded_at, jamaah_id);
CREATE INDEX absensi_t_method_idx ON absensi_t (method);
