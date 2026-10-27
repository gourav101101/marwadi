<?php

namespace App\Jobs;

use App\Mail\EnquiryReceived;
use App\Models\WorkspaceSetting;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendEnquiryEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(public int $enquiryId) {}

    public function backoff(): array { return [60, 300]; }

    public function handle(): void
    {
        $enquiry = DB::table('enquiries')->find($this->enquiryId);
        if (!$enquiry || $enquiry->email_sent_at) return;
        if (!config('enquiries.mail_enabled')) return;
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            throw new \RuntimeException('Configure a delivery mailer before sending enquiry notifications.');
        }
        $settings = WorkspaceSetting::current();
        $recipient = config('enquiries.recipient') ?: ($settings->business_email ?: config('website.email'));
        if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('Set an enquiry recipient or business email in Admin Settings.');
        }
        Mail::to($recipient)->send(new EnquiryReceived($enquiry, $settings->business_name ?: config('website.name')));
        DB::table('enquiries')->where('id', $this->enquiryId)->update(['email_sent_at' => now()]);
    }
}
