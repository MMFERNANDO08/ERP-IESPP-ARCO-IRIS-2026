<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanEstudio extends Model
{
    use HasFactory;

    // Forzamos el nombre exacto de la tabla en la base de datos
    protected $table = 'planes_estudio';

    protected $fillable = [
        'curricula',
        'resolucion',
        'modalidad',
        'programa_academico',
        'especialidad_codigo',
        'estado',
    ];
}