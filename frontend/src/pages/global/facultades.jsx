import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, Plus, Trash2, Pencil, Building2, AlertTriangle, X, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { facultadService } from '../../services/facultadService';

const FORMULARIO_VACIO = {
    id: null,
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'ACTIVO',
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
        --teal-500: #14b8a6;
        --teal-600: #0d9488;
        --teal-700: #0f766e;
        --sky-500: #0ea5e9; 
        --sky-600: #0284c7;
        --danger-500: #ef4444;
        --danger-600: #dc2626;
        --warning-500: #f59e0b;
        --warning-600: #d97706;
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

    .premium-table {
        margin-bottom: 0;
    }
    .premium-table th {
        background-color: #ffffff;
        color: var(--slate-600);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
    .premium-table tbody tr:hover td {
        background-color: var(--slate-50);
    }

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
    .premium-modal.modal-danger .modal-header {
        background: white;
        color: var(--slate-900);
        border-bottom: 1px solid var(--slate-200);
    }
    .premium-modal.modal-warning .modal-header {
        background: white;
        color: var(--slate-900);
        border-bottom: 1px solid var(--slate-200);
    }
    .premium-modal .modal-footer {
        background-color: var(--slate-50);
        border-top: 1px solid var(--slate-200);
        padding: 1.25rem 1.5rem;
        border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }
`;

export default function GestionFacultades() {
    const [busqueda, setBusqueda] = useState('');
    const [busquedaAplicada, setBusquedaAplicada] = useState('');
    const [facultades, setFacultades] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [facultadACambiarEstado, setFacultadACambiarEstado] = useState(null);
    const [facultadAEliminar, setFacultadAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarFacultades = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const resp = await facultadService.listar();
            setFacultades(extraerArreglo(resp));
        } catch (error) {
            setFacultades([]);
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarFacultades();
    }, [cargarFacultades]);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, message: mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModalNuevo = () => {
        setFormulario(FORMULARIO_VACIO);
        setModalFormularioAbierto(true);
    };

    const abrirModalEditar = (item) => {
        setFormulario({
            id: item.id || null,
            codigo: item.codigo || '',
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            estado: item.estado || 'ACTIVO',
        });
        setModalFormularioAbierto(true);
    };

    const cerrarModalFormulario = () => {
        if (guardando) return;
        setModalFormularioAbierto(false);
    };

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormulario((prev) => ({ ...prev, [name]: value }));
    };

    const guardarFacultad = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await facultadService.actualizar(formulario.id, formulario);
                mostrarFeedback('success', `Facultad "${formulario.nombre}" actualizada correctamente.`);
            } else {
                await facultadService.registrar(formulario);
                mostrarFeedback('success', `Facultad "${formulario.nombre}" registrada correctamente.`);
            }
            setModalFormularioAbierto(false);
            await cargarFacultades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoFacultad = async () => {
        if (!facultadACambiarEstado) return;
        setGuardando(true);
        const nuevoEstado = facultadACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const targetKey = facultadACambiarEstado.id || facultadACambiarEstado.codigo;

        try {
            await facultadService.actualizar(targetKey, { ...facultadACambiarEstado, estado: nuevoEstado });
            mostrarFeedback('success', `La facultad "${facultadACambiarEstado.nombre}" cambió a ${nuevoEstado}.`);
            setFacultadACambiarEstado(null);
            await cargarFacultades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarFacultad = async () => {
        if (!facultadAEliminar) return;
        setEliminando(true);
        const targetKey = facultadAEliminar.id || facultadAEliminar.codigo;

        try {
            await facultadService.eliminar(targetKey);
            mostrarFeedback('success', `Facultad "${facultadAEliminar.nombre}" eliminada correctamente.`);
            setFacultadAEliminar(null);
            await cargarFacultades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    // Paginación y Filtrado Local
    const facultadesFiltradas = facultades.filter((f) => {
        if (!busquedaAplicada.trim()) return true;
        const term = busquedaAplicada.toLowerCase();
        return (
            (f.codigo && f.codigo.toLowerCase().includes(term)) ||
            (f.nombre && f.nombre.toLowerCase().includes(term)) ||
            (f.descripcion && f.descripcion.toLowerCase().includes(term))
        );
    });

    const totalPaginas = Math.ceil(facultadesFiltradas.length / filasPorPagina);
    const facultadesPaginadas = facultadesFiltradas.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Gestión - Facultades
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <Building2 size={16} /> <span>Configura las facultades que agrupan las especialidades y carreras.</span>
                    </p>
                </div>
                <button onClick={abrirModalNuevo} className="btn btn-premium-dark px-4 py-2 d-flex align-items-center gap-2">
                    <Plus size={18} /> <span>Nueva Facultad</span>
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
                        <div className="premium-input-group h-100 d-flex flex-column justify-content-end">
                            <label className="filter-label"><Search size={14} /> Buscar Facultad</label>
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Buscar por código, nombre o descripción..."
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
                        <div className="spinner-border text-teal-600" role="status" style={{ color: 'var(--teal-600)' }}></div>
                    </div>
                ) : facultadesPaginadas.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <Building2 size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No hay facultades registradas</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            Ajuste los criterios de búsqueda o cree una nueva facultad presionando "Nueva Facultad".
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table premium-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4" style={{ width: '15%' }}>Código</th>
                                        <th style={{ width: '30%' }}>Nombre Facultad</th>
                                        <th style={{ width: '30%' }}>Descripción</th>
                                        <th className="text-center" style={{ width: '10%' }}>Estado</th>
                                        <th className="text-end pe-4" style={{ width: '15%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facultadesPaginadas.map((row) => (
                                        <tr key={row.id || row.codigo}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
                                                    {row.codigo}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                                                    {row.nombre}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                    {row.descripcion || '—'}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-2 py-1 rounded-pill ${row.estado === 'ACTIVO' ? 'badge-soft-success' : 'badge-soft-danger'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                    {row.estado}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2 align-items-center">
                                                    <button 
                                                        className={`btn btn-sm d-flex align-items-center gap-1 ${row.estado === 'ACTIVO' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                        onClick={() => setFacultadACambiarEstado(row)}
                                                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' }}
                                                    >
                                                        {row.estado === 'ACTIVO' ? <><XCircle size={14}/> Desactivar</> : <><CheckCircle2 size={14}/> Activar</>}
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-light border shadow-sm text-warning"
                                                        onClick={() => abrirModalEditar(row)}
                                                        title="Editar"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-light border shadow-sm text-danger"
                                                        onClick={() => setFacultadAEliminar(row)}
                                                        title="Eliminar"
                                                        style={{ borderRadius: '6px' }}
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
                        {facultadesFiltradas.length > 0 && (
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50 gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small fw-medium">Filas por página:</span>
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
                                    Mostrando {pagina * filasPorPagina + 1} a {Math.min((pagina + 1) * filasPorPagina, facultadesFiltradas.length)} de {facultadesFiltradas.length} registros
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

            {/* MODAL CREAR / EDITAR FACULTAD */}
            {modalFormularioAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content premium-modal">
                                
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <Building2 size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {formulario.id ? 'Editar Facultad' : 'Nueva Facultad'}
                                            </h5>
                                            <small className="text-white-50">Datos identificativos de la facultad</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModalFormulario}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-facultad" onSubmit={guardarFacultad}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Código de Facultad <span className="text-danger ms-1">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control text-uppercase" 
                                                        name="codigo"
                                                        placeholder="Ej. FAC-EDU" 
                                                        value={formulario.codigo} 
                                                        onChange={(e) => actualizarCampo({ target: { name: 'codigo', value: e.target.value.toUpperCase() } })}
                                                        disabled={Boolean(formulario.id)}
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Estado Operativo <span className="text-danger ms-1">*</span></label>
                                                    <select className="form-select" name="estado" value={formulario.estado} onChange={actualizarCampo} required>
                                                        <option value="ACTIVO">ACTIVO</option>
                                                        <option value="INACTIVO">INACTIVO</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre de la Facultad <span className="text-danger ms-1">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="nombre"
                                                        placeholder="Ej. Facultad de Educación y Humanidades" 
                                                        value={formulario.nombre} 
                                                        onChange={actualizarCampo} 
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Descripción</label>
                                                    <textarea 
                                                        className="form-control" 
                                                        name="descripcion"
                                                        rows="3"
                                                        placeholder="Descripción opcional..." 
                                                        value={formulario.descripcion} 
                                                        onChange={actualizarCampo} 
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light fw-medium px-4" onClick={cerrarModalFormulario} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" form="form-facultad" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
                                        {guardando ? 'Guardando...' : 'Guardar Facultad'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* MODAL CONFIRMACIÓN CAMBIO DE ESTADO */}
            {facultadACambiarEstado && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-warning">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <AlertTriangle size={32} className="text-warning" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Cambiar Estado?</h5>
                                    <p className="text-muted small mb-0">
                                        La facultad <strong>{facultadACambiarEstado.nombre}</strong> pasará a estar{' '}
                                        <strong>{facultadACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}</strong>.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setFacultadACambiarEstado(null)} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-link text-primary fw-bold text-decoration-none w-50 py-3 m-0 rounded-0" onClick={cambiarEstadoFacultad} disabled={guardando}>
                                        {guardando ? 'Procesando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* MODAL CONFIRMACIÓN ELIMINACIÓN */}
            {facultadAEliminar && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-danger">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <Trash2 size={32} className="text-danger" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Eliminar Facultad?</h5>
                                    <p className="text-muted small mb-0">
                                        Se eliminará <strong className="text-dark">{facultadAEliminar.nombre} ({facultadAEliminar.codigo})</strong>. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setFacultadAEliminar(null)} disabled={eliminando}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-link text-danger fw-bold text-decoration-none w-50 py-3 m-0 rounded-0" onClick={eliminarFacultad} disabled={eliminando}>
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