CREATE TABLE dapukan_hak_akses_mp (
    dapukan_id BIGINT NOT NULL,
    hak_akses_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    PRIMARY KEY (dapukan_id, hak_akses_id),
    CONSTRAINT dapukan_hak_akses_mp_dapukan_id_foreign
        FOREIGN KEY (dapukan_id) REFERENCES dapukan_m (id) ON DELETE CASCADE,
    CONSTRAINT dapukan_hak_akses_mp_hak_akses_id_foreign
        FOREIGN KEY (hak_akses_id) REFERENCES hak_akses_m (id) ON DELETE CASCADE
);
