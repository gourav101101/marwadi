<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ReferenceController extends Controller
{
    public function information(Request $request, string $slug)
    {
        $information = config('public_information.'.$slug);
        abort_unless($information, 404);
        $settings = \App\Models\WorkspaceSetting::current();
        $email = $settings->business_email ?: config('website.email');
        $phone = $settings->business_phone ?: config('website.phone');
        $sitemap = config('public_navigation');
        $content = view('partials.public-information', compact('information', 'slug', 'settings', 'email', 'phone', 'sitemap'))->render();
        $html = $this->page($request, 'contact-us')->getContent();
        $html = preg_replace('~<main\b[^>]*>.*?</main>~s', $content, $html, 1);
        $html = preg_replace('~<title>.*?</title>~s', '<title>'.e($information['title'].' | '.($settings->business_name ?: config('website.name'))).'</title>', $html, 1);
        return response($html);
    }

    public function page(Request $request, string $page = 'home')
    {
        abort_unless(in_array($page, config('reference.pages'), true), 404);
        $file = resource_path('reference/'.$page.'.html');
        abort_unless(is_file($file), 404);
        $settings = \App\Models\WorkspaceSetting::current();
        $socialItems = '';
        foreach (\App\Models\WorkspaceSetting::SOCIAL_PLATFORMS as $key => [$label, $icon]) {
            $url = $settings->social_links[$key] ?? null;
            if (!$url || !filter_var($url, FILTER_VALIDATE_URL) || !in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)) continue;
            $socialItems .= '<li><a href="'.e($url).'" target="_blank" rel="noopener noreferrer" aria-label="'.e($label).'"><i class="'.e($icon).'" aria-hidden="true"></i></a></li>';
        }
        $email = $settings->business_email ?: config('website.email');
        $phone = $settings->business_phone ?: config('website.phone');
        $html = str_replace(['__LOCAL_CSRF__', '__LOCAL_ADDRESS__', '__LOCAL_BUSINESS_NAME__'], [e(csrf_token()), e(config('website.address') ?: 'Address to be provided.'), e($settings->business_name ?: config('website.name'))], file_get_contents($file));
        $emailHtml = $email ? '<a href="mailto:'.e($email).'">'.e($email).'</a>' : 'Business email will be updated shortly.';
        $html = str_replace('__LOCAL_FOOTER__', view('partials.public-footer', compact('settings', 'email', 'phone'))->render(), $html);
        $phoneHtml = $phone ? '<a href="tel:'.e(preg_replace('/[^+0-9]/', '', $phone)).'">'.e($phone).'</a>' : 'Contact number will be updated shortly.';
        $html = str_replace(['Business email will be updated shortly.', 'Contact number will be updated shortly.', 'Business contact details will be updated shortly.'], [$emailHtml, $phoneHtml, ($email || $phone) ? implode(' · ', array_filter([$phone ? $phoneHtml : null, $email ? $emailHtml : null])) : 'Business contact details will be updated shortly.'], $html);
        $html = str_replace('</head>', '<meta name="theme-color" content="#11191c"></head>', $html);
        $html = preg_replace('~<div class="social_media">\s*<ul>.*?</ul>\s*</div>~s', $socialItems ? '<div class="social_media"><ul>'.$socialItems.'</ul></div>' : '', $html);
        foreach (['css', 'js'] as $extension) {
            $asset = '/assets/replica.'.$extension;
            $html = str_replace($asset.'"', $asset.'?v='.filemtime(public_path(ltrim($asset, '/'))).'"', $html);
        }
        $modal = match ($request->path()) {
            'open-account' => '#exampleModal', default => '',
        };
        $status = session('success');
        $errors = session('errors');
        if ($errors && $errors->any()) $status = implode(' ', $errors->all());
        $state = '<script type="application/json" id="local-page-state">'.json_encode([
            'modal' => $modal, 'login' => $request->path() === 'login', 'message' => $status,
        ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT).'</script>';
        // Page state must exist before the footer script reads it.
        return response(str_replace('</head>', $state.'</head>', $html));
    }

    public function enquiry(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:200'],
            'phone' => ['required', 'regex:/^[0-9+()\s-]{10,20}$/'],
            'interest' => ['required', 'in:General enquiry,Open an account,Derivatives,Commodities,Third party products,IPO,Portfolio management,Research and advisory,Margin trading,Offline trading,Call on trade,Smart portfolio management'],
            'message' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:100'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'max:0'],
        ]);
        unset($data['consent'], $data['website']);
        // PAN and original-provider verification fields are never retained by this enquiry form.
        $id = DB::table('enquiries')->insertGetId([...$data, 'created_at' => now(), 'updated_at' => now()]);
        return back()->with('success', 'Thank you. Your enquiry has been received. Reference #'.$id.'.');
    }

    public function market()
    {
        try {
            $data = Cache::store('file')->remember('reference-market-v1', 60, function () {
                $bundle = storage_path('app/certs/ca-bundle.pem');
                $verify = is_file($bundle) ? $bundle : true;
                $responses = Http::pool(fn ($pool) => [
                    $pool->as('indices')->withOptions(['verify' => $verify])->timeout(12)->get('https://www.marwadionline.com/market-info-sensex-qwe'),
                    $pool->as('stocks')->withOptions(['verify' => $verify])->timeout(12)->get('https://www.marwadionline.com/market-info-qwe'),
                ]);
                $indices = $responses['indices']->throw()->json();
                $stocks = $responses['stocks']->throw()->json();
                throw_unless(($indices['status'] ?? false) && ($stocks['status'] ?? false), \RuntimeException::class, 'Market feed unavailable');
                return [
                    'indices' => array_values(array_filter([
                        $indices['data_nse']['Table'][0] ?? null,
                        $indices['data_bse']['Table'][0] ?? null,
                    ])),
                    'stocks' => $stocks['data']['Table'] ?? [],
                    'fetched_at' => now()->toIso8601String(),
                    'source' => 'Marwadi public market feed',
                ];
            });
            return response()->json(['status' => true, ...$data]);
        } catch (\Throwable $exception) {
            return response()->json(['status' => false, 'message' => 'Market feed is temporarily unavailable.'], 503);
        }
    }
}
