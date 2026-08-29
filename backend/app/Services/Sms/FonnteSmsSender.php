<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:40:00
 */

namespace App\Services\Sms;

use App\Contracts\SmsSender;
use App\Support\PhoneNumberNormalizer;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FonnteSmsSender implements SmsSender
{
    public function send(string $phone, string $message): void
    {
        $token = (string) config('sms.drivers.fonnte.token');
        if ($token === '') {
            throw new RuntimeException('FONNTE_TOKEN belum dikonfigurasi.');
        }

        $target = PhoneNumberNormalizer::toInternationalDigits(
            $phone,
            (string) config('sms.drivers.fonnte.country_code', '62'),
        );

        if (! $target) {
            throw new RuntimeException('Nomor HP tidak valid untuk pengiriman SMS.');
        }

        $response = Http::asForm()
            ->withHeaders(['Authorization' => $token])
            ->timeout(15)
            ->post((string) config('sms.drivers.fonnte.endpoint'), [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Gateway SMS merespons error HTTP '.$response->status().'.');
        }

        $payload = $response->json();
        $accepted = ($payload['status'] ?? false) === true
            || ($payload['detail'] ?? '') === 'success! message in queue';

        if (! $accepted) {
            $reason = is_string($payload['reason'] ?? null)
                ? $payload['reason']
                : (is_string($payload['detail'] ?? null) ? $payload['detail'] : 'unknown');

            throw new RuntimeException('Gateway SMS menolak pengiriman: '.$reason);
        }
    }
}
