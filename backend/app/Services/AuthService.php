<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private readonly RbacMenuService $rbacMenuService) {}

    public function login(string $username, string $password): array
    {
        $user = User::with(['dapukan', 'jamaah.dapukan', 'pusat', 'daerah', 'desa', 'kelompok'])
            ->where('username', $username)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Kredensial tidak valid.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return array_merge(
            ['token' => $token],
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
        ];
    }
}
