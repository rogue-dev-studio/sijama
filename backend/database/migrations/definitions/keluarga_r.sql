CREATE TABLE keluarga_r (
    id BIGSERIAL PRIMARY KEY,
    wilayah_fung_kelompok_id BIGINT NOT NULL,
    kepala_jamaah_id BIGINT,
    no_kk VARCHAR(16),
    alamat TEXT,
    rt VARCHAR(10),
    rw VARCHAR(10),
    wilayah_adm_desa_id BIGINT,
    kode_pos VARCHAR(10),
    catatan TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    deleted_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT keluarga_r_wilayah_fung_kelompok_id_foreign
        FOREIGN KEY (wilayah_fung_kelompok_id) REFERENCES wilayah_fung_kelompok_m (id) ON DELETE RESTRICT,
    CONSTRAINT keluarga_r_kepala_jamaah_id_foreign
        FOREIGN KEY (kepala_jamaah_id) REFERENCES jamaah_r (id) ON DELETE SET NULL,
    CONSTRAINT keluarga_r_wilayah_adm_desa_id_foreign
        FOREIGN KEY (wilayah_adm_desa_id) REFERENCES wilayah_adm_desa_m (id) ON DELETE SET NULL
);

CREATE INDEX keluarga_r_no_kk_index ON keluarga_r (no_kk);
CREATE INDEX keluarga_r_status_index ON keluarga_r (status);
CREATE INDEX keluarga_r_wilayah_fung_kelompok_id_index ON keluarga_r (wilayah_fung_kelompok_id);
