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
use App\Support\DemoUserGuard;
use App\Support\SuperAdminAccess;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ProfileService
{
    public function __construct(
        private readonly LookupOptionsService $lookupOptionsService,
        private readonly ProfilePhotoService $profilePhotoService,
        private readonly ProfileSignatureService $profileSignatureService,
        private readonly AuditActivityService $auditActivityService,
    ) {}

    public function show(User $user, ?PersonalAccessToken $currentAccessToken = null): array
    {
        $user->loadMissing(['dapukan', 'jamaah.dapukan', 'wilayahFungPusat', 'wilayahFungDaerah', 'wilayahFungDesa', 'wilayahFungKelompok']);

        $jamaah = null;
        $admChain = null;

        if ($user->jamaah_id) {
            $model = Jamaah::query()
                ->with([
                    'wilayahFungKelompok.wilayahFungDesa.wilayahFungDaerah',
                    'wilayahAdmDesa.wilayahAdmKecamatan.wilayahAdmKabupatenKota.wilayahAdmProvinsi.wilayahAdmNegara',
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
            'negara', 'wilayah_adm_negara' => AdmNegara::query()
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
            'provinsi', 'wilayah_adm_provinsi' => AdmProvinsi::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('wilayah_adm_negara_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmProvinsi $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kabupaten_kota', 'wilayah_adm_kabupaten_kota' => AdmKabupatenKota::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('wilayah_adm_provinsi_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKabupatenKota $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'kecamatan', 'wilayah_adm_kecamatan' => AdmKecamatan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('wilayah_adm_kabupaten_kota_id', $parentId))
                ->orderBy('nama')
                ->get(['id', 'kode', 'nama'])
                ->map(fn (AdmKecamatan $item) => [
                    'id' => $item->id,
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ])
                ->values()
                ->all(),
            'desa_kelurahan', 'wilayah_adm_desa' => AdmDesaKelurahan::query()
                ->where('is_active', true)
                ->when($parentId, fn ($q) => $q->where('wilayah_adm_kecamatan_id', $parentId))
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
                'jamaah' => ['Akun belum terhubung ke data jamaah.'],
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
        DemoUserGuard::assertCanChangePassword($user);
        SuperAdminAccess::assertCanChangePassword($user);

        $user->update([
            'password' => $password,
        ]);

        $this->auditActivityService->record([
            'module' => AuditActivityService::MODULE_ACCESS,
            'action' => 'password_change_self',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'entity_label' => $user->username,
            'summary' => sprintf('Ganti password sendiri (%s)', $user->username),
            'meta' => ['password_changed' => true],
            'actor' => $user,
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

    public function uploadSignature(User $user, UploadedFile $file): array
    {
        $this->profileSignatureService->upload($user, $file);

        return $this->show($user->fresh(['jamaah.dapukan', 'dapukan']));
    }

    public function deleteSignature(User $user): array
    {
        $this->profileSignatureService->remove($user);

        return $this->show($user->fresh(['jamaah.dapukan', 'dapukan']));
    }

    private function resolveLinkedJamaah(User $user): Jamaah
    {
        if (! $user->jamaah_id) {
            throw ValidationException::withMessages([
                'jamaah' => ['Akun belum terhubung ke data jamaah.'],
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
     *   wilayah_adm_negara_id: int|null,
     *   wilayah_adm_provinsi_id: int|null,
     *   wilayah_adm_kabupaten_kota_id: int|null,
     *   wilayah_adm_kecamatan_id: int|null,
     *   wilayah_adm_desa_id: int|null,
     *   labels: array{wilayah_adm_negara: string|null, wilayah_adm_provinsi: string|null, wilayah_adm_kabupaten_kota: string|null, wilayah_adm_kecamatan: string|null, wilayah_adm_desa: string|null}
     * }|null
     */
    private function buildAdmChain(Jamaah $jamaah): ?array
    {
        if (! $jamaah->wilayah_adm_desa_id || ! $jamaah->relationLoaded('wilayahAdmDesa') || ! $jamaah->wilayahAdmDesa) {
            return [
                'wilayah_adm_negara_id' => null,
                'wilayah_adm_provinsi_id' => null,
                'wilayah_adm_kabupaten_kota_id' => null,
                'wilayah_adm_kecamatan_id' => null,
                'wilayah_adm_desa_id' => null,
                'labels' => [
                    'wilayah_adm_negara' => null,
                    'wilayah_adm_provinsi' => null,
                    'wilayah_adm_kabupaten_kota' => null,
                    'wilayah_adm_kecamatan' => null,
                    'wilayah_adm_desa' => null,
                ],
            ];
        }

        $desa = $jamaah->wilayahAdmDesa;
        $kecamatan = $desa->wilayahAdmKecamatan;
        $kabupaten = $kecamatan?->wilayahAdmKabupatenKota;
        $provinsi = $kabupaten?->wilayahAdmProvinsi;
        $negara = $provinsi?->wilayahAdmNegara;

        return [
            'wilayah_adm_negara_id' => $negara?->id,
            'wilayah_adm_provinsi_id' => $provinsi?->id,
            'wilayah_adm_kabupaten_kota_id' => $kabupaten?->id,
            'wilayah_adm_kecamatan_id' => $kecamatan?->id,
            'wilayah_adm_desa_id' => $desa->id,
            'labels' => [
                'wilayah_adm_negara' => $negara?->nama,
                'wilayah_adm_provinsi' => $provinsi?->nama,
                'wilayah_adm_kabupaten_kota' => $kabupaten?->nama,
                'wilayah_adm_kecamatan' => $kecamatan?->nama,
                'wilayah_adm_desa' => $desa->nama,
            ],
        ];
    }
}
