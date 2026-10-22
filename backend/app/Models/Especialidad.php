<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes; // Opcional si usas borrado lógico

class Especialidad extends Model
{
    use HasFactory;

    protected $table = 'especialidades';

    protected $fillable = [
        'codigo',
        'nombre',
        'facultad_id',
        'estado',       // Si usas columna 'estado' o 'is_active'
        'is_active',    // Inclúyelo si tu base de datos usa este campo
    ];

    /**
     * Indica a Laravel que use 'codigo' en lugar de 'id' en las rutas de la API
     */
    public function getRouteKeyName(): string
    {
        return 'codigo';
    }

    /**
     * Relación: Una Especialidad pertenece a una Facultad
     */
    public function facultad(): BelongsTo
    {
        return $this->belongsTo(Facultad::class, 'facultad_id');
    }
}