<main id="main-content" tabindex="-1" class="local-information">
    <section class="local-information-banner"><div class="container">
        <nav aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> {{ $information['title'] }}</nav>
        <h1>{{ $information['title'] }}</h1><p>{{ $information['intro'] }}</p>
    </div></section>
    <div class="container local-information-body">
        @foreach($information['sections'] as $heading => $text)
        <section><h2>{{ $heading }}</h2><p>{{ $text }}</p></section>
        @endforeach
        @if($slug === 'sitemap')
        <div class="local-sitemap-grid">
            @foreach($sitemap as $heading => $links)<section><h2>{{ $heading }}</h2><ul>
            @foreach($links as $url => $label)<li><a href="{{ $url }}">{{ $label }}</a></li>@endforeach
            </ul></section>@endforeach
        </div>
        @endif
        <aside class="local-information-help"><h2>Need assistance?</h2><p>Contact {{ $settings->business_name ?: config('website.name') }} through our <a href="/contact-us">Contact Us page</a>.</p>
            @if($phone)<p><a href="tel:{{ preg_replace('/[^+0-9]/', '', $phone) }}">{{ $phone }}</a></p>@endif
            @if($email)<p><a href="mailto:{{ $email }}">{{ $email }}</a></p>@endif
        </aside>
    </div>
</main>
