import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, Fade, IconButton
} from '@mui/material';
import {
    Plus, Search, RefreshCw, X, BookOpen, AlertTriangle, Hash,
    FileText, Eye, Layers, Edit3, CheckCircle2, XCircle, Filter, GraduationCap
} from 'lucide-react';

import { planEstudioService } from '../../services/planEstudioService';
import { especialidadService } from '../../services/especialidadService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    id: null,
    curricula: '',
    resolucion: '',
    modalidad: 'REGULAR',
    programa_academico: '',
    especialidad_codigo: '',
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

export default function GestionPlanesEstudio() {
    // Estados de filtros superiores
    const [modalidades, setModalidades] = useState(['REGULAR', 'DISTANCIA', 'SEMI-PRESENCIAL']);
    const [modalidadSel, setModalidadSel] = useState('REGULAR');
    const [programaSel, setProgramaSel] = useState('');
    const [carreraSel, setCarreraSel] = useState('');
    
    // Lista de opciones para combos
    const [programasLista, setProgramasLista] = useState([]);
    const [carrerasLista, setCarrerasLista] = useState([]);

    // Lista principal de Planes de Estudio
    const [planes, setPlanes] = useState([]);

    // Paginación
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    // Estados de carga y feedback
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Estados de Modales
    const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [planACambiarEstado, setPlanACambiarEstado] = useState(null);

    // Cargar Catálogos Iniciales (Programas y Carreras)
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const respEsp = await especialidadService.listar();
                const lista = extraerArreglo(respEsp);
                setCarrerasLista(lista);

                // Extraer programas académicos únicos
                const progs = [...new Set(lista.map(item => item.programa_academico || item.area || 'GENERAL'))].filter(Boolean);
                setProgramasLista(progs);
            } catch (err) {
                console.warn('Error al cargar carreras/programas:', err);
            }
        };
        cargarCatalogos();
    }, []);

    // Cargar Planes de Estudio según Filtros
    const cargarPlanes = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const params = {
                modalidad: modalidadSel,
                programa: programaSel,
                carrera_codigo: carreraSel,
            };

            const resp = await planEstudioService.listar(params);
            setPlanes(extraerArreglo(resp));
        } catch (error) {
            setPlanes([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [modalidadSel, programaSel, carreraSel]);

    useEffect(() => {
        cargarPlanes();
    }, [cargarPlanes]);

    // Abrir modal de creación/edición
    const abrirModalNuevo = () => {
        setFormulario({
            ...FORMULARIO_VACIO,
            modalidad: modalidadSel,
            programa_academico: programaSel,
            especialidad_codigo: carreraSel,
        });
        setModalFormularioAbierto(true);
    };

    const abrirModalEditar = (plan) => {
        setFormulario({
            id: plan.id,
            curricula: plan.curricula || plan.codigo || '',
            resolucion: plan.resolucion || '',
            modalidad: plan.modalidad || modalidadSel,
            programa_academico: plan.programa_academico || programaSel,
            especialidad_codigo: plan.especialidad_codigo || carreraSel,
            estado: plan.estado || 'ACTIVO',
        });
        setModalFormularioAbierto(true);
    };

    const cerrarModalFormulario = () => {
        if (guardando) return;
        setModalFormularioAbierto(false);
    };

    const actualizarCampo = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarPlan = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await planEstudioService.actualizar(formulario.id, formulario);
                setFeedback({ type: 'success', message: `Plan de Estudio "${formulario.curricula}" actualizado correctamente.` });
            } else {
                await planEstudioService.registrar(formulario);
                setFeedback({ type: 'success', message: `Plan de Estudio "${formulario.curricula}" registrado correctamente.` });
            }
            setModalFormularioAbierto(false);
            await cargarPlanes();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoPlan = async () => {
        if (!planACambiarEstado) return;
        const nuevoEstado = planACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        
        try {
            await planEstudioService.cambiarEstado(planACambiarEstado.id, nuevoEstado);
            setFeedback({ type: 'success', message: `El plan "${planACambiarEstado.curricula}" cambió a ${nuevoEstado}.` });
            setPlanACambiarEstado(null);
            await cargarPlanes();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        }
    };

    const planesPaginados = planes.slice(
        pagina * filasPorPagina,
        pagina * filasPorPagina + filasPorPagina
    );

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            transition: '0.3s ease-in-out',
            backgroundColor: '#ffffff',
            '&:hover fieldset': { borderColor: THEME_COLORS.primary },
            '&.Mui-focused fieldset': { boxShadow: `0 0 0 3px ${THEME_COLORS.primary}20` }
        }
    };

    return (
        <Fade in={true} timeout={500}>
            <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>

                {/* --- HEADER --- */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justify: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 3,
                                backgroundColor: '#e0f2fe',
                                color: THEME_COLORS.primary,
                                display: 'flex'
                            }}
                        >
                            <GraduationCap size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary, letterSpacing: '-0.5px' }}>
                                Gestión - Plan de Estudio
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Configura la currícula, módulos y resoluciones académicas por carrera.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* --- PANEL DE FILTROS SELECCIONABLES (MODALIDAD, PROG. ACADÉMICO, CARRERA) --- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                    }}
                >
                    <Grid container spacing={2.5} alignItems="flex-end">
                        <Grid item xs={12} md={3.5}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#475569' }}>
                                Seleccionar Modalidad:
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={modalidadSel}
                                onChange={(e) => setModalidadSel(e.target.value)}
                                sx={inputStyle}
                            >
                                {modalidades.map((mod) => (
                                    <MenuItem key={mod} value={mod}>{mod}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#475569' }}>
                                Seleccionar Prog. Académico:
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={programaSel}
                                onChange={(e) => setProgramaSel(e.target.value)}
                                sx={inputStyle}
                            >
                                <MenuItem value="">-- TODOS --</MenuItem>
                                {programasLista.map((prog) => (
                                    <MenuItem key={prog} value={prog}>{prog}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={4.5}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#475569' }}>
                                Seleccionar Carrera:
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                value={carreraSel}
                                onChange={(e) => setCarreraSel(e.target.value)}
                                sx={inputStyle}
                            >
                                <MenuItem value="">-- TODAS --</MenuItem>
                                {carrerasLista.map((esp) => (
                                    <MenuItem key={esp.codigo || esp.id} value={esp.codigo || esp.id}>
                                        {esp.nombre} {esp.resolucion ? `(${esp.resolucion})` : ''}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<Filter size={16} />}
                                onClick={() => { setPagina(0); cargarPlanes(); }}
                                sx={{
                                    backgroundColor: '#0d9488',
                                    '&:hover': { backgroundColor: '#0f766e' },
                                    textTransform: 'none',
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    px: 3,
                                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                                }}
                            >
                                Ver Planes de Estudio
                            </Button>
                            <Button
                                variant="text"
                                startIcon={<RefreshCw size={16} />}
                                onClick={() => {
                                    setModalidadSel('REGULAR');
                                    setProgramaSel('');
                                    setCarreraSel('');
                                    setPagina(0);
                                    cargarPlanes();
                                }}
                                sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 600, color: '#64748b' }}
                            >
                                Limpiar Filtros
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* --- SECCIÓN PRINCIPAL DE TABLA --- */}
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Barra superior de la tabla */}
                    <Box
                        sx={{
                            p: 2.5,
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <BookOpen size={20} />
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                                Planes de Estudio Registrados
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={abrirModalNuevo}
                            sx={{
                                backgroundColor: '#ffffff',
                                color: '#0284c7',
                                '&:hover': { backgroundColor: '#f0f9ff' },
                                textTransform: 'none',
                                fontWeight: 800,
                                borderRadius: 2,
                                fontSize: '0.82rem',
                                px: 2
                            }}
                        >
                            AGREGAR
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table sx={{ minWidth: 900 }}>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '15%', py: 2 }}>Currícula</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '30%' }}>Resolución</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>Estado</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '40%' }}>Acciones / Accesos Directos</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={32} thickness={5} sx={{ color: THEME_COLORS.primary }} />
                                        </TableCell>
                                    </TableRow>
                                ) : planesPaginados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-flex' }}>
                                                    <BookOpen size={32} color="#cbd5e1" />
                                                </Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>
                                                    No hay planes de estudio registrados
                                                </Typography>
                                                <Typography variant="body2">
                                                    Selecciona otros filtros o crea un nuevo plan con el botón "AGREGAR".
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    planesPaginados.map((plan) => (
                                        <TableRow hover key={plan.id || plan.curricula} sx={{ '& td': { borderColor: '#f1f5f9' } }}>
                                            {/* Currícula */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                    {plan.curricula || plan.codigo}
                                                </Typography>
                                            </TableCell>

                                            {/* Resolución */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                                    {plan.resolucion || 'Sin Resolución Asignada'}
                                                </Typography>
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                <Chip
                                                    label={plan.estado}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: '0.7rem',
                                                        letterSpacing: '0.5px',
                                                        borderRadius: '8px',
                                                        px: 1,
                                                        backgroundColor: String(plan.estado).toUpperCase() === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                        color: String(plan.estado).toUpperCase() === 'ACTIVO' ? '#166534' : '#991b1b',
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Botones de Acción Estilizados */}
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                                    {/* Ver Cursos */}
                                                    <Button
                                                        size="small"
                                                        startIcon={<Eye size={14} />}
                                                        sx={{
                                                            backgroundColor: '#f87171',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: '#ef4444' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            borderRadius: '6px',
                                                            px: 1.5,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        Ver Cursos
                                                    </Button>

                                                    {/* Ver Módulos */}
                                                    <Button
                                                        size="small"
                                                        startIcon={<Layers size={14} />}
                                                        sx={{
                                                            backgroundColor: '#22c55e',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: '#16a34a' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            borderRadius: '6px',
                                                            px: 1.5,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        Ver Módulos
                                                    </Button>

                                                    {/* Reporte Plan */}
                                                    <Button
                                                        size="small"
                                                        startIcon={<FileText size={14} />}
                                                        sx={{
                                                            backgroundColor: '#fb7185',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: '#f43f5e' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            borderRadius: '6px',
                                                            px: 1.5,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        Reporte Plan
                                                    </Button>

                                                    {/* Activar / Desactivar Toggle */}
                                                    <Button
                                                        size="small"
                                                        startIcon={plan.estado === 'ACTIVO' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                                        onClick={() => setPlanACambiarEstado(plan)}
                                                        sx={{
                                                            backgroundColor: plan.estado === 'ACTIVO' ? '#f87171' : '#22c55e',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: plan.estado === 'ACTIVO' ? '#ef4444' : '#16a34a' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            borderRadius: '6px',
                                                            px: 1.5,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        {plan.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                    </Button>

                                                    {/* Editar */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => abrirModalEditar(plan)}
                                                        sx={{
                                                            backgroundColor: '#eab308',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: '#ca8a04' },
                                                            borderRadius: '6px',
                                                            p: 0.6
                                                        }}
                                                    >
                                                        <Edit3 size={15} />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <Box sx={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfcfc' }}>
                            <TablePagination
                                component="div"
                                count={planes.length}
                                page={pagina}
                                onPageChange={(e, newPage) => setPagina(newPage)}
                                rowsPerPage={filasPorPagina}
                                onRowsPerPageChange={(e) => {
                                    setFilasPorPagina(parseInt(e.target.value, 10));
                                    setPagina(0);
                                }}
                                labelRowsPerPage="Planes por página:"
                            />
                        </Box>
                    </TableContainer>
                </Paper>

                {/* --- MODAL CREAR / EDITAR PLAN DE ESTUDIO --- */}
                <Dialog
                    open={modalFormularioAbierto}
                    onClose={cerrarModalFormulario}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}
                >
                    <Box component="form" onSubmit={guardarPlan}>
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ backgroundColor: '#f0f9ff', color: THEME_COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex' }}>
                                    <BookOpen size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                        {formulario.id ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                        Configure el año curricular y la resolución institucional.
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={cerrarModalFormulario} size="small" sx={{ backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#e2e8f0' } }}>
                                <X size={20} color="#64748b" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pb: 4, pt: '10px !important' }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Currícula (Año/Código) <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. 2020, 2024-I"
                                        size="medium"
                                        value={formulario.curricula}
                                        onChange={(e) => actualizarCampo('curricula', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Hash size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Modalidad <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        required
                                        size="medium"
                                        value={formulario.modalidad}
                                        onChange={(e) => actualizarCampo('modalidad', e.target.value)}
                                        sx={inputStyle}
                                    >
                                        {modalidades.map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Resolución Académica
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Ej. RVM 147-2020-MINEDU"
                                        size="medium"
                                        value={formulario.resolucion}
                                        onChange={(e) => actualizarCampo('resolucion', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FileText size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Carrera / Especialidad Vinculada
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        size="medium"
                                        value={formulario.especialidad_codigo}
                                        onChange={(e) => actualizarCampo('especialidad_codigo', e.target.value)}
                                        sx={inputStyle}
                                    >
                                        <MenuItem value="">-- Ninguna --</MenuItem>
                                        {carrerasLista.map((c) => (
                                            <MenuItem key={c.codigo || c.id} value={c.codigo || c.id}>
                                                {c.nombre}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5, borderTop: '1px solid #f1f5f9', mt: 1 }}>
                            <Button
                                type="button"
                                onClick={cerrarModalFormulario}
                                disabled={guardando}
                                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { backgroundColor: '#f1f5f9' } }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={guardando}
                                sx={{
                                    backgroundColor: THEME_COLORS.primary,
                                    borderRadius: 2.5,
                                    px: 4,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                                    '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                }}
                            >
                                {guardando ? 'Guardando...' : 'Guardar Plan'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* --- MODAL CONFIRMACIÓN CAMBIO DE ESTADO --- */}
                <Dialog
                    open={Boolean(planACambiarEstado)}
                    onClose={() => setPlanACambiarEstado(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <AlertTriangle size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Cambiar Estado del Plan?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            El plan <strong style={{ color: '#000' }}>{planACambiarEstado?.curricula}</strong> pasará a estar{' '}
                            <strong>{planACambiarEstado?.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}</strong>.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={() => setPlanACambiarEstado(null)}
                            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { backgroundColor: '#f1f5f9' } }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={cambiarEstadoPlan}
                            variant="contained"
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                            }}
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Fade>
    );
}