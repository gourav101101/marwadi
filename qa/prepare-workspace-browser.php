<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$path = storage_path('framework/testing/workspace-browser-'.date('YmdHis').'.sqlite');
if (! is_dir(dirname($path))) mkdir(dirname($path), 0755, true);
touch($path);
config(['database.default'=>'sqlite','database.connections.sqlite.database'=>$path]);
Illuminate\Support\Facades\DB::purge('sqlite');
Illuminate\Support\Facades\Artisan::call('migrate', ['--force'=>true]);
App\Models\User::create(['name'=>'Integration Administrator','email'=>'admin@integration.invalid','role'=>'admin','password'=>'IntegrationAdmin2026!']);
$user = App\Models\User::create(['name'=>'Integration Client','email'=>'client@integration.invalid','role'=>'client','password'=>'IntegrationClient2026!']);
App\Models\Client::create(['user_id'=>$user->id,'code'=>'QA1001','phone'=>'9000000000','risk'=>'Medium','investment'=>1000000,'details'=>[]]);
App\Models\WorkspaceSetting::current();
file_put_contents(__DIR__.'/workspace-browser-database.json', json_encode(['database'=>$path]));
echo 'Isolated browser-testing database prepared; live accounts and records unchanged.'.PHP_EOL;
