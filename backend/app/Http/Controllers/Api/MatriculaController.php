<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatriculaController extends Controller
{
    /**
     * Obtener listado de modalidades activas
     */
    public function getModalidades()
    {
        $modalidades = DB::table('modalidad_estudios')
            ->where('estado', 'ACTIVO')
            ->select('id', 'nombre')
            ->orderBy('id', 'asc')
            ->get();
            
        return response()->json($modalidades);
    }

    /**
     * Obtener listado de programas de estudio activos
     */
    public function getProgramas()
    {
        // Según tu captura, la columna de estado es 'is_active' (booleano)
        $programas = DB::table('programas_estudio')
            ->where('is_active', true) 
            ->select('id', 'nombre')
            ->get();
            
        return response()->json($programas);
    }

    /**
     * Obtener periodos académicos hasta crear la tabla real)
     */
    public function getPeriodos()
    {
        // Tabla 'periodos_academicos', cambiar el codigo por un DB::table(...)
        return response()->json([
            ['id' => '2026-I', 'nombre' => '2026-I'],
            ['id' => '2026-II', 'nombre' => '2026-II'],
        ]);
    }
}