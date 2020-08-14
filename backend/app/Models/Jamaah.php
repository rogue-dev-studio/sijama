<?php

namespace App\Models;

use App\Support\JamaahKategoriUmur;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Jamaah extends Model
{
    use SoftDeletes;

    protected $table = 'jamaah';

    protected $fillable = [
        'kelompok_id',
        'nik',
        'nama',
        'gender',
        'tanggal_lahir',
        'kategori_umur',
        'pekerjaan',
        'pekerjaan_id',
        'pendidikan',
        'status_pernikahan',
        'alamat',
        'rt',
        'rw',
        'no_hp',
        'email',
        'status',
        'foto_path',
        'enrolled_at',
        'adm_desa_kelurahan_id',
        'kode_pos',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'face_descriptor' => 'array',
            'enrolled_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Jamaah $jamaah) {
            $jamaah->kategori_umur = JamaahKategoriUmur::classify(
                $jamaah->tanggal_lahir,
                $jamaah->status_pernikahan
            );

            if ($jamaah->pekerjaan_id) {
                $nama = Pekerjaan::query()->whereKey($jamaah->pekerjaan_id)->value('nama');
                if ($nama) {
                    $jamaah->pekerjaan = $nama;
                }
            }
        });
    }

    public function kelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class);
    }

    public function pekerjaanRef(): BelongsTo
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }

    public function admDesaKelurahan(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'adm_desa_kelurahan_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function pemateri(): HasMany
    {
        return $this->hasMany(Pemateri::class);
    }

    public function dapukan(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Dapukan::class, 'jamaah_dapukan')->withTimestamps();
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class);
    }
}
