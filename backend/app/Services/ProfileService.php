<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 18:05:00
 */

namespace App\Services;

use App\Http\Resources\JamaahResource;
use App\Http\Resources\UserResource;
use App\Models\AdmDesaKelurahan;
use App\Models\AdmKabupatenKota;
use App\Models\AdmKecamatan;
use App\Models\AdmNegara;
use App\Models\AdmProvinsi;
use App\Support\NikWilayahResolver;
use App\Models\Jamaah;
use App\Models\LookupM;
use App\Models\User;
use App\Services\LookupOptionsService;
use App\Support\LoginRememberOptions;
use App\Support\LookupTypes;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ProfileService
{
    public function __construct(
        private readonly LookupOptionsService $lookupOptionsService,
        private readonly ProfilePhotoService $profilePhotoService,
    ) {}

    public function show(User $user, ?PersonalAccessToken $currentAccessToken = null): array
    {
        $user->loadMissing(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']);

        $jamaah = null;
        $admChain = null;

        if ($user->jamaah_id) {
            $model = Jamaah::query()
                ->with([
                    'kelompok.desa.daerah',
                    'admDesaKelurahan.kecamatan.kabupatenKota.provinsi.negara',
                    'pekerjaanRef',
                    'dapukan:id,slug,nama,tingkat',
                ])
                ->find($user->jamaah_id);

            if ($model) {
                $jamaah = (new JamaahResource($model))->resolve();
                $admChain = $this->buildAdmChain($model);
            }
        }

        $lookups = $this->lookupOptionsService->byTypes(LookupTypes::JAMAAH_FORM_TYPES);

        return [
            'user' => (new UserResource($user))->resolve(),
            'jamaah' => $jamaah,
            'can_edit_jamaah' => $jamaah !== null,
            'adm_chain' => $admChain,
            'lookups' => [
                'pekerjaan' => collect($lookups[LookupTypes::PEKERJAAN] ?? [])
                    ->map(fn (array $item) => [
                        'id' => $item['id'],
                        'nama' => $item['name'],
                        'value' => $item['value'],
                    ])
                    ->values()
                    ->all(),
                'jenis_kelamin' => $lookups[LookupTypes::JENIS_KELAMIN] ?? [],
                'golongan_darah' => $lookups[LookupTypes::GOLONGAN_DARAH] ?? [],
                'status_pernikahan' => $lookups[LookupTypes::STATUS_PERNIKAHAN] ?? [],
                'pendidikan' => $lookups[LookupTypes::PENDIDIKAN] ?? [],
                'negara' => AdmNegara::query()
                    ->where('is_active', true)
                    ->orderBy('nama')
                    ->get(['id', 'kode', 'nama']),
            ],
            'login_session' => $this->buildLoginSessionPayload($user, $currentAccessToken),
        ];
    }

    public function updateLoginSession(
        User $user,
        ?int $minutes,
        bool $untilLogout,
        ?PersonalAccessToken $currentAccessToken,
    ): array {
        if ($untilLogout) {
            $minutes = null;
        } elseif ($minutes !== null && ! LoginRememberOptions::isAllowed($minutes)) {
            throw ValidationException::withMessages([
                'login_remember_minutes' => [
                    'Durasi sesi login harus antara '
                    .LoginRememberOptions::MIN_MINUTES
                    .' dan '
                    .LoginRememberOptions::MAX_MINUTES
                    .' menit.',
                ],
            ]);
        }

        $user->update([
            'login_remember_minutes' => $minutes,
            'login_remember_until_logout' => $untilLogout,
        ]);

        if ($currentAccessToken) {
            $currentAccessToken->update([
                'expires_at' => LoginRememberOptions::resolveLoginExpiration(
                    $minutes,
                    $untilLogout,
                    true,
                ),
            ]);
        }

        return $this->show($user->fresh(), $currentAccessToken);
    }

    /**
     * @return array{
     *   login_remember_minutes: int|null,
     *   login_remember_until_logout: bool,
     *   current_token_expires_at: string|null,
     *   min_minutes: int,
     *   max_minutes: int,
     *   default_minutes: int
     * }
     */
    private function buildLoginSessionPayload(User $user, ?PersonalAccessToken $currentAccessToken): array
    {
        return [
            'login_remember_minutes' => $user->login_remember_minutes,
            'login_remember_until_logout' => (bool) $user->login_remember_until_logout,
            'current_token_expires_at' => $currentAccessToken?->expires_at?->toIso8601String(),
            'min_minutes' => LoginRememberOptions::MIN_MINUTES,
            'max_minutes' => LoginRememberOptions::MAX_MINUTES,
            'default_minutes' => LoginRememberOptions::DEFAULT_MINUTES,
        ];
    }

    /**
     * Cascade wilayah administratif untuk form profil sendiri (tanpa permission master).
     *
     * @return array<int, array{id: int, kode: string, nama: string}>
     */
    public function wilayahOptions(string $level, ?int $parentId = null): array
    {
        return match ($level) {
            'negara' => AdmNegara::query()
                ->where('is_active', true)
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmNegara $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'provinsi' => AdmProvinsi::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('negara_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmProvinsi $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kabupaten_kota' => AdmKabupatenKota::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('provinsi_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKabupatenKota $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kecamatan' => AdmKecamatan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('kabupaten_kota_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKecamatan $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'desa_kelurahan' => AdmDesaKelurahan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('kecamatan_id', $parentId))
                ->with(['kodePos' => fn ($q) => $q->orderBy('kode')])
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmDesaKelurahan $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                    'kode_pos' => $item->kodePos
                        ->first(fn ($row) => (bool) $row->is_active)
                        ?->kode
                        ?? $item->kodePos->first()?->kode,
                ])
                ->values()
                ->all(),
            default => throw ValidationException::withMessages([
                'level' => ['Level wilayah tidak valid.'],
            ]),
        };
    }

    /**
     * Resolve provinsi → kab/kota → kecamatan dari 6 digit awal NIK.
     *
     * @return array<string, mixed>
     */
    public function resolveWilayahFromNik(?string $nik): array
    {
        return (new NikWilayahResolver)->resolve($nik);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateJamaah(User $user, array $data): array
    {
        if (! $user->jamaah_id) {
            throw ValidationException::withMessages([
                'jamaah' => ['Akun belum ditautkan ke data jamaah.'],
            ]);
        }

        $jamaah = Jamaah::query()->find($user->jamaah_id);
        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah' => ['Data jamaah tidak ditemukan.'],
            ]);
        }

        if (array_key_exists('pekerjaan_id', $data)) {
            $pekerjaanId = $data['pekerjaan_id'];
            if ($pekerjaanId) {
                $pekerjaan = LookupM::query()
                    ->notDeleted()
                    ->byType(LookupTypes::PEKERJAAN)
                    ->find($pekerjaanId);
                $data['pekerjaan'] = $pekerjaan?->lookup_name;
            } else {
                $data['pekerjaan_id'] = null;
                $data['pekerjaan'] = null;
            }
        }

        $jamaah->update($data);

        $user->update([
            'name' => $jamaah->nama,
            'email' => $jamaah->email,
        ]);

        return $this->show($user->fresh());
    }

    public function updatePassword(User $user, string $password): void
    {
        $user->update([
            'password' => $password,
        ]);
    }

    public function uploadPhoto(User $user, UploadedFile $file): array
    {
        $jamaah = $this->resolveLinkedJamaah($user);
        $this->profilePhotoService->upload($jamaah, $file);

        return $this->show($user->fresh());
    }

    public function deletePhoto(User $user): array
    {
        $jamaah = $this->resolveLinkedJamaah($user);
        $this->profilePhotoService->remove($jamaah);

        return $this->show($user->fresh());
    }

    private function resolveLinkedJamaah(User $user): Jamaah
    {
        if (! $user->jamaah_id) {
            throw ValidationException::withMessages([
                'jamaah' => ['Akun belum ditautkan ke data jamaah.'],
            ]);
        }

        $jamaah = Jamaah::query()->find($user->jamaah_id);
        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah' => ['Data jamaah tidak ditemukan.'],
            ]);
        }

        return $jamaah;
    }

    /**
     * @return array{
     *   negara_id: int|null,
     *   provinsi_id: int|null,
     *   kabupaten_kota_id: int|null,
     *   kecamatan_id: int|null,
     *   desa_kelurahan_id: int|null,
     *   labels: array{negara: string|null, provinsi: string|null, kabupaten_kota: string|null, kecamatan: string|null, desa_kelurahan: string|null}
     * }|null
     */
    private function buildAdmChain(Jamaah $jamaah): ?array
    {
        if (! $jamaah->adm_desa_kelurahan_id || ! $jamaah->relationLoaded('admDesaKelurahan') || ! $jamaah->admDesaKelurahan) {
            return [
                'negara_id' => null,
                'provinsi_id' => null,
                'kabupaten_kota_id' => null,
                'kecamatan_id' => null,
                'desa_kelurahan_id' => null,
                'labels' => [
                    'negara' => null,
                    'provinsi' => null,
                    'kabupaten_kota' => null,
                    'kecamatan' => null,
                    'desa_kelurahan' => null,
                ],
            ];
        }

        $desa = $jamaah->admDesaKelurahan;
        $kecamatan = $desa->kecamatan;
        $kabupaten = $kecamatan?->kabupatenKota;
        $provinsi = $kabupaten?->provinsi;
        $negara = $provinsi?->negara;

        return [
            'negara_id' => $negara?->id,
            'provinsi_id' => $provinsi?->id,
            'kabupaten_kota_id' => $kabupaten?->id,
            'kecamatan_id' => $kecamatan?->id,
            'desa_kelurahan_id' => $desa->id,
            'labels' => [
                'negara' => $negara?->nama,
                'provinsi' => $provinsi?->nama,
                'kabupaten_kota' => $kabupaten?->nama,
                'kecamatan' => $kecamatan?->nama,
                'desa_kelurahan' => $desa->nama,
            ],
        ];
    }
}
