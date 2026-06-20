<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->string('student_name');
            $table->string('student_id');
            $table->string('session_token')->unique();
            $table->datetime('started_at');
            $table->datetime('submitted_at')->nullable();
            $table->datetime('last_activity')->nullable();
            $table->integer('violation_count')->default(0);
            $table->enum('status', ['active', 'submitted', 'expired'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_sessions');
    }
};