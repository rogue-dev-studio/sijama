# SQL Definitions Workflow

SIJAMA database schema is maintained as **one PostgreSQL definition file per table** under `definitions/`.

Fresh install / remigrate expects **create-only** migrations. Do not keep alter/rename/add fragment migrations in the tree when the project is still on `migrate:fresh --seed`.

## Layout

| Path | Purpose |
|------|---------|
| `definitions/{table_name}.sql` | Canonical `CREATE TABLE` + indexes (+ FKs when create order allows) |
| `definitions/{name}_v.sql` | PostgreSQL view |
| `definitions/{name}_mv.sql` | Materialized view |
| `definitions/{name}_fn.sql` | PostgreSQL function |
| `support/RunsSqlDefinitions.php` | Trait: run SQL or delegate to SQLite |
| `support/SqliteSchema.php` | SQLite / PHPUnit equivalent of table DDL |

Wilayah naming (`docs/architecture/database-table-naming-v1.0.0.md`):

- `wilayah_adm_*_m` — administratif
- `wilayah_fung_*_m` — organisasi SIJAMA

## Migration pattern

Each table migration:

```php
public function up(): void
{
    $this->createFromDefinition('table_name');
}

public function down(): void
{
    $this->dropTable('table_name');
}
```

## Driver behavior

- **PostgreSQL:** runs `definitions/{table}.sql` via `DB::unprepared()`.
- **SQLite (tests):** `SqliteSchema::create()` mirrors the same final columns.

## Schema changes (remigrate-first)

1. Update the canonical `definitions/{table}.sql` (final columns only).
2. Mirror the same columns in `SqliteSchema`.
3. Prefer `migrate:fresh --seed` locally / early environments.
4. Do **not** leave alter/rename/add PHP migrations + fragment SQL for columns that already belong in the create definition.

### Note: `users` scope columns

`users.dapukan_id` / `jamaah_id` / `wilayah_fung_*_id` live on the create definition as nullable BIGINT + indexes.  
DB foreign keys are omitted because those parent tables are created **after** `users` (and `jamaah_id` is circular with `jamaah_r`). Integrity remains enforced in application services / Eloquent relations.

## Removed alter fragments (folded into create)

- `users_scope.sql` → `users.sql`
- `konfigsystem_k_api_co_id_holiday.sql`, `konfigsystem_k_font_family.sql`, `konfigsystem_k_integration_meta.sql` → `konfigsystem_k.sql` (final `db_*` names, not `aiven_*`)
- Feedback username/images/contact + error-log status → create definitions (`app_feedback_module.sql`, `app_error_log_t.sql`)
