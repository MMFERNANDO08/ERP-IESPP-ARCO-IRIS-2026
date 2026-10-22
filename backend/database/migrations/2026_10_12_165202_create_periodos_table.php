<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periodos', function (Blueprint $table) {
            $table->id();

            // Campos principales del periodo académico
            $table->string('codigo', 20)->unique(); // Ej: 20262
            $table->string('nombre', 50); // Ej: 2026-II
            
            // Flags e indicadores operativos
            $table->char('flag_per', 1)->default('1'); // 1 o 0
            $table->char('flag_cur', 1)->default('0'); // 1 o 0
            $table->string('activo', 20)->default('ABIERTO'); // ABIERTO / CERRADO

            // Accesos web institucionales
            $table->char('web_adm', 1)->default('1'); // 1 o 0
            $table->char('web_doc', 1)->default('1'); // 1 o 0
            $table->char('web_alu', 1)->default('1'); // 1 o 0

            // Fechas de vigencia
            $table->date('inicio');
            $table->date('fin');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodos');
    }
};