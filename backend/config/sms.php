<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default SMS Driver
    |--------------------------------------------------------------------------
    |
    | Supported: "log", "fonnte"
    |
    | log    — OTP dicatat di log backend (dev lokal)
    | fonnte — https://fonnte.com (WhatsApp/SMS gateway Indonesia)
    |
    */

    'default' => env('SMS_DRIVER', 'log'),

    /*
    | Sementara false: reset password via no. HP dalam maintenance.
    | Set true bila gateway SMS siap production.
    */
    'password_reset_enabled' => filter_var(
        env('PASSWORD_RESET_PHONE_ENABLED', false),
        FILTER_VALIDATE_BOOLEAN,
    ),

    'from' => env('SMS_FROM', env('APP_NAME', 'SIJAMA')),

    'drivers' => [

        'log' => [
            'channel' => env('SMS_LOG_CHANNEL', env('LOG_CHANNEL', 'stack')),
        ],

        'fonnte' => [
            'token' => env('FONNTE_TOKEN'),
            'endpoint' => env('FONNTE_ENDPOINT', 'https://api.fonnte.com/send'),
            'country_code' => env('SMS_COUNTRY_CODE', '62'),
        ],

    ],

];
