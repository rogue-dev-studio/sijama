<?php

namespace App\Providers;

use App\Contracts\SmsSender;
use App\Services\Sms\SmsSenderManager;
use App\Support\SystemKonfig;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SmsSenderManager::class);

        $this->app->bind(SmsSender::class, fn ($app) => $app
            ->make(SmsSenderManager::class)
            ->driver());
    }

    public function boot(): void
    {
        try {
            SystemKonfig::applyRuntimeConfig();
        } catch (\Throwable) {
            // DB may be unavailable during early boot / artisan package:discover.
        }
    }
}
