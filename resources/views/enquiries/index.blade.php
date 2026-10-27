@extends('layouts.app')
@section('title','Website enquiries')
@section('heading','Website enquiries')
@section('description','Account requests and contact enquiries submitted through your website.')
@section('content')
<section class="card">
    <div class="card-heading"><div><h2>{{ $enquiryCount }} {{ $enquiryCount === 1 ? 'enquiry' : 'enquiries' }} received</h2><p>Newest first. Submissions are saved here; no SMTP connection is needed.</p></div></div>
    <form method="get" class="list-toolbar">
        <div class="table-search"><x-icon name="search" :size="17"/><input name="q" value="{{ request('q') }}" maxlength="100" aria-label="Search enquiries" placeholder="Search name, email, mobile or city"></div>
        <div class="toolbar-right"><select name="type" aria-label="Enquiry type"><option value="">All enquiries</option><option value="account" @selected(request('type')==='account')>Open an account</option></select><button class="btn secondary">Filter</button>@if(request()->filled('q') || request()->filled('type'))<a class="btn secondary" href="{{ route('enquiries.index') }}">Clear filters</a>@endif</div>
    </form>
    @if($rows->count())
    <div class="table-wrap"><table><thead><tr><th>REFERENCE / RECEIVED</th><th>NAME</th><th>CONTACT</th><th>INTEREST / CITY</th><th>ACTION</th></tr></thead><tbody>
    @foreach($rows as $row)<tr>
        <td><strong>#{{ $row->id }}</strong><div class="muted">{{ \App\Support\Format::date($row->created_at,true) }}</div></td>
        <td>{{ $row->name }}</td><td><div class="contact-cell"><a href="mailto:{{ $row->email }}">{{ $row->email }}</a><a href="tel:{{ preg_replace('/[^+0-9]/','',$row->phone) }}">{{ $row->phone }}</a></div></td>
        <td>{{ $row->interest }}<div class="muted">{{ $row->city ?: 'City not provided' }}</div></td>
        <td><a class="btn secondary" href="{{ route('enquiries.show',$row->id) }}">View details</a></td>
    </tr>@endforeach
    </tbody></table></div>
    <div class="pagination"><span>Showing {{ $rows->firstItem() }}–{{ $rows->lastItem() }} of {{ $rows->total() }} results</span><div>@if($rows->previousPageUrl())<a class="btn secondary" href="{{ $rows->previousPageUrl() }}">Previous</a>@endif<span>{{ $rows->currentPage() }} / {{ $rows->lastPage() }}</span>@if($rows->nextPageUrl())<a class="btn secondary" href="{{ $rows->nextPageUrl() }}">Next</a>@endif</div></div>
    @else<x-empty title="No enquiries found" icon="file">New website submissions will appear here. If you applied filters, try clearing them.</x-empty>@endif
</section>
@endsection
