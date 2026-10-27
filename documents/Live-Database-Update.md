# Update the existing live database

This update adds the new business contact settings, social links, and enquiry email fields. It does not replace client accounts or financial records. The SQL file targets MySQL/MariaDB, not the local SQLite database. It assumes the live database already has the integrated client workspace and Laravel migrations table.

## Preferred method: Laravel migrations

1. Back up the live database and private uploaded files. Keep the existing live `.env` and `APP_KEY`.
2. Upload the updated application files and migrations.
3. From the live project directory, run:

```sh
php artisan migrate:status
php artisan migrate --pretend
php artisan migrate --force
php artisan optimize:clear
php artisan queue:restart
```

Review pending migrations before applying them. `migrate --force` runs all pending migrations, not just these changes. The new migrations described here add nullable columns and keep existing records. Do not run `migrate:fresh`, `migrate:refresh`, `db:wipe`, or a demo seeder on the live database.

## Alternative: phpMyAdmin SQL import

Use this only if you cannot run the Laravel commands. Do not import a full local database dump over the live one.

1. In phpMyAdmin, select the existing live database used by the site's `.env`.
2. Export a full SQL backup first.
3. Open the SQL tab or Import tab and run `documents/sql/2026-10-27-live-settings-update.mysql.sql`.
4. Confirm the final query shows all six new columns. It also creates the enquiry table if missing and records the equivalent Laravel migrations.
5. Upload the matching application changes and clear the Laravel application/config/view caches through your hosting tools. Restart the queue worker if running.
6. Verify Admin Settings, client sign-in and an existing client record. Submit a fictional enquiry to verify saving. Email delivery additionally needs SMTP settings and the queue worker.

The SQL skips columns that already exist, but it does not fix an existing column with an incompatible type. It expects unprefixed tables named `workspace_settings`, `enquiries` and `migrations`. If your tables have a prefix or a different schema, use Laravel migrations or adapt the SQL before importing. MySQL schema changes can auto-commit, so a failed import may be partially applied. Review any error before continuing. Do not use a Laravel rollback as a safety mechanism: the down migrations remove the new fields and their saved values.

## What happens to old data?

| Action | Result |
|---|---|
| Apply this update to the existing database | Existing records stay; new fields are added. |
| Point `.env` at a new empty database | The website sees an empty database. Old records remain in the old database, but are not copied automatically. |
| Export the old database and restore it into a new database, then apply the update | Old records are carried over, provided the export/restore is complete. |
| Replace the live database with a local/demo database | Live records can be lost or overwritten. Do not do this. |

For a move to a new database, export the live data first, restore it into the new database, preserve the live `APP_KEY`, copy private uploads, and only then switch the database credentials. Verify accounts, financial records and documents before retiring the old database. A database backup alone does not include uploaded files.

The SQL file has been checked against the project migrations. It has not been executed against your live server; live access and database version have not been provided.
