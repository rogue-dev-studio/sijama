<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:00:00
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KegiatanJadwalRutin extends Model
{
    public const FREKUENSI_MINGGUAN = 'mingguan';

    public const FREKUENSI_BULANAN = 'bulanan';

    public const FREKUENSI_TAHUNAN = 'tahunan';

    public const SCOPE_DAERAH = 'daerah';

    public const SCOPE_DESA = 'desa';

    public const SCOPE_KELOMPOK = 'kelompok';

    protected $table = 'kegiatan_jadwal_rutin_t';

    protected $fillable = [
        'judul',
        'pemateri',
        'pemateri_id',
        'kategori_kegiatan_id',
        'lokasi',
        'lokasi_id',
        'deskripsi',
        'frekuensi',
        'day_of_week',
        'day_of_month',
        'month_of_year',
        'jam_mulai',
        'jam_selesai',
        'scope_level',
        'wilayah_fung_daerah_id',
        'wilayah_fung_desa_id',
        'wilayah_fung_kelompok_id',
        'effective_from',
        'effective_until',
        'generate_horizon_days',
        'last_generated_until',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_from' => 'date',
            'effective_until' => 'date',
            'last_generated_until' => 'date',
            'is_active' => 'boolean',
            'jam_mulai' => 'string',
            'jam_selesai' => 'string',
        ];
    }

    public function pemateriRef(): BelongsTo
    {
        return $this->belongsTo(Pemateri::class, 'pemateri_id');
    }

    public function materi(): BelongsToMany
    {
        return $this->belongsToMany(Materi::class, 'kegiatan_jadwal_rutin_materi_mp');
    }

    public function kategoriKegiatan(): BelongsTo
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kategori_kegiatan_id');
    }

    public function lokasiRef(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function wilayahFungDaerah(): BelongsTo
    {
        return $this->belongsTo(Daerah::class, 'wilayah_fung_daerah_id');
    }

    public function wilayahFungDesa(): BelongsTo
    {
        return $this->belongsTo(Desa::class, 'wilayah_fung_desa_id');
    }

    public function wilayahFungKelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class, 'wilayah_fung_kelompok_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function kegiatan(): HasMany
    {
        return $this->hasMany(Kegiatan::class, 'jadwal_rutin_id');
    }
}
