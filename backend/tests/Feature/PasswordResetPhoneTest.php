<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:45:00
 */

namespace Tests\Feature;

use App\Models\Jamaah;
use App\Models\PasswordResetRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\Support\CreatesAuthorizedUser;
use Tests\TestCase;

class PasswordResetPhoneTest extends TestCase
{
    use CreatesAuthorizedUser;
    use RefreshDatabase;

    public function test_forgot_password_with_phone_sends_otp_via_log_driver(): void
    {
        Log::fake();
        config([
            'sms.default' => 'log',
            'sms.password_reset_enabled' => true,
            'app.debug' => true,
        ]);

        $user = $this->createAuthorizedUser(username: 'reset.phone', permissionSlugs: []);
        $phone = '081234567890';
        Jamaah::query()->create([
            'nama' => $user->name,
            'gender' => 'L',
            'no_hp' => $phone,
            'email' => 'reset.phone@sijama.test',
            'status' => 'aktif',
        ]);
        $user->update(['jamaah_id' => Jamaah::query()->where('no_hp', $phone)->value('id')]);

        $response = $this->postJson('/api/forgot-password', [
            'identifier' => $phone,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.channel', 'phone');

        $this->assertDatabaseHas('password_reset_requests', [
            'user_id' => $user->id,
            'channel' => PasswordResetRequest::CHANNEL_PHONE,
        ]);

        Log::assertLogged(fn ($log) => str_contains($log->message, 'SMS (log driver)'));
    }

    public function test_reset_password_with_valid_otp_updates_password(): void
    {
        Log::fake();
        config([
            'sms.default' => 'log',
            'sms.password_reset_enabled' => true,
            'app.debug' => true,
        ]);

        $user = $this->createAuthorizedUser(username: 'reset.otp', permissionSlugs: []);
        $phone = '082199275053';
        Jamaah::query()->create([
            'nama' => $user->name,
            'gender' => 'L',
            'no_hp' => $phone,
            'email' => 'reset.otp@sijama.test',
            'status' => 'aktif',
        ]);
        $user->update(['jamaah_id' => Jamaah::query()->where('no_hp', $phone)->value('id')]);

        $this->postJson('/api/forgot-password', ['identifier' => $phone])->assertOk();

        $loggedMessage = null;
        Log::assertLogged(function ($log) use (&$loggedMessage) {
            if (! str_contains($log->message, 'SMS (log driver)')) {
                return false;
            }
            $loggedMessage = $log->context['message'] ?? null;

            return is_string($loggedMessage);
        });

        $this->assertNotNull($loggedMessage);
        preg_match('/(\d{6})/', $loggedMessage, $matches);
        $this->assertNotEmpty($matches[1] ?? null);
        $otp = $matches[1];

        $response = $this->postJson('/api/reset-password', [
            'identifier' => $phone,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
            'otp' => $otp,
        ]);

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('password_reset_requests', [
            'user_id' => $user->id,
        ]);

        $this->postJson('/api/login', [
            'username' => 'reset.otp',
            'password' => 'new-password-123',
        ])->assertOk();
    }

    public function test_fonnte_driver_sends_normalized_phone(): void
    {
        Http::fake([
            'api.fonnte.com/*' => Http::response([
                'status' => true,
                'detail' => 'success! message in queue',
            ]),
        ]);

        config([
            'sms.default' => 'fonnte',
            'sms.password_reset_enabled' => true,
            'sms.drivers.fonnte.token' => 'test-token',
        ]);

        $user = $this->createAuthorizedUser(username: 'reset.fonnte', permissionSlugs: []);
        $phone = '082199275053';
        Jamaah::query()->create([
            'nama' => $user->name,
            'gender' => 'L',
            'no_hp' => $phone,
            'email' => 'reset.fonnte@sijama.test',
            'status' => 'aktif',
        ]);
        $user->update(['jamaah_id' => Jamaah::query()->where('no_hp', $phone)->value('id')]);

        $this->postJson('/api/forgot-password', ['identifier' => $phone])
            ->assertOk()
            ->assertJsonPath('data.channel', 'phone');

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.fonnte.com/send'
                && $request['target'] === '6282199275053'
                && str_contains($request['message'], 'Kode OTP reset password');
        });
    }

    public function test_forgot_password_with_phone_returns_maintenance_when_disabled(): void
    {
        config(['sms.password_reset_enabled' => false]);

        $response = $this->postJson('/api/forgot-password', [
            'identifier' => '082199275053',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
        $this->assertStringContainsString(
            'maintenance',
            strtolower((string) data_get($response->json(), 'message', '')),
        );
    }
}
