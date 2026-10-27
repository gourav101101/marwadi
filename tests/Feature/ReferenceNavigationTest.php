<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferenceNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_navigation_does_not_link_to_reference_company_or_copied_documents(): void
    {
        foreach (config('reference.pages') as $page) {
            $path = $page === 'home' ? '/' : '/'.str_replace('--', '/', $page);
            $response = $this->get($path)->assertOk();
            preg_match_all('/(?:href|action)=["\']([^"\']*)["\']/i', $response->getContent(), $links);
            foreach ($links[1] as $url) {
                $this->assertDoesNotMatchRegularExpression('/marwadionline\.(com|in)|marwadihq/i', $url, $path.' links to reference company');
                $this->assertDoesNotMatchRegularExpression('~^/reference-assets/.*\.pdf~i', $url, $path.' offers copied company documents');
            }
            $response->assertDontSee('Block Online Trading')->assertDontSee('inquiry@marwadionline.in');
        }
    }
}
