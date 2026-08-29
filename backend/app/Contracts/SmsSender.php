<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:40:00
 */

namespace App\Contracts;

interface SmsSender
{
    public function send(string $phone, string $message): void;
}
