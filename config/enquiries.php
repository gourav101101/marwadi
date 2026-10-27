<?php

return [
    // Enquiries are now handled inside the admin panel; also stops old queued mail jobs.
    'mail_enabled' => false,
    // Falls back to the business email saved in Admin Settings.
    'recipient' => env('ENQUIRY_MAIL_TO'),
];
