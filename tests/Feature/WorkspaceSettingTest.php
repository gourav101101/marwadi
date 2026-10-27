<?php

namespace Tests\Feature;

use App\Models\WorkspaceSetting;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_social_links_are_editable_validated_and_hidden_when_empty(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->get('/admin/settings')->assertOk()->assertSee('Social media links');
        $this->post('/admin/settings', ['name' => 'Test', 'social_links' => ['instagram' => 'https://www.instagram.com/examplebrand/', 'whatsapp' => 'https://wa.me/919000000000']])
            ->assertSessionHasNoErrors();
        $this->get('/')->assertOk()->assertSee('https://www.instagram.com/examplebrand/', false)
            ->assertSee('https://wa.me/919000000000', false)->assertDontSee('facebook.com/MarwadiHQ', false);
        $this->post('/admin/settings', ['name' => 'Test', 'social_links' => ['instagram' => 'javascript:alert(1)']])
            ->assertSessionHasErrors('social_links.instagram');
        $this->assertSame('https://www.instagram.com/examplebrand/', WorkspaceSetting::current()->social_links['instagram']);
        $this->post('/admin/settings', ['name' => 'Test', 'social_links' => ['instagram' => '', 'whatsapp' => '']])->assertSessionHasNoErrors();
        $this->get('/')->assertOk()->assertDontSee('<div class="social_media">', false);
    }

    public function test_admin_can_update_public_contact_details_and_clients_cannot(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $data = ['name' => 'Test workspace', 'business_name' => 'Example Brokerage',
            'business_email' => 'contact@example.test', 'business_phone' => '+91 9000000000'];
        $this->actingAs($admin)->post('/admin/settings', $data)->assertSessionHasNoErrors();
        $this->get('/')->assertOk()->assertSee('Example Brokerage')
            ->assertSee('mailto:contact@example.test', false)->assertSee('tel:+919000000000', false);
        $this->post('/admin/settings', array_replace($data, ['business_email' => 'invalid', 'business_phone' => 'abc']))
            ->assertSessionHasErrors(['business_email', 'business_phone']);
        $this->assertSame('contact@example.test', WorkspaceSetting::current()->business_email);
        $user = User::factory()->create(['role' => 'client']);
        Client::create(['user_id' => $user->id, 'code' => 'CONTACT100', 'phone' => '9000000000', 'risk' => 'Medium', 'investment' => 0, 'details' => []]);
        $this->actingAs($user)->post('/admin/settings', $data)->assertForbidden();
    }

    public function test_settings_keep_their_singleton_id_after_the_sequence_advances(): void
    {
        WorkspaceSetting::forceCreate(['id' => 50, 'name' => 'Temporary'])->delete();
        $settings = WorkspaceSetting::current();
        $this->assertSame(1, $settings->id);
        $settings->update(['payment_name' => 'Saved payee']);
        $this->assertSame('Saved payee', WorkspaceSetting::current()->payment_name);
        $this->assertSame(1, WorkspaceSetting::count());
    }

    public function test_admin_can_save_and_reload_valid_bank_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/settings', [
            'name' => 'Example Wealth',
            'payment_name' => 'Example Account Holder',
            'bank_account_number' => '001234567890',
            'ifsc_code' => 'abcd0123456',
            'upi_id' => 'example@bank',
            'payment_note' => 'Fictional test instructions.',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $settings = WorkspaceSetting::current();
        $this->assertSame('Example Account Holder', $settings->payment_name);
        $this->assertSame('001234567890', $settings->bank_account_number);
        $this->assertSame('ABCD0123456', $settings->ifsc_code);
        $this->assertSame('example@bank', $settings->upi_id);
        $this->assertSame('Fictional test instructions.', $settings->payment_note);

        $this->get('/admin/settings')
            ->assertOk()
            ->assertSee('Account Holder Name')
            ->assertSee('name="bank_account_number" type="text" value="001234567890"', false)
            ->assertSee('name="ifsc_code" type="text" value="ABCD0123456"', false);
    }

    public function test_bank_details_require_matching_fields_and_valid_indian_formats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/settings', [
            'name' => 'Example Wealth',
            'payment_name' => '',
            'bank_account_number' => '12345',
            'ifsc_code' => 'NOT-AN-IFSC',
        ])->assertSessionHasErrors(['payment_name', 'bank_account_number', 'ifsc_code']);

        $this->post('/admin/settings', [
            'name' => 'Example Wealth',
            'payment_name' => 'Example Account Holder',
            'bank_account_number' => '001234567890',
            'ifsc_code' => '',
        ])->assertSessionHasErrors('ifsc_code');

        $this->assertSame(0, WorkspaceSetting::count());
    }

    public function test_clients_cannot_update_workspace_bank_details(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Client::create([
            'user_id' => $user->id,
            'code' => 'TEST1A',
            'phone' => '2025550100',
            'risk' => 'Low',
            'investment' => 0,
            'details' => ['first_name' => 'Test'],
        ]);

        $this->actingAs($user)->post('/admin/settings', [
            'name' => 'Unauthorized Change',
            'payment_name' => 'Unauthorized Holder',
            'bank_account_number' => '001234567890',
            'ifsc_code' => 'ABCD0123456',
        ])->assertForbidden();

        $this->assertSame(0, WorkspaceSetting::count());
    }
}
