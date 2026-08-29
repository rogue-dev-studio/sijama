<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:06:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

namespace App\Support;

use App\Models\KonfigDokumenK;
use App\Models\LookupM;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;


class DocumentKonfig
{
    public const CACHE_KEY = 'konfigdokumen_k.by_lookup';

    public static function forgetCache(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
        } catch (\Throwable) {
            // ignore
        }
    }

    /**
     * Map lookup_value => branding payload (hanya lookup aktif tipe konfig_dokumen).
     *
     * @return array{items: array<string, array<string, mixed>>}
     */
    public static function publicPayload(): array
    {
        if (! Schema::hasTable('konfigdokumen_k') || ! Schema::hasTable('lookup_m')) {
            return ['items' => []];
        }

        try {
            return Cache::remember(self::CACHE_KEY, 15, fn () => self::buildPublicPayload());
        } catch (\Throwable) {
            return self::buildPublicPayload();
        }
    }

    /** @return array{items: array<string, array<string, mixed>>} */
    private static function buildPublicPayload(): array
    {
        $lookups = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::KONFIG_DOKUMEN)
            ->orderBy('lookup_urutan')
            ->orderBy('lookup_id')
            ->get();

        $configs = KonfigDokumenK::query()
            ->notDeleted()
            ->where('is_active', true)
            ->whereIn('lookup_id', $lookups->pluck('lookup_id'))
            ->get()
            ->keyBy('lookup_id');

        $items = [];
        foreach ($lookups as $lookup) {
            $key = trim((string) $lookup->lookup_value);
            if ($key === '') {
                continue;
            }

            $config = $configs->get($lookup->lookup_id);
            $items[$key] = self::mapRow($lookup, $config);
        }

        return ['items' => $items];
    }

    /** @return array<string, mixed> */
    public static function mapRow(LookupM $lookup, ?KonfigDokumenK $config): array
    {
        $defaults = self::fallbackBrand();

        return [
            'lookup_id' => $lookup->lookup_id,
            'lookup_name' => $lookup->lookup_name,
            'lookup_value' => $lookup->lookup_value,
            'lookup_urutan' => $lookup->lookup_urutan,
            'konfigdokumen_id' => $config?->konfigdokumen_id,
            'header' => $config?->header ?? $defaults['header'],
            'header_detail' => $config?->header_detail ?? $defaults['header_detail'],
            'footer' => $config?->footer ?? $defaults['footer'],
            'footer_detail' => $config?->footer_detail ?? $defaults['footer_detail'],
            'path_logo_kiri' => $config?->path_logo_kiri,
            'path_logo_kanan' => $config?->path_logo_kanan,
            'layout_mode' => DocumentHeaderStyle::normalizeLayoutMode(
                $config?->layout_mode ?? $defaults['layout_mode'],
            ),
            'header_style' => DocumentHeaderStyle::normalize($config?->header_style ?? $defaults['header_style']),
            'apply_pdf' => $config ? (bool) $config->apply_pdf : $defaults['apply_pdf'],
            'apply_excel' => $config ? (bool) $config->apply_excel : $defaults['apply_excel'],
            'apply_csv' => $config ? (bool) $config->apply_csv : $defaults['apply_csv'],
            'is_configured' => $config !== null,
            'is_active' => $config ? (bool) $config->is_active : true,
        ];
    }

    /** @return array<string, mixed> */
    public static function fallbackBrand(): array
    {
        return [
            'header' => config('app.name', 'SIJAMA'),
            'header_detail' => 'Sistem Informasi Jamaah',
            'footer' => 'Dokumen dihasilkan oleh SIJAMA',
            'footer_detail' => null,
            'path_logo_kiri' => null,
            'path_logo_kanan' => null,
            'layout_mode' => DocumentHeaderStyle::LAYOUT_KOP_GANDA,
            'header_style' => DocumentHeaderStyle::defaults(),
            'apply_pdf' => true,
            'apply_excel' => true,
            'apply_csv' => false,
        ];
    }

    /** @deprecated gunakan fallbackBrand() */
    public static function fallbackPublicPayload(): array
    {
        return self::fallbackBrand();
    }
}
