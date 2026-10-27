# Titan email for account enquiries

> Superseded on 27 October 2026: enquiry delivery now uses Admin → Website enquiries. SMTP notifications are disabled. This guide is retained only as a historical reference; do not enable it for the current workflow.

The website saves each enquiry, then queues a notification when enabled. A running queue worker sends it to the configured mailbox. Enquiries remain in the database if delivery fails. This does not activate a trading account.

## 1. Get the mailbox settings

Sign in to Titan Webmail. Open Settings and the third-party app configuration to confirm the SMTP host for your mailbox. Most accounts use `smtp.titan.email`; EU-hosted accounts may use `smtp0101.titan.email`. Use the host shown by your provider.

For an account with two-factor authentication, create an application password: Settings → Preferences → Account & Security → Security & Access → Two-Factor Authentication → Manage → Application Password. Name it for this website and copy it securely. Do not paste mailbox passwords in chat, source code, public files, or Admin Settings.

Official instructions:
- https://support.titan.email/hc/en-us/articles/4405162224665-Configuring-Titan-on-Email-Scripts
- https://support.titan.email/hc/en-us/articles/59899461438233-Application-Password-in-Titan-for-Third-Party-Clients

## 2. Configure the private server environment

Edit the project's private `.env` file or your hosting environment variables. Replace the example addresses and password below with your own. Keep the authenticated mailbox and From address the same.

```dotenv
MAIL_MAILER=smtp
MAIL_SCHEME=smtps
MAIL_HOST=smtp.titan.email
MAIL_PORT=465
MAIL_USERNAME="website@yourdomain.com"
MAIL_PASSWORD="YOUR_TITAN_APPLICATION_PASSWORD"
MAIL_FROM_ADDRESS="website@yourdomain.com"
MAIL_FROM_NAME="Marwadi Finance broker"
ENQUIRY_MAIL_ENABLED=true
ENQUIRY_MAIL_TO="admin@yourdomain.com"
QUEUE_CONNECTION=database
```

Leave `ENQUIRY_MAIL_TO` empty to use the business email in Admin → Settings. The From mailbox remains server-controlled; the visitor's address is used only as Reply-To. Remove a pre-existing `MAIL_URL` if it overrides these individual settings.

Alternative: port `587` uses `MAIL_SCHEME=smtp` with STARTTLS negotiated by the mail transport. Do not use `MAIL_SCHEME=tls`; this Laravel version uses `smtp`/`smtps`. Keep TLS certificate verification enabled. If PHP reports a certificate trust error, configure `openssl.cafile` with a trusted CA bundle.

## 3. Apply settings and run the worker

Run from the project directory using your PHP executable (or `php` if it is on PATH):

```powershell
php artisan migrate --force
php artisan config:clear
php artisan queue:restart
php artisan queue:work database --queue=default --sleep=3 --tries=3 --timeout=60
```

Keep the worker running. On production, use your hosting process manager to restart it automatically. Configure cached environment settings with `php artisan config:cache` after final server setup. On shared hosting without persistent workers, schedule `php artisan queue:work database --stop-when-empty --tries=3 --timeout=60` every minute with overlapping execution prevented.

## 4. Verify delivery

Submit a fictional test enquiry through Open an account. Confirm the success reference, then verify the email arrives in the admin inbox (including spam). It should contain name, email, mobile, city, interest, message and submission time. Reply should address the visitor. Do not submit real PAN or identity documents for testing.

Check saved enquiries from server access:

```powershell
php artisan enquiries:list
php artisan queue:failed
```

Failed SMTP jobs retry automatically up to three attempts. After fixing settings, restart the worker and retry the relevant failed-job UUID:

```powershell
php artisan queue:retry FAILED_JOB_UUID
```

For a saved enquiry that was not queued while email was disabled, use its numeric reference:

```powershell
php artisan enquiries:notify 123
```

The send timestamp prevents intentionally re-notifying an already sent enquiry. Like most SMTP queues, a crash after provider acceptance but before recording the timestamp can cause a duplicate on retry. SMTP acceptance is not proof of inbox delivery.

If authentication fails, check the full mailbox username, application password and third-party access. If connection times out, ask hosting to allow outbound SMTP port 465 or 587. Configure the domain's SPF/DKIM records using Titan/provider instructions for deliverability. Never disable TLS verification to bypass connection errors.

## Current readiness

Code and automated tests are ready. Live delivery needs your real Titan mailbox settings and a running queue worker; no real SMTP delivery has been claimed or tested using your mailbox.
