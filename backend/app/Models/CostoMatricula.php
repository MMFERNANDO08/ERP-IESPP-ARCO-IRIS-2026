<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostoMatricula extends Model
{
    use HasFactory;

    // Nombre exacto de la tabla en tu base de datos
    protected $table = 'costos_matricula'; 

    // Campos que permitimos guardar masivamente
    protected $fillable = [
        'modalidad_id', 'periodo_id', 'programa_id', 'carrera_id',
        'tipo_matricula', 'sede', 'concepto', 'condicion', 'momento',
        'cobrar_una_vez', 'detalle', 'monto', 'estado'
    ];
}