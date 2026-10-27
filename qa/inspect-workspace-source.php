<?php
require 'D:/Xampp/htdocs/newcode/vendor/autoload.php';
$app = require 'D:/Xampp/htdocs/newcode/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
try {
    $connection = Illuminate\Support\Facades\DB::connection();
    $tables = ['users','clients','positions','deposits','withdrawals','documents','workspace_settings','audit_events','client_id_sequences'];
    $counts = [];
    foreach ($tables as $table) $counts[$table] = $connection->table($table)->count();
    $target = new PDO('sqlite:D:/marwadi/database/database.sqlite');
    $matched = 0;
    $lookup = $target->prepare('SELECT password FROM users WHERE id = ?');
    foreach ($connection->table('users')->select(['id','password'])->get() as $user) {
        $lookup->execute([$user->id]);
        if (hash_equals($user->password, (string) $lookup->fetchColumn())) $matched++;
    }
    echo json_encode(['driver' => $connection->getDriverName(), 'counts' => $counts, 'unchanged_password_hashes_verified' => $matched], JSON_PRETTY_PRINT).PHP_EOL;
} catch (Throwable $exception) {
    echo 'Source database not reachable: '.get_class($exception).PHP_EOL;
    exit(1);
}
