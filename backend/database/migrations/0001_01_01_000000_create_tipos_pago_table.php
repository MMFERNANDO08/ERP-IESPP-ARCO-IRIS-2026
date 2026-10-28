<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_pago', function (Blueprint $table) {
            $table->id();

            // Campos principales
            $table->string('descripcion', 255); // Ej: Matrícula 2024, Constancia de Estudios
            $table->string('codigo_pago', 50)->nullable()->unique(); // Ej: MAT-01, CONST-02
            $table->decimal('costo', 10, 2); // 10 dígitos en total, 2 decimales (Ej: 99999999.99)
            $table->string('estado', 20)->default('ACTIVO'); // ACTIVO / INACTIVO

            $table->timestamps();
            $table->softDeletes(); // Opcional: Agregado porque incluimos SoftDeletes en el modelo
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_pago');
    }
};