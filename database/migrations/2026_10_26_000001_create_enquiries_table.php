<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 200);
            $table->string('phone', 25);
            $table->string('interest');
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('enquiries'); }
};
