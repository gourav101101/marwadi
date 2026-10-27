@php
$businessName = $settings->business_name ?: config('website.name');
$groups = array_slice(config('public_navigation'), 0, 3);
@endphp
<div class="container local-footer">
    <div class="local-footer-top">
        <div class="local-footer-brand">
            <a href="/" aria-label="{{ $businessName }} home"><img src="/assets/brand/client-logo.jpeg" alt="{{ $businessName }}" width="180" height="120" loading="lazy"></a>
            <h2>{{ $businessName }}</h2>
            <p>Explore our investment products and trading services. Speak with our team for personal assistance.</p>
            <div class="social_media"><ul></ul></div>
        </div>
        @foreach($groups as $heading => $links)
        <nav aria-label="Footer {{ $heading }}">
            <h2>{{ $heading }}</h2>
            <ul>@foreach($links as $url => $label)<li><a href="{{ $url }}">{{ $label }}</a></li>@endforeach</ul>
        </nav>
        @endforeach
    </div>
    <div class="local-footer-resources">
        <nav aria-label="Footer help and information"><h2>Help &amp; Information</h2><ul>
            @foreach(config('public_navigation')['Help & Information'] as $url => $label)<li><a href="{{ $url }}">{{ $label }}</a></li>@endforeach
        </ul></nav>
        <nav aria-label="Official market resources"><h2>Official market resources</h2><p>External websites · open in a new tab</p><ul>
            @foreach(['https://www.sebi.gov.in/'=>'SEBI', 'https://www.nseindia.com/'=>'NSE', 'https://www.bseindia.com/'=>'BSE', 'https://nsdl.co.in/'=>'NSDL', 'https://www.cdslindia.com/'=>'CDSL'] as $url => $label)
            <li><a href="{{ $url }}" target="_blank" rel="noopener noreferrer">{{ $label }} <span aria-hidden="true">↗</span></a></li>
            @endforeach
        </ul></nav>
    </div>
    <div class="local-footer-contact">
        <div><h2>Contact Us</h2><address>{{ config('website.address') }}</address></div>
        <div class="local-footer-contact-links">
            @if($phone)<a href="tel:{{ preg_replace('/[^+0-9]/', '', $phone) }}">{{ $phone }}</a>@endif
            @if($email)<a href="mailto:{{ $email }}">{{ $email }}</a>@endif
            <a href="/contact-us">Get in touch <span aria-hidden="true">→</span></a>
        </div>
        <div class="local-footer-account"><a href="/login">Client login</a><a href="/open-account">Open an account</a></div>
    </div>
    <p class="local-footer-risk">Investments in securities markets are subject to market risks. Read all related documents carefully before investing.</p>
    <div class="local-footer-copyright">© {{ now()->year }} {{ $businessName }}. All rights reserved.</div>
</div>
