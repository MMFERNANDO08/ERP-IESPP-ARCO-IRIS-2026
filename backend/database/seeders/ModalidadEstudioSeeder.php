<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModalidadEstudioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('modalidad_estudios')->insert([
            [
                'codigo' => 'MOD-01',
                'nombre' => 'PRESENCIAL',
                'descripcion' => 'Programa ofertado por el Instituto Arco Iris de manera presencial',
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'MOD-02',
                'nombre' => 'SEMIPRESENCIAL',
                'descripcion' => 'Programa ofertado por el Instituto Arco Iris con asistencia segun cronogramas',
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'MOD-03',
                'nombre' => 'A DISTANCIA',
                'descripcion' => 'Programa ofertado por el Instituto Arco Iris totalmente remota de manera virtual',
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
