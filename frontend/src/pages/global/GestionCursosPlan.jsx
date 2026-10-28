import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, BookOpen, Edit3, Trash2, Clock, Award, Layers, AlertCircle } from 'lucide-react';
import { cursoService } from '../../services/cursoService';

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
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
        transition: all 0.2s ease;
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
        background-color: #fff;
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
        letter-spacing: 0.5px;
    }
    .premium-table th {
        background-color: var(--slate-50);
        color: var(--slate-600);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 1rem;
        border-bottom: 2px solid var(--slate-200);
    }
    .premium-table td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--slate-100);
        font-size: 0.9rem;
    }
    .badge-soft-primary { background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; font-weight: 500; }
    .badge-soft-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-weight: 500; }
    
    .modal-content.premium-modal {
        border: none;
        border-radius: var(--radius-xl);
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
        overflow: hidden;
    }
    .premium-modal .modal-header {
        background: linear-gradient(135deg, var(--slate-900), var(--slate-800));
        color: white;
        border-bottom: none;
        padding: 1.5rem;
    }
    .premium-modal .modal-footer {
        background-color: var(--slate-50);
        border-top: 1px solid var(--slate-200);
        padding: 1.25rem 1.5rem;
    }
    .action-btn {
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
    }
    .action-btn:hover {
        transform: translateY(-2px);
    }
`;

export default function GestionCursosPlan() {
    const { id } = useParams();
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
            const resp = await cursoService.listar({ plan_estudio_id: id });
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
                        onClick={() => navigate('/gestion-global/planes-estudio')} 
                        className="action-btn btn btn-light border shadow-sm text-secondary"
                        title="Volver a Planes de Estudio"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                            Malla Curricular
                        </h2>
                        <p className="mb-0 text-muted d-flex align-items-center gap-2 small">
                            <Layers size={15} className="text-teal-600" /> <span>Gestión y distribución de asignaturas por semestre académico.</span>
                        </p>
                    </div>
                </div>
                <button onClick={abrirModalNuevo} className="btn btn-premium-accent px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                    <Plus size={18} /> <span>Agregar Curso</span>
                </button>
            </div>

            {feedback && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center mb-4`}>
                    <span className="fw-medium">{feedback.message}</span>
                </div>
            )}

            {cargando ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-teal-600" role="status"></div>
                    <p className="text-muted small mt-2">Cargando malla curricular...</p>
                </div>
            ) : cursos.length === 0 ? (
                <div className="premium-card text-center py-5 px-3">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                        <BookOpen size={30} className="text-muted opacity-50" />
                    </div>
                    <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>Malla Curricular Vacía</h5>
                    <p className="text-muted small mb-3">No hay cursos registrados en este plan de estudios actualmente.</p>
                    <button onClick={abrirModalNuevo} className="btn btn-sm btn-outline-secondary px-3">
                        Comenzar agregando uno
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {CICLOS.map(ciclo => {
                        const cursosDelCiclo = cursosPorCiclo[ciclo];
                        if (cursosDelCiclo.length === 0) return null;

                        return (
                            <div key={ciclo} className="col-12">
                                <div className="premium-card overflow-hidden">
                                    <div className="px-4 py-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-light text-dark border shadow-sm px-3 py-2 fw-bold text-uppercase">
                                                Ciclo {ciclo}
                                            </span>
                                        </div>
                                        <span className="text-muted small fw-medium bg-white px-2 py-1 rounded border shadow-sm">
                                            {cursosDelCiclo.length} {cursosDelCiclo.length === 1 ? 'Asignatura' : 'Asignaturas'}
                                        </span>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table premium-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="ps-4" style={{ width: '130px' }}>Código</th>
                                                    <th>Asignatura</th>
                                                    <th style={{ width: '140px' }}>Tipo</th>
                                                    <th className="text-center" style={{ width: '110px' }}>Créditos</th>
                                                    <th className="text-center" style={{ width: '160px' }}>HT / HP</th>
                                                    <th className="text-end pe-4" style={{ width: '120px' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cursosDelCiclo.map(curso => (
                                                    <tr key={curso.id}>
                                                        <td className="ps-4 fw-bold text-secondary font-monospace">{curso.codigo}</td>
                                                        <td className="fw-bold text-dark">{curso.nombre}</td>
                                                        <td>
                                                            <span className={`badge px-2.5 py-1 rounded-pill ${curso.tipo === 'OBLIGATORIO' ? 'badge-soft-primary' : 'badge-soft-warning'}`}>
                                                                {curso.tipo}
                                                            </span>
                                                        </td>
                                                        <td className="text-center fw-semibold">
                                                            <div className="d-inline-flex align-items-center gap-1 text-teal-700 bg-light px-2 py-1 rounded">
                                                                <Award size={13} /> {curso.creditos}
                                                            </div>
                                                        </td>
                                                        <td className="text-center text-muted small">
                                                            <div className="d-inline-flex align-items-center gap-1">
                                                                <Clock size={13} className="text-muted" />
                                                                <span>HT: {curso.horas_teoria} | HP: {curso.horas_practica}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-end pe-4">
                                                            <div className="d-flex gap-1.5 justify-content-end">
                                                                <button 
                                                                    className="action-btn btn btn-sm btn-light border text-primary shadow-sm"
                                                                    onClick={() => abrirModalEditar(curso)}
                                                                    title="Editar Curso"
                                                                >
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button 
                                                                    className="action-btn btn btn-sm btn-light border text-danger shadow-sm"
                                                                    onClick={() => setCursoAEliminar(curso)}
                                                                    title="Eliminar Curso"
                                                                >
                                                                    <Trash2 size={14} />
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
                                            <BookOpen size={22} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white fs-5">
                                                {formulario.id ? 'Editar Asignatura' : 'Nueva Asignatura'}
                                            </h5>
                                            <small className="text-white-50">Completa los campos con la información académica.</small>
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
                                                    <input type="text" className="form-control" name="codigo" value={formulario.codigo} onChange={actualizarCampoForm} placeholder="Ej. MAT101" required />
                                                </div>
                                            </div>
                                            <div className="col-md-9">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre del Curso <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="nombre" value={formulario.nombre} onChange={actualizarCampoForm} placeholder="Ej. Cálculo I" required />
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
                                                    <input type="number" step="0.5" className="form-control" name="creditos" value={formulario.creditos} onChange={actualizarCampoForm} placeholder="Ej. 4" required />
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

                                <div className="modal-footer d-flex justify-content-between align-items-center">
                                    <span className="text-muted small d-flex align-items-center gap-1">
                                        <span className="text-danger">*</span> Campos obligatorios
                                    </span>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-light fw-medium px-4 border" onClick={() => setModalFormularioAbierto(false)} disabled={guardando}>Cancelar</button>
                                        <button type="submit" form="form-curso" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
                                            {guardando ? 'Guardando...' : 'Guardar Curso'}
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
                            <div className="modal-header bg-danger text-white">
                                <div className="d-flex align-items-center gap-2">
                                    <AlertCircle size={20} />
                                    <h5 className="modal-title fw-bold fs-5">Eliminar Asignatura</h5>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setCursoAEliminar(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-0 text-secondary">
                                    ¿Está seguro que desea eliminar el curso <strong className="text-dark">[{cursoAEliminar.codigo}] {cursoAEliminar.nombre}</strong>? 
                                    <span className="d-block mt-2 text-muted small">Esta acción no se puede deshacer y podría afectar el historial o matrículas vinculadas.</span>
                                </p>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-light border px-4" onClick={() => setCursoAEliminar(null)}>Cancelar</button>
                                <button type="button" className="btn btn-danger px-4" onClick={eliminarCurso}>Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </div>
            )}
        </div>
    );
}