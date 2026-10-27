<?php

namespace App\Console\Commands;

use App\Jobs\SendEnquiryEmail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NotifyEnquiry extends Command
{
    protected $signature = 'enquiries:notify {id : Saved enquiry reference number}';
    protected $description = 'Queue an email notification for an existing, unsent website enquiry';

    public function handle(): int
    {
        $enquiry = DB::table('enquiries')->find($this->argument('id'));
        if (!$enquiry) { $this->error('Enquiry not found.'); return self::FAILURE; }
        if (!config('enquiries.mail_enabled')) { $this->error('Enable enquiry email in the server configuration first.'); return self::FAILURE; }
        if ($enquiry->email_sent_at) { $this->info('This enquiry notification was already sent.'); return self::SUCCESS; }
        SendEnquiryEmail::dispatch((int) $enquiry->id);
        $this->info('Notification queued. Keep the queue worker running.');
        return self::SUCCESS;
    }
}
