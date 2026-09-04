CREATE TABLE kegiatan_jadwal_rutin_t (
    id BIGSERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    pemateri VARCHAR(255),
    pemateri_id BIGINT,
    kategori_kegiatan_id BIGINT,
    lokasi VARCHAR(255),
    lokasi_id BIGINT,
    deskripsi TEXT,
    frekuensi VARCHAR(20) NOT NULL,
    day_of_week SMALLINT,
    day_of_month SMALLINT,
    month_of_year SMALLINT,
    jam_mulai TIME(0) WITHOUT TIME ZONE,
    jam_selesai TIME(0) WITHOUT TIME ZONE,
    scope_level VARCHAR(20) NOT NULL,
    wilayah_fung_daerah_id BIGINT,
    wilayah_fung_desa_id BIGINT,
    wilayah_fung_kelompok_id BIGINT,
    effective_from DATE NOT NULL,
    effective_until DATE,
    generate_horizon_days SMALLINT NOT NULL DEFAULT 90,
    last_generated_until DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT kegiatan_jadwal_rutin_t_pemateri_id_foreign
        FOREIGN KEY (pemateri_id) REFERENCES pemateri_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_kategori_kegiatan_id_foreign
        FOREIGN KEY (kategori_kegiatan_id) REFERENCES kategori_kegiatan_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_lokasi_id_foreign
        FOREIGN KEY (lokasi_id) REFERENCES lokasi_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_wilayah_fung_daerah_id_foreign
        FOREIGN KEY (wilayah_fung_daerah_id) REFERENCES wilayah_fung_daerah_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_wilayah_fung_desa_id_foreign
        FOREIGN KEY (wilayah_fung_desa_id) REFERENCES wilayah_fung_desa_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_wilayah_fung_kelompok_id_foreign
        FOREIGN KEY (wilayah_fung_kelompok_id) REFERENCES wilayah_fung_kelompok_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_jadwal_rutin_t_created_by_foreign
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX kegiatan_jadwal_rutin_t_is_active_effective_from_index
    ON kegiatan_jadwal_rutin_t (is_active, effective_from);
CREATE INDEX kegiatan_jadwal_rutin_t_scope_level_wilayah_fung_daerah_id_wilayah_fung_desa_id_wilayah_fung_kelompok_id_index
    ON kegiatan_jadwal_rutin_t (scope_level, wilayah_fung_daerah_id, wilayah_fung_desa_id, wilayah_fung_kelompok_id);
