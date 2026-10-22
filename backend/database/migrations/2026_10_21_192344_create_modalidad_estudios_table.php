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
            $table->string('codigo')->unique(); // Código (ej. MOD-01)
            $table->string('nombre');           // Modalidad (REGULAR, VIRTUAL, SEMIPRESENCIAL)
            $table->text('descripcion')->nullable(); // Descripción
            $table->string('estado')->default('ACTIVO'); // ACTIVO o INACTIVO
            $table->timestamps(); // Crea columnas created_at y updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modalidad_estudios');
    }
};