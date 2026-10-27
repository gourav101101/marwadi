<?php

namespace App\Http\Controllers;

class BrandingController extends Controller
{
    public function logo()
    {
        // A fixed public branding asset, independent of Apache's static-image rewrites.
        $path = public_path('images/marwadi-finance-logo.jpg');
        if (! is_file($path)) {
            $path = resource_path('branding/marwadi-finance-logo.jpg');
        }
        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => 'image/jpeg',
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
