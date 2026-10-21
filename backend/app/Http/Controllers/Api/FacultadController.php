<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facultad;
use Illuminate\Http\Request;

class FacultadController extends Controller
{
    /**
     * Listar facultades (admite filtro solo_activos)
     */
    public function index(Request $request)
    {
        try {
            $query = Facultad::query();

            if ($request->has('solo_activos') && $request->solo_activos == 1) {
                $query->where('estado', 'ACTIVO');
            }

            $facultades = $query->orderBy('codigo', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $facultades
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener facultades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar una nueva facultad
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo'      => 'required|string|max:20|unique:facultades,codigo',
            'nombre'      => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'estado'      => 'nullable|string|in:ACTIVO,INACTIVO',
        ]);

        try {
            $facultad = Facultad::create([
                'codigo'      => strtoupper(trim($request->codigo)),
                'nombre'      => trim($request->nombre),
                'descripcion' => $request->descripcion ? trim($request->descripcion) : null,
                'estado'      => $request->estado ?? 'ACTIVO',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facultad registrada correctamente.',
                'data'    => $facultad
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar facultad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Consultar una facultad por ID o código
     */
    public function show($idOrCodigo)
    {
        try {
            $facultad = Facultad::where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->first();

            if (!$facultad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Facultad no encontrada.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $facultad
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar facultad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una facultad por ID o código
     */
    public function update(Request $request, $idOrCodigo)
    {
        $request->validate([
            'codigo'      => 'nullable|string|max:20',
            'nombre'      => 'nullable|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'estado'      => 'nullable|string|in:ACTIVO,INACTIVO',
        ]);

        try {
            $facultad = Facultad::where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->first();

            if (!$facultad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Facultad no encontrada.'
                ], 404);
            }

            $datos = [];
            if ($request->filled('codigo')) $datos['codigo'] = strtoupper(trim($request->codigo));
            if ($request->filled('nombre')) $datos['nombre'] = trim($request->nombre);
            if ($request->has('descripcion')) $datos['descripcion'] = $request->descripcion ? trim($request->descripcion) : null;
            if ($request->filled('estado')) $datos['estado'] = $request->estado;

            $facultad->update($datos);

            return response()->json([
                'success' => true,
                'message' => 'Facultad actualizada correctamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar facultad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una facultad por ID o código
     */
    public function destroy($idOrCodigo)
    {
        try {
            $facultad = Facultad::where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->first();

            if (!$facultad) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró la facultad para eliminar.'
                ], 404);
            }

            $facultad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Facultad eliminada correctamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar facultad: ' . $e->getMessage()
            ], 500);
        }
    }
}