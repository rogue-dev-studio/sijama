<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:10:00
 */

namespace App\Http\Requests;

use App\Models\KegiatanJadwalRutin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreKegiatanJadwalRutinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return $this->baseRules();
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $this->validateRecurrenceFields($validator);
        });
    }

    /**
     * @return array<string, mixed>
     */
    protected function baseRules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:255'],
            'pemateri' => ['nullable', 'string', 'max:255'],
            'pemateri_id' => ['nullable', 'integer', 'exists:pemateri_m,id'],
            'materi_ids' => ['nullable', 'array'],
            'materi_ids.*' => ['integer', 'exists:materi_m,id'],
            'kategori_kegiatan_id' => ['nullable', 'integer', 'exists:kategori_kegiatan_m,id'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'lokasi_id' => ['nullable', 'integer', 'exists:lokasi_m,id'],
            'deskripsi' => ['nullable', 'string'],
            'frekuensi' => ['required', Rule::in([
                KegiatanJadwalRutin::FREKUENSI_MINGGUAN,
                KegiatanJadwalRutin::FREKUENSI_BULANAN,
                KegiatanJadwalRutin::FREKUENSI_TAHUNAN,
            ])],
            'day_of_week' => ['nullable', 'integer', 'min:1', 'max:7'],
            'day_of_month' => ['nullable', 'integer', 'min:1', 'max:31'],
            'month_of_year' => ['nullable', 'integer', 'min:1', 'max:12'],
            'jam_mulai' => ['nullable', 'date_format:H:i'],
            'jam_selesai' => ['nullable', 'date_format:H:i', 'after:jam_mulai'],
            'scope_level' => ['required', Rule::in([
                KegiatanJadwalRutin::SCOPE_DAERAH,
                KegiatanJadwalRutin::SCOPE_DESA,
                KegiatanJadwalRutin::SCOPE_KELOMPOK,
            ])],
            'wilayah_fung_daerah_id' => ['nullable', 'integer', 'exists:wilayah_fung_daerah_m,id'],
            'wilayah_fung_desa_id' => ['nullable', 'integer', 'exists:wilayah_fung_desa_m,id'],
            'wilayah_fung_kelompok_id' => ['nullable', 'integer', 'exists:wilayah_fung_kelompok_m,id'],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date', 'after_or_equal:effective_from'],
            'generate_horizon_days' => ['nullable', 'integer', 'min:7', 'max:365'],
        ];
    }

    protected function validateRecurrenceFields(Validator $validator): void
    {
        $frekuensi = (string) $this->input('frekuensi');

        if ($frekuensi === KegiatanJadwalRutin::FREKUENSI_MINGGUAN && ! $this->filled('day_of_week')) {
            $validator->errors()->add('day_of_week', 'Hari minggu wajib dipilih untuk jadwal mingguan.');
        }

        if (in_array($frekuensi, [KegiatanJadwalRutin::FREKUENSI_BULANAN, KegiatanJadwalRutin::FREKUENSI_TAHUNAN], true)
            && ! $this->filled('day_of_month')) {
            $validator->errors()->add('day_of_month', 'Tanggal bulan wajib dipilih untuk jadwal bulanan/tahunan.');
        }

        if ($frekuensi === KegiatanJadwalRutin::FREKUENSI_TAHUNAN && ! $this->filled('month_of_year')) {
            $validator->errors()->add('month_of_year', 'Bulan wajib dipilih untuk jadwal tahunan.');
        }

        $scopeLevel = (string) $this->input('scope_level');
        if ($scopeLevel === KegiatanJadwalRutin::SCOPE_DAERAH && ! $this->filled('wilayah_fung_daerah_id')) {
            $validator->errors()->add('wilayah_fung_daerah_id', 'Daerah wajib dipilih.');
        }
        if ($scopeLevel === KegiatanJadwalRutin::SCOPE_DESA && ! $this->filled('wilayah_fung_desa_id')) {
            $validator->errors()->add('wilayah_fung_desa_id', 'Desa wajib dipilih.');
        }
    }
}
