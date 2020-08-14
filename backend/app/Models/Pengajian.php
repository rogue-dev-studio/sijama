<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengajian extends Model
{
    protected $table = 'pengajian';

    protected $fillable = [
        'judul',
        'pemateri',
        'pemateri_id',
        'lokasi',
        'lokasi_id',
        'materi_id',
        'kategori_kegiatan_id',
        'starts_at',
        'ends_at',
        'catatan',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
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

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class);
    }

    public function kategoriKegiatan(): BelongsTo
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kategori_kegiatan_id');
    }
}
