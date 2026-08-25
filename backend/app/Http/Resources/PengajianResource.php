<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PengajianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'pemateri' => $this->pemateri,
            'pemateri_id' => $this->pemateri_id,
            'pemateri_ref' => $this->whenLoaded('pemateriRef', fn () => $this->pemateriRef ? [
                'id' => $this->pemateriRef->id,
                'nama' => $this->pemateriRef->nama,
            ] : null),
            'lokasi' => $this->lokasi,
            'lokasi_id' => $this->lokasi_id,
            'lokasi_ref' => $this->whenLoaded('lokasiRef', fn () => $this->lokasiRef ? [
                'id' => $this->lokasiRef->id,
                'nama' => $this->lokasiRef->nama,
                'jenis' => $this->lokasiRef->jenis,
            ] : null),
            'materi_id' => $this->materi_id,
            'materi' => $this->whenLoaded('materi', fn () => $this->materi ? [
                'id' => $this->materi->id,
                'nama' => $this->materi->nama,
            ] : null),
            'kategori_kegiatan_id' => $this->kategori_kegiatan_id,
            'kategori_kegiatan' => $this->whenLoaded('kategoriKegiatan', fn () => $this->kategoriKegiatan ? [
                'id' => $this->kategoriKegiatan->id,
                'nama' => $this->kategoriKegiatan->nama,
                'calendar_color' => $this->kategoriKegiatan->calendar_color,
            ] : null),
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'catatan' => $this->catatan,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
