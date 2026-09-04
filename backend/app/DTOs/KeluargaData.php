<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\DTOs;

final class KeluargaData
{
    /**
     * @param  array<int, array{jamaah_id: int, hubungan_keluarga: string, is_kepala_keluarga?: bool, catatan?: string|null}>  $anggota
     */
    public function __construct(
        public readonly ?int $wilayah_fung_kelompokId,
        public readonly int $kepalaJamaahId,
        public readonly ?string $noKk,
        public readonly ?string $alamat,
        public readonly ?string $rt,
        public readonly ?string $rw,
        public readonly ?int $wilayahAdmDesaId,
        public readonly ?string $kodePos,
        public readonly ?string $catatan,
        public readonly string $status,
        public readonly array $anggota,
    ) {}

    public static function fromArray(array $data): self
    {
        $anggota = collect($data['anggota'] ?? [])
            ->map(fn (array $row) => [
                'jamaah_id' => (int) $row['jamaah_id'],
                'hubungan_keluarga' => (string) $row['hubungan_keluarga'],
                'is_kepala_keluarga' => (bool) ($row['is_kepala_keluarga'] ?? false),
                'catatan' => $row['catatan'] ?? null,
            ])
            ->values()
            ->all();

        return new self(
            wilayah_fung_kelompokId: isset($data['wilayah_fung_kelompok_id']) ? (int) $data['wilayah_fung_kelompok_id'] : null,
            kepalaJamaahId: (int) $data['kepala_jamaah_id'],
            noKk: $data['no_kk'] ?? null,
            alamat: $data['alamat'] ?? null,
            rt: $data['rt'] ?? null,
            rw: $data['rw'] ?? null,
            wilayahAdmDesaId: isset($data['wilayah_adm_desa_id']) ? (int) $data['wilayah_adm_desa_id'] : null,
            kodePos: $data['kode_pos'] ?? null,
            catatan: $data['catatan'] ?? null,
            status: $data['status'] ?? 'aktif',
            anggota: $anggota,
        );
    }

    public function toModelAttributes(): array
    {
        return [
            'kepala_jamaah_id' => $this->kepalaJamaahId,
            'no_kk' => $this->noKk,
            'alamat' => $this->alamat,
            'rt' => $this->rt,
            'rw' => $this->rw,
            'wilayah_adm_desa_id' => $this->wilayahAdmDesaId,
            'kode_pos' => $this->kodePos,
            'catatan' => $this->catatan,
            'status' => $this->status,
        ];
    }
}
