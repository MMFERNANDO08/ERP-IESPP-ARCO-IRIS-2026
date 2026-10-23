import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, Plus, Trash2, Pencil, BookOpen, AlertTriangle, X, GraduationCap, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { especialidadService } from '../../services/especialidadService';
import { facultadService } from '../../services/facultadService';

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    facultad_id: '',
    estado: 'ACTIVO',
};

function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
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
        --danger-500: #ef4444;
        --danger-600: #dc2626;
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
        letter-spacing: 0.3px;
        transition: all 0.2s;
    }
    .btn-premium-dark:hover {
        background-color: var(--slate-800);
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
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
        letter-spacing: 0.5px;
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
    .premium-modal .modal-footer {
        background-color: var(--slate-50);
        border-top: 1px solid var(--slate-200);
        padding: 1.25rem 1.5rem;
        border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    }
`;

export default function Especialidades() {
    const [especialidades, setEspecialidades] = useState([]);
    const [listaFacultades, setListaFacultades] = useState([]);
    
    // Estados de búsqueda, filtro y paginación
    const [busqueda, setBusqueda] = useState('');
    const [soloActivos, setSoloActivos] = useState('0'); // '0' = Todas, '1' = Solo activas
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina] = useState(10);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);

    // Estados de carga
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    // Estados modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [codigoEdicion, setCodigoEdicion] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [especialidadAEliminar, setEspecialidadAEliminar] = useState(null);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const cargarDatosBasicos = useCallback(async () => {
        try {
            const respFacultades = await facultadService.listar();
            const facultadesData = Array.isArray(respFacultades) ? respFacultades : (respFacultades?.data || []);
            setListaFacultades(facultadesData.filter(f => f.estado === 'ACTIVO'));
        } catch (error) {
            console.error("Error al cargar facultades", error);
        }
    }, []);

    const cargarEspecialidades = useCallback(async (e) => {
        if(e) e.preventDefault();
        setCargando(true);
        setBusquedaRealizada(true);
        try {
            const params = {};
            if (busqueda.trim()) params.buscar = busqueda.trim();
            if (soloActivos === '1') params.solo_activos = 1;

            const respuesta = await especialidadService.listar(params);
            const resultado = Array.isArray(respuesta) ? respuesta : (respuesta?.data || []);
            setEspecialidades(resultado);
            setPagina(0);
        } catch (error) {
            setEspecialidades([]);
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos]);

    useEffect(() => {
        cargarDatosBasicos();
        cargarEspecialidades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirNuevaEspecialidad = () => {
        setCodigoEdicion(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirEdicionPorCodigo = async (codigo) => {
        try {
            const encontrada = await especialidadService.obtener(codigo);
            setCodigoEdicion(encontrada.codigo);
            setFormulario({
                codigo: encontrada.codigo || '',
                nombre: encontrada.nombre || '',
                facultad_id: encontrada.facultad_id || encontrada.facultad?.id || '',
                estado: encontrada.estado || 'ACTIVO',
            });
            setModalAbierto(true);
        } catch (error) {
            const local = especialidades.find((item) => item.codigo === codigo);
            if (local) {
                setCodigoEdicion(local.codigo);
                setFormulario({
                    codigo: local.codigo,
                    nombre: local.nombre,
                    facultad_id: local.facultad_id || local.facultad?.id || '',
                    estado: local.estado || 'ACTIVO',
                });
                setModalAbierto(true);
            } else {
                mostrarFeedback('error', obtenerErrores(error));
            }
        }
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setCodigoEdicion(null);
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setSoloActivos('0');
        setBusquedaRealizada(false);
        cargarEspecialidades();
    };

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        const valFinal = name === 'codigo' ? value.toUpperCase() : value;
        setFormulario((prev) => ({ ...prev, [name]: valFinal }));
    };

    const guardarEspecialidad = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const datos = {
            codigo: formulario.codigo.trim().toUpperCase(),
            nombre: formulario.nombre.trim(),
            facultad_id: formulario.facultad_id,
            estado: formulario.estado,
        };

        try {
            if (codigoEdicion !== null) {
                await especialidadService.actualizar(codigoEdicion, datos);
                mostrarFeedback('success', `Especialidad "${codigoEdicion}" actualizada correctamente.`);
            } else {
                await especialidadService.registrar(datos);
                mostrarFeedback('success', 'Especialidad registrada correctamente.');
            }
            cerrarModal();
            await cargarEspecialidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!especialidadAEliminar) return;
        setEliminando(true);

        try {
            await especialidadService.eliminar(especialidadAEliminar.codigo);
            mostrarFeedback('success', `Especialidad eliminada correctamente.`);
            setEspecialidadAEliminar(null);
            await cargarEspecialidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    const totalPaginas = Math.ceil(especialidades.length / filasPorPagina);
    const especialidadesPaginadas = especialidades.slice(
        pagina * filasPorPagina,
        pagina * filasPorPagina + filasPorPagina
    );

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Catálogo de Especialidades
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <BookOpen size={16} /> <span>Gestión oficial de carreras, asignación de facultades y estado académico.</span>
                    </p>
                </div>
                <button onClick={abrirNuevaEspecialidad} className="btn btn-premium-dark px-4 py-2 d-flex align-items-center gap-2">
                    <Plus size={18} /> <span>Nueva Especialidad</span>
                </button>
            </div>

            {feedback && (
                <div className={`alert alert-${feedback.tipo === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center`} role="alert">
                    <span className="fw-semibold">{feedback.mensaje}</span>
                </div>
            )}

            {/* Panel de Filtros Ultra Moderno */}
            <div className="premium-card p-4 mb-4">
                <form onSubmit={cargarEspecialidades}>
                    <div className="row g-4 align-items-end">
                        
                        <div className="col-12 col-md-6">
                            <div className="premium-input-group h-100 d-flex flex-column justify-content-end">
                                <label className="filter-label"><Search size={14} /> Buscar Especialidad</label>
                                <div className="position-relative">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="Buscar por código (ej. EF) o nombre..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                    <Search size={16} className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-3">
                            <div className="premium-input-group">
                                <label className="filter-label">Estado Operativo</label>
                                <select className="form-select" value={soloActivos} onChange={(e) => setSoloActivos(e.target.value)}>
                                    <option value="0">Todas las Especialidades</option>
                                    <option value="1">Solo Especialidades Activas</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-12 col-md-3 d-flex gap-2">
                            <button type="button" className="btn btn-light border text-muted fw-medium d-flex align-items-center justify-content-center gap-2 w-100" onClick={limpiarFiltros} title="Limpiar">
                                <RefreshCcw size={16} /> 
                            </button>
                            <button type="submit" className="btn btn-premium-accent d-flex align-items-center justify-content-center gap-2 w-100">
                                <Filter size={16} /> Buscar
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Tabla Principal */}
            <div className="premium-card overflow-hidden">
                {!busquedaRealizada && especialidades.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <GraduationCap size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>Catálogo Vacío</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            Aún no hay especialidades registradas. Haga clic en "Nueva Especialidad" para comenzar.
                        </p>
                    </div>
                ) : cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : especialidades.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: '80px', height: '80px' }}>
                            <Search size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No hay resultados</h5>
                        <p className="text-muted mb-0">No se encontraron especialidades que coincidan con los filtros aplicados.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table premium-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4" style={{ width: '15%' }}>Código</th>
                                        <th style={{ width: '35%' }}>Nombre de la Especialidad</th>
                                        <th style={{ width: '25%' }}>Facultad</th>
                                        <th className="text-center" style={{ width: '10%' }}>Estado</th>
                                        <th className="text-end pe-4" style={{ width: '15%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {especialidadesPaginadas.map((item) => (
                                        <tr key={item.codigo}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-primary mb-0" style={{ fontSize: '0.95rem' }}>
                                                    {item.codigo}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                                                    {item.nombre}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <Building2 size={16} /> 
                                                    {item.facultad?.nombre || 'Sin Asignar'}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-2 py-1 rounded-pill ${item.estado === 'ACTIVO' ? 'badge-soft-success' : 'badge-soft-danger'}`} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button 
                                                        className="btn btn-sm btn-light border text-primary shadow-sm"
                                                        onClick={() => abrirEdicionPorCodigo(item.codigo)}
                                                        title="Editar Especialidad"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-light border text-danger shadow-sm"
                                                        onClick={() => setEspecialidadAEliminar(item)}
                                                        title="Eliminar Especialidad"
                                                        style={{ borderRadius: '6px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {especialidades.length > filasPorPagina && (
                            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50">
                                <span className="text-muted small fw-medium">
                                    Mostrando {pagina * filasPorPagina + 1} a {Math.min((pagina + 1) * filasPorPagina, especialidades.length)} de {especialidades.length} registros
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

            {/* Modal Crear / Editar */}
            {modalAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content premium-modal">
                                
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <BookOpen size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {codigoEdicion ? `Actualizar Especialidad` : 'Nueva Especialidad'}
                                            </h5>
                                            <small className="text-white-50">Datos oficiales académicos</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-especialidad" onSubmit={guardarEspecialidad}>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <h6 className="fw-bold mb-2 text-primary border-bottom pb-2">
                                                    1. Información de la Especialidad
                                                </h6>
                                            </div>

                                            <div className="col-md-5">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Código *</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control text-uppercase" 
                                                        name="codigo"
                                                        placeholder="Ej. EF" 
                                                        value={formulario.codigo} 
                                                        onChange={actualizarCampo} 
                                                        disabled={codigoEdicion !== null}
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-7">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Estado Operativo *</label>
                                                    <select className="form-select" name="estado" value={formulario.estado} onChange={actualizarCampo} required>
                                                        <option value="ACTIVO">ACTIVO</option>
                                                        <option value="INACTIVO">INACTIVO</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Nombre de la Especialidad *</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="nombre"
                                                        placeholder="Ej. EDUCACIÓN FÍSICA" 
                                                        value={formulario.nombre} 
                                                        onChange={actualizarCampo} 
                                                        required 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-12 mt-4">
                                                <h6 className="fw-bold mb-2 text-primary border-bottom pb-2">
                                                    2. Asignación de Facultad
                                                </h6>
                                            </div>

                                            <div className="col-12">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Facultad Correspondiente *</label>
                                                    <select className="form-select" name="facultad_id" value={formulario.facultad_id} onChange={actualizarCampo} required>
                                                        <option value="" disabled>Seleccione una facultad...</option>
                                                        {listaFacultades.map(facultad => (
                                                            <option key={facultad.id} value={facultad.id}>
                                                                {facultad.nombre} ({facultad.codigo})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-light fw-medium px-4" onClick={cerrarModal} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" form="form-especialidad" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
                                        {guardando ? 'Guardando...' : codigoEdicion ? 'Guardar Cambios' : 'Registrar Especialidad'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* Modal Confirmar Eliminación */}
            {especialidadAEliminar && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-danger">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <AlertTriangle size={32} className="text-danger" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Eliminar Especialidad?</h5>
                                    <p className="text-muted small mb-0">
                                        Estás a punto de eliminar <strong>{especialidadAEliminar.nombre} ({especialidadAEliminar.codigo})</strong>. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setEspecialidadAEliminar(null)} disabled={eliminando}>
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