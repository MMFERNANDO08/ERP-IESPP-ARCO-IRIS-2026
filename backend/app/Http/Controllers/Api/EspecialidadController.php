<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use Illuminate\Http\Request;

class EspecialidadController extends Controller
{
    public function index(Request $request)
    {
        $query = Especialidad::with('facultad');

        if ($request->has('solo_activos') && $request->solo_activos == 1) {
            $query->where(function($q) {
                $q->where('is_active', 1)
                  ->orWhere('estado', 'ACTIVO')
                  ->orWhere('estado', '1');
            });
        }

        if ($request->has('facultad_id') && !empty($request->facultad_id)) {
            $query->where('facultad_id', $request->facultad_id);
        }

        $especialidades = $query->get();

        return response()->json($especialidades);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo' => 'required|string|unique:especialidades,codigo',
            'nombre' => 'required|string',
            'facultad_id' => 'required',
            'estado' => 'nullable|string',
            'is_active' => 'nullable',
        ]);

        $especialidad = Especialidad::create($data);

        return response()->json([
            'message' => 'Especialidad registrada correctamente',
            'data' => $especialidad
        ], 201);
    }

    public function show($codigo)
    {
        $especialidad = Especialidad::with('facultad')->where('codigo', $codigo)->firstOrFail();
        return response()->json(['data' => $especialidad]);
    }

    public function update(Request $request, $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)->firstOrFail();

        $data = $request->validate([
            'nombre' => 'required|string',
            'facultad_id' => 'required',
            'estado' => 'nullable|string',
            'is_active' => 'nullable',
        ]);

        $especialidad->update($data);

        return response()->json([
            'message' => 'Especialidad actualizada correctamente',
            'data' => $especialidad
        ]);
    }

    public function destroy($codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)->firstOrFail();
        $especialidad->delete();

        return response()->json([
            'message' => 'Especialidad eliminada correctamente'
        ]);
    }
}