<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicInformationTest extends TestCase
{
    use RefreshDatabase;

    public function test_footer_information_pages_have_local_content_and_navigation(): void
    {
        foreach (config('public_information') as $slug => $information) {
            $this->get('/'.$slug)->assertOk()->assertSee($information['title'])
                ->assertSee('id="main-content"', false)->assertSee('aria-label="Footer help and information"', false)
                ->assertDontSee('facebook.com/MarwadiHQ', false);
        }
        $this->get('/sitemap')->assertSee('/products/derivatives')->assertSee('/services/offline-trading');
    }
}
