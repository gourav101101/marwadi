<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EnquiryInboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_website_submission_is_visible_to_admin_without_sending_email(): void
    {
        Mail::fake(); Queue::fake();
        config(['enquiries.mail_enabled'=>true]); // Even an old SMTP setting must not queue new mail.
        $this->from('/open-account')->post('/enquiry', ['name'=>'Test Visitor', 'email'=>'visitor@example.test',
            'phone'=>'9876543210', 'city'=>'New Delhi', 'interest'=>'Open an account', 'message'=>'Please call me.', 'consent'=>1])
            ->assertSessionHasNoErrors()->assertSessionHas('success');
        $row = DB::table('enquiries')->sole();
        Queue::assertNothingPushed(); Mail::assertNothingSent();
        $this->actingAs(User::factory()->create(['role'=>'admin']));
        $this->get('/admin/enquiries')->assertOk()->assertSee('Test Visitor')->assertSee('9876543210');
        $this->get('/admin/enquiries/'.$row->id)->assertOk()->assertSee('Please call me.')
            ->assertSee('New Delhi')->assertSee('visitor@example.test');
        $this->get('/admin/enquiries?q=nobody')->assertOk()->assertDontSee('Test Visitor');
        $this->get('/admin/enquiries?q=New+Delhi&type=account')->assertOk()->assertSee('Test Visitor');
        $this->get('/admin/enquiries/99999')->assertNotFound();
    }

    public function test_clients_and_guests_cannot_read_website_enquiries(): void
    {
        $this->get('/admin/enquiries')->assertRedirect('/login');
        $user = User::factory()->create(['role'=>'client']);
        Client::create(['user_id'=>$user->id, 'code'=>'INBOX100', 'phone'=>'9000000000', 'risk'=>'Medium', 'investment'=>0, 'details'=>[]]);
        $this->actingAs($user)->get('/admin/enquiries')->assertForbidden();
        $this->get('/admin/enquiries/1')->assertForbidden();
        $this->get('/workspace')->assertOk()->assertDontSee('Website enquiries');
    }
}
