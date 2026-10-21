<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NivelEducativoController extends Controller
{
    /**
     * Listar niveles educativos (admite filtro solo_activos)
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('niveles_educativos');

            if ($request->has('solo_activos') && $request->solo_activos == 1) {
                $query->where('estado', 'ACTIVO');
            }

            $niveles = $query->orderBy('codigo', 'asc')->get();

            return response()->json([
                'success' => true,
                'data'    => $niveles
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener niveles educativos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar un nuevo nivel educativo
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo'      => 'required|string|max:20|unique:niveles_educativos,codigo',
            'nombre'      => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado'      => 'nullable|string|in:ACTIVO,INACTIVO',
        ]);

        try {
            $codigo = strtoupper(trim($request->codigo));

            $id = DB::table('niveles_educativos')->insertGetId([
                'codigo'      => $codigo,
                'nombre'      => trim($request->nombre),
                'descripcion' => $request->descripcion ? trim($request->descripcion) : null,
                'estado'      => $request->estado ?? 'ACTIVO',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Nivel educativo registrado correctamente.',
                'data'    => ['id' => $id, 'codigo' => $codigo]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar nivel educativo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Consultar un nivel educativo por ID o código
     */
    public function show($idOrCodigo)
    {
        try {
            $nivel = DB::table('niveles_educativos')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->first();

            if (!$nivel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nivel educativo no encontrado.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $nivel
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al consultar nivel educativo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un nivel educativo por ID o código
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

            DB::table('niveles_educativos')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->update($datos);

            return response()->json([
                'success' => true,
                'message' => 'Nivel educativo actualizado correctamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar nivel educativo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un nivel educativo por ID o código
     */
    public function destroy($idOrCodigo)
    {
        try {
            $eliminado = DB::table('niveles_educativos')
                ->where('id', $idOrCodigo)
                ->orWhere('codigo', $idOrCodigo)
                ->delete();

            if (!$eliminado) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró el nivel educativo para eliminar.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Nivel educativo eliminado correctamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar nivel educativo: ' . $e->getMessage()
            ], 500);
        }
    }
}