import React, { useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, Plus, Edit3, Trash2, Layers, AlertTriangle, X, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { modalidadService } from '../../services/modalidadService';

const FORMULARIO_VACIO = {
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

export default function GestionModalidades() {
    const [modalidades, setModalidades] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [busquedaAplicada, setBusquedaAplicada] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [modalidadAEliminar, setModalidadAEliminar] = useState(null);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarModalidades = async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const resp = await modalidadService.listar();
            setModalidades(extraerArreglo(resp));
        } catch (error) {
            setModalidades([]);
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarModalidades();
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

    const abrirModalEditar = (mod) => {
        setModoEdicion(true);
        setFormulario({
            codigo: mod.codigo || '',
            nombre: mod.nombre || '',
            descripcion: mod.descripcion || '',
            estado: mod.estado || 'ACTIVO',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
    };

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const guardarModalidad = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (modoEdicion) {
                await modalidadService.actualizar(formulario.codigo, formulario);
                mostrarFeedback('success', `Modalidad "${formulario.nombre}" actualizada correctamente.`);
            } else {
                await modalidadService.registrar(formulario);
                mostrarFeedback('success', `Modalidad "${formulario.nombre}" registrada correctamente.`);
            }
            setModalAbierto(false);
            await cargarModalidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!modalidadAEliminar) return;
        setEliminando(true);

        try {
            await modalidadService.eliminar(modalidadAEliminar.codigo);
            mostrarFeedback('success', `Modalidad "${modalidadAEliminar.nombre}" eliminada correctamente.`);
            setModalidadAEliminar(null);
            await cargarModalidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    const modalidadesFiltradas = modalidades.filter((mod) => {
        const cumpleBusqueda = !busquedaAplicada.trim() || 
            (mod.codigo && mod.codigo.toLowerCase().includes(busquedaAplicada.toLowerCase())) ||
            (mod.nombre && mod.nombre.toLowerCase().includes(busquedaAplicada.toLowerCase()));
        
        const cumpleEstado = !estadoFiltro || mod.estado === estadoFiltro;

        return cumpleBusqueda && cumpleEstado;
    });

    const totalPaginas = Math.ceil(modalidadesFiltradas.length / filasPorPagina);
    const modalidadesPaginadas = modalidadesFiltradas.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Gestión de Modalidades
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <Layers size={16} /> <span>Administra las modalidades de estudio e instrucción institucional.</span>
                    </p>
                </div>
                <button type="button" className="btn btn-premium-accent d-flex align-items-center justify-content-center gap-2 px-4 py-2" onClick={abrirModalNuevo}>
                    <Plus size={18} /> Nueva Modalidad
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
                    
                    <div className="col-12 col-md-5">
                        <div className="premium-input-group">
                            <label className="filter-label"><Search size={14} /> Buscar Modalidad</label>
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Buscar por código o nombre..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && setBusquedaAplicada(busqueda)}
                                />
                                <Search size={16} className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="premium-input-group">
                            <label className="filter-label"><Filter size={14} /> Filtrar por Estado</label>
                            <select className="form-select" value={estadoFiltro} onChange={(e) => { setEstadoFiltro(e.target.value); setPagina(0); }}>
                                <option value="">Todos los estados</option>
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-3 d-flex gap-2">
                        <button 
                            type="button" 
                            className="btn btn-premium-accent d-flex align-items-center justify-content-center gap-2 w-100 py-2"
                            onClick={() => {
                                setBusquedaAplicada(busqueda);
                                setPagina(0);
                            }}
                        >
                            <Filter size={16} /> Filtrar
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-light border d-flex align-items-center justify-content-center px-3 py-2"
                            title="Limpiar filtros"
                            onClick={() => {
                                setBusqueda('');
                                setBusquedaAplicada('');
                                setEstadoFiltro('');
                                setPagina(0);
                            }}
                        >
                            <RefreshCcw size={16} />
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
                ) : modalidadesPaginadas.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <Layers size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No se encontraron modalidades</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            No hay registros que coincidan con los filtros de búsqueda aplicados.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table premium-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Código</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th className="text-center">Estado</th>
                                        <th className="text-end pe-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalidadesPaginadas.map((mod) => (
                                        <tr key={mod.codigo || mod.id}>
                                            <td className="ps-4 fw-bold text-primary">{mod.codigo}</td>
                                            <td>
                                                <div className="fw-semibold text-dark">{mod.nombre}</div>
                                            </td>
                                            <td>
                                                <span className="text-muted small">{mod.descripcion || 'Sin descripción'}</span>
                                            </td>
                                            <td className="text-center">
                                                <span 
                                                    className="badge px-3 py-1 rounded-pill" 
                                                    style={{ 
                                                        fontSize: '0.75rem', 
                                                        letterSpacing: '0.5px', 
                                                        fontWeight: 700,
                                                        backgroundColor: mod.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                        color: mod.estado === 'ACTIVO' ? '#166534' : '#991b1b'
                                                    }}
                                                >
                                                    {mod.estado}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-light border text-primary" 
                                                        title="Editar modalidad"
                                                        onClick={() => abrirModalEditar(mod)}
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-light border text-danger" 
                                                        title="Eliminar modalidad"
                                                        onClick={() => setModalidadAEliminar(mod)}
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
                        {modalidadesFiltradas.length > 0 && (
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
                                    Mostrando {pagina * filasPorPagina + 1} a {Math.min((pagina + 1) * filasPorPagina, modalidadesFiltradas.length)} de {modalidadesFiltradas.length} registros
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
                                            <Layers size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {modoEdicion ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                            </h5>
                                            <small className="text-white-50">Configuración de régimen académico</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-modalidad" onSubmit={guardarModalidad}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Código <span className="text-danger ms-1">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control text-uppercase" 
                                                        name="codigo"
                                                        placeholder="Ej. PRES" 
                                                        value={formulario.codigo} 
                                                        onChange={actualizarCampo} 
                                                        disabled={modoEdicion}
                                                        required 
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Estado <span className="text-danger ms-1">*</span></label>
                                                    <select className="form-select" name="estado" value={formulario.estado} onChange={actualizarCampo} required>
                                                        <option value="ACTIVO">ACTIVO</option>
                                                        <option value="INACTIVO">INACTIVO</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre <span className="text-danger ms-1">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="nombre"
                                                        placeholder="Ej. Presencial" 
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
                                                        placeholder="Detalles sobre esta modalidad..." 
                                                        value={formulario.descripcion} 
                                                        onChange={actualizarCampo} 
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light fw-medium px-4" onClick={cerrarModal} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" form="form-modalidad" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
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
            {modalidadAEliminar && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-danger">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <AlertTriangle size={32} className="text-danger" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Eliminar Modalidad?</h5>
                                    <p className="text-muted small mb-0">
                                        Se eliminará permanentemente la modalidad <strong className="text-dark">{modalidadAEliminar.nombre}</strong>. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setModalidadAEliminar(null)} disabled={eliminando}>
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