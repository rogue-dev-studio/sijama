<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\LoginRememberOptions;
use App\Support\SystemKonfig;
use App\Support\UserLoginResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private readonly RbacMenuService $rbacMenuService,
        private readonly TrustedAdminDeviceService $trustedAdminDeviceService,
    ) {}

    public function login(string $username, string $password, ?Request $request = null): array
    {
        $login = trim($username);
        $user = UserLoginResolver::findByIdentifier($login);

        if (! $user) {
            throw ValidationException::withMessages([
                'username' => [UserLoginResolver::failureMessage($login) ?? 'Kredensial tidak valid.'],
            ]);
        }

        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Kredensial tidak valid.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif.'],
            ]);
        }

        $konfig = SystemKonfig::active();
        if ($konfig?->maintenance_mode && ! $user->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'username' => ['Aplikasi sedang dalam maintenance. Hanya Super Admin yang dapat masuk.'],
            ]);
        }

        $rememberMe = $request !== null
            ? $request->boolean('remember_me', true)
            : true;

        if (! $rememberMe) {
            $user->update([
                'login_remember_minutes' => null,
                'login_remember_until_logout' => false,
            ]);
            $user->refresh();
        }

        $expiresAt = LoginRememberOptions::resolveLoginExpiration(
            $user->login_remember_minutes,
            (bool) $user->login_remember_until_logout,
            $rememberMe,
        );
        $newToken = $user->createToken('api-token', ['*'], $expiresAt);
        $accessToken = $newToken->accessToken;
        $accessToken->forceFill([
            'ip_address' => $request?->ip(),
            'user_agent' => Str::limit($request?->userAgent() ?? '', 512),
        ])->save();

        $token = $newToken->plainTextToken;

        $this->trustedAdminDeviceService->remember(
            $user,
            $request,
            $request?->header('X-Device-Key'),
        );

        return array_merge(
            [
                'token' => $token,
                'token_expires_at' => $expiresAt?->toIso8601String(),
            ],
            $this->buildAuthPayload($user)
        );
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function buildAuthPayload(User $user): array
    {
        $user->loadMissing(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok']);

        return [
            'user' => (new UserResource($user))->resolve(),
            'permissions' => $user->permissionCodes(),
            'menus' => $this->rbacMenuService->getAccessibleMenus($user),
            'app_settings' => SystemKonfig::publicSettings(),
        ];
    }
}
