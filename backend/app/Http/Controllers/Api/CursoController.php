<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CursoController extends Controller
{
    /**
     * Listar todos los cursos (con filtros opcionales)
     */
    public function index(Request $request)
    {
        $query = Curso::query();

        // Filtro por Plan de Estudio
        if ($request->filled('plan_estudio_id')) {
            $query->where('plan_estudio_id', $request->plan_estudio_id);
        }

        // Filtro por Ciclo
        if ($request->filled('ciclo')) {
            $query->where('ciclo', $request->ciclo);
        }

        // Ordenamos por ciclo por defecto para que la malla salga ordenada
        $cursos = $query->orderBy('ciclo', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $cursos,
        ], 200);
    }

    /**
     * Registrar un nuevo curso
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_estudio_id' => 'required|exists:planes_estudio,id',
            'codigo' => 'required|string|max:20',
            'nombre' => 'required|string|max:150',
            'ciclo' => 'required|string|max:10',
            'creditos' => 'required|numeric|min:0',
            'horas_teoria' => 'nullable|integer|min:0',
            'horas_practica' => 'nullable|integer|min:0',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $curso = Curso::create([
            'plan_estudio_id' => $request->plan_estudio_id,
            'codigo' => $request->codigo,
            'nombre' => $request->nombre,
            'ciclo' => $request->ciclo,
            'creditos' => $request->creditos,
            'horas_teoria' => $request->horas_teoria ?? 0,
            'horas_practica' => $request->horas_practica ?? 0,
            'tipo' => $request->tipo ?? 'OBLIGATORIO',
            'estado' => $request->estado ?? 'ACTIVO',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Curso registrado correctamente',
            'data' => $curso,
        ], 201);
    }

    /**
     * Mostrar un curso específico
     */
    public function show($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $curso,
        ], 200);
    }

    /**
     * Actualizar un curso
     */
    public function update(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'plan_estudio_id' => 'sometimes|required|exists:planes_estudio,id',
            'codigo' => 'sometimes|required|string|max:20',
            'nombre' => 'sometimes|required|string|max:150',
            'ciclo' => 'sometimes|required|string|max:10',
            'creditos' => 'sometimes|required|numeric|min:0',
            'horas_teoria' => 'nullable|integer|min:0',
            'horas_practica' => 'nullable|integer|min:0',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $curso->update($request->only([
            'plan_estudio_id',
            'codigo',
            'nombre',
            'ciclo',
            'creditos',
            'horas_teoria',
            'horas_practica',
            'tipo',
            'estado',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Curso actualizado correctamente',
            'data' => $curso,
        ], 200);
    }

    /**
     * Cambiar estado del curso (ACTIVO / INACTIVO)
     */
    public function cambiarEstado(Request $request, $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
            ], 404);
        }

        $request->validate([
            'estado' => 'required|in:ACTIVO,INACTIVO',
        ]);

        $curso->estado = $request->estado;
        $curso->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'data' => $curso,
        ], 200);
    }

    /**
     * Eliminar un curso
     */
    public function destroy($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'success' => false,
                'message' => 'Curso no encontrado',
            ], 404);
        }

        $curso->delete();

        return response()->json([
            'success' => true,
            'message' => 'Curso eliminado correctamente',
        ], 200);
    }


    // ========================================================
    // MÉTODOS PARA GESTIÓN DE PRERREQUISITOS
    // ========================================================

    /**
     * Obtener los prerrequisitos de un curso
     */
    public function obtenerPrerrequisitos($id)
    {
        $curso = Curso::with('prerrequisitos')->find($id);

        if (!$curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $curso->prerrequisitos
        ], 200);
    }

    /**
     * Asignar un prerrequisito a un curso
     */
    public function agregarPrerrequisito(Request $request, $id)
    {
        $request->validate([
            'prerrequisito_id' => 'required|exists:cursos,id|different:' . $id
        ]);

        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado'], 404);
        }

        // attach() lo vincula sin borrar los anteriores. syncWithoutDetaching() evita duplicados.
        $curso->prerrequisitos()->syncWithoutDetaching([$request->prerrequisito_id]);

        return response()->json([
            'success' => true,
            'message' => 'Prerrequisito agregado con éxito'
        ], 201);
    }

    /**
     * Eliminar un prerrequisito de un curso
     */
    public function eliminarPrerrequisito($id, $prerrequisitoId)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['success' => false, 'message' => 'Curso no encontrado'], 404);
        }

        // detach() borra el registro de la tabla pivote
        $curso->prerrequisitos()->detach($prerrequisitoId);

        return response()->json([
            'success' => true,
            'message' => 'Prerrequisito eliminado con éxito'
        ], 200);
    }
}