<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();

            // Identidad y Nombres
            $table->string('nombres', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100)->nullable();

            // Documentación
            $table->string('tipo_documento', 50);
            $table->string('numero_documento', 20)->unique();
            
            // Datos personales adicionales
            $table->string('sexo', 20)->nullable();
            $table->date('fecha_nacimiento')->nullable();

            // Datos institucionales y contacto
            $table->string('codigo_estudiante', 30)->unique();
            $table->string('celular', 20)->nullable();
            $table->string('correo_institucional', 150)->nullable()->unique();
            $table->string('correo_personal', 150)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumnos');
    }
};