<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('enquiries:list {--limit=25}', function () {
    $limit = max(1, min(500, (int) $this->option('limit')));
    $rows = \Illuminate\Support\Facades\DB::table('enquiries')->latest('id')->limit($limit)
        ->get(['id', 'name', 'email', 'phone', 'interest', 'message', 'created_at']);
    $this->table(['ID', 'Name', 'Email', 'Phone', 'Interest', 'Message', 'Received'],
        $rows->map(fn ($row) => (array) $row)->all());
})->purpose('List recent private website enquiries (server access required)');
