<?php
// One-time, read-only source import. Never prints credentials, personal records or encryption keys.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Encryption\Encrypter;

$sourceRoot = 'D:/Xampp/htdocs/newcode';
$sourceEnvironment = Dotenv\Dotenv::parse(file_get_contents($sourceRoot.'/.env'));
$config = [
    'host' => $sourceEnvironment['DB_HOST'] ?? '127.0.0.1',
    'port' => $sourceEnvironment['DB_PORT'] ?? '3306',
    'database' => $sourceEnvironment['DB_DATABASE'] ?? 'wealthdesk',
    'username' => $sourceEnvironment['DB_USERNAME'] ?? 'root',
    'password' => $sourceEnvironment['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci', 'prefix' => '',
    'strict' => true, 'options' => [],
];

if (DB::table('users')->exists() || DB::table('clients')->exists()) {
    fwrite(STDERR, "Import stopped: target workspace already contains accounts. Nothing was changed.\n");
    exit(1);
}

$source = (new Illuminate\Database\Connectors\MySqlConnector)->connect($config);
$source->exec('SET TRANSACTION READ ONLY');
$source->beginTransaction();
$key = $sourceEnvironment['APP_KEY'] ?? '';
$key = str_starts_with($key, 'base64:') ? base64_decode(substr($key, 7)) : $key;
$oldEncrypter = new Encrypter($key, $sourceEnvironment['APP_CIPHER'] ?? 'AES-256-CBC');
$tables = ['users','clients','positions','deposits','withdrawals','documents','workspace_settings','audit_events','client_id_sequences'];
$rows = [];
foreach ($tables as $table) $rows[$table] = $source->query('SELECT * FROM `'.$table.'`')->fetchAll(PDO::FETCH_ASSOC);

$sourcePrivate = realpath($sourceRoot.'/storage/app/private');
$files = [];
foreach ($rows['documents'] as &$document) {
    $relative = str_replace('\\', '/', $document['path']);
    if (str_starts_with($relative, '/') || in_array('..', explode('/', $relative), true)) throw new RuntimeException('Unsafe source document path.');
    $original = realpath($sourcePrivate.'/'.$relative);
    if (! $original || ! str_starts_with(str_replace('\\','/',$original), str_replace('\\','/',$sourcePrivate).'/')) throw new RuntimeException('A source document is missing or outside private storage.');
    $destination = storage_path('app/private/workspace/'.$relative);
    if (is_file($destination)) throw new RuntimeException('A destination document already exists; refusing to overwrite it.');
    $files[] = [$original, $destination];
    $document['path'] = 'workspace/'.$relative;
}
unset($document);

$copied = [];
try {
    DB::transaction(function () use ($tables, $rows, $files, $oldEncrypter, &$copied) {
        foreach ($files as [$original, $destination]) {
            if (! is_dir(dirname($destination))) mkdir(dirname($destination), 0755, true);
            if (! copy($original, $destination) || hash_file('sha256', $original) !== hash_file('sha256', $destination)) throw new RuntimeException('Document copy verification failed.');
            $copied[] = $destination;
        }
        foreach ($tables as $table) {
            foreach ($rows[$table] as $row) {
                if ($table === 'users') {
                    $row['remember_token'] = null;
                    if (! empty($row['client_password'])) $row['client_password'] = Crypt::encryptString($oldEncrypter->decryptString($row['client_password']));
                }
                if ($table === 'client_id_sequences') DB::table($table)->updateOrInsert(['id' => $row['id']], $row);
                else DB::table($table)->insert($row);
            }
        }
        foreach ($tables as $table) {
            if (DB::table($table)->count() !== count($rows[$table])) throw new RuntimeException('Imported row counts differ.');
        }
    });
    $source->rollBack(); // Close the explicitly read-only source transaction.
    $counts = [];
    foreach ($tables as $table) {
        $counts[$table] = DB::table($table)->count();
    }
    echo json_encode(['status'=>'imported','counts'=>$counts,'private_documents_copied'=>count($copied),'source'=>'read-only','password_hashes'=>'preserved','encrypted_client_values'=>'rewrapped for this application'], JSON_PRETTY_PRINT).PHP_EOL;
} catch (Throwable $exception) {
    if ($source->inTransaction()) $source->rollBack();
    // DB::transaction rolls back target records. Remove only the files created by this run.
    foreach ($copied as $file) if (is_file($file)) unlink($file);
    fwrite(STDERR, 'Import failed: '.get_class($exception).'. No credentials were printed.'.PHP_EOL);
    exit(1);
}
