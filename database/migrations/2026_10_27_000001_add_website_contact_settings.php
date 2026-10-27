<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspace_settings', function (Blueprint $table) {
            $table->string('business_name', 100)->nullable();
            $table->string('business_email', 160)->nullable();
            $table->string('business_phone', 25)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('workspace_settings', fn (Blueprint $table) => $table->dropColumn(['business_name', 'business_email', 'business_phone']));
    }
};
