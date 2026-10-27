# Reference website navigation cleanup

The 16 imported public page templates were audited and cleaned on 27 October 2026.

Removed:
- The floating Block Online Trading link to the reference company's back-office kill switch.
- Their KYC/re-KYC portal and bank-details links.
- Their dated account notices and mandatory-update PDFs.
- Homepage View More buttons linking to reference website pagination endpoints.
- Contact page escalation matrix and KMP PDFs belonging to the reference business.
- Copied homepage warning popups containing the reference company's phone numbers and email.

The announcement strip now links to local account opening, contact, investor safety and FAQs. Your header/footer navigation and admin-configured business contact details remain in use. Official market resources in the footer are labelled as external sites.

`Reference-Link-Cleanup.json` contains the per-template change report. `qa/remove-reference-navigation.mjs` reapplies the cleanup after a template re-import and is included in the finalisation script.

## Remaining market-data dependency

The server still reads the reference provider's two public market-data endpoints for the live ticker. These are server-side requests, not visitor navigation links. This dependency has not been replaced by a separate licensed market-data integration. A different data provider would need its own integration and any required credentials.

## Content review still needed

Removing links does not verify the imported company history, experience figures, testimonials or business claims. Those sections still need client-approved facts before public launch; they should not be treated as confirmed client information.
