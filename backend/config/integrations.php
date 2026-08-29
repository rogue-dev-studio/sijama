<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:22:19
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:22:19
 */

return [

    'telegram' => [
        'enabled' => filter_var(env('TELEGRAM_BOT_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'bot_username' => env('TELEGRAM_BOT_USERNAME'),
        'default_chat_id' => env('TELEGRAM_DEFAULT_CHAT_ID'),
    ],

    'n8n' => [
        'enabled' => filter_var(env('N8N_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
        'base_url' => env('N8N_BASE_URL'),
        'webhook_url' => env('N8N_WEBHOOK_URL'),
        'api_key' => env('N8N_API_KEY'),
    ],

];
