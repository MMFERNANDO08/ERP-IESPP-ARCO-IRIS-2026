<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            // Relación con el Plan de Estudio
            $table->foreignId('plan_estudio_id')->constrained('planes_estudio')->onDelete('cascade');
            
            $table->string('codigo', 20);
            $table->string('nombre', 150);
            $table->string('ciclo', 10); // Ej: I, II, III, IV
            $table->decimal('creditos', 4, 1); // Permite decimales ej: 3.5 o 4.0
            $table->integer('horas_teoria')->default(0);
            $table->integer('horas_practica')->default(0);
            $table->string('tipo', 50)->default('OBLIGATORIO'); // OBLIGATORIO, ELECTIVO
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};