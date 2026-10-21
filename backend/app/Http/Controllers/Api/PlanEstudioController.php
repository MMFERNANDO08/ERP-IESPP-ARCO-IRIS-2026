<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanEstudio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanEstudioController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanEstudio::query();

        if ($request->filled('modalidad')) {
            $query->where('modalidad', $request->modalidad);
        }

        if ($request->filled('programa')) {
            $query->where('programa_academico', $request->programa);
        }

        if ($request->filled('carrera_codigo')) {
            $query->where('especialidad_codigo', $request->carrera_codigo);
        }

        $planes = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $planes,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'curricula' => 'required|string|max:50',
            'resolucion' => 'nullable|string|max:150',
            'modalidad' => 'required|string|max:50',
            'programa_academico' => 'nullable|string|max:150',
            'especialidad_codigo' => 'nullable|string|max:50',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $plan = PlanEstudio::create([
            'curricula' => $request->curricula,
            'resolucion' => $request->resolucion ?? '',
            'modalidad' => $request->modalidad ?? 'REGULAR',
            'programa_academico' => $request->programa_academico,
            'especialidad_codigo' => $request->especialidad_codigo,
            'estado' => $request->estado ?? 'ACTIVO',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Plan de estudio registrado correctamente',
            'data' => $plan,
        ], 201);
    }

    public function show($id)
    {
        $plan = PlanEstudio::find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan de estudio no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $plan,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $plan = PlanEstudio::find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan de estudio no encontrado',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'curricula' => 'sometimes|required|string|max:50',
            'resolucion' => 'nullable|string|max:150',
            'modalidad' => 'sometimes|required|string|max:50',
            'programa_academico' => 'nullable|string|max:150',
            'especialidad_codigo' => 'nullable|string|max:50',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $plan->update($request->only([
            'curricula',
            'resolucion',
            'modalidad',
            'programa_academico',
            'especialidad_codigo',
            'estado',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Plan de estudio actualizado correctamente',
            'data' => $plan,
        ], 200);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $plan = PlanEstudio::find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan de estudio no encontrado',
            ], 404);
        }

        $request->validate([
            'estado' => 'required|in:ACTIVO,INACTIVO',
        ]);

        $plan->estado = $request->estado;
        $plan->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'data' => $plan,
        ], 200);
    }

    public function destroy($id)
    {
        $plan = PlanEstudio::find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'Plan de estudio no encontrado',
            ], 404);
        }

        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plan de estudio eliminado correctamente',
        ], 200);
    }
}