<?php
use App\Http\Controllers\ReferenceController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn (\Illuminate\Http\Request $request) => app(ReferenceController::class)->page($request, 'home'))->name('home');
foreach (config('reference.pages') as $page) {
    if ($page === 'home') continue;
    Route::get('/'.str_replace('--', '/', $page), fn (\Illuminate\Http\Request $request) => app(ReferenceController::class)->page($request, $page));
}
foreach (config('reference.aliases') as $path => $page) {
    Route::get('/'.$path, fn (\Illuminate\Http\Request $request) => app(ReferenceController::class)->page($request, $page));
}
Route::get('/market-data', [ReferenceController::class, 'market'])->middleware('throttle:60,1');
foreach (array_keys(config('public_information')) as $slug) {
    Route::get('/'.$slug, fn (\Illuminate\Http\Request $request) => app(ReferenceController::class)->information($request, $slug));
}
Route::post('/reference-enquiry', [ReferenceController::class, 'enquiry'])->middleware('throttle:5,1');
Route::post('/enquiry', [ReferenceController::class, 'enquiry'])->middleware('throttle:5,1');
require __DIR__.'/workspace.php';
