<?php

use App\Http\Controllers\PublicMediaController;
use Illuminate\Support\Facades\Route;

Route::get('/storage/{path}', [PublicMediaController::class, 'show'])
    ->where('path', '.*');

Route::get('/', function () {
    return view('welcome');
});
