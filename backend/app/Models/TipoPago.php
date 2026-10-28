<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoPago extends Model
{
    use HasFactory, SoftDeletes;

    // Nombre de la tabla en la base de datos (por convención suele ser en plural)
    protected $table = 'tipos_pago';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'descripcion',
        'codigo_pago',
        'costo',
        'estado',
    ];

    /**
     * Mutadores o Casteos (Opcional pero recomendado)
     * Asegura que el costo siempre se maneje como un número decimal (float/double)
     */
    protected $casts = [
        'costo' => 'decimal:2',
    ];

    /**
     * Scope local para filtrar solo los tipos de pago activos (opcional pero útil)
     * Uso: TipoPago::activos()->get();
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }
}