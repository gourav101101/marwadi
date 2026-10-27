# Marwadi Laravel reference implementation

The site uses a charcoal, gold and warm-white theme based on the supplied Marwadi Finance bull logo, with responsive navigation, service accordions and account-enquiry modals. The supplied logo is preserved in `public/assets/brand/client-logo.jpeg`. Reference-company images and footage have been replaced with project-owned original artwork, an animated hero, SVG icons and backgrounds. Team and office photos await client-supplied originals. See [Original-Media-Guide.md](documents/Original-Media-Guide.md) for saved assets, generation prompts and maintenance.

## Open the site

The Laravel server runs at http://127.0.0.1:8000.

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Use PHP 8.3+ and Laravel 12. Point a web server document root to `D:\marwadi\public`. The production UI needs no Vite build.

## Source and page scope

- Original page markup: `resources/reference/*.html`.
- Retained fonts, layout styles and UI libraries: `public/reference-assets/`. Historical copied media files remain archived there but are no longer referenced by the displayed images or videos.
- Current original artwork, motion footage, icons, backgrounds and visual placeholders: `public/assets/brand/`.
- Integration fixes and live UI code: `public/assets/replica.css` and `public/assets/replica.js`.
- Laravel rendering, enquiries and market endpoint: `app/Http/Controllers/ReferenceController.php`.
- Page allowlist and backwards-compatible routes: `config/reference.php`.

The main menu contains only About, Our Products, Our Services and Contact Us, as requested. Requested pages are local. Out-of-scope informational footer links open their original destinations in another tab.

The original site has no separate Offline Trading page. That requested page uses the same original service-page layout with locally written offline-support text. Five PMS tab-preview images return 404 on the original host. Their spaces retain the original dimensions and display a clearly labelled unavailable-preview panel; the original PMS text and tab interactions are retained.

## Contact address

Set the supplied address in `.env`:

```dotenv
BUSINESS_ADDRESS="Client supplied office address"
```

Then run `php artisan config:clear`. The contact-page and footer address placeholders use this value. All other business copy and leadership details now come from the reference pages.

## Forms and login

Open an Account opens the enquiry modal. Become a Partner, Investor Relations and Download utility links have been removed. Login opens the integrated local administrator/client login from the `newcode` project. The authenticated dashboard is `/workspace`, while `/` remains the public website. See [Workspace-Integration.md](documents/Workspace-Integration.md) for routes, imported records, authentication and verification.

Forms post to this Laravel application and save an enquiry in the private SQLite database. They do not send data to the original website. Original tracking scripts, payment code and OTP calls are removed. This implementation has no connected SMS/OTP or account-opening provider; activation is completed separately. PAN input is optional and is not retained. Forms include consent, CSRF protection, validation and rate limits. No email notification is configured.

Read saved enquiries through server access:

```powershell
php artisan enquiries:list
```

## Market feed

The original ticker layout is populated from the same public market endpoints used by the reference site, through `/market-data`. Laravel validates the JSON, caches it for 60 seconds and shows provider timestamps in quote tooltips. No captured sample prices or artificial movement are used. On feed failure the strip reports that it is unavailable.

On this Windows installation, a local CA bundle at `storage/app/certs/ca-bundle.pem` contains trusted public root certificates exported from the Windows root certificate store. The bundle is ignored by Git. TLS verification stays enabled. Other hosts use their configured system CA trust when this local file is absent.

## Verification

```powershell
php artisan test
node qa/check-replica.mjs
```

The browser check requires `npm.cmd install` and Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. It checks local pages, original modals, dropdowns, accordions, PMS tabs, live market rendering, assets, JavaScript errors, mobile navigation and five viewport widths. Current screenshots are in `qa/screenshots/`.

Reference inspection and import scripts are retained in `qa/`. `qa/mirror-reference.mjs` downloads and sanitizes the requested original pages. If importing again, run `qa/localize-fonts.mjs` and `qa/finalize-reference.mjs` afterwards. The import uses an allowlist of UI scripts and removes original trackers and original form handlers.

## Install elsewhere

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File
php artisan migrate
```

On this machine ZIP is disabled globally. Composer can enable it for one command:

```powershell
php -d extension=zip C:/ProgramData/ComposerSetup/bin/composer.phar install
```

Deploy on a PHP/Laravel host; Sites Worker hosting does not execute PHP. For production set the actual URL, HTTPS and `APP_DEBUG=false`, and configure client-specific onboarding and approved market-feed access as needed.
