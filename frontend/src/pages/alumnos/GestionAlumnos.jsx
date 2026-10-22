import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, DownloadCloud, Users, Hash, Mail, Phone, Pencil, UserCircle, BookOpen, CalendarClock } from 'lucide-react';
import { alumnoService } from '../../services/alumnoService';
import { modalidadService } from '../../services/modalidadService';
import { especialidadService } from '../../services/especialidadService';

const FORMULARIO_VACIO = {
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    sexo: '',
    fecha_nacimiento: '',
    codigo_estudiante: '',
    celular: '',
    correo_institucional: '',
    correo_personal: '',
    modalidad: '', 
    especialidad: '', // Se actualizará dinámicamente
    periodo_ingreso: '2026-II',
};

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

    .badge-soft-sky {
        background-color: rgba(14, 165, 233, 0.1);
        color: var(--sky-600);
        border: 1px solid rgba(14, 165, 233, 0.2);
    }
    .badge-soft-slate {
        background-color: var(--slate-100);
        color: var(--slate-600);
        border: 1px solid var(--slate-200);
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

export default function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [listaModalidades, setListaModalidades] = useState([]);
    const [listaEspecialidades, setListaEspecialidades] = useState([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Filtros
    const [codigoBusqueda, setCodigoBusqueda] = useState('');
    const [filtroModalidad, setFiltroModalidad] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const cargarDatosBase = async () => {
            try {
                const [modResp, espResp] = await Promise.all([
                    modalidadService.listar({ solo_activos: 1 }),
                    especialidadService.listar({ solo_activos: 1 })
                ]);
                setListaModalidades(extraerArreglo(modResp));
                setListaEspecialidades(extraerArreglo(espResp));
            } catch (error) {
                console.error("Error al cargar datos base:", error);
            }
        };
        cargarDatosBase();

        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const ejecutarBusqueda = useCallback(async (e) => {
        if(e) e.preventDefault();
        setCargando(true);
        setBusquedaRealizada(true);
        try {
            const resp = await alumnoService.listar({
                buscar: codigoBusqueda.trim(),
                modalidad: filtroModalidad,
                periodo: filtroPeriodo,
                especialidad: filtroEspecialidad
            });
            setAlumnos(extraerArreglo(resp));
        } catch (error) {
            setAlumnos([]);
            mostrarFeedback('error', 'Error al cargar los registros.');
        } finally {
            setCargando(false);
        }
    }, [codigoBusqueda, filtroModalidad, filtroPeriodo, filtroEspecialidad]);

    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModal = (alumno = null) => {
        if (alumno) {
            setAlumnoSeleccionado(alumno);
            setFormulario({
                ...FORMULARIO_VACIO,
                ...alumno,
                fecha_nacimiento: alumno.fecha_nacimiento ? String(alumno.fecha_nacimiento).slice(0, 10) : '',
            });
        } else {
            setAlumnoSeleccionado(null);
            setFormulario({ ...FORMULARIO_VACIO });
        }
        setModalAbierto(true);
    };

    const limpiarFiltros = () => {
        setCodigoBusqueda('');
        setFiltroModalidad('');
        setFiltroPeriodo('');
        setFiltroEspecialidad('');
        setAlumnos([]);
        setBusquedaRealizada(false);
    };

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const guardarAlumno = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            if (alumnoSeleccionado) {
                await alumnoService.actualizar(alumnoSeleccionado.id, formulario);
                mostrarFeedback('success', 'Ficha actualizada exitosamente.');
            } else {
                await alumnoService.registrar(formulario);
                mostrarFeedback('success', 'Estudiante registrado.');
            }
            setModalAbierto(false);
            if (busquedaRealizada) await ejecutarBusqueda();
        } catch (error) {
            mostrarFeedback('danger', 'Error al procesar los datos.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Directorio Estudiantil
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <BookOpen size={16} /> <span>Gestión académica y expedientes institucionales</span>
                    </p>
                </div>
                <button onClick={() => abrirModal()} className="btn btn-premium-dark px-4 py-2 d-flex align-items-center gap-2">
                    <UserCircle size={18} /> <span>Nuevo Registro</span>
                </button>
            </div>

            {feedback && (
                <div className={`alert alert-${feedback.tipo === 'error' ? 'danger' : 'success'} border-0 shadow-sm rounded-3 py-3 d-flex align-items-center`} role="alert">
                    <span className="fw-semibold">{feedback.mensaje}</span>
                </div>
            )}

            <div className="premium-card p-4 mb-4">
                <form onSubmit={ejecutarBusqueda}>
                    <div className="row g-4">
                        
                        <div className="col-12 col-xl-4">
                            <div className="premium-input-group h-100 d-flex flex-column justify-content-end">
                                <label className="filter-label"><Search size={14} /> Búsqueda Rápida</label>
                                <div className="position-relative">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="DNI, Código o Nombres..."
                                        value={codigoBusqueda}
                                        onChange={(e) => setCodigoBusqueda(e.target.value)}
                                    />
                                    <Search size={16} className="position-absolute text-muted" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-xl-8">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="premium-input-group">
                                        <label className="filter-label">Especialidad</label>
                                        <select className="form-select" value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                                            <option value="">Todas</option>
                                            {listaEspecialidades.map(esp => (
                                                <option key={esp.codigo} value={esp.codigo}>
                                                    {esp.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="premium-input-group">
                                        <label className="filter-label">Modalidad</label>
                                        <select className="form-select" value={filtroModalidad} onChange={(e) => setFiltroModalidad(e.target.value)}>
                                            <option value="">Todas</option>
                                            {listaModalidades.map(mod => (
                                                <option key={mod.codigo} value={mod.codigo}>
                                                    {mod.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="premium-input-group">
                                        <label className="filter-label"><CalendarClock size={14}/> Periodo</label>
                                        <select className="form-select" value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                                            <option value="">Todos</option>
                                            <option value="2026-II">2026-II</option>
                                            <option value="2026-I">2026-I</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 border-top pt-3 mt-4 d-flex justify-content-between align-items-center">
                            <button type="button" className="btn text-muted fw-medium d-flex align-items-center gap-2 px-0" onClick={limpiarFiltros}>
                                <RefreshCcw size={16} /> Restablecer filtros
                            </button>
                            <div className="d-flex gap-3">
                                <button type="button" className="btn btn-light border text-dark fw-medium d-flex align-items-center gap-2">
                                    <DownloadCloud size={16} /> Exportar
                                </button>
                                <button type="submit" className="btn btn-premium-accent px-4 d-flex align-items-center gap-2">
                                    <Filter size={16} /> Filtrar Resultados
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="premium-card overflow-hidden">
                {!busquedaRealizada ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <Search size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>Listo para buscar</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            Ingrese un código, nombre o aplique los filtros superiores para explorar el directorio de estudiantes.
                        </p>
                    </div>
                ) : cargando ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : alumnos.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: '80px', height: '80px' }}>
                            <Users size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No hay resultados</h5>
                        <p className="text-muted mb-0">No se encontraron estudiantes que coincidan con los filtros aplicados.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table premium-table">
                            <thead>
                                <tr>
                                    <th className="ps-4">Identidad del Estudiante</th>
                                    <th>Especialidad</th>
                                    <th>Periodo / Mod.</th>
                                    <th>Información de Contacto</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumnos.map((alumno) => (
                                    <tr key={alumno.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" 
                                                     style={{ width: '42px', height: '42px', backgroundColor: 'var(--sky-500)', fontSize: '1rem' }}>
                                                    {alumno.nombres.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{`${alumno.apellido_paterno} ${alumno.apellido_materno || ''}`}</div>
                                                    <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.85rem' }}>
                                                        <span>{alumno.nombres}</span> • <span className="fw-medium text-primary">{alumno.codigo_estudiante}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                                                {alumno.especialidad?.nombre || alumno.especialidad || 'Sin Especialidad'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1 align-items-start">
                                                <span className="badge badge-soft-sky px-2 py-1 rounded-pill">{alumno.periodo_ingreso || '2026-II'}</span>
                                                <span className="badge badge-soft-slate px-2 py-1 rounded-pill">{alumno.modalidad || 'REGULAR'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                                <div className="d-flex align-items-center gap-2"><Mail size={14} /> {alumno.correo_institucional || alumno.correo_personal || 'Sin correo'}</div>
                                                <div className="d-flex align-items-center gap-2"><Phone size={14} /> {alumno.celular || 'Sin teléfono'}</div>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn btn-sm btn-light border text-muted shadow-sm hover-primary"
                                                onClick={() => abrirModal(alumno)}
                                                title="Editar Ficha"
                                                style={{ borderRadius: '6px' }}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content premium-modal">
                                
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <UserCircle size={26} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {alumnoSeleccionado ? 'Expediente del Estudiante' : 'Nuevo Expediente Estudiantil'}
                                            </h5>
                                            <small className="text-white-50">Gestión de datos de identidad e institucionales</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setModalAbierto(false)}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-alumno-premium" onSubmit={guardarAlumno}>
                                        
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary border-bottom pb-2">
                                            <UserCircle size={18} /> 1. Datos Personales
                                        </h6>
                                        
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4">
                                                <label className="form-label text-muted small fw-bold">Tipo Doc.</label>
                                                <select className="form-select bg-light border-0" name="tipo_documento" value={formulario.tipo_documento} onChange={actualizarCampo} required>
                                                    <option value="DNI">DNI</option>
                                                    <option value="Carné de Extranjería">C. Extranjería</option>
                                                </select>
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label text-muted small fw-bold">Número Documento</label>
                                                <input type="text" className="form-control bg-light border-0" name="numero_documento" value={formulario.numero_documento} onChange={actualizarCampo} required />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label text-muted small fw-bold">Nombres Completos</label>
                                                <input type="text" className="form-control bg-light border-0" name="nombres" value={formulario.nombres} onChange={actualizarCampo} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-bold">Apellido Paterno</label>
                                                <input type="text" className="form-control bg-light border-0" name="apellido_paterno" value={formulario.apellido_paterno} onChange={actualizarCampo} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-bold">Apellido Materno</label>
                                                <input type="text" className="form-control bg-light border-0" name="apellido_materno" value={formulario.apellido_materno} onChange={actualizarCampo} />
                                            </div>
                                        </div>

                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary border-bottom pb-2 mt-4">
                                            <BookOpen size={18} /> 2. Datos Institucionales
                                        </h6>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label text-muted small fw-bold">Código Estudiante</label>
                                                <input type="text" className="form-control border-primary bg-light fw-bold" name="codigo_estudiante" value={formulario.codigo_estudiante} onChange={actualizarCampo} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label text-muted small fw-bold">Especialidad</label>
                                                <select className="form-select bg-light border-0" name="especialidad" value={formulario.especialidad} onChange={actualizarCampo} required>
                                                    <option value="">Seleccionar...</option>
                                                    {listaEspecialidades.map(esp => (
                                                        <option key={esp.codigo} value={esp.codigo}>
                                                            {esp.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label text-muted small fw-bold">Modalidad</label>
                                                <select className="form-select bg-light border-0" name="modalidad" value={formulario.modalidad} onChange={actualizarCampo} required>
                                                    <option value="">Seleccionar...</option>
                                                    {listaModalidades.map(mod => (
                                                        <option key={mod.codigo} value={mod.codigo}>
                                                            {mod.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-bold">Celular de Contacto</label>
                                                <input type="text" className="form-control bg-light border-0" name="celular" value={formulario.celular} onChange={actualizarCampo} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-bold">Correo Institucional</label>
                                                <input type="email" className="form-control bg-light border-0" name="correo_institucional" value={formulario.correo_institucional} onChange={actualizarCampo} />
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="modal-footer d-flex justify-content-between">
                                    <span className="text-muted small">Campos obligatorios marcados internamente</span>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-light fw-medium px-4" onClick={() => setModalAbierto(false)} disabled={guardando}>
                                            Cancelar
                                        </button>
                                        <button type="submit" form="form-alumno-premium" className="btn btn-premium-accent fw-medium px-5" disabled={guardando}>
                                            {guardando ? 'Guardando...' : 'Guardar Expediente'}
                                        </button>
                                    </div>
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