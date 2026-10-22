<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModalidadEstudio extends Model
{
    use HasFactory;
    protected $table = 'modalidad_estudios';
    
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'estado'
    ];
}