# Website enquiries in admin

Open **Admin → Website enquiries** (`/admin/enquiries`) to see account requests and other enquiries submitted on the public website.

- Newest submissions appear first with reference, time, name, email, mobile, interest and city.
- Search by name, email, mobile or city; filter to Open an account requests.
- Open View details to read the complete message and contact the visitor using email/phone links.
- Guest visitors and client accounts cannot access the inbox.
- Enquiries do not create or activate client accounts automatically.
- Existing saved enquiries appear too. No existing records are removed.

SMTP is no longer required. Public submissions do not enqueue mail. The retained email worker is disabled by the enquiry configuration.

## Deploy this change

Upload the updated code, views and configuration. Keep the existing live database and private environment. Run `php artisan optimize:clear` and `php artisan queue:restart` so existing workers pick up the disabled email configuration. Set `ENQUIRY_MAIL_ENABLED=false` in the live environment if it was previously enabled.

This inbox uses the existing `enquiries` table and its city field. No extra database columns were added for the inbox itself. If the recent enquiry migration has not been deployed yet, apply the previously supplied SQL update or run `php artisan migrate --force` after reviewing pending migrations.
