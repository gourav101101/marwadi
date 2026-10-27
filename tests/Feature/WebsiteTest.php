<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_requested_pages_render_and_unknown_pages_return_404(): void
    {
        foreach (['/', '/contact', '/open-account', '/login'] as $path) {
            $this->get($path)->assertOk();
        }
        foreach (config('reference.pages') as $page) {
            if ($page === 'home') continue;
            $this->get('/'.str_replace('--', '/', $page))->assertOk()->assertSee('/assets/replica.css', false)
                ->assertDontSee('__LOCAL_CSRF__', false)
                ->assertDontSee('action="https://www.marwadionline.com', false);
        }
        $this->get('/products/not-a-product')->assertNotFound();
        $this->get('/become-partner')->assertNotFound();
    }

    public function test_an_enquiry_is_saved_and_receives_a_reference(): void
    {
        $this->from('/open-account')->post('/enquiry', [
            'name' => 'Test Visitor', 'email' => 'visitor@example.com', 'phone' => '9876543210',
            'interest' => 'Open an account', 'message' => 'Please contact me.', 'consent' => '1',
        ])->assertRedirect('/open-account')->assertSessionHas('success');
        $this->assertDatabaseHas('enquiries', ['email' => 'visitor@example.com', 'interest' => 'Open an account']);
    }

    public function test_invalid_or_unconsented_enquiries_are_rejected(): void
    {
        $this->post('/enquiry', ['name' => 'Visitor', 'email' => 'invalid', 'phone' => 'abc', 'interest' => 'Unknown'])
            ->assertSessionHasErrors(['email', 'phone', 'interest', 'consent']);
        $this->assertDatabaseCount('enquiries', 0);
    }

    public function test_honeypot_submissions_are_rejected(): void
    {
        $this->post('/enquiry', ['name' => 'Spam', 'email' => 'spam@example.com', 'phone' => '9876543210',
            'interest' => 'General enquiry', 'consent' => '1', 'website' => 'https://spam.example'])
            ->assertSessionHasErrors('website');
        $this->assertDatabaseCount('enquiries', 0);
    }

    public function test_public_login_opens_the_integrated_workspace_login(): void
    {
        $this->get('/')->assertOk()->assertSee('href="/login"', false)->assertDontSee('https://connect.marwadionline.com/', false);
        $this->get('/login')->assertOk()->assertSee('Email address or Client ID')->assertSee('type="password"', false);
        $this->get('/workspace')->assertRedirect('/login');
    }

    public function test_reference_menu_has_only_requested_primary_sections(): void
    {
        $html = $this->get('/')->assertOk()->getContent();
        $doc = new \DOMDocument;
        @$doc->loadHTML($html);
        $xpath = new \DOMXPath($doc);
        $links = $xpath->query('//ul[contains(concat(" ", normalize-space(@class), " "), " nav-menu ")]/li/a');
        $labels = [];
        foreach ($links as $link) $labels[] = trim(preg_replace('/\s+/', ' ', $link->textContent));
        $this->assertSame(['About', 'Our Products', 'Our Services', 'Contact Us'], $labels);
    }

    public function test_market_feed_is_normalized_and_does_not_use_sample_prices(): void
    {
        \Illuminate\Support\Facades\Cache::store('file')->forget('reference-market-v1');
        \Illuminate\Support\Facades\Http::fake([
            '*market-info-sensex-qwe' => \Illuminate\Support\Facades\Http::response(['status' => true, 'data_nse' => ['Table' => [['SYMBOL' => 'NIFTY', 'PRICE' => '123.45']]], 'data_bse' => ['Table' => [['SYMBOL' => 'SENSEX', 'PRICE' => '456.78']]]]),
            '*market-info-qwe' => \Illuminate\Support\Facades\Http::response(['status' => true, 'data' => ['Table' => [['symbol' => 'TEST', 'Ltp' => '111.00']]]]),
        ]);
        $this->getJson('/market-data')->assertOk()->assertJsonPath('indices.0.PRICE', '123.45')->assertJsonPath('stocks.0.Ltp', '111.00');
        \Illuminate\Support\Facades\Cache::store('file')->forget('reference-market-v1');
    }

    public function test_feed_failure_returns_unavailable_instead_of_fake_prices(): void
    {
        \Illuminate\Support\Facades\Cache::store('file')->forget('reference-market-v1');
        \Illuminate\Support\Facades\Http::fake(['*' => \Illuminate\Support\Facades\Http::response([], 503)]);
        $this->getJson('/market-data')->assertStatus(503)->assertJsonPath('status', false)->assertJsonMissingPath('indices');
    }

    public function test_displayed_images_and_videos_use_project_owned_media(): void
    {
        foreach (config('reference.pages') as $page) {
            $html = file_get_contents(resource_path('reference/'.$page.'.html'));
            $doc = new \DOMDocument;
            @$doc->loadHTML($html);
            $xpath = new \DOMXPath($doc);
            foreach ($xpath->query('//img/@src | //source/@src | //video/@poster') as $attribute) {
                $this->assertStringStartsWith('/assets/brand/', $attribute->nodeValue, $page.' contains borrowed media');
            }
        }
    }

    public function test_client_identity_and_address_are_displayed_without_reference_registration_numbers(): void
    {
        foreach (['/', '/contact-us', '/who-we-are'] as $path) {
            $this->get($path)->assertOk()->assertSee('Marwadi Finance broker')
                ->assertSee('122, Vinobha Puri, Vinoba Puri, Block M, Lajpat Nagar II, Lajpat Nagar, New Delhi, Delhi 110024')
                ->assertDontSee('__LOCAL_BUSINESS_NAME__')
                ->assertDontSee('Marwadi Shares and Finance Limited')
                ->assertDontSee('INZ000174730')->assertDontSee('U65910GJ1992PLC017544');
        }
    }
}
