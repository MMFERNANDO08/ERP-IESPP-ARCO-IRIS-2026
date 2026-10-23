<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modalidad_estudios', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique(); 
            $table->string('nombre');           // Modalidad (REGULAR, VIRTUAL, SEMIPRESENCIAL)
            $table->text('descripcion')->nullable(); 
            $table->string('estado')->default('ACTIVO'); // ACTIVO o INACTIVO
            $table->timestamps(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modalidad_estudios');
    }
};