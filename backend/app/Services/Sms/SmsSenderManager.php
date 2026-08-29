<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:40:00
 */

namespace App\Services\Sms;

use App\Contracts\SmsSender;
use InvalidArgumentException;

class SmsSenderManager
{
    public function driver(?string $name = null): SmsSender
    {
        $name ??= (string) config('sms.default', 'log');

        return match ($name) {
            'log' => app(LogSmsSender::class),
            'fonnte' => app(FonnteSmsSender::class),
            default => throw new InvalidArgumentException("SMS driver [{$name}] tidak dikenali."),
        };
    }
}
