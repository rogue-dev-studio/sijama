<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:14:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:14:00
 */

use App\Models\KonfigSystemK;
use App\Support\SystemKonfig;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$k = KonfigSystemK::query()->notDeleted()->orderBy('konfigsystem_id')->first();

if (! $k) {
    fwrite(STDERR, "No konfig row\n");
    exit(1);
}

$mailer = env('MAIL_MAILER', 'smtp');
$payload = [
    'mail_protocol' => $mailer === 'log' ? 'log' : 'smtp',
    'smtp_hostname' => env('MAIL_HOST'),
    'smtp_username' => env('MAIL_USERNAME'),
    'smtp_port' => (int) env('MAIL_PORT', 587),
    'smtp_timeout' => 30,
    'smtp_encryption' => env('MAIL_ENCRYPTION', 'tls'),
    'mail_from_address' => env('MAIL_FROM_ADDRESS'),
    'mail_from_name' => env('MAIL_FROM_NAME') ?: config('app.name', 'SIJAMA'),
    'mail_reply_to' => env('MAIL_FROM_ADDRESS'),
    'password_reset_phone_enabled' => filter_var(env('PASSWORD_RESET_PHONE_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
    'sms_driver' => env('SMS_DRIVER', 'log'),
    'sms_country_code' => env('SMS_COUNTRY_CODE', '62'),
    'fonnte_endpoint' => env('FONNTE_ENDPOINT', 'https://api.fonnte.com/send'),
    'last_modified_date' => now(),
    'modified_count' => ((int) $k->modified_count) + 1,
];

if ($password = env('MAIL_PASSWORD')) {
    $payload['smtp_password'] = $password;
}

if ($token = env('FONNTE_TOKEN')) {
    $payload['fonnte_token'] = $token;
}

$k->fill($payload);
$k->save();
SystemKonfig::forgetCache();
SystemKonfig::applyRuntimeConfig();

echo json_encode([
    'id' => $k->konfigsystem_id,
    'smtp_hostname' => $k->smtp_hostname,
    'smtp_username' => $k->smtp_username,
    'smtp_port' => $k->smtp_port,
    'smtp_password_set' => filled($k->smtp_password),
    'mail_from_address' => $k->mail_from_address,
    'mail_protocol' => $k->mail_protocol,
], JSON_PRETTY_PRINT).PHP_EOL;
