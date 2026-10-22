<<<<<<< HEAD
import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCcw, Filter, Plus, Trash2, Pencil, Globe, AlertTriangle, X, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { modalidadService } from '../../services/modalidadService';
=======
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Grid, Chip, Tooltip, 
    Alert, InputAdornment, FormControlLabel, Checkbox, CircularProgress
} from '@mui/material';
import { Plus, Search, RefreshCw, Pencil, Trash2, X, Check, Globe } from 'lucide-react';
import axios from 'axios';

// Definimos colores basados en tu imagen
const COLORS = {
    primary: '#2563eb', // Azul del botón "Nueva Modalidad"
    primaryHover: '#1d4ed8',
    bgIcon: '#eff6ff',  // Fondo celeste del ícono de globo
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    tableHead: '#f9fafb',
};
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: 'REGULAR',
    descripcion: 'Programa ofertado por el Instituto Arco Iris',
    estado: 'ACTIVO',
};

<<<<<<< HEAD
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

export default function GestionModalidades() {
    const [busqueda, setBusqueda] = useState('');
    const [busquedaAplicada, setBusquedaAplicada] = useState('');
    const [modalidades, setModalidades] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
=======
export default function Modalidades() {
    const [modalidades, setModalidades] = useState([]);
    const [cargando, setCargando] = useState(false);
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
    const [feedback, setFeedback] = useState(null);
    
    // Estados para búsqueda y filtros
    const [busqueda, setBusqueda] = useState('');
    const [soloActivas, setSoloActivas] = useState(false);

<<<<<<< HEAD
    const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [modalidadACambiarEstado, setModalidadACambiarEstado] = useState(null);
=======
    // Estados del Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Estado para confirmar eliminación
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
    const [modalidadAEliminar, setModalidadAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

<<<<<<< HEAD
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = premiumStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

=======
    // Cargar datos con filtros
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
    const cargarModalidades = useCallback(async () => {
        setCargando(true);
        try {
<<<<<<< HEAD
            const resp = await modalidadService.listar();
            setModalidades(extraerArreglo(resp));
        } catch (error) {
            setModalidades([]);
            mostrarFeedback('error', obtenerErrores(error));
=======
            // Nota: Aquí podrías enviar los parámetros de búsqueda al backend si lo deseas
            // const res = await axios.get(`/api/plan-estudios/modalidades-crud?buscar=${busqueda}`);
            const res = await axios.get('/api/plan-estudios/modalidades-crud');
            setModalidades(res.data);
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'Error al cargar las modalidades.' });
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarModalidades();
    }, [cargarModalidades]);

<<<<<<< HEAD
    const mostrarFeedback = (tipo, mensaje) => {
        setFeedback({ tipo, message: mensaje });
        setTimeout(() => setFeedback(null), 4000);
    };

    const abrirModalNuevo = () => {
=======
    // Filtrado local (para que funcione la barra de búsqueda al instante)
    const modalidadesFiltradas = modalidades.filter(mod => {
        const coincideBusqueda = 
            mod.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            mod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (mod.descripcion && mod.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
        
        const coincideEstado = soloActivas ? mod.estado === 'ACTIVO' : true;

        return coincideBusqueda && coincideEstado;
    });

    const handleNuevo = () => {
        setEditandoId(null);
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
        setFormulario(FORMULARIO_VACIO);
        setModalFormularioAbierto(true);
    };

<<<<<<< HEAD
    const abrirModalEditar = (item) => {
        setFormulario({
            id: item.id || null,
            codigo: item.codigo || '',
            nombre: item.nombre || '',
            descripcion: item.descripcion || '',
            estado: item.estado || 'ACTIVO',
=======
    const handleEditar = (modalidad) => {
        setEditandoId(modalidad.id);
        setFormulario({
            codigo: modalidad.codigo,
            nombre: modalidad.nombre,
            descripcion: modalidad.descripcion || '',
            estado: modalidad.estado,
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
        });
        setModalFormularioAbierto(true);
    };

<<<<<<< HEAD
    const cerrarModalFormulario = () => {
        if (guardando) return;
        setModalFormularioAbierto(false);
    };

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormulario((prev) => ({ ...prev, [name]: value }));
    };

    const guardarModalidad = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await modalidadService.actualizar(formulario.id, formulario);
                mostrarFeedback('success', `Modalidad "${formulario.nombre}" actualizada correctamente.`);
            } else {
                await modalidadService.registrar(formulario);
                mostrarFeedback('success', `Modalidad "${formulario.nombre}" registrada correctamente.`);
            }
            setModalFormularioAbierto(false);
            await cargarModalidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoModalidad = async () => {
        if (!modalidadACambiarEstado) return;
        setGuardando(true);
        const nuevoEstado = modalidadACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const targetKey = modalidadACambiarEstado.id || modalidadACambiarEstado.codigo;

        try {
            await modalidadService.actualizar(targetKey, { ...modalidadACambiarEstado, estado: nuevoEstado });
            mostrarFeedback('success', `La modalidad "${modalidadACambiarEstado.nombre}" cambió a ${nuevoEstado}.`);
            setModalidadACambiarEstado(null);
            await cargarModalidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    const eliminarModalidad = async () => {
        if (!modalidadAEliminar) return;
        setEliminando(true);
        const targetKey = modalidadAEliminar.id || modalidadAEliminar.codigo;

        try {
            await modalidadService.eliminar(targetKey);
            mostrarFeedback('success', `Modalidad "${modalidadAEliminar.nombre}" eliminada correctamente.`);
            setModalidadAEliminar(null);
            await cargarModalidades();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    // Paginación y Filtrado Local
    const modalidadesFiltradas = modalidades.filter((m) => {
        if (!busquedaAplicada.trim()) return true;
        const term = busquedaAplicada.toLowerCase();
        return (
            (m.codigo && m.codigo.toLowerCase().includes(term)) ||
            (m.nombre && m.nombre.toLowerCase().includes(term)) ||
            (m.descripcion && m.descripcion.toLowerCase().includes(term))
        );
    });

    const totalPaginas = Math.ceil(modalidadesFiltradas.length / filasPorPagina);
    const modalidadesPaginadas = modalidadesFiltradas.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: '1400px' }}>
            
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--slate-900)', letterSpacing: '-0.5px' }}>
                        Gestión Global — Modalidades
                    </h2>
                    <p className="mb-0 text-muted d-flex align-items-center gap-2">
                        <Globe size={16} /> <span>Configura las modalidades de estudio (Presencial, Semipresencial, Virtual, etc.).</span>
                    </p>
                </div>
                <button onClick={abrirModalNuevo} className="btn btn-premium-dark px-4 py-2 d-flex align-items-center gap-2">
                    <Plus size={18} /> <span>Nueva Modalidad</span>
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
                            <label className="filter-label"><Search size={14} /> Buscar Modalidad</label>
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
                ) : modalidadesPaginadas.length === 0 ? (
                    <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                            <Globe size={36} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold" style={{ color: 'var(--slate-800)' }}>No se encontraron modalidades</h5>
                        <p className="text-muted mb-0" style={{ maxWidth: '400px' }}>
                            Ajuste los criterios de búsqueda o cree una nueva modalidad presionando "Nueva Modalidad".
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table premium-table">
                                <thead>
                                    <tr>
                                        <th className="ps-4" style={{ width: '15%' }}>Código</th>
                                        <th style={{ width: '30%' }}>Modalidad</th>
                                        <th style={{ width: '30%' }}>Descripción</th>
                                        <th className="text-center" style={{ width: '10%' }}>Estado</th>
                                        <th className="text-end pe-4" style={{ width: '15%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalidadesPaginadas.map((row) => (
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
                                                        onClick={() => setModalidadACambiarEstado(row)}
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
                                                        onClick={() => setModalidadAEliminar(row)}
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
                        {modalidadesFiltradas.length > 0 && (
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50 gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small fw-medium">Modalidades por página:</span>
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

            {/* MODAL CREAR / EDITAR MODALIDAD */}
            {modalFormularioAbierto && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content premium-modal">
                                
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-white bg-opacity-10 p-2 rounded-3">
                                            <Globe size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0 text-white">
                                                {formulario.id ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                            </h5>
                                            <small className="text-white-50">Datos identificativos de la modalidad</small>
                                        </div>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={cerrarModalFormulario}></button>
                                </div>

                                <div className="modal-body p-4">
                                    <form id="form-modalidad" onSubmit={guardarModalidad}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="premium-input-group">
                                                    <label className="filter-label">Código de Modalidad <span className="text-danger ms-1">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control text-uppercase" 
                                                        name="codigo"
                                                        placeholder="Ej. PRES" 
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
                                                    <label className="filter-label">Nombre de la Modalidad <span className="text-danger ms-1">*</span></label>
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
                                    <button type="submit" form="form-modalidad" className="btn btn-premium-accent fw-medium px-4" disabled={guardando}>
                                        {guardando ? 'Guardando...' : 'Guardar Modalidad'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ backgroundColor: '#0f172a', opacity: 0.6 }}></div>
                </>
            )}

            {/* MODAL CONFIRMACIÓN CAMBIO DE ESTADO */}
            {modalidadACambiarEstado && (
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
                                        La modalidad <strong>{modalidadACambiarEstado.nombre}</strong> pasará a estar{' '}
                                        <strong>{modalidadACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}</strong>.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setModalidadACambiarEstado(null)} disabled={guardando}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-link text-primary fw-bold text-decoration-none w-50 py-3 m-0 rounded-0" onClick={cambiarEstadoModalidad} disabled={guardando}>
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
            {modalidadAEliminar && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content premium-modal modal-danger">
                                <div className="modal-body p-4 text-center">
                                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                        <Trash2 size={32} className="text-danger" />
                                    </div>
                                    <h5 className="fw-bold text-dark mb-2">¿Eliminar Modalidad?</h5>
                                    <p className="text-muted small mb-0">
                                        Se eliminará <strong className="text-dark">{modalidadAEliminar.nombre} ({modalidadAEliminar.codigo})</strong>. Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="modal-footer bg-light border-top d-flex flex-nowrap p-0">
                                    <button type="button" className="btn btn-link text-muted fw-semibold text-decoration-none w-50 py-3 border-end m-0 rounded-0" onClick={() => setModalidadAEliminar(null)} disabled={eliminando}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-link text-danger fw-bold text-decoration-none w-50 py-3 m-0 rounded-0" onClick={eliminarModalidad} disabled={eliminando}>
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
=======
    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (editandoId) {
                await axios.put(`/api/plan-estudios/modalidades-crud/${editandoId}`, formulario);
                setFeedback({ type: 'success', message: 'Modalidad actualizada correctamente.' });
            } else {
                await axios.post('/api/plan-estudios/modalidades-crud', formulario);
                setFeedback({ type: 'success', message: 'Modalidad creada correctamente.' });
            }
            setModalAbierto(false);
            cargarModalidades();
        } catch (error) {
            setFeedback({ type: 'error', message: error.response?.data?.message || 'Error al guardar.' });
        }
    };

    const handleEliminar = async () => {
        if (!modalidadAEliminar) return;
        try {
            await axios.delete(`/api/plan-estudios/modalidades-crud/${modalidadAEliminar.id}`);
            setFeedback({ type: 'success', message: 'Modalidad eliminada correctamente.' });
            setModalidadAEliminar(null);
            cargarModalidades();
        } catch (error) {
            setFeedback({ type: 'error', message: 'Error al eliminar la modalidad.' });
        }
    };

    const actualizarCampo = (campo, valor) => setFormulario(prev => ({ ...prev, [campo]: valor }));

    return (
        <Box sx={{ backgroundColor: '#f3f4f6', minHeight: '100vh', py: 3 }}>
            <Container maxWidth="lg">
                
                {/* HEADER PRINCIPAL */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ 
                            backgroundColor: COLORS.bgIcon, 
                            color: COLORS.primary, 
                            p: 1.5, 
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Globe size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.2 }}>
                                Gestión Global — Modalidades
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
                                Configura las modalidades de estudio (Presencial, Semipresencial, Virtual, etc.).
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={handleNuevo}
                        sx={{
                            backgroundColor: COLORS.primary,
                            '&:hover': { backgroundColor: COLORS.primaryHover },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                            px: 3,
                            py: 1
                        }}
                    >
                        Nueva Modalidad
                    </Button>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* BARRA DE BÚSQUEDA Y FILTROS */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                            <TextField
                                placeholder="Buscar por código, nombre o descripción..."
                                size="small"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                sx={{ 
                                    width: { xs: '100%', sm: 350 },
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} style={{ color: COLORS.textSecondary }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        size="small" 
                                        checked={soloActivas} 
                                        onChange={(e) => setSoloActivas(e.target.checked)} 
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                                        Solo modalidades activas
                                    </Typography>
                                }
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Search size={16} />}
                                onClick={cargarModalidades}
                                sx={{ 
                                    textTransform: 'none', 
                                    color: COLORS.primary, 
                                    borderColor: COLORS.primary,
                                    borderRadius: 2,
                                    fontWeight: 600
                                }}
                            >
                                Buscar
                            </Button>
                            <Button
                                startIcon={<RefreshCw size={16} />}
                                onClick={() => { setBusqueda(''); setSoloActivas(false); }}
                                sx={{ textTransform: 'none', color: COLORS.textSecondary, fontWeight: 600 }}
                            >
                                Limpiar
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* TABLA DE DATOS */}
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: COLORS.tableHead }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: COLORS.textSecondary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>CÓDIGO</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: COLORS.textSecondary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>MODALIDAD</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: COLORS.textSecondary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>DESCRIPCIÓN</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.textSecondary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ESTADO</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: COLORS.textSecondary, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ACCIONES</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={30} sx={{ color: COLORS.primary }} />
                                    </TableCell>
                                </TableRow>
                            ) : modalidadesFiltradas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: COLORS.textSecondary }}>
                                        No se encontraron modalidades registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                modalidadesFiltradas.map((mod) => (
                                    <TableRow key={mod.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ fontWeight: 600, color: COLORS.textPrimary }}>{mod.codigo}</TableCell>
                                        <TableCell sx={{ color: COLORS.textPrimary }}>{mod.nombre}</TableCell>
                                        <TableCell sx={{ color: COLORS.textSecondary }}>{mod.descripcion || '—'}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={mod.estado}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    backgroundColor: mod.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                    color: mod.estado === 'ACTIVO' ? '#166534' : '#991b1b',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="Editar">
                                                    <IconButton 
                                                        onClick={() => handleEditar(mod)} 
                                                        size="small" 
                                                        sx={{ color: COLORS.primary, backgroundColor: COLORS.bgIcon, borderRadius: 1.5, '&:hover': { backgroundColor: '#dbeafe' } }}
                                                    >
                                                        <Pencil size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton 
                                                        onClick={() => setModalidadAEliminar(mod)} 
                                                        size="small" 
                                                        sx={{ color: '#dc2626', backgroundColor: '#fef2f2', borderRadius: 1.5, '&:hover': { backgroundColor: '#fee2e2' } }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* MODAL DE CREAR / EDITAR (Mismo código de antes) */}
                <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                    <form onSubmit={handleGuardar}>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}`, p: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                                {editandoId ? 'Editar Modalidad' : 'Nueva Modalidad'}
                            </Typography>
                            <IconButton onClick={() => setModalAbierto(false)} size="small"><X size={18} /></IconButton>
                        </DialogTitle>
                        
                        <DialogContent sx={{ p: 3 }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth required label="Código" size="small"
                                        value={formulario.codigo}
                                        onChange={(e) => actualizarCampo('codigo', e.target.value)}
                                        placeholder="Ej. MOD-01"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select fullWidth required label="Modalidad" size="small"
                                        value={formulario.nombre}
                                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="PRESENCIAL">PRESENCIAL</MenuItem>
                                        <MenuItem value="SEMIPRESENCIAL">SEMIPRESENCIAL</MenuItem>
                                        <MenuItem value="VIRTUAL">VIRTUAL</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Descripción" size="small" multiline rows={3}
                                        value={formulario.descripcion}
                                        onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select fullWidth required label="Estado" size="small"
                                        value={formulario.estado}
                                        onChange={(e) => actualizarCampo('estado', e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
                            <Button onClick={() => setModalAbierto(false)} sx={{ color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600 }}>
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<Check size={18} />}
                                sx={{ backgroundColor: COLORS.primary, fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 3 }}
                            >
                                Guardar
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* MODAL DE ELIMINACIÓN (Mismo código de antes) */}
                <Dialog open={Boolean(modalidadAEliminar)} onClose={() => setModalidadAEliminar(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            ¿Estás seguro de que deseas eliminar la modalidad <strong>{modalidadAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
                        <Button onClick={() => setModalidadAEliminar(null)} sx={{ color: COLORS.textSecondary, textTransform: 'none', fontWeight: 600 }}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleEliminar} 
                            variant="contained" 
                            sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        >
                            Sí, Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
>>>>>>> bc050594254965b7fefac7961c49cfaa485bd79d
    );
}