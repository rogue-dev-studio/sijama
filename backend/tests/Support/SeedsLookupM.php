<?php

namespace Tests\Support;

use Database\Seeders\LookupMSeeder;

trait SeedsLookupM
{
    protected function seedLookupM(): void
    {
        $this->seed(LookupMSeeder::class);
    }
}
