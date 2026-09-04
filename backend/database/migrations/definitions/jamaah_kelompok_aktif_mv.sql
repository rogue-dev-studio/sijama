CREATE MATERIALIZED VIEW jamaah_kelompok_aktif_mv AS
SELECT
    j.wilayah_fung_kelompok_id,
    k.nama AS kelompok_nama,
    d.id AS wilayah_fung_desa_id,
    dr.id AS wilayah_fung_daerah_id,
    dr.wilayah_fung_pusat_id,
    COUNT(*)::bigint AS jamaah_aktif
FROM jamaah_r j
INNER JOIN wilayah_fung_kelompok_m k ON k.id = j.wilayah_fung_kelompok_id
INNER JOIN wilayah_fung_desa_m d ON d.id = k.wilayah_fung_desa_id
INNER JOIN wilayah_fung_daerah_m dr ON dr.id = d.wilayah_fung_daerah_id
WHERE j.status = 'aktif'
  AND j.deleted_at IS NULL
GROUP BY j.wilayah_fung_kelompok_id, k.nama, d.id, dr.id, dr.wilayah_fung_pusat_id;

CREATE UNIQUE INDEX jamaah_kelompok_aktif_mv_kelompok_uidx
    ON jamaah_kelompok_aktif_mv (wilayah_fung_kelompok_id);

REFRESH MATERIALIZED VIEW jamaah_kelompok_aktif_mv;
