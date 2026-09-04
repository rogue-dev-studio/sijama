<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace Database\Seeders;

use App\Models\AppPoll;
use App\Models\AppPollOption;
use Illuminate\Database\Seeder;

class AppPollDemoSeeder extends Seeder
{
    public function run(): void
    {
        $exists = AppPoll::query()
            ->where('title', 'Bagaimana pengalaman Anda memakai SIJAMA?')
            ->exists();

        if ($exists) {
            return;
        }

        $poll = AppPoll::query()->create([
            'title' => 'Bagaimana pengalaman Anda memakai SIJAMA?',
            'description' => 'Bantu kami meningkatkan kualitas layanan dengan memilih jawaban yang paling sesuai.',
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'ends_at' => null,
            'created_by' => null,
        ]);

        $options = [
            'Sangat membantu',
            'Cukup membantu',
            'Biasa saja',
            'Perlu banyak perbaikan',
        ];

        foreach ($options as $index => $label) {
            AppPollOption::query()->create([
                'poll_id' => $poll->id,
                'label' => $label,
                'urutan' => $index + 1,
            ]);
        }
    }
}
