import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, Plus, Trash2, Pencil, Calendar, AlertTriangle, X, ChevronLeft, ChevronRight, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
import { periodoService } from '../../services/periodoService';

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    flag_per: '1',
    flag_cur: '0',
    activo: 'ABIERTO',
    web_adm: '1',
    web_doc: '1',
    web_alu: '1',
    inicio: '',
    fin: '',
};

function obtenerErrores(error) {
    const errores = error?.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error?.response?.data?.message || error?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

function extraerArreglo(respuesta) {
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
        --sky-500: #0ea5e9; 
        --sky-600: #0284c7;
        --radius-lg: 12px;
        --radius-xl: 16px;
    }

    body {
        background-color: var(--slate-50);
    }

    .premium-card {
        background: #ffffff;
        border-radius: var(--radius-lg);
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.3s ease;
    }

    .btn-premium-accent {
        background-color: var(--sky-500);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s;
    }
    .btn-premium-accent:hover {
        background-color: var(--sky-600);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    .premium-input-group {
        position: relative;
    }
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
        border-color: var(--sky-500);
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
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
        letter-spacing: 0.5px;
        padding: 1.25rem 0.75rem;
        border-bottom: 2px solid var(--slate-100);
    }
    .premium-table td {
        padding: 1.1rem 0.75rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--slate-100);
        font-size: 0.88rem;
        color: var(--slate-800);
    }
    .premium-table tbody tr:hover td {
        background-color: var(--slate-50);
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
    .premium-modal.modal-danger .modal-header {
        background: white;
        color: var(--slate-900);
        border-bottom: 1px solid var(--slate-200);
    }
`;

export default function GestionPeriodos() {
    const [periodos, setPeriodos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [busquedaAplicada, setBusquedaAplicada] = useState('');
    
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [periodoAEliminar, setPeriodoAEliminar] = useState(null);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarPeriodos = async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const resp = await periodoService.listar();
            setPeriodos(extraerArreglo(resp));
        } catch (error) {
            setPeriodos([]);
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarPeriodos();
    }, []);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, message: mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setFormulario(FORMULARIO_VACIO);
        setModalAbierto(true);
    };

    const abrirModalEditar = (per) => {
        setModoEdicion(true);
        setFormulario({
            codigo: per.codigo || '',
            nombre: per.nombre || '',
            flag_per: String(per.flag_per ?? '1'),
            flag_cur: String(per.flag_cur ?? '0'),
            activo: per.activo || 'ABIERTO',
            web_adm: String(per.web_adm ?? '1'),
            web_doc: String(per.web_doc ?? '1'),
            web_alu: String(per.web_alu ?? '1'),
            inicio: per.inicio ? String(per.inicio).slice(0, 10) : '',
            fin: per.fin ? String(per.fin).slice(0, 10) : '',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
    };

    const actualizarCampo = (e) => {
        const { name, value, type, checked } = e.target;
        setFormulario(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (checked ? '1' : '0') : value 
        }));
    };

    const guardarPeriodo = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (modoEdicion) {
                await periodoService.actualizar(formulario.codigo, formulario);
                mostrarFeedback('success', `Periodo "${formulario.nombre}" actualizado correctamente.`);
            } else {
                await periodoService.registrar(formulario);
                mostrarFeedback('success', `Periodo "${formulario.nombre}" registrado correctamente.`);
            }
            setModalAbierto(false);
            await cargarPeriodos();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!periodoAEliminar) return;
        setEliminando(true);

        try {
            await periodoService.eliminar(periodoAEliminar.codigo);
            mostrarFeedback('success', `Periodo "${periodoAEliminar.nombre}" eliminado correctamente.`);
            setPeriodoAEliminar(null);
            await cargarPeriodos();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    const periodosFiltrados = periodos.filter((per) => {
        if (!busquedaAplicada.trim()) return true;
        const term = busquedaAplicada.toLowerCase();
        return (
            (per.codigo && String(per.codigo).toLowerCase().includes(term)) ||
            (per.nombre && per.nombre.toLowerCase().includes(term))
        );
    });

    const totalPaginas = Math.ceil(periodosFiltrados.length / filasPorPagina);
    const periodosPaginados = periodosFiltrados.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1500px' }}>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Gestión de Periodos Académicos
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <Calendar size={16} /> <span>Administra los ciclos académicos, aperturas de actas y accesos web por roles.</span>
                    </p>
                </div>
                <button type="button" className="btn btn-premium-accent d-flex align-items-center justify-content-center gap-2 px-4 py-2" onClick={abrirModalNuevo}>
                    <Plus size={18} /> Nuevo Periodo
                </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
                <div className={`alert alert-${feedback.type === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center mb-4`} role="alert">
                    <span className="fw-semibold">{feedback.message}</span>
                </div>
            )}

            {/* Panel de Filtros */}
            <div className="premium-card p-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-8">
                        <div className="premium-input-group">
                            <label className="filter-label"><Search size={14} /> Buscar Periodo</label>
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Buscar por código (ej. 20262) o nombre (ej. 2026-II)..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && setBusquedaAplicada(busqueda)}
                                />
                                <Search size={16} className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 d-flex gap-2">
                        <button type="button" className="btn btn-light border text-muted fw-medium d-flex align-items-center justify-content-center gap-2 w-100" 
                            onClick={() => {
                                setBusqueda('');
                                setBusquedaAplicada('');
                                setPagina(0);
                            }}
                        >
                            <RefreshCcw size={16} /> Limpiar
                        </button>
                        <button type="button" className="btn btn-premium-accent d-flex align-items-center justify-content-center gap-2 w-100"
                            onClick={() => {
                                setBusquedaAplicada(busqueda);
                                setPagina(0);
                            }}
                        >
                            <Filter size={16} /> Filtrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla Principal */}
            <div className="premium-card overflow-hidden">
                {cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-sky-500" role="status"></div>
                    </div>
                ) : periodosPaginados.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <Calendar size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No se encontraron periodos</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            No hay registros que coincidan con los criterios de búsqueda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table premium-table text-center">
                                <thead>
                                    <tr>
                                        <th className="text-start ps-4">Código</th>
                                        <th className="text-start">Nombre</th>
                                        <th>Flag Per</th>
                                        <th>Flag Cur</th>
                                        <th>Activo</th>
                                        <th>Web Adm</th>
                                        <th>Web Doc</th>
                                        <th>Web Alu</th>
                                        <th>Inicio</th>
                                        <th>Fin</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periodosPaginados.map((per) => (
                                        <tr key={per.codigo || per.id}>
                                            <td className="text-start ps-4 fw-bold text-primary">{per.codigo}</td>
                                            <td className="text-start fw-semibold text-dark">{per.nombre}</td>
                                            <td>
                                                {String(per.flag_per) === '1' ? <CheckCircle size={18} className="text-success" title="Periodo Principal Activo" /> : <XCircle size={18} className="text-muted opacity-50" />}
                                            </td>
                                            <td>
                                                {String(per.flag_cur) === '1' ? <CheckCircle size={18} className="text-success" title="Ciclo Especial / Verano" /> : <XCircle size={18} className="text-muted opacity-50" />}
                                            </td>
                                            <td>
                                                {per.activo === 'ABIERTO' ? <Unlock size={17} className="text-success" title="Abierto para operaciones" /> : <Lock size={17} className="text-danger" title="Cerrado institucionalmente" />}
                                            </td>
                                            <td>
                                                {String(per.web_adm) === '1' ? <CheckCircle size={18} className="text-success" title="Acceso Admin Habilitado" /> : <XCircle size={18} className="text-muted opacity-50" />}
                                            </td>
                                            <td>
                                                {String(per.web_doc) === '1' ? <CheckCircle size={18} className="text-success" title="Portal Docente Habilitado para Notas" /> : <XCircle size={18} className="text-muted opacity-50" />}
                                            </td>
                                            <td>
                                                {String(per.web_alu) === '1' ? <CheckCircle size={18} className="text-success" title="Portal Alumno Habilitado" /> : <XCircle size={18} className="text-muted opacity-50" />}
                                            </td>
                                            <td className="text-muted small">{per.inicio ? String(per.inicio).slice(0, 10) : '—'}</td>
                                            <td className="text-muted small">{per.fin ? String(per.fin).slice(0, 10) : '—'}</td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-light border text-primary shadow-sm" 
                                                        title="Editar periodo"
                                                        onClick={() => abrirModalEditar(per)}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-light border text-danger shadow-sm" 
                                                        title="Eliminar periodo"
                                                        onClick={() => setPeriodoAEliminar(per)}
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

                        {/* Footer Paginación */}
                        {periodosFiltrados.length > 0 && (
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50 gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small fw-medium">Registros por página:</span>
                                    <select 
                                        className="form-select form-select-sm border-0 bg-transparent fw-bold" 
                                        style={{ width: '70px', cursor: 'pointer' }}
                                        value={filasPorPagina} 
                                        onChange={(e) => {
                                            setFilasPorPagina(parseInt(e.target.value, 10));
                                            setPagina(0);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <span className="text-muted small fw-medium">
                                    Mostrando {pagina * filasPorPagina + 1} a {Math.min((pagina + 1) * filasPorPagina, periodosFiltrados.length)} de {periodosFiltrados.length} registros
                                </span>
                                <div className="d-flex gap-1">
                                    <button 
                                        className="btn btn-sm btn-white border shadow-sm" 
                                        onClick={() => setPagina(p => Math.max(0, p - 1))}
                                        disabled={pagina === 0}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-white border shadow-sm" 
                                        onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                                        disabled={pagina >= totalPaginas - 1}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODAL CREAR / EDITAR */}
            {modalAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content premium-modal">
                                
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <Calendar size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {modoEdicion ? 'Editar Periodo' : 'Nuevo Periodo'}
                                            </h5>
                                            <small className="text-white-50">Configuración de ciclos y permisos institucionales</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-periodo" onSubmit={guardarPeriodo}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Periodo (Código) <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="codigo"
                                                        placeholder="Ej. 20262" 
                                                        value={formulario.codigo} 
                                                        onChange={actualizarCampo} 
                                                        disabled={modoEdicion}
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="nombre"
                                                        placeholder="Ej. 2026-II" 
                                                        value={formulario.nombre} 
                                                        onChange={actualizarCampo} 
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12"><hr className="my-1 text-muted opacity-25" /></div>

                                            <div className="col-12">
                                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Parámetros y Accesos Web por Roles</small>
                                            </div>

                                            <div className="col-md-4">
                                                <div className="form-check form-switch pt-2">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="flag_per" name="flag_per" checked={formulario.flag_per === '1'} onChange={actualizarCampo} />
                                                    <label className="form-check-label fw-semibold small text-dark" htmlFor="flag_per">Flag Per (Principal)</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check form-switch pt-2">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="flag_cur" name="flag_cur" checked={formulario.flag_cur === '1'} onChange={actualizarCampo} />
                                                    <label className="form-check-label fw-semibold small text-dark" htmlFor="flag_cur">Flag Cur (Especial)</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check form-switch pt-2">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="web_adm" name="web_adm" checked={formulario.web_adm === '1'} onChange={actualizarCampo} />
                                                    <label className="form-check-label fw-semibold small text-dark" htmlFor="web_adm">Web Adm (Admin)</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-check form-switch pt-2">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="web_doc" name="web_doc" checked={formulario.web_doc === '1'} onChange={actualizarCampo} />
                                                    <label className="form-check-label fw-semibold small text-dark" htmlFor="web_doc">Web Doc (Portal Docente / Notas)</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-check form-switch pt-2">
                                                    <input className="form-check-input" type="checkbox" role="switch" id="web_alu" name="web_alu" checked={formulario.web_alu === '1'} onChange={actualizarCampo} />
                                                    <label className="form-check-label fw-semibold small text-dark" htmlFor="web_alu">Web Alu (Portal Alumno / Matrícula)</label>
                                                </div>
                                            </div>

                                            <div className="col-12"><hr className="my-1 text-muted opacity-25" /></div>

                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Estado Operativo General <span className="text-danger">*</span></label>
                                                    <select className="form-select" name="activo" value={formulario.activo} onChange={actualizarCampo} required>
                                                        <option value="ABIERTO">ABIERTO (Permite operar actas y registros del ciclo)</option>
                                                        <option value="CERRADO">CERRADO (Bloquea modificaciones y transacciones)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Fecha Inicio <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="date" 
                                                        className="form-control" 
                                                        name="inicio"
                                                        value={formulario.inicio} 
                                                        onChange={actualizarCampo} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Fecha Fin <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="date" 
                                                        className="form-control" 
                                                        name="fin"
                                                        value={formulario.fin} 
                                                        onChange={actualizarCampo} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light fw-medium px-4" onClick={cerrarModal} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" form="form-periodo" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
                                        {guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar')}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* MODAL ELIMINAR */}
            {periodoAEliminar && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-danger">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <AlertTriangle size={32} className="text-danger" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Eliminar Periodo?</h5>
                                    <p className="text-muted small mb-0">
                                        Se eliminará permanentemente el periodo <strong className="text-dark">{periodoAEliminar.nombre}</strong>. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setPeriodoAEliminar(null)} disabled={eliminando}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-link text-danger fw-bold text-decoration-none w-50 py-3 m-0 rounded-0" onClick={confirmarEliminacion} disabled={eliminando}>
                                        {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

        </div>
    );
}