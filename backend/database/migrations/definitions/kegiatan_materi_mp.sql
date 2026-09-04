CREATE TABLE kegiatan_materi_mp (
    kegiatan_id BIGINT NOT NULL,
    materi_id BIGINT NOT NULL,
    PRIMARY KEY (kegiatan_id, materi_id),
    CONSTRAINT kegiatan_materi_mp_kegiatan_id_foreign
        FOREIGN KEY (kegiatan_id) REFERENCES kegiatan_t (id) ON DELETE CASCADE,
    CONSTRAINT kegiatan_materi_mp_materi_id_foreign
        FOREIGN KEY (materi_id) REFERENCES materi_m (id) ON DELETE CASCADE
);

CREATE INDEX kegiatan_materi_mp_materi_id_idx ON kegiatan_materi_mp (materi_id);
