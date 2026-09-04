<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

namespace App\Services;

use App\Contracts\SmsSender;
use App\Mail\ResetPasswordLinkMail;
use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Support\DemoUserGuard;
use App\Support\SystemKonfig;
use App\Support\UserContactResolver;
use App\Support\UserLoginResolver;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetService
{
    public function __construct(private readonly SmsSender $smsSender) {}
    private const EMAIL_EXPIRES_MINUTES = 60;

    private const OTP_EXPIRES_MINUTES = 15;

    /**
     * @return array{
     *   channel: string,
     *   masked_destination: string,
     *   expires_in_minutes: int
     * }
     */
    public function requestReset(string $identifier): array
    {
        $identifier = trim($identifier);

        if ($this->looksLikeEmail($identifier) && ! $this->emailResetEnabled()) {
            $this->throwEmailMaintenance();
        }

        if ($this->looksLikePhone($identifier) && ! $this->phoneResetEnabled()) {
            $this->throwPhoneMaintenance();
        }

        $user = UserLoginResolver::findByIdentifier($identifier);

        if (! $user || ! $user->is_active || ! UserContactResolver::matchesContact($user, $identifier)) {
            return $this->genericPendingResponse();
        }

        if (DemoUserGuard::isDemoUser($user)) {
            return $this->genericPendingResponse();
        }

        if (! UserContactResolver::hasResetContact($user)) {
            throw ValidationException::withMessages([
                'identifier' => ['Akun belum memiliki kontak reset yang terdaftar. Hubungi admin.'],
            ]);
        }

        if (UserContactResolver::matchesEmail($user, $identifier)) {
            if (! $this->emailResetEnabled()) {
                $this->throwEmailMaintenance();
            }

            return $this->sendEmailReset($user, UserContactResolver::email($user));
        }

        if (! $this->phoneResetEnabled()) {
            $this->throwPhoneMaintenance();
        }

        return $this->sendPhoneReset($user, UserContactResolver::phone($user));
    }

    public function resetPassword(
        string $identifier,
        string $password,
        ?string $token = null,
        ?string $otp = null,
    ): void {
        $identifier = trim($identifier);
        $user = UserLoginResolver::findByIdentifier($identifier);

        if (! $user || ! $user->is_active || ! UserContactResolver::matchesContact($user, $identifier)) {
            throw ValidationException::withMessages([
                'identifier' => ['Permintaan reset password tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        DemoUserGuard::assertCanChangePassword($user);

        $channel = filled($token)
            ? PasswordResetRequest::CHANNEL_EMAIL
            : PasswordResetRequest::CHANNEL_PHONE;

        if ($channel === PasswordResetRequest::CHANNEL_EMAIL && ! $this->emailResetEnabled()) {
            $this->throwEmailMaintenance();
        }

        if ($channel === PasswordResetRequest::CHANNEL_PHONE && ! $this->phoneResetEnabled()) {
            $this->throwPhoneMaintenance();
        }

        $request = PasswordResetRequest::query()
            ->where('user_id', $user->id)
            ->where('channel', $channel)
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        if (! $request) {
            throw ValidationException::withMessages([
                'identifier' => ['Permintaan reset password tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        $providedSecret = $request->channel === PasswordResetRequest::CHANNEL_EMAIL
            ? trim((string) $token)
            : trim((string) $otp);

        if ($providedSecret === '' || ! hash_equals($request->token_hash, hash('sha256', $providedSecret))) {
            throw ValidationException::withMessages([
                $request->channel === PasswordResetRequest::CHANNEL_EMAIL ? 'token' : 'otp' => [
                    'Kode atau tautan reset tidak valid.',
                ],
            ]);
        }

        $user->update(['password' => $password]);
        PasswordResetRequest::query()->where('user_id', $user->id)->delete();
        $user->tokens()->delete();
    }

    /**
     * @return array{
     *   channel: string,
     *   masked_destination: string,
     *   expires_in_minutes: int
     * }
     */
    private function sendEmailReset(User $user, ?string $email): array
    {
        if (! $email) {
            throw ValidationException::withMessages([
                'identifier' => ['Email belum terdaftar pada akun ini.'],
            ]);
        }

        $plainToken = Str::random(64);
        $this->storeRequest(
            $user,
            PasswordResetRequest::CHANNEL_EMAIL,
            $email,
            $plainToken,
            now()->addMinutes(self::EMAIL_EXPIRES_MINUTES),
        );

        SystemKonfig::applyRuntimeConfig();

        $resetUrl = rtrim((string) config('app.frontend_url'), '/')
            .'/reset-password?channel=email&identifier='.urlencode($email)
            .'&token='.urlencode($plainToken);

        $appName = SystemKonfig::active()?->app_nama ?: config('app.name', 'SIJAMA');

        Mail::to($email)->send(new ResetPasswordLinkMail(
            appName: $appName,
            resetUrl: $resetUrl,
            expiresMinutes: self::EMAIL_EXPIRES_MINUTES,
        ));

        return [
            'channel' => PasswordResetRequest::CHANNEL_EMAIL,
            'masked_destination' => UserContactResolver::maskEmail($email),
            'expires_in_minutes' => self::EMAIL_EXPIRES_MINUTES,
        ];
    }

    /**
     * @return array{
     *   channel: string,
     *   masked_destination: string,
     *   expires_in_minutes: int
     * }
     */
    private function sendPhoneReset(User $user, ?string $phone): array
    {
        if (! $phone) {
            throw ValidationException::withMessages([
                'identifier' => ['Nomor HP belum terdaftar pada akun ini.'],
            ]);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $requestId = $this->storeRequest(
            $user,
            PasswordResetRequest::CHANNEL_PHONE,
            $phone,
            $otp,
            now()->addMinutes(self::OTP_EXPIRES_MINUTES),
        );

        $appName = SystemKonfig::active()?->app_nama ?: config('app.name', 'SIJAMA');
        $message = sprintf(
            'Kode OTP reset password %s: %s. Berlaku %d menit. Jangan bagikan kode ini.',
            $appName,
            $otp,
            self::OTP_EXPIRES_MINUTES,
        );

        try {
            $this->smsSender->send($phone, $message);
        } catch (Throwable) {
            PasswordResetRequest::query()->whereKey($requestId)->delete();

            throw ValidationException::withMessages([
                'identifier' => ['Gagal mengirim OTP ke nomor HP. Coba lagi beberapa saat.'],
            ]);
        }

        return [
            'channel' => PasswordResetRequest::CHANNEL_PHONE,
            'masked_destination' => UserContactResolver::maskPhone($phone),
            'expires_in_minutes' => self::OTP_EXPIRES_MINUTES,
        ];
    }

    private function storeRequest(
        User $user,
        string $channel,
        string $identifier,
        string $plainSecret,
        \DateTimeInterface $expiresAt,
    ): int {
        PasswordResetRequest::query()->where('user_id', $user->id)->delete();

        $request = PasswordResetRequest::query()->create([
            'user_id' => $user->id,
            'channel' => $channel,
            'identifier' => $identifier,
            'token_hash' => hash('sha256', $plainSecret),
            'expires_at' => $expiresAt,
        ]);

        return (int) $request->id;
    }

    /**
     * @return array{
     *   channel: string,
     *   masked_destination: string,
     *   expires_in_minutes: int
     * }
     */
    private function genericPendingResponse(): array
    {
        return [
            'channel' => 'unknown',
            'masked_destination' => '***',
            'expires_in_minutes' => self::EMAIL_EXPIRES_MINUTES,
        ];
    }

    private function phoneResetEnabled(): bool
    {
        return (bool) config('sms.password_reset_enabled', false);
    }

    private function emailResetEnabled(): bool
    {
        return (bool) config('mail.password_reset_enabled', true);
    }

    private function looksLikePhone(string $identifier): bool
    {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        return UserLoginResolver::phoneVariants($identifier) !== [];
    }

    private function looksLikeEmail(string $identifier): bool
    {
        return filter_var($identifier, FILTER_VALIDATE_EMAIL) !== false;
    }

    private function throwPhoneMaintenance(): never
    {
        throw ValidationException::withMessages([
            'identifier' => [
                'Reset password via nomor HP sedang dalam maintenance. Gunakan saluran reset yang tersedia.',
            ],
        ]);
    }

    private function throwEmailMaintenance(): never
    {
        throw ValidationException::withMessages([
            'identifier' => [
                'Reset password via email sedang dalam maintenance. Gunakan saluran reset yang tersedia.',
            ],
        ]);
    }
}
