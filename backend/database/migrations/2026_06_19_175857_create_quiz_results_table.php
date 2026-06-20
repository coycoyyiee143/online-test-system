<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->string('student_name');
            $table->string('student_id');
            $table->integer('total_points')->default(0);
            $table->integer('earned_points')->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('remarks')->nullable(); // passed, failed
            $table->integer('total_violations')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_results');
    }
};