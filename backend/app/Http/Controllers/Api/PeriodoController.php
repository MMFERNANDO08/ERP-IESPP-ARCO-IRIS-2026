<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Periodo;
use Illuminate\Http\Request;

class PeriodoController extends Controller
{
    public function index(Request $request)
    {
        $periodos = Periodo::all();
        return response()->json($periodos);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'codigo' => 'required|string|unique:periodos,codigo',
            'nombre' => 'required|string',
            'flag_per' => 'nullable',
            'flag_cur' => 'nullable',
            'activo' => 'required|string',
            'web_adm' => 'nullable',
            'web_doc' => 'nullable',
            'web_alu' => 'nullable',
            'inicio' => 'nullable|date',
            'fin' => 'nullable|date',
        ]);

        $periodo = Periodo::create($data);

        return response()->json([
            'message' => 'Periodo registrado correctamente',
            'data' => $periodo
        ], 201);
    }

    public function show($codigo)
    {
        $periodo = Periodo::where('codigo', $codigo)->firstOrFail();
        return response()->json(['data' => $periodo]);
    }

    public function update(Request $request, $codigo)
    {
        $periodo = Periodo::where('codigo', $codigo)->firstOrFail();

        $data = $request->validate([
            'nombre' => 'required|string',
            'flag_per' => 'nullable',
            'flag_cur' => 'nullable',
            'activo' => 'required|string',
            'web_adm' => 'nullable',
            'web_doc' => 'nullable',
            'web_alu' => 'nullable',
            'inicio' => 'nullable|date',
            'fin' => 'nullable|date',
        ]);

        $periodo->update($data);

        return response()->json([
            'message' => 'Periodo actualizado correctamente',
            'data' => $periodo
        ]);
    }

    public function destroy($codigo)
    {
        $periodo = Periodo::where('codigo', $codigo)->firstOrFail();
        $periodo->delete();

        return response()->json([
            'message' => 'Periodo eliminado correctamente'
        ]);
    }
}