<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Jamaah extends Model
{
    use SoftDeletes;

    protected $table = 'jamaah_r';

    protected $fillable = [
        'wilayah_fung_kelompok_id',
        'nik',
        'nama',
        'gender',
        'tanggal_lahir',
        'kategori_umur',
        'pekerjaan',
        'pekerjaan_id',
        'pendidikan',
        'golongan_darah',
        'status_pernikahan',
        'alamat',
        'rt',
        'rw',
        'no_hp',
        'email',
        'status',
        'foto_path',
        'enrolled_at',
        'wilayah_adm_desa_id',
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

    public function wilayahFungKelompok(): BelongsTo
    {
        return $this->belongsTo(Kelompok::class, 'wilayah_fung_kelompok_id');
    }

    public function pekerjaanRef(): BelongsTo
    {
        return $this->belongsTo(LookupM::class, 'pekerjaan_id', 'lookup_id');
    }

    public function wilayahAdmDesa(): BelongsTo
    {
        return $this->belongsTo(AdmDesaKelurahan::class, 'wilayah_adm_desa_id');
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
        return $this->belongsToMany(Dapukan::class, 'jamaah_dapukan_mp')->withTimestamps();
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class);
    }

    public function keluargaPivot(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(JamaahKeluarga::class);
    }

    public function keluarga(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Keluarga::class, 'jamaah_keluarga_mp')
            ->withPivot(['hubungan_keluarga', 'is_kepala_keluarga', 'catatan'])
            ->withTimestamps();
    }
}
