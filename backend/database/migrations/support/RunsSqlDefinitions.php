<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:50:00
 */

namespace Database\Migrations\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

trait RunsSqlDefinitions
{
    protected function createFromDefinition(string $table): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            $this->runSqlDefinition("{$table}.sql");

            return;
        }

        SqliteSchema::create($table);
    }

    protected function dropTable(string $table): void
    {
        Schema::dropIfExists($table);
    }

    protected function runAlterDefinition(string $name): void
    {
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            $this->runSqlDefinition("{$name}.sql");

            return;
        }

        SqliteSchema::applyAlter($name);
    }

    protected function runSqlDefinition(string $filename): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        $path = database_path('migrations/definitions/'.$filename);

        if (! is_readable($path)) {
            throw new \RuntimeException("SQL definition not found: {$path}");
        }

        DB::unprepared((string) file_get_contents($path));
    }

    protected function createReportingObjectFromDefinition(string $name): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        $this->runSqlDefinition("{$name}.sql");
    }
}
