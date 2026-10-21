<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModalidadController extends Controller
{
    /**
     * Listar modalidades (admite filtro solo_activos)
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('modalidades');

            if ($request->has('solo_activos') && $request->solo_activos == 1) {
                $query->where('estado', 'ACTIVO');
            }

            $modalidades = $query->orderBy('codigo', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $modalidades
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener modalidades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar una nueva modalidad
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo'      => 'required|string|max:20|unique:modalidades,codigo',
            'nombre'      => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado'      => 'nullable|string|in:ACTIVO,INACTIVO',
        ]);

        try {
            $codigo = strtoupper(trim($request->codigo));

            $id = DB::table('modalidades')->insertGetId([
                'codigo'      => $codigo,
                'nombre'      => trim($request->nombre),
                'descripcion' => $request->descripcion ? trim($request->descripcion) : null,
                'estado'      => $request->estado ?? 'ACTIVO',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Modalidad registrada correctamente.',
                'data'    => ['id' => $id, 'codigo' => $codigo]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la modalidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Consultar una modalidad por ID o código
     */
    public function show($idOrCodigo)
    {
        try {
            $modalidad = DB::table('modalidades')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->first();

            if (!$modalidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Modalidad no encontrada.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $modalidad
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar modalidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una modalidad por ID o código
     */
    public function update(Request $request, $idOrCodigo)
    {
        $request->validate([
            'codigo'      => 'nullable|string|max:20',
            'nombre'      => 'nullable|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado'      => 'nullable|string|in:ACTIVO,INACTIVO',
        ]);

        try {
            $datos = [
                'updated_at' => now(),
            ];

            if ($request->filled('codigo')) {
                $datos['codigo'] = strtoupper(trim($request->codigo));
            }

            if ($request->filled('nombre')) {
                $datos['nombre'] = trim($request->nombre);
            }

            if ($request->has('descripcion')) {
                $datos['descripcion'] = $request->descripcion ? trim($request->descripcion) : null;
            }

            if ($request->filled('estado')) {
                $datos['estado'] = $request->estado;
            }

            $actualizado = DB::table('modalidades')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->update($datos);

            return response()->json([
                'success' => true,
                'message' => 'Modalidad actualizada correctamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar modalidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una modalidad por ID o código
     */
    public function destroy($idOrCodigo)
    {
        try {
            $eliminado = DB::table('modalidades')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->delete();

            if (!$eliminado) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la modalidad para eliminar.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Modalidad eliminada correctamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar modalidad: ' . $e->getMessage()
            ], 500);
        }
    }
}