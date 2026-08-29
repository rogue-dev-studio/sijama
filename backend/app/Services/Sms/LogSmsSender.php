<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:40:00
 */

namespace App\Services\Sms;

use App\Contracts\SmsSender;
use App\Support\UserContactResolver;
use Illuminate\Support\Facades\Log;

class LogSmsSender implements SmsSender
{
    public function send(string $phone, string $message): void
    {
        Log::channel(config('sms.drivers.log.channel'))
            ->info('SMS (log driver)', [
                'phone_masked' => UserContactResolver::maskPhone($phone),
                'message' => config('app.debug') ? $message : '[hidden]',
            ]);
    }
}
