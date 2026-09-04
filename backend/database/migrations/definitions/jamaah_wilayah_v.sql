CREATE OR REPLACE VIEW jamaah_wilayah_v AS
SELECT
    j.id,
    j.wilayah_fung_kelompok_id,
    j.status,
    j.kategori_umur,
    k.wilayah_fung_desa_id,
    d.wilayah_fung_daerah_id,
    dr.wilayah_fung_pusat_id
FROM jamaah_r j
LEFT JOIN wilayah_fung_kelompok_m k ON k.id = j.wilayah_fung_kelompok_id
LEFT JOIN wilayah_fung_desa_m d ON d.id = k.wilayah_fung_desa_id
LEFT JOIN wilayah_fung_daerah_m dr ON dr.id = d.wilayah_fung_daerah_id
WHERE j.deleted_at IS NULL;
