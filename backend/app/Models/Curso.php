<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    // Forzamos el nombre exacto de la tabla en la base de datos
    protected $table = 'cursos';

    protected $fillable = [
        'plan_estudio_id',
        'codigo',
        'nombre',
        'ciclo',
        'creditos',
        'horas_teoria',
        'horas_practica',
        'tipo', // Ej: OBLIGATORIO, ELECTIVO
        'estado',
    ];

    /**
     * Relación: Un curso pertenece a un Plan de Estudio
     */
    public function planEstudio()
    {
        return $this->belongsTo(PlanEstudio::class, 'plan_estudio_id');
    }

    /**
     * Relación: Prerrequisitos del curso (Relación Muchos a Muchos consigo misma)
     * Asume que crearás una tabla pivot llamada 'curso_prerrequisito' 
     * con los campos 'curso_id' y 'prerrequisito_id'
     */
    public function prerrequisitos()
    {
        return $this->belongsToMany(Curso::class, 'curso_prerrequisito', 'curso_id', 'prerrequisito_id');
    }
}