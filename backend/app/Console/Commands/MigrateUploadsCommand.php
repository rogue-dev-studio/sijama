<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:45:00
 */

namespace App\Console\Commands;

use App\Support\UploadStorage;
use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

class MigrateUploadsCommand extends Command
{
    protected $signature = 'storage:migrate-uploads
                            {--source=public : Source disk name}
                            {--target= : Target disk (default: filesystems.upload_disk)}
                            {--dry-run : Preview files without copying}
                            {--delete-source : Delete source object after successful copy}';

    protected $description = 'Migrate user uploads from local public disk to the configured upload disk (S3/R2)';

    public function handle(): int
    {
        $sourceName = (string) $this->option('source');
        $targetName = (string) ($this->option('target') ?: UploadStorage::diskName());

        if ($sourceName === $targetName) {
            $this->warn("Source and target are both [{$sourceName}]. Nothing to migrate.");

            return self::SUCCESS;
        }

        $source = Storage::disk($sourceName);
        $target = Storage::disk($targetName);

        if (! $this->diskAvailable($source, $sourceName) || ! $this->diskAvailable($target, $targetName)) {
            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $deleteSource = (bool) $this->option('delete-source');
        $copied = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($source->allFiles() as $relative) {
            if ($target->exists($relative)) {
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->line("would copy: {$relative}");
                $copied++;

                continue;
            }

            try {
                $stream = $source->readStream($relative);
                if ($stream === false) {
                    throw new \RuntimeException('Unable to read source stream');
                }

                $target->writeStream($relative, $stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }

                $copied++;

                if ($deleteSource) {
                    $source->delete($relative);
                }
            } catch (\Throwable $exception) {
                $failed++;
                $this->error("failed: {$relative} — {$exception->getMessage()}");
            }
        }

        $suffix = $dryRun ? ' (dry-run)' : '';
        $this->info("Migrate uploads complete. copied={$copied} skipped={$skipped} failed={$failed}{$suffix}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function diskAvailable(Filesystem $disk, string $name): bool
    {
        try {
            $disk->directories('/');

            return true;
        } catch (\Throwable $exception) {
            $this->error("Disk [{$name}] unavailable: {$exception->getMessage()}");

            return false;
        }
    }
}
