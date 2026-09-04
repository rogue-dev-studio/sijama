<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Kegiatan extends Model
{
    protected $table = 'kegiatan_t';

    protected $fillable = [
        'judul',
        'pemateri',
        'pemateri_id',
        'jenis',
        'kategori_kegiatan_id',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'lokasi',
        'lokasi_id',
        'deskripsi',
        'catatan',
        'status',
        'jadwal_rutin_id',
        'wilayah_fung_daerah_id',
        'wilayah_fung_desa_id',
        'wilayah_fung_kelompok_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function lokasiRef(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class, 'lokasi_id');
    }

    public function pemateriRef(): BelongsTo
    {
        return $this->belongsTo(Pemateri::class, 'pemateri_id');
    }

    public function materi(): BelongsToMany
    {
        return $this->belongsToMany(Materi::class, 'kegiatan_materi_mp');
    }

    public function kategoriKegiatan(): BelongsTo
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kategori_kegiatan_id');
    }

    public function jadwalRutin(): BelongsTo
    {
        return $this->belongsTo(KegiatanJadwalRutin::class, 'jadwal_rutin_id');
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
}
