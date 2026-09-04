<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use PDO;
use PDOException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $this->isolatePgsqlTestingDatabaseEnv();
        $this->ensurePgsqlTestingDatabase();

        return parent::createApplication();
    }

    private function isolatePgsqlTestingDatabaseEnv(): void
    {
        putenv('DB_CONNECTION=pgsql');
        putenv('DB_DATABASE=sijama_testing');
        $_ENV['DB_CONNECTION'] = 'pgsql';
        $_ENV['DB_DATABASE'] = 'sijama_testing';
        $_SERVER['DB_CONNECTION'] = 'pgsql';
        $_SERVER['DB_DATABASE'] = 'sijama_testing';
    }

    private function ensurePgsqlTestingDatabase(): void
    {
        $connection = (string) ($_ENV['DB_CONNECTION'] ?? getenv('DB_CONNECTION') ?: 'pgsql');
        if ($connection !== 'pgsql') {
            return;
        }

        $database = (string) ($_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'sijama_testing');
        if ($database === '' || $database === 'sijama' || ! preg_match('/^[A-Za-z0-9_]+$/', $database)) {
            return;
        }

        $host = (string) ($_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1');
        $port = (string) ($_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '5432');
        $username = (string) ($_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'sijama');
        $password = (string) ($_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: 'sijama');

        try {
            $pdo = new PDO(
                "pgsql:host={$host};port={$port};dbname=postgres",
                $username,
                $password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
            );
            $exists = $pdo->query('SELECT 1 FROM pg_database WHERE datname = '.$pdo->quote($database))->fetchColumn();
            if (! $exists) {
                $pdo->exec('CREATE DATABASE '.$database);
            }
        } catch (PDOException) {
            // RefreshDatabase will report the connection error.
        }
    }
}
