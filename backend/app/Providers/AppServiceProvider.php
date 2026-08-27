<?php

namespace App\Providers;

use App\Support\SystemKonfig;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
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
