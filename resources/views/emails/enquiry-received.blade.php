<!doctype html><html lang="en"><head><meta charset="utf-8"><title>New website enquiry</title></head>
<body style="font-family:Arial,sans-serif;color:#172125;line-height:1.6">
<h1 style="font-size:24px">New website enquiry #{{ $enquiry->id }}</h1>
<p>{{ $businessName }} has received a {{ strtolower($enquiry->interest) }} request.</p>
<table cellpadding="10" style="border-collapse:collapse;text-align:left">
@foreach(['Name'=>$enquiry->name, 'Email'=>$enquiry->email, 'Mobile'=>$enquiry->phone, 'City'=>$enquiry->city ?: 'Not provided', 'Interest'=>$enquiry->interest, 'Submitted'=>\Illuminate\Support\Carbon::parse($enquiry->created_at)->timezone('Asia/Kolkata')->format('d M Y, h:i A').' IST'] as $label=>$value)
<tr><th style="border-bottom:1px solid #ddd">{{ $label }}</th><td style="border-bottom:1px solid #ddd">{{ $value }}</td></tr>
@endforeach
</table>
<h2 style="font-size:18px">Message</h2><p style="white-space:pre-wrap">{{ $enquiry->message ?: 'No additional message.' }}</p>
<p>The visitor agreed to be contacted about this enquiry. Reply to this email to contact the visitor.</p>
<p style="color:#667">This is an account enquiry; no client account has been activated by this submission.</p>
</body></html>
