@extends('layouts.app')
@section('title','Enquiry #'.$enquiry->id)
@section('heading','Enquiry #'.$enquiry->id)
@section('description','Received '.\App\Support\Format::date($enquiry->created_at,true).' IST')
@section('actions')<a class="btn secondary" href="{{ route('enquiries.index') }}">Back to enquiries</a>@endsection
@section('content')
<section class="card"><div class="card-heading"><div><h2>{{ $enquiry->name }}</h2><p>{{ $enquiry->interest }}</p></div></div>
    <div style="padding:24px;overflow-wrap:anywhere">
        <dl class="form-grid">
            <div><dt>Email address</dt><dd><a href="mailto:{{ $enquiry->email }}">{{ $enquiry->email }}</a></dd></div>
            <div><dt>Mobile number</dt><dd><a href="tel:{{ preg_replace('/[^+0-9]/','',$enquiry->phone) }}">{{ $enquiry->phone }}</a></dd></div>
            <div><dt>City</dt><dd>{{ $enquiry->city ?: 'Not provided' }}</dd></div>
            <div><dt>Received</dt><dd>{{ \App\Support\Format::date($enquiry->created_at,true) }} IST</dd></div>
        </dl>
        <h3>Message</h3><p style="white-space:pre-wrap">{{ $enquiry->message ?: 'No additional message provided.' }}</p>
        <div class="info-box">This is a website enquiry. It has not automatically created or activated a client account.</div>
    </div>
</section>
@endsection
