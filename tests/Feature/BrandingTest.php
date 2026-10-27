<?php

namespace Tests\Feature;

use Tests\TestCase;

class BrandingTest extends TestCase
{
    public function test_logo_is_publicly_available_through_laravel(): void
    {
        $response = $this->get('/branding/marwadi-finance-logo.jpg')->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertSame(realpath(public_path('images/marwadi-finance-logo.jpg')), $response->baseResponse->getFile()->getRealPath());
    }

    public function test_logo_uses_packaged_backup_when_public_image_is_missing(): void
    {
        $original = public_path();
        $this->app->usePublicPath(storage_path('framework/testing/no-public-branding'));
        try {
            $response = $this->get('/branding/marwadi-finance-logo.jpg')->assertOk()->assertHeader('Content-Type', 'image/jpeg');
            $this->assertSame(realpath(resource_path('branding/marwadi-finance-logo.jpg')), $response->baseResponse->getFile()->getRealPath());
            $this->assertSame('image/jpeg', getimagesize(resource_path('branding/marwadi-finance-logo.jpg'))['mime']);
        } finally {
            $this->app->usePublicPath($original);
        }
    }
}
