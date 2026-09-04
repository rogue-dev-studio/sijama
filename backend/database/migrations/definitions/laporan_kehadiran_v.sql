CREATE OR REPLACE VIEW laporan_kehadiran_v AS
SELECT
    a.id,
    a.recorded_at,
    a.method,
    a.matched_distance,
    a.jamaah_id,
    a.session_id,
    j.nama AS jamaah_nama,
    j.wilayah_fung_kelompok_id,
    j.kategori_umur,
    k.nama AS kelompok_nama,
    d.id AS wilayah_fung_desa_id,
    dr.id AS wilayah_fung_daerah_id,
    dr.wilayah_fung_pusat_id,
    s.type AS session_type,
    s.ref_id AS session_ref_id,
    s.title AS session_title,
    s.status AS session_status
FROM absensi_t a
INNER JOIN jamaah_r j ON j.id = a.jamaah_id AND j.deleted_at IS NULL
LEFT JOIN wilayah_fung_kelompok_m k ON k.id = j.wilayah_fung_kelompok_id
LEFT JOIN wilayah_fung_desa_m d ON d.id = k.wilayah_fung_desa_id
LEFT JOIN wilayah_fung_daerah_m dr ON dr.id = d.wilayah_fung_daerah_id
INNER JOIN absensi_sesi_t s ON s.id = a.session_id;
