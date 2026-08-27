<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

namespace App\Services;

use App\Http\Resources\KonfigSystemKResource;
use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class KonfigSystemKService
{
    public function current(): JsonResource
    {
        return new KonfigSystemKResource($this->resolveSingleton());
    }

    /** @return array<string, mixed> */
    public function publicSettings(): array
    {
        return SystemKonfig::publicSettings();
    }

    public function resolveModel(): KonfigSystemK
    {
        return $this->resolveSingleton();
    }

    public function upsert(array $data): JsonResource
    {
        $model = $this->resolveSingleton();
        $payload = $this->prepare($data);
        $payload['last_modified_date'] = now();
        $payload['last_modified_by'] = Auth::id();
        $payload['modified_count'] = ((int) $model->modified_count) + 1;
        $model->update($payload);
        SystemKonfig::forgetCache();
        SystemKonfig::applyRuntimeConfig();

        return new KonfigSystemKResource($model->fresh());
    }

    private function resolveSingleton(): KonfigSystemK
    {
        $rows = KonfigSystemK::query()->notDeleted()->orderBy('konfigsystem_id')->get();
        $first = $rows->first();

        foreach ($rows->skip(1) as $extra) {
            $extra->update([
                'is_deleted' => true,
                'is_active' => false,
                'deleted_date' => now(),
                'deleted_by' => Auth::id(),
            ]);
        }

        if ($first) {
            return $first;
        }

        $model = KonfigSystemK::query()->create([
            'created_date' => now(),
            'created_by' => Auth::id(),
            'modified_count' => 0,
            'is_deleted' => false,
            'is_active' => true,
            'maintenance_mode' => false,
            'app_nama' => config('app.name', 'SIJAMA'),
            'nama_instansi' => 'Sistem Informasi Jamaah',
            'header' => config('app.name', 'SIJAMA'),
            'header_detail' => 'Sistem Informasi Jamaah',
            'footer' => 'Rogue Development',
            'website' => 'https://github.com/rogue-dev-studio',
            'footer_link' => 'https://github.com/rogue-dev-studio',
            'footer_detail' => 'Rogue Dev Studio · @rogue-dev-studio',
            'footer_detail_link' => 'https://github.com/rogue-dev-studio',
            'path_logoheader' => null,
            'path_favicon' => null,
            'path_logofooter' => null,
            'path_background' => null,
            'background_style' => 'cover',
            'background_repeat_size' => '28px',
            'color_bg' => null,
            'color_surface' => null,
            'color_ink' => null,
            'color_accent' => null,
            'color_accent_soft' => null,
            'color_muted' => null,
            'color_border' => null,
            'theme_color' => null,
            'timezone' => config('app.timezone', 'Asia/Jakarta'),
            'locale' => config('app.locale', 'id'),
            'mail_protocol' => 'smtp',
            'smtp_encryption' => 'tls',
            'mail_from_address' => config('mail.from.address'),
            'mail_from_name' => config('mail.from.name', config('app.name', 'SIJAMA')),
        ]);
        SystemKonfig::forgetCache();

        return $model;
    }

    private function prepare(array $data): array
    {
        unset($data['is_deleted'], $data['deleted_date'], $data['deleted_by'], $data['smtp_password_set']);

        if (array_key_exists('smtp_password', $data) && ($data['smtp_password'] === null || $data['smtp_password'] === '')) {
            unset($data['smtp_password']);
        }

        return $data;
    }
}
