# Public website and investment workspace integration

The Laravel application in `D:\marwadi` now includes the login and complete administrator/client workspace from `D:\Xampp\htdocs\newcode`.

## Entry points

- `/` remains the public Marwadi Finance broker website, for guests and signed-in users.
- The public header Login link now opens `/login` directly. The previous external login dropdown is removed from all 16 public page templates.
- `/login` accepts an existing email address or Client ID and password.
- Successful sign-in opens `/workspace`, the administrator or client dashboard selected by the account role. An intended protected destination is respected.
- Administrator routes remain under `/admin/...`; client/shared routes retain the source application's route names and paths. They require authentication and workspace access. Administrator-only actions retain their role restriction.
- Logout is a CSRF-protected POST, invalidates the session and returns to `/login`.
- Login includes a Back to website link. Its logo also links to the public homepage.

## What was merged

Authentication and workspace controllers; user/client and financial models; ledger, document and client-ID services; role middleware; Blade components and screens; JavaScript and CSS; the additional SQL migrations; source console commands; and the source feature-test suite.

Public website enquiries, market display, logo, content, colours and routes are retained. The workspace has a separate stylesheet override matching the charcoal/gold identity, while preserving its existing layout and light/dark mode. Source files were copied into this project; runtime operation does not require the old source directory or its database.

## Existing records

The source MariaDB database was read in a read-only transaction. A one-time copy was imported into this project's existing SQLite database after additive migrations:

| Table | Imported records |
|---|---:|
| Users | 25 |
| Clients | 24 |
| Positions | 75 |
| Deposits | 40 |
| Withdrawals | 21 |
| Documents | 4 |
| Workspace settings | 1 |
| Audit events | 194 |
| Client ID sequence | 1 |

All 25 password hashes were verified unchanged against the source. Existing encrypted client-password values were decrypted with the source application's key in memory and encrypted under this application's existing key. No passwords or keys were printed or written to an export file. Remember tokens were cleared so users authenticate in this application separately.

Four document files were copied and SHA-256 verified into private local storage under `storage/app/private/workspace/`. The protected document controller remains responsible for access checks. Private storage is not publicly served.

The original `newcode` files and database were not modified. This is a snapshot import: later edits in the old application do not automatically synchronize to this one. Use this merged application going forward if it is to be the active system.

Before migration, the public website database was backed up to `storage/app/integration-backups/website-before-workspace.sqlite`. These files and private documents remain outside the public web root and are ignored by the storage Git rules.

## Verification

`php artisan test --compact`: 73 passed, 2 skipped. The skipped source tests require a separate MariaDB test database and are unrelated to normal SQLite operation. Coverage includes email/Client ID login, role checks, client isolation, session invalidation, financial calculations, deposits, withdrawals, archival, uploads, protected files, password handling, enquiry persistence and public pages.

Browser verification passed using an isolated test database and fictional test accounts: public Login navigation, administrator/client authentication, client management, administrator-route denial for clients, logout, guest protection, desktop/mobile layouts, no JavaScript exceptions and no missing assets. Screenshots are under `qa/screenshots/workspace/` and the summary is `qa/workspace-verification.json`.

The old README's documented demo administrator password did not authenticate against the copied records. No account was reset to make it match. Existing real credentials remain unchanged; the browser checks used independent test accounts instead.

## Verification commands

```powershell
php artisan test --compact
php artisan view:cache
```

For isolated browser verification, run `php qa/prepare-workspace-browser.php`, use its database path from `qa/workspace-browser-database.json` as `DB_DATABASE` in a separate PHP-server process on port 8002, set that process's `APP_URL` accordingly and give it a separate `SESSION_COOKIE`. In another process set `WORKSPACE_QA_URL=http://127.0.0.1:8002` and run `node qa/check-workspace-integration.mjs`. Stop the test server afterwards. Do not point it at the live database.

`qa/import-workspace-data.php` is a one-time migration utility and refuses to import into an account database that is already populated. Do not rerun it to synchronize applications. `qa/inspect-workspace-source.php` verifies source counts and copied password hashes without printing credentials.

## Account administration

Public account-opening forms still save enquiries and do not create investment accounts automatically. Authorised administrators create and manage client accounts inside the workspace. Existing users sign in with their current credentials. The source application's optional administrator-confirmed client-password reveal feature is retained, including its encryption, rate limits and audit events.
