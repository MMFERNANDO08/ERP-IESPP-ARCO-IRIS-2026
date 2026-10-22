<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EspecialidadController extends Controller
{
    /**
     * Convertir y formatear la especialidad para la interfaz.
     */
    private function formatoEspecialidad(Especialidad $especialidad): array
    {
        return [
            'id' => $especialidad->id,
            'codigo' => $especialidad->codigo,
            'nombre' => $especialidad->nombre,
            'estado' => $especialidad->estado,
            'facultad_id' => $especialidad->facultad_id,
            'facultad' => $especialidad->relationLoaded('facultad') && $especialidad->facultad ? [
                'id' => $especialidad->facultad->id,
                'nombre' => $especialidad->facultad->nombre,
            ] : null,
        ];
    }

    /**
     * Listar y filtrar especialidades considerando el buscador y estado operativo.
     */
    public function index(Request $request)
    {
        $query = Especialidad::with('facultad');

        // Filtro por estado operativo proveniente de la interfaz
        if ($request->filled('estado') && $request->input('estado') !== 'Todas las Especialidades') {
            $query->where('estado', $request->input('estado'));
        }

        // Compatibilidad con parámetro alternativo de activos
        if ($request->input('solo_activos') == 1) {
            $query->where('estado', 'ACTIVO');
        }

        // Filtro de búsqueda por código o nombre
        if ($request->filled('buscar')) {
            $buscar = trim($request->input('buscar'));

            $query->where(function ($q) use ($buscar) {
                $q->where('codigo', 'ilike', "%{$buscar}%")
                  ->orWhere('nombre', 'ilike', "%{$buscar}%");
            });
        }

        $especialidades = $query->orderBy('codigo')
            ->get()
            ->map(fn ($esp) => $this->formatoEspecialidad($esp));

        return response()->json($especialidades->values());
    }

    /**
     * Obtener un registro por código.
     */
    public function show(string $codigo)
    {
        $especialidad = Especialidad::with('facultad')
            ->where('codigo', $codigo)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatoEspecialidad($especialidad),
        ]);
    }

    /**
     * Registrar una especialidad validando su facultad.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'codigo' => [
                'required',
                'string',
                'max:30',
                'unique:especialidades,codigo',
            ],
            'nombre' => 'required|string|max:150',
            'estado' => 'required|in:ACTIVO,INACTIVO',
            'facultad_id' => 'required|exists:facultades,id',
        ]);

        $especialidad = Especialidad::create([
            'codigo' => strtoupper(trim($datos['codigo'])),
            'nombre' => trim($datos['nombre']),
            'estado' => $datos['estado'],
            'facultad_id' => $datos['facultad_id'],
        ]);

        $especialidad->load('facultad');

        return response()->json([
            'message' => 'Especialidad creada correctamente.',
            'data' => $this->formatoEspecialidad($especialidad),
        ], 201);
    }

    /**
     * Actualizar una especialidad por código.
     */
    public function update(Request $request, string $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)
            ->firstOrFail();

        $datos = $request->validate([
            'codigo' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('especialidades', 'codigo')
                    ->ignore($especialidad->id),
            ],
            'nombre' => 'required|string|max:150',
            'estado' => 'required|in:ACTIVO,INACTIVO',
            'facultad_id' => 'required|exists:facultades,id',
        ]);

        $especialidad->update([
            'codigo' => strtoupper(trim($datos['codigo'] ?? $especialidad->codigo)),
            'nombre' => trim($datos['nombre']),
            'estado' => $datos['estado'],
            'facultad_id' => $datos['facultad_id'],
        ]);

        $especialidad->load('facultad');

        return response()->json([
            'message' => 'Especialidad actualizada correctamente.',
            'data' => $this->formatoEspecialidad($especialidad),
        ]);
    }

    /**
     * Eliminar por código.
     */
    public function destroy(string $codigo)
    {
        $especialidad = Especialidad::where('codigo', $codigo)
            ->firstOrFail();

        $especialidad->delete();

        return response()->json([
            'message' => 'Especialidad eliminada correctamente.',
        ]);
    }
}