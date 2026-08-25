<?php

namespace App\Http\Resources;

use App\Support\JamaahKategoriUmur;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JamaahResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $kategoriUmur = JamaahKategoriUmur::classify($this->tanggal_lahir, $this->status_pernikahan);

        return [
            'id' => $this->id,
            'kelompok_id' => $this->kelompok_id,
            'kelompok' => $this->whenLoaded('kelompok', fn () => $this->kelompok ? [
                'id' => $this->kelompok->id,
                'kode' => $this->kelompok->kode,
                'nama' => $this->kelompok->nama,
            ] : null),
            'nik' => $this->nik,
            'nama' => $this->nama,
            'gender' => $this->gender,
            'tanggal_lahir' => $this->tanggal_lahir?->format('Y-m-d'),
            'kategori_umur' => $kategoriUmur,
            'kategori_umur_label' => JamaahKategoriUmur::label($kategoriUmur),
            'usia' => $this->tanggal_lahir?->age,
            'pekerjaan' => $this->pekerjaan,
            'pekerjaan_id' => $this->pekerjaan_id,
            'pekerjaan_ref' => $this->whenLoaded('pekerjaanRef', fn () => $this->pekerjaanRef ? [
                'id' => $this->pekerjaanRef->id,
                'nama' => $this->pekerjaanRef->nama,
            ] : null),
            'dapukan_ids' => $this->whenLoaded('dapukan', fn () => $this->dapukan->pluck('id')->values()->all()),
            'dapukan' => $this->whenLoaded('dapukan', fn () => $this->dapukan->map(fn ($item) => [
                'id' => $item->id,
                'slug' => $item->slug,
                'nama' => $item->nama,
                'tingkat' => $item->tingkat,
            ])->values()->all()),
            'pendidikan' => $this->pendidikan,
            'status_pernikahan' => $this->status_pernikahan,
            'alamat' => $this->alamat,
            'rt' => $this->rt,
            'rw' => $this->rw,
            'no_hp' => $this->no_hp,
            'email' => $this->email,
            'adm_desa_kelurahan_id' => $this->adm_desa_kelurahan_id,
            'adm_desa_kelurahan' => $this->whenLoaded('admDesaKelurahan', fn () => $this->admDesaKelurahan ? [
                'id' => $this->admDesaKelurahan->id,
                'kode' => $this->admDesaKelurahan->kode,
                'nama' => $this->admDesaKelurahan->nama,
            ] : null),
            'kode_pos' => $this->kode_pos,
            'status' => $this->status,
            'foto_path' => $this->foto_path,
            'face_enrolled' => $this->resolveFaceEnrolled(),
            'face_descriptor' => $this->when(
                $request->boolean('include_face') || $request->boolean('enrolled'),
                fn () => $this->face_descriptor
            ),
            'enrolled_at' => $this->enrolled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    private function resolveFaceEnrolled(): bool
    {
        $attributes = $this->resource->getAttributes();

        if (array_key_exists('face_descriptor', $attributes)) {
            return $attributes['face_descriptor'] !== null;
        }

        return $this->enrolled_at !== null;
    }
}
