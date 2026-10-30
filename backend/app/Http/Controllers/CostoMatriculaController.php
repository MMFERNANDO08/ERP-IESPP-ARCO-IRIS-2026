<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CostoMatricula; // Asegúrate de que este sea el nombre de tu modelo

class CostoMatriculaController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validamos los datos que vienen de React
        $validated = $request->validate([
            'modalidad_id' => 'required|exists:modalidad_estudios,id',
            'periodo_id' => 'required|exists:periodos_academicos,id',
            'programa_id' => 'required|exists:facultades,id', // Según tu lógica de React
            'carrera_id' => 'required|exists:programas_estudio,id', // Según tu lógica de React
            'tipo_matricula' => 'required|string',
            'sede' => 'required|string',
            'concepto' => 'required|string',
            'condicion' => 'required|string',
            'momento' => 'nullable|string',
            'cobrar_una_vez' => 'boolean',
            'detalle' => 'nullable|string',
            'monto' => 'required|numeric',
            'estado' => 'required|string',
        ]);

        // 2. Guardamos en la tabla costos_matricula
        $costo = CostoMatricula::create($validated);

        // 3. Respondemos a React que todo salió bien
        return response()->json([
            'message' => 'Costo registrado correctamente',
            'data' => $costo
        ], 201);
    }

    public function index(Request $request)
    {
        // Aquí filtras según lo que seleccione el usuario en los selects
        $query = CostoMatricula::query();

        if ($request->has('modalidad_id') && $request->modalidad_id != '') {
            $query->where('modalidad_id', $request->modalidad_id);
        }
        if ($request->has('periodo_id') && $request->periodo_id != '') {
            $query->where('periodo_id', $request->periodo_id);
        }
        if ($request->has('programa_id') && $request->programa_id != '') {
            $query->where('programa_id', $request->programa_id);
        }
        if ($request->has('carrera_id') && $request->carrera_id != '') {
            $query->where('carrera_id', $request->carrera_id);
        }

        $costos = $query->get();

        return response()->json($costos, 200);
    }

    public function destroy($id)
    {
        $costo = CostoMatricula::findOrFail($id);
        $costo->delete();

        return response()->json(['message' => 'Eliminado correctamente'], 200);
    }

    public function update(Request $request, $id)
    {
        $costo = CostoMatricula::findOrFail($id);
        
        $validated = $request->validate([
            'modalidad_id' => 'required',
            'periodo_id' => 'required',
            'programa_id' => 'required',
            'carrera_id' => 'required',
            'tipo_matricula' => 'required|string',
            'sede' => 'required|string',
            'concepto' => 'required|string',
            'condicion' => 'required|string',
            'momento' => 'nullable|string',
            'cobrar_una_vez' => 'boolean',
            'detalle' => 'nullable|string',
            'monto' => 'required|numeric',
            'estado' => 'required|string',
        ]);

        $costo->update($validated);

        return response()->json([
            'message' => 'Costo actualizado correctamente',
            'data' => $costo
        ], 200);
    }
}