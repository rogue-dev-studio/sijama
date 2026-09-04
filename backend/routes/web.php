<?php

use App\Http\Controllers\PublicMediaController;
use App\Http\Middleware\PublicMediaHeaders;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::get('/storage/{path}', [PublicMediaController::class, 'show'])
    ->name('storage.public')
    ->withoutMiddleware([
        EncryptCookies::class,
        AddQueuedCookiesToResponse::class,
        StartSession::class,
        ShareErrorsFromSession::class,
        VerifyCsrfToken::class,
    ])
    ->middleware(PublicMediaHeaders::class)
    ->where('path', '.*');

Route::get('/', function () {
    return view('welcome');
});
