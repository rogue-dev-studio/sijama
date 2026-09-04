<?php

use App\Http\Middleware\EnsureMaintenanceAccess;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Responses\ApiResponse;
use App\Services\AppErrorLogService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('events:update-statuses')->everyFiveMinutes();
        $schedule->command('kegiatan:generate-rutin')->dailyAt('00:30');
        $schedule->command('reporting:refresh-views')->everyFifteenMinutes();
        $schedule->command('hari-libur:sync --next')->monthlyOn(1, '03:00');
        $schedule->command('integrations:health-check --expiry-only')->dailyAt('07:15');
        $schedule->command('integrations:health-check')->weeklyOn(1, '07:30');
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => EnsureRole::class,
            'permission' => EnsurePermission::class,
            'superadmin' => EnsureSuperAdmin::class,
            'maintenance.access' => EnsureMaintenanceAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->dontReport([
            ValidationException::class,
            AuthenticationException::class,
            AccessDeniedHttpException::class,
            NotFoundHttpException::class,
            ModelNotFoundException::class,
            ServiceUnavailableHttpException::class,
        ]);

        $exceptions->reportable(function (\Throwable $e) {
            try {
                app(AppErrorLogService::class)->recordFromException($e);
            } catch (\Throwable) {
                // Jangan biarkan pencatatan log merusak alur error asli.
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                $detail = collect($e->errors())->flatten()->first();

                return ApiResponse::error(
                    is_string($detail) && $detail !== '' ? $detail : 'Validasi gagal.',
                    $e->errors(),
                    422
                );
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Tidak terautentikasi.', null, 401);
            }
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Data tidak ditemukan.', null, 404);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Endpoint tidak ditemukan.', null, 404);
            }
        });

        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $message = $e->getMessage();

                return ApiResponse::error(
                    is_string($message) && $message !== '' ? $message : 'Akses ditolak.',
                    null,
                    403
                );
            }
        });

        $exceptions->render(function (ServiceUnavailableHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $message = $e->getMessage();

                return ApiResponse::error(
                    is_string($message) && $message !== '' ? $message : 'Aplikasi sedang dalam maintenance.',
                    null,
                    503
                );
            }
        });
    })->create();
