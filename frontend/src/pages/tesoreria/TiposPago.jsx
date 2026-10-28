
import React, { useCallback, useEffect, useState } from 'react';
import {
    Plus,
    Edit3,
    Trash2,
    Tags,
    SearchX,
    DollarSign,
    Layers,
    Search,
    X,
    GraduationCap,
    RefreshCw,
    Wallet,
    Building2,
    FileText,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
    Receipt,
} from 'lucide-react';
import { tipoPagoService } from '../../services/tipoPagoService';

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const FORMULARIO_VACIO = {
    id: null,
    descripcion: '',
    codigo_pago: '',
    costo: '',
    categoria: '',
    area_administrativa: '',
    partida_contable: '',
    estado: 'ACTIVO',
};

const COLORES = {
    marino: '#0B111A',
    petroleo: '#102F42',
    celeste: '#20B9E8',
    celesteOscuro: '#0786B5',
    fondo: '#F3F7FA',
    texto: '#172033',
    secundario: '#64748B',
    borde: '#E2EAF0',
};

function obtenerErrores(error) {
    const errores = error?.response?.data?.errors;

    if (errores) {
        return Object.values(errores).flat().join(' ');
    }

    return (
        error?.response?.data?.message ||
        error?.message ||
        'Ocurrió un error al comunicarse con el servidor.'
    );
}

function extraerArreglo(respuesta) {
    if (!respuesta) return [];
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta.data)) return respuesta.data;
    if (Array.isArray(respuesta.data?.data)) {
        return respuesta.data.data;
    }
    return [];
}

function formatearCosto(costo) {
    const valor = Number(costo);

    return `S/ ${(Number.isFinite(valor) ? valor : 0).toLocaleString(
        'es-PE',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

/* =========================================================
   ESTILOS INSTITUCIONALES
========================================================= */

const modernStyles = `
    .tp-page {
        --tp-navy: #0B111A;
        --tp-petroleum: #102F42;
        --tp-blue: #20B9E8;
        --tp-blue-dark: #0786B5;
        --tp-blue-soft: #E3F7FD;
        --tp-bg: #F3F7FA;
        --tp-text: #172033;
        --tp-muted: #64748B;
        --tp-border: #E2EAF0;

        min-height: 100%;
        color: var(--tp-text);
        font-family: inherit;
    }

    .tp-page *,
    .tp-page *::before,
    .tp-page *::after {
        box-sizing: border-box;
    }

    .tp-page .tp-heading {
        color: var(--tp-navy);
        font-size: clamp(1.45rem, 2vw, 1.9rem);
        font-weight: 800;
        letter-spacing: -0.7px;
        line-height: 1.25;
    }

    .tp-page .tp-subtitle {
        color: var(--tp-muted);
        font-size: 0.875rem;
        line-height: 1.7;
    }

    .tp-page .tp-heading-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 54px;
        height: 54px;
        color: #fff;
        border-radius: 16px;
        background: linear-gradient(
            135deg,
            var(--tp-blue),
            var(--tp-blue-dark)
        );
        box-shadow: 0 7px 18px rgba(32, 185, 232, 0.24);
    }

    .tp-page .tp-btn-primary {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 9px;
        min-height: 44px;
        padding: 11px 18px;
        border: 1px solid transparent;
        border-radius: 11px;
        background: linear-gradient(
            135deg,
            var(--tp-blue),
            var(--tp-blue-dark)
        );
        color: #fff;
        font-size: 0.875rem;
        font-weight: 700;
        box-shadow: 0 5px 14px rgba(32, 185, 232, 0.19);
        transition: transform .2s, box-shadow .2s, opacity .2s;
    }

    .tp-page .tp-btn-primary:hover:not(:disabled) {
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(32, 185, 232, 0.3);
    }

    .tp-page button:disabled {
        cursor: not-allowed;
        opacity: .55;
    }

    .tp-page .tp-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 42px;
        padding: 9px 15px;
        border: 1px solid var(--tp-border);
        border-radius: 10px;
        background: #fff;
        color: var(--tp-muted);
        font-size: .875rem;
        font-weight: 600;
        transition: all .2s ease;
    }

    .tp-page .tp-btn-secondary:hover {
        background: #F1F7FA;
        border-color: #C7DCE7;
        color: var(--tp-petroleum);
    }

    .tp-page .tp-panel {
        overflow: hidden;
        border: 1px solid rgba(226, 234, 240, .9);
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 8px 28px rgba(15, 35, 52, .045);
    }

    .tp-page .tp-toolbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    }

    .tp-page .tp-search {
        position: relative;
        width: 100%;
        max-width: 360px;
    }

    .tp-page .tp-search-icon {
        position: absolute;
        top: 50%;
        left: 14px;
        color: #8A9BAC;
        transform: translateY(-50%);
        pointer-events: none;
    }

    .tp-page .tp-search input {
        width: 100%;
        min-height: 44px;
        padding: 10px 42px 10px 42px;
        border: 1px solid var(--tp-border);
        border-radius: 11px;
        outline: none;
        background: #F8FAFC;
        color: var(--tp-text);
        font-size: .875rem;
        transition: border-color .2s, box-shadow .2s, background .2s;
    }

    .tp-page .tp-search input:focus,
    .tp-page .tp-field input:focus,
    .tp-page .tp-field select:focus {
        border-color: var(--tp-blue);
        background: #fff;
        box-shadow: 0 0 0 4px rgba(32, 185, 232, .12);
        outline: none;
    }

    .tp-page .tp-search-clear {
        position: absolute;
        top: 50%;
        right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 27px;
        height: 27px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--tp-muted);
        transform: translateY(-50%);
    }

    .tp-page .tp-search-clear:hover {
        background: var(--tp-blue-soft);
        color: var(--tp-blue-dark);
    }

    .tp-page .tp-select {
        min-height: 38px;
        border: 1px solid var(--tp-border);
        border-radius: 9px;
        background-color: #F8FAFC;
        color: var(--tp-text);
        font-size: .85rem;
        font-weight: 600;
    }

    .tp-page .tp-table-wrap {
        overflow: hidden;
        border: 1px solid var(--tp-border);
        border-radius: 13px;
    }

    .tp-page .tp-table {
        width: 100%;
        margin: 0;
        border-collapse: separate;
        border-spacing: 0;
    }

    .tp-page .tp-table thead th {
        padding: 15px 17px;
        border-bottom: 1px solid var(--tp-border);
        background: #F3F7FA;
        color: #60758A;
        font-size: .69rem;
        font-weight: 800;
        letter-spacing: .075em;
        text-transform: uppercase;
        white-space: nowrap;
    }

    .tp-page .tp-table tbody td {
        padding: 16px 17px;
        border-bottom: 1px solid #EDF2F6;
        background: #fff;
        color: var(--tp-text);
        font-size: .84rem;
        vertical-align: middle;
    }

    .tp-page .tp-table tbody tr:last-child td {
        border-bottom: none;
    }

    .tp-page .tp-table tbody tr {
        transition: background .2s ease;
    }

    .tp-page .tp-table tbody tr:hover td {
        background: #F6FBFE;
    }

    .tp-page .tp-number {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-width: 31px;
        height: 29px;
        border: 1px solid #E7EDF3;
        border-radius: 8px;
        background: #F8FAFC;
        color: #64748B;
        font-size: .77rem;
        font-weight: 700;
    }

    .tp-page .tp-code {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border: 1px solid #D5F0F9;
        border-radius: 7px;
        background: #EAF9FE;
        color: #087FA8;
        font-size: .76rem;
        font-weight: 800;
        letter-spacing: .025em;
        white-space: nowrap;
    }

    .tp-page .tp-price {
        color: var(--tp-blue-dark);
        font-size: .9rem;
        font-weight: 800;
        white-space: nowrap;
    }

    .tp-page .tp-muted {
        color: var(--tp-muted);
    }

    .tp-page .tp-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 35px;
        height: 35px;
        border: 1px solid transparent;
        border-radius: 9px;
        transition: all .2s ease;
    }

    .tp-page .tp-action-edit {
        border-color: #D9EFF9;
        background: #EAF7FD;
        color: #0786B5;
    }

    .tp-page .tp-action-edit:hover {
        border-color: #0786B5;
        background: #0786B5;
        color: #fff;
    }

    .tp-page .tp-action-delete {
        border-color: #F9E1E3;
        background: #FFF0F1;
        color: #C63F4B;
    }

    .tp-page .tp-action-delete:hover {
        border-color: #C63F4B;
        background: #C63F4B;
        color: #fff;
    }

    .tp-page .tp-empty {
        padding: 60px 20px;
        text-align: center;
    }

    .tp-page .tp-empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 68px;
        height: 68px;
        margin: 0 auto 17px;
        border-radius: 20px;
        background: #EAF8FD;
        color: #0786B5;
    }

    .tp-page .tp-pagination {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 0;
        margin: 0;
        list-style: none;
    }

    .tp-page .tp-page-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 35px;
        height: 35px;
        padding: 0 10px;
        border: 1px solid transparent;
        border-radius: 9px;
        background: #fff;
        color: #64748B;
        font-size: .83rem;
        font-weight: 700;
        transition: all .2s ease;
    }

    .tp-page .tp-page-btn:hover:not(:disabled) {
        border-color: #B9EAF7;
        background: #EAF9FE;
        color: #0786B5;
    }

    .tp-page .tp-page-btn.active {
        border-color: var(--tp-blue-dark);
        background: var(--tp-blue-dark);
        color: #fff;
        box-shadow: 0 4px 10px rgba(7, 134, 181, .2);
    }

    .tp-page .tp-page-dots {
        padding: 0 4px;
        color: #94A3B8;
    }

    .tp-page .tp-alert {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 15px 17px;
        border: 1px solid transparent;
        border-radius: 12px;
        font-size: .875rem;
    }

    .tp-page .tp-alert-success {
        border-color: #B9E9D1;
        background: #ECFDF5;
        color: #166534;
    }

    .tp-page .tp-alert-error {
        border-color: #F5C7CB;
        background: #FFF1F2;
        color: #9F2635;
    }

    .tp-page .tp-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1050;
        background: rgba(7, 17, 29, .62);
        backdrop-filter: blur(4px);
    }

    .tp-page .tp-modal {
        position: fixed;
        inset: 0;
        z-index: 1055;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        padding: 20px;
    }

    .tp-page .tp-modal-dialog {
        width: 100%;
        max-width: 620px;
        margin: auto;
        animation: tp-modal-in .22s ease-out;
    }

    .tp-page .tp-modal-dialog-sm {
        max-width: 460px;
    }

    .tp-page .tp-modal-content {
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.5);
        border-radius: 19px;
        background: #fff;
        box-shadow: 0 24px 75px rgba(0, 0, 0, .23);
    }

    .tp-page .tp-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 22px 25px;
        border-bottom: 1px solid var(--tp-border);
        background: #F7FAFC;
    }

    .tp-page .tp-modal-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--tp-navy);
        font-size: 1.05rem;
        font-weight: 800;
    }

    .tp-page .tp-modal-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 12px;
        background: #DFF6FD;
        color: #0786B5;
    }

    .tp-page .tp-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        border: 1px solid var(--tp-border);
        border-radius: 9px;
        background: #fff;
        color: #64748B;
    }

    .tp-page .tp-close:hover {
        background: #EAF9FE;
        color: #0786B5;
    }

    .tp-page .tp-modal-body {
        padding: 25px;
    }

    .tp-page .tp-modal-footer {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 10px;
        padding: 17px 25px;
        border-top: 1px solid var(--tp-border);
        background: #F8FAFC;
    }

    .tp-page .tp-field label {
        display: block;
        margin-bottom: 7px;
        color: #42556A;
        font-size: .79rem;
        font-weight: 700;
    }

    .tp-page .tp-required {
        color: #DC3545;
    }

    .tp-page .tp-field input,
    .tp-page .tp-field select {
        width: 100%;
        min-height: 43px;
        padding: 10px 12px;
        border: 1px solid #DCE5ED;
        border-radius: 10px;
        outline: none;
        background: #F8FAFC;
        color: var(--tp-text);
        font-size: .875rem;
        transition: border-color .2s, box-shadow .2s;
    }

    .tp-page .tp-field input::placeholder {
        color: #A0ADBA;
    }

    .tp-page .tp-field .tp-field-icon-wrap {
        position: relative;
    }

    .tp-page .tp-field .tp-field-icon {
        position: absolute;
        top: 50%;
        left: 12px;
        color: #8AA0B1;
        transform: translateY(-50%);
        pointer-events: none;
    }

    .tp-page .tp-field .tp-input-icon {
        padding-left: 38px;
    }

    .tp-page .tp-help {
        margin-top: 6px;
        color: #8795A5;
        font-size: .74rem;
    }

    .tp-page .tp-delete-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        margin-bottom: 17px;
        border-radius: 16px;
        background: #FFF0F1;
        color: #C63F4B;
    }

    .tp-page .tp-btn-danger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 42px;
        padding: 10px 16px;
        border: 1px solid #C63F4B;
        border-radius: 10px;
        background: #C63F4B;
        color: #fff;
        font-size: .875rem;
        font-weight: 700;
        transition: all .2s;
    }

    .tp-page .tp-btn-danger:hover:not(:disabled) {
        background: #A92E3A;
        color: #fff;
    }

    .tp-page .tp-stat {
        display: flex;
        align-items: center;
        gap: 14px;
        height: 100%;
        padding: 18px;
        border: 1px solid var(--tp-border);
        border-radius: 15px;
        background: #fff;
        box-shadow: 0 5px 18px rgba(15, 35, 52, .025);
    }

    .tp-page .tp-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 46px;
        flex-shrink: 0;
        border-radius: 13px;
        background: #E5F7FD;
        color: #0786B5;
    }

    .tp-page .tp-stat-label {
        color: var(--tp-muted);
        font-size: .76rem;
        font-weight: 600;
    }

    .tp-page .tp-stat-value {
        margin-top: 3px;
        color: var(--tp-navy);
        font-size: 1.2rem;
        font-weight: 800;
        line-height: 1.3;
    }

    @keyframes tp-modal-in {
        from {
            opacity: 0;
            transform: translateY(9px) scale(.985);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 767px) {
        .tp-page .tp-panel {
            border-radius: 14px;
        }

        .tp-page .tp-toolbar {
            align-items: stretch;
        }

        .tp-page .tp-search {
            max-width: none;
        }

        .tp-page .tp-modal {
            align-items: flex-start;
            padding: 12px;
        }

        .tp-page .tp-modal-header {
            padding: 17px;
        }

        .tp-page .tp-modal-body {
            padding: 18px;
        }

        .tp-page .tp-modal-footer {
            padding: 15px 18px;
        }

        .tp-page .tp-modal-footer > button {
            flex: 1;
        }

        .tp-page .tp-table thead th,
        .tp-page .tp-table tbody td {
            padding: 13px 12px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .tp-page *,
        .tp-page *::before,
        .tp-page *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
        }
    }
`;

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function GestionTiposPago() {
    const [tiposPago, setTiposPago] = useState([]);
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [modalFormularioAbierto, setModalFormularioAbierto] =
        useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [tipoAEliminar, setTipoAEliminar] = useState(null);

    /* Insertar estilos y retirarlos al desmontar */
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.setAttribute('data-tipos-pago-styles', 'true');
        styleSheet.textContent = modernStyles;
        document.head.appendChild(styleSheet);

        return () => {
            styleSheet.remove();
        };
    }, []);

    /* Mensajes de éxito y error */
    const mostrarFeedback = useCallback((tipo, mensaje) => {
        setFeedback({
            type: tipo,
            message: mensaje,
        });
    }, []);

    /* Cargar registros */
    const cargarTiposPago = useCallback(async () => {
        setCargando(true);

        try {
            const respuesta = await tipoPagoService.listar();
            setTiposPago(extraerArreglo(respuesta));
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setCargando(false);
        }
    }, [mostrarFeedback]);

    useEffect(() => {
        cargarTiposPago();
    }, [cargarTiposPago]);

    /* Cerrar mensajes automáticamente */
    useEffect(() => {
        if (!feedback) return undefined;

        const temporizador = setTimeout(() => {
            setFeedback(null);
        }, 4500);

        return () => clearTimeout(temporizador);
    }, [feedback]);

    /* Modal de registro */
    const abrirModalNuevo = () => {
        setFormulario({ ...FORMULARIO_VACIO });
        setModalFormularioAbierto(true);
    };

    /* Modal de edición */
    const abrirModalEditar = (tipo) => {
        setFormulario({
            id: tipo.id,
            descripcion: tipo.descripcion ?? '',
            codigo_pago: tipo.codigo_pago ?? '',
            costo: tipo.costo ?? '',
            categoria: tipo.categoria ?? '',
            area_administrativa: tipo.area_administrativa ?? '',
            partida_contable: tipo.partida_contable ?? '',
            estado: tipo.estado ?? 'ACTIVO',
        });

        setModalFormularioAbierto(true);
    };

    const cerrarModalFormulario = () => {
        if (guardando) return;
        setModalFormularioAbierto(false);
    };

    /* Campos del formulario */
    const actualizarCampoForm = (evento) => {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    };

    /* Registrar o actualizar */
    const guardarTipoPago = async (evento) => {
        evento.preventDefault();

        if (guardando) return;

        const descripcion = formulario.descripcion.trim();
        const costo = Number(formulario.costo);

        if (!descripcion) {
            mostrarFeedback('error', 'Ingresa la descripción del tipo de pago.');
            return;
        }

        if (
            formulario.costo === '' ||
            !Number.isFinite(costo) ||
            costo < 0
        ) {
            mostrarFeedback('error', 'Ingresa un costo válido mayor o igual a cero.');
            return;
        }

        const datos = {
            ...formulario,
            descripcion,
            costo,
            codigo_pago: formulario.codigo_pago.trim(),
            categoria: formulario.categoria.trim(),
            area_administrativa: formulario.area_administrativa.trim(),
            partida_contable: formulario.partida_contable.trim(),
        };

        setGuardando(true);

        try {
            if (formulario.id !== null && formulario.id !== undefined) {
                await tipoPagoService.actualizar(formulario.id, datos);
                mostrarFeedback(
                    'success',
                    'El tipo de pago se actualizó correctamente.'
                );
            } else {
                await tipoPagoService.registrar(datos);
                mostrarFeedback(
                    'success',
                    'El tipo de pago se registró correctamente.'
                );
            }

            setModalFormularioAbierto(false);
            await cargarTiposPago();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setGuardando(false);
        }
    };

    /* Solicitar confirmación de eliminación */
    const solicitarEliminacion = (tipo) => {
        setTipoAEliminar(tipo);
    };

    /* Eliminar registro */
    const eliminarTipoPago = async () => {
        if (!tipoAEliminar || eliminando) return;

        setEliminando(true);

        try {
            await tipoPagoService.eliminar(tipoAEliminar.id);

            mostrarFeedback(
                'success',
                'El tipo de pago se eliminó correctamente.'
            );

            setTipoAEliminar(null);
            await cargarTiposPago();
        } catch (error) {
            mostrarFeedback('error', obtenerErrores(error));
        } finally {
            setEliminando(false);
        }
    };

    /* Búsqueda */
    const normalizar = (valor) =>
        String(valor ?? '').toLocaleLowerCase('es-PE').trim();

    const tiposFiltrados = tiposPago.filter((tipo) => {
        const termino = normalizar(filtroBusqueda);

        if (!termino) return true;

        return [
            tipo.descripcion,
            tipo.codigo_pago,
            tipo.categoria,
            tipo.area_administrativa,
            tipo.partida_contable,
            tipo.estado,
        ].some((campo) => normalizar(campo).includes(termino));
    });

    /* Paginación */
    const totalRegistros = tiposFiltrados.length;
    const totalPaginas = Math.max(
        1,
        Math.ceil(totalRegistros / registrosPorPagina)
    );

    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const indiceInicio = (paginaSegura - 1) * registrosPorPagina;

    const tiposPaginados = tiposFiltrados.slice(
        indiceInicio,
        indiceInicio + registrosPorPagina
    );

    /* Estadísticas */
    const totalCategorias = new Set(
        tiposPago
            .map((tipo) => normalizar(tipo.categoria))
            .filter(Boolean)
    ).size;

    const totalCostos = tiposPago.reduce((suma, tipo) => {
        const costo = Number(tipo.costo);
        return suma + (Number.isFinite(costo) ? costo : 0);
    }, 0);

    /* Páginas visibles: evita mostrar cientos de números */
    const obtenerPaginasVisibles = () => {
        const inicio = Math.max(1, paginaSegura - 2);
        const fin = Math.min(totalPaginas, paginaSegura + 2);
        const paginas = [];

        if (inicio > 1) paginas.push(1);
        if (inicio > 2) paginas.push('...inicio');

        for (let pagina = inicio; pagina <= fin; pagina++) {
            paginas.push(pagina);
        }

        if (fin < totalPaginas - 1) paginas.push('...fin');
        if (fin < totalPaginas) paginas.push(totalPaginas);

        return paginas;
    };

    /* =====================================================
       INTERFAZ
    ===================================================== */

    return (
        <div className="tp-page container-fluid px-3 px-md-4 py-4 py-md-5">

            {/* ENCABEZADO */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="tp-heading-icon">
                        <GraduationCap size={29} strokeWidth={1.8} />
                    </div>

                    <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h2 className="tp-heading mb-0">
                                Tipos de Pago
                            </h2>

                            <span className="tp-code">
                                ERP IESPP
                            </span>
                        </div>

                        <p className="tp-subtitle mb-0 mt-1">
                            Administración de conceptos, categorías y costos institucionales.
                        </p>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="tp-btn-secondary"
                        onClick={cargarTiposPago}
                        disabled={cargando}
                    >
                        <RefreshCw
                            size={16}
                            className={cargando ? 'spinner-border-sm' : ''}
                        />
                        Actualizar
                    </button>

                    <button
                        type="button"
                        className="tp-btn-primary"
                        onClick={abrirModalNuevo}
                    >
                        <Plus size={18} />
                        Nuevo tipo de pago
                    </button>
                </div>
            </div>

            {/* NOTIFICACIONES */}
            {feedback && (
                <div
                    className={`tp-alert mb-4 ${
                        feedback.type === 'error'
                            ? 'tp-alert-error'
                            : 'tp-alert-success'
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    {feedback.type === 'error' ? (
                        <AlertCircle size={21} className="flex-shrink-0" />
                    ) : (
                        <CheckCircle2 size={21} className="flex-shrink-0" />
                    )}

                    <div className="flex-grow-1">
                        <div className="fw-bold mb-1">
                            {feedback.type === 'error'
                                ? 'No se pudo completar la operación'
                                : 'Operación completada'}
                        </div>

                        <div>{feedback.message}</div>
                    </div>

                    <button
                        type="button"
                        className="tp-close"
                        onClick={() => setFeedback(null)}
                        aria-label="Cerrar notificación"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* TARJETAS DE RESUMEN */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="tp-stat">
                        <div className="tp-stat-icon">
                            <Wallet size={22} />
                        </div>

                        <div>
                            <div className="tp-stat-label">
                                Tipos de pago registrados
                            </div>
                            <div className="tp-stat-value">
                                {tiposPago.length}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="tp-stat">
                        <div className="tp-stat-icon">
                            <Tags size={22} />
                        </div>

                        <div>
                            <div className="tp-stat-label">
                                Categorías registradas
                            </div>
                            <div className="tp-stat-value">
                                {totalCategorias}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-xl-4">
                    <div className="tp-stat">
                        <div className="tp-stat-icon">
                            <Receipt size={22} />
                        </div>

                        <div>
                            <div className="tp-stat-label">
                                Suma de costos registrados
                            </div>
                            <div className="tp-stat-value">
                                {formatearCosto(totalCostos)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PANEL PRINCIPAL */}
            <div className="tp-panel">
                {/* BARRA DE BÚSQUEDA */}
                <div className="p-3 p-md-4 border-bottom">
                    <div className="tp-toolbar">
                        <div>
                            <h5 className="fw-bold mb-1">
                                <Layers
                                    size={19}
                                    className="me-2"
                                    color={COLORES.celesteOscuro}
                                />
                                Registro de conceptos
                            </h5>

                            <p className="tp-subtitle mb-0">
                                Consulta y administra los tipos de pago de tu institución.
                            </p>
                        </div>

                        <div className="tp-search">
                            <Search
                                className="tp-search-icon"
                                size={17}
                            />

                            <input
                                type="search"
                                value={filtroBusqueda}
                                onChange={(evento) => {
                                    setFiltroBusqueda(evento.target.value);
                                    setPaginaActual(1);
                                }}
                                placeholder="Buscar concepto, código, área..."
                                aria-label="Buscar tipos de pago"
                            />

                            {filtroBusqueda && (
                                <button
                                    type="button"
                                    className="tp-search-clear"
                                    onClick={() => {
                                        setFiltroBusqueda('');
                                        setPaginaActual(1);
                                    }}
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
                        <span className="tp-subtitle">
                            Mostrar
                        </span>

                        <select
                            className="form-select tp-select"
                            style={{ width: 'auto' }}
                            value={registrosPorPagina}
                            onChange={(evento) => {
                                setRegistrosPorPagina(
                                    Number(evento.target.value)
                                );
                                setPaginaActual(1);
                            }}
                            aria-label="Registros por página"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <span className="tp-subtitle">
                            registros por página
                        </span>

                        <span className="ms-auto tp-code">
                            {totalRegistros} resultado
                            {totalRegistros !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* TABLA */}
                {cargando ? (
                    <div className="tp-empty">
                        <LoaderCircle
                            size={38}
                            className="mb-3"
                            color={COLORES.celesteOscuro}
                        />

                        <h6 className="fw-bold">
                            Cargando tipos de pago...
                        </h6>

                        <p className="tp-subtitle mb-0">
                            Estamos consultando los registros.
                        </p>
                    </div>
                ) : tiposPaginados.length === 0 ? (
                    <div className="tp-empty">
                        <div className="tp-empty-icon">
                            <SearchX size={32} />
                        </div>

                        <h5 className="fw-bold mb-2">
                            {filtroBusqueda
                                ? 'No encontramos coincidencias'
                                : 'Todavía no hay tipos de pago'}
                        </h5>

                        <p className="tp-subtitle mb-4">
                            {filtroBusqueda
                                ? 'Prueba con otra descripción, código o categoría.'
                                : 'Agrega el primer concepto para comenzar a administrar los pagos.'}
                        </p>

                        {filtroBusqueda ? (
                            <button
                                type="button"
                                className="tp-btn-secondary"
                                onClick={() => setFiltroBusqueda('')}
                            >
                                <X size={16} />
                                Limpiar búsqueda
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="tp-btn-primary"
                                onClick={abrirModalNuevo}
                            >
                                <Plus size={17} />
                                Agregar primer tipo de pago
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="tp-table-wrap border-0 rounded-0">
                            <div className="table-responsive">
                                <table className="table tp-table">
                                    <thead>
                                        <tr>
                                            <th className="ps-4">
                                                N.º
                                            </th>

                                            <th>
                                                Descripción
                                            </th>

                                            <th>
                                                Área administrativa
                                            </th>

                                            <th>
                                                Código de pago
                                            </th>

                                            <th>
                                                Costo
                                            </th>

                                            <th>
                                                Categoría
                                            </th>

                                            <th>
                                                Partida contable
                                            </th>

                                            <th className="text-center pe-4">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tiposPaginados.map((tipo, index) => (
                                            <tr key={tipo.id}>
                                                <td className="ps-4">
                                                    <span className="tp-number">
                                                        {indiceInicio + index + 1}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="tp-stat-icon"
                                                            style={{
                                                                width: 35,
                                                                height: 35,
                                                                borderRadius: 9,
                                                            }}
                                                        >
                                                            <DollarSign size={17} />
                                                        </div>

                                                        <div>
                                                            <div className="fw-bold">
                                                                {tipo.descripcion || 'Sin descripción'}
                                                            </div>

                                                            {tipo.estado && (
                                                                <div className="tp-subtitle mt-1">
                                                                    {tipo.estado}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Building2
                                                            size={15}
                                                            color="#8A9BAC"
                                                        />

                                                        <span>
                                                            {tipo.area_administrativa || '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="tp-code">
                                                        {tipo.codigo_pago || 'SIN CÓDIGO'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="tp-price">
                                                        {formatearCosto(tipo.costo)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="tp-muted">
                                                        {tipo.categoria || 'Sin categoría'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FileText
                                                            size={15}
                                                            color="#8A9BAC"
                                                        />

                                                        <span>
                                                            {tipo.partida_contable || '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="text-center pe-4">
                                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="tp-action tp-action-edit"
                                                            onClick={() => abrirModalEditar(tipo)}
                                                            title="Editar tipo de pago"
                                                            aria-label={`Editar ${tipo.descripcion}`}
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="tp-action tp-action-delete"
                                                            onClick={() => solicitarEliminacion(tipo)}
                                                            title="Eliminar tipo de pago"
                                                            aria-label={`Eliminar ${tipo.descripcion}`}
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
                        </div>

                        {/* PIE Y PAGINACIÓN */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 p-md-4">
                            <div className="tp-subtitle text-center text-md-start">
                                Mostrando{' '}
                                <strong className="text-dark">
                                    {indiceInicio + 1}
                                </strong>
                                {' '}a{' '}
                                <strong className="text-dark">
                                    {Math.min(
                                        indiceInicio + registrosPorPagina,
                                        totalRegistros
                                    )}
                                </strong>
                                {' '}de{' '}
                                <strong className="text-dark">
                                    {totalRegistros}
                                </strong>
                                {' '}registros
                            </div>

                            {totalPaginas > 1 && (
                                <nav aria-label="Paginación de tipos de pago">
                                    <ul className="tp-pagination">
                                        <li>
                                            <button
                                                type="button"
                                                className="tp-page-btn"
                                                disabled={paginaSegura === 1}
                                                onClick={() => {
                                                    setPaginaActual(
                                                        Math.max(1, paginaSegura - 1)
                                                    );
                                                }}
                                                aria-label="Página anterior"
                                            >
                                                <ChevronLeft size={17} />
                                            </button>
                                        </li>

                                        {obtenerPaginasVisibles().map(
                                            (pagina, index) => {
                                                if (typeof pagina === 'string') {
                                                    return (
                                                        <li key={pagina}>
                                                            <span className="tp-page-dots">
                                                                ...
                                                            </span>
                                                        </li>
                                                    );
                                                }

                                                return (
                                                    <li key={`${pagina}-${index}`}>
                                                        <button
                                                            type="button"
                                                            className={`tp-page-btn ${
                                                                paginaSegura === pagina
                                                                    ? 'active'
                                                                    : ''
                                                            }`}
                                                            onClick={() => {
                                                                setPaginaActual(pagina);
                                                            }}
                                                            aria-current={
                                                                paginaSegura === pagina
                                                                    ? 'page'
                                                                    : undefined
                                                            }
                                                        >
                                                            {pagina}
                                                        </button>
                                                    </li>
                                                );
                                            }
                                        )}

                                        <li>
                                            <button
                                                type="button"
                                                className="tp-page-btn"
                                                disabled={
                                                    paginaSegura === totalPaginas
                                                }
                                                onClick={() => {
                                                    setPaginaActual(
                                                        Math.min(
                                                            totalPaginas,
                                                            paginaSegura + 1
                                                        )
                                                    );
                                                }}
                                                aria-label="Página siguiente"
                                            >
                                                <ChevronRight size={17} />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* =================================================
                MODAL: REGISTRAR / EDITAR
            ================================================= */}
            {modalFormularioAbierto && (
                <>
                    <div
                        className="tp-modal-backdrop"
                        onClick={cerrarModalFormulario}
                        aria-hidden="true"
                    />

                    <div
                        className="tp-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tp-modal-title"
                    >
                        <div className="tp-modal-dialog">
                            <div className="tp-modal-content">
                                <div className="tp-modal-header">
                                    <div className="tp-modal-title">
                                        <div className="tp-modal-icon">
                                            {formulario.id !== null &&
                                            formulario.id !== undefined ? (
                                                <Edit3 size={21} />
                                            ) : (
                                                <DollarSign size={22} />
                                            )}
                                        </div>

                                        <div>
                                            <div id="tp-modal-title">
                                                {formulario.id !== null &&
                                                formulario.id !== undefined
                                                    ? 'Editar tipo de pago'
                                                    : 'Nuevo tipo de pago'}
                                            </div>

                                            <div className="tp-subtitle mt-1">
                                                Completa la información del concepto.
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="tp-close"
                                        onClick={cerrarModalFormulario}
                                        disabled={guardando}
                                        aria-label="Cerrar formulario"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={guardarTipoPago}>
                                    <div className="tp-modal-body">
                                        <div className="row g-3">
                                            {/* DESCRIPCIÓN */}
                                            <div className="col-12">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-descripcion">
                                                        Descripción{' '}
                                                        <span className="tp-required">
                                                            *
                                                        </span>
                                                    </label>

                                                    <div className="tp-field-icon-wrap">
                                                        <FileText
                                                            className="tp-field-icon"
                                                            size={17}
                                                        />

                                                        <input
                                                            id="tp-descripcion"
                                                            type="text"
                                                            name="descripcion"
                                                            className="tp-input-icon"
                                                            placeholder="Ej. Matrícula regular"
                                                            value={formulario.descripcion}
                                                            onChange={actualizarCampoForm}
                                                            maxLength={255}
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CÓDIGO */}
                                            <div className="col-12 col-md-6">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-codigo">
                                                        Código de pago
                                                    </label>

                                                    <input
                                                        id="tp-codigo"
                                                        type="text"
                                                        name="codigo_pago"
                                                        placeholder="Ej. MAT-001"
                                                        value={formulario.codigo_pago}
                                                        onChange={actualizarCampoForm}
                                                        maxLength={100}
                                                    />

                                                    <div className="tp-help">
                                                        Código identificador del concepto.
                                                    </div>
                                                </div>
                                            </div>

                                            {/* COSTO */}
                                            <div className="col-12 col-md-6">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-costo">
                                                        Costo (S/){' '}
                                                        <span className="tp-required">
                                                            *
                                                        </span>
                                                    </label>

                                                    <div className="tp-field-icon-wrap">
                                                        <DollarSign
                                                            className="tp-field-icon"
                                                            size={17}
                                                        />

                                                        <input
                                                            id="tp-costo"
                                                            type="number"
                                                            name="costo"
                                                            className="tp-input-icon"
                                                            placeholder="0.00"
                                                            value={formulario.costo}
                                                            onChange={actualizarCampoForm}
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CATEGORÍA */}
                                            <div className="col-12 col-md-6">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-categoria">
                                                        Categoría
                                                    </label>

                                                    <div className="tp-field-icon-wrap">
                                                        <Tags
                                                            className="tp-field-icon"
                                                            size={17}
                                                        />

                                                        <input
                                                            id="tp-categoria"
                                                            type="text"
                                                            name="categoria"
                                                            className="tp-input-icon"
                                                            placeholder="Ej. MATRÍCULA"
                                                            value={formulario.categoria}
                                                            onChange={actualizarCampoForm}
                                                            maxLength={150}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ÁREA */}
                                            <div className="col-12 col-md-6">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-area">
                                                        Área administrativa
                                                    </label>

                                                    <div className="tp-field-icon-wrap">
                                                        <Building2
                                                            className="tp-field-icon"
                                                            size={17}
                                                        />

                                                        <input
                                                            id="tp-area"
                                                            type="text"
                                                            name="area_administrativa"
                                                            className="tp-input-icon"
                                                            placeholder="Ej. TESORERÍA"
                                                            value={formulario.area_administrativa}
                                                            onChange={actualizarCampoForm}
                                                            maxLength={150}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* PARTIDA CONTABLE */}
                                            <div className="col-12">
                                                <div className="tp-field">
                                                    <label htmlFor="tp-partida">
                                                        Partida contable
                                                    </label>

                                                    <div className="tp-field-icon-wrap">
                                                        <Receipt
                                                            className="tp-field-icon"
                                                            size={17}
                                                        />

                                                        <input
                                                            id="tp-partida"
                                                            type="text"
                                                            name="partida_contable"
                                                            className="tp-input-icon"
                                                            placeholder="Ej. 1.1.1"
                                                            value={formulario.partida_contable}
                                                            onChange={actualizarCampoForm}
                                                            maxLength={150}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="tp-help mt-4 mb-0">
                                            <span className="tp-required">*</span>
                                            {' '}Los campos marcados son obligatorios.
                                        </p>
                                    </div>

                                    <div className="tp-modal-footer">
                                        <button
                                            type="button"
                                            className="tp-btn-secondary"
                                            onClick={cerrarModalFormulario}
                                            disabled={guardando}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="submit"
                                            className="tp-btn-primary"
                                            disabled={guardando}
                                        >
                                            {guardando ? (
                                                <>
                                                    <LoaderCircle size={17} />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={17} />
                                                    {formulario.id !== null &&
                                                    formulario.id !== undefined
                                                        ? 'Guardar cambios'
                                                        : 'Registrar tipo de pago'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =================================================
                MODAL: CONFIRMAR ELIMINACIÓN
            ================================================= */}
            {tipoAEliminar && (
                <>
                    <div
                        className="tp-modal-backdrop"
                        onClick={() => {
                            if (!eliminando) setTipoAEliminar(null);
                        }}
                        aria-hidden="true"
                    />

                    <div
                        className="tp-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="tp-delete-title"
                    >
                        <div className="tp-modal-dialog tp-modal-dialog-sm">
                            <div className="tp-modal-content">
                                <div className="tp-modal-body p-4 p-md-5">
                                    <div className="tp-delete-icon">
                                        <Trash2 size={26} />
                                    </div>

                                    <h5
                                        id="tp-delete-title"
                                        className="fw-bold mb-2"
                                    >
                                        ¿Eliminar tipo de pago?
                                    </h5>

                                    <p className="tp-subtitle mb-3">
                                        Estás a punto de eliminar el siguiente concepto:
                                    </p>

                                    <div
                                        className="p-3 mb-3"
                                        style={{
                                            border: '1px solid #E2EAF0',
                                            borderRadius: 12,
                                            background: '#F8FAFC',
                                        }}
                                    >
                                        <div className="fw-bold">
                                            {tipoAEliminar.descripcion}
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
                                            <span className="tp-code">
                                                {tipoAEliminar.codigo_pago || 'SIN CÓDIGO'}
                                            </span>

                                            <span className="tp-price">
                                                {formatearCosto(tipoAEliminar.costo)}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mb-0 small text-danger">
                                        Esta acción podría afectar los registros relacionados,
                                        según las restricciones de tu base de datos.
                                    </p>
                                </div>

                                <div className="tp-modal-footer">
                                    <button
                                        type="button"
                                        className="tp-btn-secondary"
                                        onClick={() => setTipoAEliminar(null)}
                                        disabled={eliminando}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        className="tp-btn-danger"
                                        onClick={eliminarTipoPago}
                                        disabled={eliminando}
                                    >
                                        {eliminando ? (
                                            <>
                                                <LoaderCircle size={16} />
                                                Eliminando...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Sí, eliminar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
