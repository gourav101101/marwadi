<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkspaceSetting extends Model
{
    public const SOCIAL_PLATFORMS = [
        'facebook' => ['Facebook', 'fab fa-facebook-f'],
        'instagram' => ['Instagram', 'fab fa-instagram'],
        'linkedin' => ['LinkedIn', 'fab fa-linkedin-in'],
        'x' => ['X (Twitter)', 'fab fa-twitter'],
        'youtube' => ['YouTube', 'fab fa-youtube'],
        'whatsapp' => ['WhatsApp', 'fab fa-whatsapp'],
        'telegram' => ['Telegram', 'far fa-paper-plane'],
    ];

    protected function casts(): array
    {
        return ['social_links' => 'array'];
    }

    protected $guarded = ['id'];

    public static function current(): self
    {
        // The singleton must explicitly use ID 1 even after MariaDB advances its sequence.
        return static::unguarded(fn () => static::firstOrCreate(['id' => 1], ['name' => 'MARWADI FINANCE', 'payment_note' => 'Include your Client ID in the payment reference. Contact your advisor after payment.']));
    }
}
