<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoPago;
use Illuminate\Http\Request;

class TipoPagoController extends Controller
{
    public function index(Request $request)
    {
        $query = TipoPago::query();

        // Filtro de búsqueda (usado en el frontend con params = { search: filtroBusqueda })
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('descripcion', 'LIKE', "%{$search}%")
                  ->orWhere('codigo_pago', 'LIKE', "%{$search}%");
            });
        }

        // Si necesitas un filtro de "solo activos" en el futuro
        if ($request->has('solo_activos') && $request->solo_activos == 1) {
            $query->where('estado', 'ACTIVO');
        }

        $tiposPago = $query->orderBy('id', 'desc')->get();

        return response()->json($tiposPago);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'descripcion' => 'required|string|max:255',
            'codigo_pago' => 'nullable|string|max:50|unique:tipos_pago,codigo_pago',
            'costo'       => 'required|numeric|min:0',
            'estado'      => 'required|in:ACTIVO,INACTIVO',
        ]);

        $tipoPago = TipoPago::create($data);

        return response()->json([
            'message' => 'Tipo de Pago registrado correctamente',
            'data'    => $tipoPago
        ], 201);
    }

    public function show($id)
    {
        $tipoPago = TipoPago::findOrFail($id);
        return response()->json(['data' => $tipoPago]);
    }

    public function update(Request $request, $id)
    {
        $tipoPago = TipoPago::findOrFail($id);

        $data = $request->validate([
            'descripcion' => 'required|string|max:255',
            // El unique ignora el ID actual para permitir actualizar sin cambiar el código
            'codigo_pago' => 'nullable|string|max:50|unique:tipos_pago,codigo_pago,' . $tipoPago->id,
            'costo'       => 'required|numeric|min:0',
            'estado'      => 'required|in:ACTIVO,INACTIVO',
        ]);

        $tipoPago->update($data);

        return response()->json([
            'message' => 'Tipo de Pago actualizado correctamente',
            'data'    => $tipoPago
        ]);
    }

    /**
     * Método específico para cambiar el estado desde el botón rápido de la tabla
     */
    public function cambiarEstado(Request $request, $id)
    {
        $tipoPago = TipoPago::findOrFail($id);

        $request->validate([
            'estado' => 'required|in:ACTIVO,INACTIVO'
        ]);

        $tipoPago->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'data'    => $tipoPago
        ]);
    }

    public function destroy($id)
    {
        $tipoPago = TipoPago::findOrFail($id);
        $tipoPago->delete();

        return response()->json([
            'message' => 'Tipo de Pago eliminado correctamente'
        ]);
    }
}