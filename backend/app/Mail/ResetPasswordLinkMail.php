<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $appName,
        public readonly string $resetUrl,
        public readonly int $expiresMinutes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset password '.$this->appName,
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.reset-password-link',
        );
    }
}
