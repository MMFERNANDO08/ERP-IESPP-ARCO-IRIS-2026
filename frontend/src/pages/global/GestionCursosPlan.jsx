import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, BookOpen, Edit3, Trash2, Clock, Award, Layers } from 'lucide-react';
// Importa aquí tu servicio de cursos. Asegúrate de tener estas funciones en el servicio.
import { cursoService } from '../../services/cursoService';
// import { planEstudioService } from '../../services/planEstudioService'; // Opcional: para traer el nombre del plan

const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const premiumStyles = `
    :root {
        --slate-50: #f8fafc;
        --slate-100: #f1f5f9;
        --slate-200: #e2e8f0;
        --slate-600: #475569;
        --slate-800: #1e293b;
        --slate-900: #0f172a; 
        --teal-500: #14b8a6;
        --teal-600: #0d9488;
        --teal-700: #0f766e;
        --radius-lg: 12px;
        --radius-xl: 16px;
    }
    body { background-color: var(--slate-50); }
    .premium-card {
        background: #ffffff;
        border-radius: var(--radius-lg);
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .btn-premium-accent {
        background-color: var(--teal-600);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s;
    }
    .btn-premium-accent:hover {
        background-color: var(--teal-700);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
    }
    .premium-input-group .form-control, .premium-input-group .form-select {
        border-radius: 8px;
        border: 1px solid var(--slate-200);
        padding: 0.65rem 1rem;
        font-size: 0.9rem;
    }
    .premium-input-group .form-control:focus, .premium-input-group .form-select:focus {
        border-color: var(--teal-500);
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
    }
    .filter-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--slate-600);
        margin-bottom: 0.4rem;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .premium-table th {
        background-color: var(--slate-50);
        color: var(--slate-600);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1rem;
        border-bottom: 2px solid var(--slate-200);
    }
    .premium-table td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--slate-100);
        font-size: 0.9rem;
    }
    .badge-soft-primary { background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .badge-soft-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .modal-content.premium-modal {
        border: none;
        border-radius: var(--radius-xl);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .premium-modal .modal-header {
        background: linear-gradient(to right, var(--slate-900), #1e293b);
        color: white;
        border-bottom: none;
        padding: 1.5rem;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }
    .premium-modal .modal-footer {
        background-color: var(--slate-50);
        border-top: 1px solid var(--slate-200);
        padding: 1.25rem 1.5rem;
        border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }
`;

export default function GestionCursosPlan() {
    const { id } = useParams(); // Obtenemos el ID del plan desde la URL
    const navigate = useNavigate();

    const FORMULARIO_VACIO = {
        id: null,
        plan_estudio_id: id,
        codigo: '',
        nombre: '',
        ciclo: 'I',
        creditos: '',
        horas_teoria: '',
        horas_practica: '',
        tipo: 'OBLIGATORIO',
    };

    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [cursoAEliminar, setCursoAEliminar] = useState(null);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarCursos = useCallback(async () => {
        setCargando(true);
        try {
            // Asume que tu servicio tiene un método para listar cursos por plan de estudio
            // Si el endpoint general soporta filtros, podría ser: cursoService.listar({ plan_estudio_id: id })
            const resp = await cursoService.listar({ plan_estudio_id: id });
            
            // Extraer arreglo seguro
            let data = [];
            if (Array.isArray(resp)) data = resp;
            else if (resp?.data && Array.isArray(resp.data)) data = resp.data;
            else if (resp?.data?.data && Array.isArray(resp.data.data)) data = resp.data.data;
            
            setCursos(data);
        } catch (error) {
            mostrarFeedback('error', 'Error al cargar los cursos del plan.');
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        cargarCursos();
    }, [cargarCursos]);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, message: mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModalNuevo = () => {
        setFormulario({ ...FORMULARIO_VACIO });
        setModalFormularioAbierto(true);
    };

    const abrirModalEditar = (curso) => {
        setFormulario({
            id: curso.id,
            plan_estudio_id: id,
            codigo: curso.codigo || '',
            nombre: curso.nombre || '',
            ciclo: curso.ciclo || 'I',
            creditos: curso.creditos || '',
            horas_teoria: curso.horas_teoria || 0,
            horas_practica: curso.horas_practica || 0,
            tipo: curso.tipo || 'OBLIGATORIO',
        });
        setModalFormularioAbierto(true);
    };

    const actualizarCampoForm = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const guardarCurso = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await cursoService.actualizar(formulario.id, formulario);
                mostrarFeedback('success', `Curso "${formulario.nombre}" actualizado correctamente.`);
            } else {
                await cursoService.registrar(formulario);
                mostrarFeedback('success', `Curso "${formulario.nombre}" registrado al plan.`);
            }
            setModalFormularioAbierto(false);
            await cargarCursos();
        } catch (error) {
            mostrarFeedback('error', 'Ocurrió un error al guardar el curso.');
        } finally {
            setGuardando(false);
        }
    };

    const eliminarCurso = async () => {
        if (!cursoAEliminar) return;
        try {
            await cursoService.eliminar(cursoAEliminar.id);
            mostrarFeedback('success', `El curso "${cursoAEliminar.nombre}" ha sido eliminado.`);
            setCursoAEliminar(null);
            await cargarCursos();
        } catch (error) {
            mostrarFeedback('error', 'Error al intentar eliminar el curso.');
        }
    };

    // Agrupar cursos por ciclo para renderizarlos en bloques ordenados
    const cursosPorCiclo = CICLOS.reduce((acc, ciclo) => {
        acc[ciclo] = cursos.filter(c => c.ciclo === ciclo);
        return acc;
    }, {});

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            {/* Header / Navegación */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div className="d-flex align-items-center gap-3">
                    <button 
                        onClick={() => navigate('/planes-estudio')} 
                        className="btn btn-light border shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <ArrowLeft size={20} className="text-muted" />
                    </button>
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                            Malla Curricular
                        </h2>
                        <p className="mb-0 text-muted d-flex align-items-center gap-2">
                            <Layers size={16} /> <span>Gestión de cursos por semestre académico.</span>
                        </p>
                    </div>
                </div>
                <button onClick={abrirModalNuevo} className="btn btn-premium-accent px-4 py-2 d-flex align-items-center gap-2">
                    <Plus size={18} /> <span>Agregar Curso</span>
                </button>
            </div>

            {feedback && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center mb-4`}>
                    <span className="fw-semibold">{feedback.message}</span>
                </div>
            )}

            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-teal-600" role="status"></div>
                </div>
            ) : cursos.length === 0 ? (
                <div className="premium-card text-center py-5">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                        <BookOpen size={36} className="text-muted opacity-50" />
                    </div>
                    <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>Malla Curricular Vacía</h5>
                    <p className="text-muted mb-0">No hay cursos registrados en este plan de estudios. Comienza agregando uno.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {CICLOS.map(ciclo => {
                        const cursosDelCiclo = cursosPorCiclo[ciclo];
                        if (cursosDelCiclo.length === 0) return null;

                        return (
                            <div key={ciclo} className="col-12">
                                <div className="premium-card overflow-hidden">
                                    <div className="p-3 bg-light border-bottom d-flex align-items-center gap-2">
                                        <div className="bg-white border rounded px-2 py-1 fw-bold text-teal-700 shadow-sm">
                                            CICLO {ciclo}
                                        </div>
                                        <span className="text-muted small fw-medium">
                                            {cursosDelCiclo.length} Asignatura(s)
                                        </span>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table premium-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="ps-4" style={{ width: '120px' }}>Código</th>
                                                    <th>Asignatura</th>
                                                    <th>Tipo</th>
                                                    <th className="text-center">Créditos</th>
                                                    <th className="text-center">HT / HP</th>
                                                    <th className="text-end pe-4">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cursosDelCiclo.map(curso => (
                                                    <tr key={curso.id}>
                                                        <td className="ps-4 fw-bold text-muted">{curso.codigo}</td>
                                                        <td className="fw-bold text-dark">{curso.nombre}</td>
                                                        <td>
                                                            <span className={`badge px-2 py-1 rounded ${curso.tipo === 'OBLIGATORIO' ? 'badge-soft-primary' : 'badge-soft-warning'}`}>
                                                                {curso.tipo}
                                                            </span>
                                                        </td>
                                                        <td className="text-center fw-medium">
                                                            <Award size={14} className="text-teal-600 me-1" /> {curso.creditos}
                                                        </td>
                                                        <td className="text-center text-muted">
                                                            <Clock size={14} className="me-1" />
                                                            HT: {curso.horas_teoria} | HP: {curso.horas_practica}
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex gap-2 justify-content-end">
                                                                <button 
                                                                    className="btn btn-sm btn-light border text-primary shadow-sm"
                                                                    onClick={() => abrirModalEditar(curso)}
                                                                    title="Editar Curso"
                                                                >
                                                                    <Edit3 size={15} />
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-light border text-danger shadow-sm"
                                                                    onClick={() => setCursoAEliminar(curso)}
                                                                    title="Eliminar Curso"
                                                                >
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Crear/Editar Curso */}
            {modalFormularioAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content premium-modal">
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <BookOpen size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {formulario.id ? 'Editar Asignatura' : 'Nueva Asignatura'}
                                            </h5>
                                            <small className="text-white-50">Ingresa los datos académicos del curso.</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setModalFormularioAbierto(false)}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-curso" onSubmit={guardarCurso}>
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Código <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="codigo" value={formulario.codigo} onChange={actualizarCampoForm} required />
                                                </div>
                                            </div>
                                            <div className="col-md-9">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre del Curso <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="nombre" value={formulario.nombre} onChange={actualizarCampoForm} required />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Ciclo Académico <span className="text-danger">*</span></label>
                                                    <select className="form-select" name="ciclo" value={formulario.ciclo} onChange={actualizarCampoForm} required>
                                                        {CICLOS.map(c => <option key={c} value={c}>Ciclo {c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Naturaleza <span className="text-danger">*</span></label>
                                                    <select className="form-select" name="tipo" value={formulario.tipo} onChange={actualizarCampoForm} required>
                                                        <option value="OBLIGATORIO">Obligatorio</option>
                                                        <option value="ELECTIVO">Electivo</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Créditos <span className="text-danger">*</span></label>
                                                    <input type="number" step="0.5" className="form-control" name="creditos" value={formulario.creditos} onChange={actualizarCampoForm} required />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Horas Teoría (HT) <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control" name="horas_teoria" value={formulario.horas_teoria} onChange={actualizarCampoForm} required min="0" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Horas Práctica (HP) <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control" name="horas_practica" value={formulario.horas_practica} onChange={actualizarCampoForm} required min="0" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-between">
                                    <span className="text-muted small">* Campos obligatorios</span>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-light fw-medium px-4" onClick={() => setModalFormularioAbierto(false)} disabled={guardando}>Cancelar</button>
                                        <button type="submit" form="form-curso" className="btn btn-premium-accent fw-medium px-5" disabled={guardando}>
                                            {guardando ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* Modal Confirmar Eliminar */}
            {cursoAEliminar && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content premium-modal">
                            <div className="modal-header bg-danger bg-gradient text-white">
                                <h5 className="modal-title fw-bold">Eliminar Curso</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setCursoAEliminar(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-0">
                                    ¿Está seguro que desea eliminar el curso <strong>{cursoAEliminar.codigo} - {cursoAEliminar.nombre}</strong>? 
                                    Esta acción no se puede deshacer y puede afectar matrículas existentes.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={() => setCursoAEliminar(null)}>Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={eliminarCurso}>Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </div>
            )}
        </div>
    );
}