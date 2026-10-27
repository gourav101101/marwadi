<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
try {
    $response = Illuminate\Support\Facades\Http::timeout(15)->get('https://www.marwadionline.com/market-info-sensex-qwe');
    echo 'HTTP '.$response->status().' Status: '.json_encode($response->json('status')).PHP_EOL;
} catch (Throwable $exception) { echo $exception->getMessage().PHP_EOL; }
