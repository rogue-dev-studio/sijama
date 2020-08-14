<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KegiatanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'jenis' => $this->jenis,
            'kategori_kegiatan_id' => $this->kategori_kegiatan_id,
            'kategori_kegiatan' => $this->whenLoaded('kategoriKegiatan', fn () => $this->kategoriKegiatan ? [
                'id' => $this->kategoriKegiatan->id,
                'kode' => $this->kategoriKegiatan->kode,
                'nama' => $this->kategoriKegiatan->nama,
            ] : null),
            'tanggal' => $this->tanggal?->format('Y-m-d'),
            'lokasi' => $this->lokasi,
            'lokasi_id' => $this->lokasi_id,
            'lokasi_ref' => $this->whenLoaded('lokasiRef', fn () => $this->lokasiRef ? [
                'id' => $this->lokasiRef->id,
                'kode' => $this->lokasiRef->kode,
                'nama' => $this->lokasiRef->nama,
                'jenis' => $this->lokasiRef->jenis,
            ] : null),
            'deskripsi' => $this->deskripsi,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
