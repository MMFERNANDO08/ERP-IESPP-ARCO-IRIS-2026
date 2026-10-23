import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCcw, Filter, DownloadCloud, Plus, RefreshCw, X, BookOpen, FileText, Eye, Layers, Edit3, CheckCircle2, XCircle, GraduationCap, Building2 } from 'lucide-react';
import { planEstudioService } from '../../services/planEstudioService';
import { especialidadService } from '../../services/especialidadService';
import { facultadService } from '../../services/facultadService';
import { modalidadService } from '../../services/modalidadService';

const FORMULARIO_VACIO = {
    id: null,
    curricula: '',
    resolucion: '',
    modalidad: '',
    facultad_id: '',
    especialidad_codigo: '',
    estado: 'ACTIVO',
};

function obtenerErrores(error) {
    const errores = error?.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error?.response?.data?.message || error?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

function extraerArreglo(respuesta) {
    if (!respuesta) return [];
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta?.data && Array.isArray(respuesta.data)) return respuesta.data;
    if (respuesta?.data?.data && Array.isArray(respuesta.data.data)) return respuesta.data.data;
    return [];
}

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
        transition: box-shadow 0.3s ease;
    }

    .btn-premium-dark {
        background-color: var(--slate-900);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s;
    }
    .btn-premium-dark:hover {
        background-color: var(--slate-800);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
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

    .premium-input-group { position: relative; }
    .premium-input-group .form-control, .premium-input-group .form-select {
        border-radius: 8px;
        border: 1px solid var(--slate-200);
        padding: 0.65rem 1rem;
        font-size: 0.9rem;
        color: var(--slate-800);
        background-color: var(--slate-50);
        transition: all 0.2s;
    }
    .premium-input-group .form-control:focus, .premium-input-group .form-select:focus {
        background-color: #fff;
        border-color: var(--teal-500);
        box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
    }
    .premium-input-group .form-select:disabled {
        background-color: var(--slate-200);
        cursor: not-allowed;
        opacity: 0.7;
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
        background-color: #ffffff;
        color: var(--slate-600);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1.25rem 1rem;
        border-bottom: 2px solid var(--slate-100);
    }
    .premium-table td {
        padding: 1.25rem 1rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--slate-100);
        font-size: 0.9rem;
        color: var(--slate-800);
    }
    .premium-table tbody tr:hover td { background-color: var(--slate-50); }

    .badge-soft-success {
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
    }
    .badge-soft-danger {
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
    }

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

export default function GestionPlanesEstudio() {
    const navigate = useNavigate();

    const [listaModalidades, setListaModalidades] = useState([]);
    const [listaFacultades, setListaFacultades] = useState([]);
    const [listaEspecialidades, setListaEspecialidades] = useState([]);

    const [filtroModalidad, setFiltroModalidad] = useState('');
    const [filtroFacultad, setFiltroFacultad] = useState('');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
    
    const [planes, setPlanes] = useState([]);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [planACambiarEstado, setPlanACambiarEstado] = useState(null);

    useEffect(() => {
        const cargarCatalogosBase = async () => {
            try {
                const facResp = await facultadService.listar({ solo_activos: 1 });
                setListaFacultades(extraerArreglo(facResp));
            } catch (e) { console.error("Error Facultades:", e); }

            try {
                const espResp = await especialidadService.listar();
                setListaEspecialidades(extraerArreglo(espResp));
            } catch (e) { console.error("Error Especialidades:", e); }

            try {
                const modResp = await modalidadService.listar();
                setListaModalidades(extraerArreglo(modResp));
            } catch (e) { console.error("Error Modalidades:", e); }
        };
        
        cargarCatalogosBase();

        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarPlanes = useCallback(async (e) => {
        if (e) e.preventDefault();
        setCargando(true);
        setFeedback(null);
        try {
            const params = {
                modalidad: filtroModalidad,
                facultad_id: filtroFacultad,
                carrera_codigo: filtroEspecialidad,
            };
            const resp = await planEstudioService.listar(params);
            setPlanes(extraerArreglo(resp));
        } catch (error) {
            setPlanes([]);
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    }, [filtroModalidad, filtroFacultad, filtroEspecialidad]);

    useEffect(() => {
        cargarPlanes();
    }, [cargarPlanes]);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, message: mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModalNuevo = () => {
        setFormulario({
            ...FORMULARIO_VACIO,
            modalidad: filtroModalidad,
            facultad_id: filtroFacultad,
            especialidad_codigo: filtroEspecialidad,
        });
        setModalFormularioAbierto(true);
    };

    // LOGICA CORREGIDA AQUÍ
    const abrirModalEditar = (plan) => {
        const codigoEspecialidad = plan.especialidad_codigo || plan.carrera_codigo || '';
        let facultadId = '';

        // Buscar a qué facultad pertenece la especialidad registrada
        if (codigoEspecialidad) {
            const especialidadEncontrada = listaEspecialidades.find(
                esp => String(esp.codigo || esp.id) === String(codigoEspecialidad)
            );
            if (especialidadEncontrada) {
                facultadId = especialidadEncontrada.facultad_id;
            }
        }

        setFormulario({
            id: plan.id,
            curricula: plan.curricula || plan.codigo || '',
            resolucion: plan.resolucion || '',
            modalidad: plan.modalidad || '',
            facultad_id: facultadId, 
            especialidad_codigo: codigoEspecialidad,
            estado: plan.estado || 'ACTIVO',
        });
        setModalFormularioAbierto(true);
    };

    const actualizarCampoForm = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => {
            const nuevo = { ...prev, [name]: value };
            if (name === 'facultad_id') {
                nuevo.especialidad_codigo = '';
            }
            return nuevo;
        });
    };

    const guardarPlan = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await planEstudioService.actualizar(formulario.id, formulario);
                mostrarFeedback('success', `Plan de Estudio "${formulario.curricula}" actualizado correctamente.`);
            } else {
                await planEstudioService.registrar(formulario);
                mostrarFeedback('success', `Plan de Estudio "${formulario.curricula}" registrado correctamente.`);
            }
            setModalFormularioAbierto(false);
            await cargarPlanes();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoPlan = async () => {
        if (!planACambiarEstado) return;
        const nuevoEstado = planACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        
        try {
            await planEstudioService.cambiarEstado(planACambiarEstado.id, nuevoEstado);
            mostrarFeedback('success', `El plan "${planACambiarEstado.curricula}" cambió a ${nuevoEstado}.`);
            setPlanACambiarEstado(null);
            await cargarPlanes();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        }
    };

    const limpiarFiltros = () => {
        setFiltroModalidad('');
        setFiltroFacultad('');
        setFiltroEspecialidad('');
    };

    const especialidadesFiltroTabla = filtroFacultad
        ? listaEspecialidades.filter(esp => String(esp.facultad_id) === String(filtroFacultad))
        : [];

    const especialidadesFormulario = formulario.facultad_id
        ? listaEspecialidades.filter(esp => String(esp.facultad_id) === String(formulario.facultad_id))
        : [];

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Gestión - Plan de Estudio
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <GraduationCap size={16} /> <span>Configura la currícula y resoluciones académicas por carrera.</span>
                    </p>
                </div>
                <button onClick={abrirModalNuevo} className="btn btn-premium-accent px-4 py-2 d-flex align-items-center gap-2">
                    <Plus size={18} /> <span>Nuevo Plan</span>
                </button>
            </div>

            {feedback && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center mb-4`} role="alert">
                    <span className="fw-semibold">{feedback.message}</span>
                </div>
            )}

            <div className="premium-card p-4 mb-4">
                <form onSubmit={cargarPlanes}>
                    <div className="row g-3 align-items-end">
                        <div className="col-12 col-md-3">
                            <div className="premium-input-group">
                                <label className="filter-label"><Layers size={14}/> Modalidad</label>
                                <select 
                                    className="form-select" 
                                    value={filtroModalidad} 
                                    onChange={(e) => setFiltroModalidad(e.target.value)}
                                >
                                    <option value="">Todas las modalidades</option>
                                    {listaModalidades.map(mod => (
                                        <option key={`mod-${mod.codigo || mod.id}`} value={mod.codigo || mod.id}>
                                            {mod.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-4">
                            <div className="premium-input-group">
                                <label className="filter-label"><Building2 size={14}/> Facultad</label>
                                <select 
                                    className="form-select" 
                                    value={filtroFacultad} 
                                    onChange={(e) => {
                                        setFiltroFacultad(e.target.value);
                                        setFiltroEspecialidad('');
                                    }}
                                >
                                    <option value="">Todas las facultades</option>
                                    {listaFacultades.map(fac => (
                                        <option key={`fac-${fac.id}`} value={fac.id}>{fac.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-5">
                            <div className="premium-input-group">
                                <label className="filter-label"><GraduationCap size={14}/> Especialidad</label>
                                <select 
                                    className="form-select" 
                                    value={filtroEspecialidad} 
                                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                                    disabled={!filtroFacultad}
                                >
                                    <option value="">{filtroFacultad ? "Todas las especialidades" : "Seleccione Facultad..."}</option>
                                    {especialidadesFiltroTabla.map(esp => (
                                        <option key={`esp-${esp.codigo || esp.id}`} value={esp.codigo || esp.id}>
                                            {esp.nombre} {esp.resolucion ? `(${esp.resolucion})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-12 border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                            <button type="button" className="btn text-muted fw-medium d-flex align-items-center gap-2 px-0" onClick={limpiarFiltros}>
                                <RefreshCcw size={16} /> Limpiar Filtros
                            </button>
                            <button type="submit" className="btn btn-premium-accent px-4 d-flex align-items-center gap-2">
                                <Filter size={16} /> Filtrar Planes
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <BookOpen size={20} className="text-teal-600" />
                        <h6 className="fw-bold mb-0 text-dark">Planes de Estudio Registrados</h6>
                    </div>
                </div>

                {cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-teal-600" role="status"></div>
                    </div>
                ) : planes.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <BookOpen size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No hay planes de estudio registrados</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            Selecciona otros filtros o crea un nuevo plan con el botón superior.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table premium-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Currícula</th>
                                    <th>Resolución</th>
                                    <th>Modalidad</th>
                                    <th>Estado</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planes.map((plan) => (
                                    <tr key={plan.id || plan.curricula}>
                                        <td className="ps-4">
                                            <span className="fw-bold text-dark">{plan.curricula || plan.codigo}</span>
                                        </td>
                                        <td>
                                            <span className="text-muted">{plan.resolucion || 'Sin Resolución'}</span>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border px-2 py-1">
                                                {plan.modalidad_nombre || plan.modalidad || 'N/D'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge px-3 py-1 rounded-pill ${String(plan.estado).toUpperCase() === 'ACTIVO' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
                                                {plan.estado}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex gap-2 justify-content-end align-items-center">
                                                
                                                <button 
                                                    className="btn btn-sm btn-light border text-primary shadow-sm" 
                                                    title="Ver Malla Curricular (Cursos)" 
                                                    style={{ borderRadius: '6px' }}
                                                    onClick={() => navigate(`/planes-estudio/${plan.id}/cursos`)}
                                                >
                                                    <Layers size={15} />
                                                </button>

                                                <button className="btn btn-sm btn-light border text-muted shadow-sm" title="Reporte Plan" style={{ borderRadius: '6px' }}>
                                                    <FileText size={15} />
                                                </button>
                                                <button 
                                                    className={`btn btn-sm btn-light border shadow-sm ${plan.estado === 'ACTIVO' ? 'text-danger' : 'text-success'}`}
                                                    onClick={() => setPlanACambiarEstado(plan)}
                                                    title={plan.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    {plan.estado === 'ACTIVO' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-light border text-muted shadow-sm"
                                                    onClick={() => abrirModalEditar(plan)}
                                                    title="Editar Plan"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
                                                {formulario.id ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio'}
                                            </h5>
                                            <small className="text-white-50">Configure el año curricular y la resolución institucional.</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setModalFormularioAbierto(false)}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-plan-estudio" onSubmit={guardarPlan}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Currícula (Año/Código) <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="curricula" 
                                                        value={formulario.curricula} 
                                                        onChange={actualizarCampoForm} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Resolución</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="resolucion" 
                                                        value={formulario.resolucion} 
                                                        onChange={actualizarCampoForm} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Modalidad <span className="text-danger">*</span></label>
                                                    <select 
                                                        className="form-select" 
                                                        name="modalidad" 
                                                        value={formulario.modalidad} 
                                                        onChange={actualizarCampoForm}
                                                        required
                                                    >
                                                        <option value="">Seleccionar modalidad...</option>
                                                        {listaModalidades.map(mod => (
                                                            <option key={`modal-mod-${mod.codigo || mod.id}`} value={mod.codigo || mod.id}>
                                                                {mod.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Facultad <span className="text-danger">*</span></label>
                                                    <select 
                                                        className="form-select" 
                                                        name="facultad_id" 
                                                        value={formulario.facultad_id} 
                                                        onChange={actualizarCampoForm}
                                                        required
                                                    >
                                                        <option value="">Seleccionar facultad...</option>
                                                        {listaFacultades.map(fac => (
                                                            <option key={`modal-fac-${fac.id}`} value={fac.id}>{fac.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Especialidad <span className="text-danger">*</span></label>
                                                    <select 
                                                        className="form-select" 
                                                        name="especialidad_codigo" 
                                                        value={formulario.especialidad_codigo} 
                                                        onChange={actualizarCampoForm}
                                                        required
                                                        disabled={!formulario.facultad_id}
                                                    >
                                                        <option value="">{formulario.facultad_id ? "Seleccionar especialidad..." : "Seleccione Facultad..."}</option>
                                                        {especialidadesFormulario.map(esp => (
                                                            <option key={`modal-esp-${esp.codigo || esp.id}`} value={esp.codigo || esp.id}>{esp.nombre}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Estado <span className="text-danger">*</span></label>
                                                    <select 
                                                        className="form-select" 
                                                        name="estado" 
                                                        value={formulario.estado} 
                                                        onChange={actualizarCampoForm}
                                                    >
                                                        <option value="ACTIVO">ACTIVO</option>
                                                        <option value="INACTIVO">INACTIVO</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-between">
                                    <span className="text-muted small">Campos obligatorios *</span>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-light fw-medium px-4" onClick={() => setModalFormularioAbierto(false)} disabled={guardando}>
                                            Cancelar
                                        </button>
                                        <button type="submit" form="form-plan-estudio" className="btn btn-premium-accent fw-medium px-5" disabled={guardando}>
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

            {planACambiarEstado && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content premium-modal">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Confirmar cambio de estado</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setPlanACambiarEstado(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-0">
                                    ¿Está seguro que desea cambiar el estado del plan <strong>{planACambiarEstado.curricula}</strong> a{' '}
                                    <span className="fw-bold text-teal-600">
                                        {planACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}
                                    </span>?
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-light" onClick={() => setPlanACambiarEstado(null)}>Cancelar</button>
                                <button type="button" className="btn btn-premium-accent" onClick={cambiarEstadoPlan}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </div>
            )}
        </div>
    );
}