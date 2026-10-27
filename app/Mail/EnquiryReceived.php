<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class EnquiryReceived extends Mailable
{
    public function __construct(public object $enquiry, public string $businessName) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New website enquiry #'.$this->enquiry->id.' — '.$this->enquiry->interest,
            replyTo: [new Address($this->enquiry->email)],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.enquiry-received');
    }
}
