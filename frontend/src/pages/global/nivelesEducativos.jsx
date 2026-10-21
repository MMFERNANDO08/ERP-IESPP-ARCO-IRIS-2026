import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, Fade, IconButton
} from '@mui/material';
import {
    Plus, Search, RefreshCw, X, School, AlertTriangle, Hash,
    FileText, Edit3, CheckCircle2, XCircle, Filter, Trash2
} from 'lucide-react';

import { nivelEducativoService } from '../../services/nivelEducativoService';
import { THEME_COLORS } from '../../theme/colors';

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

export default function GestionNivelesEducativos() {
    // Estados de búsqueda / filtro
    const [busqueda, setBusqueda] = useState('');
    const [busquedaAplicada, setBusquedaAplicada] = useState('');

    // Lista principal de Niveles Educativos
    const [niveles, setNiveles] = useState([]);

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
    const [nivelACambiarEstado, setNivelACambiarEstado] = useState(null);
    const [nivelAEliminar, setNivelAEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    // Cargar Niveles Educativos desde la API
    const cargarNiveles = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const resp = await nivelEducativoService.listar();
            setNiveles(extraerArreglo(resp));
        } catch (error) {
            setNiveles([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarNiveles();
    }, [cargarNiveles]);

    // Abrir modal para creación o edición
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

    const actualizarCampo = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

    // Guardar (Registrar / Actualizar)
    const guardarNivel = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id || editandoPorCodigo()) {
                const targetKey = formulario.id || formulario.codigo;
                await nivelEducativoService.actualizar(targetKey, formulario);
                setFeedback({ type: 'success', message: `Nivel educativo "${formulario.nombre}" actualizado correctamente.` });
            } else {
                await nivelEducativoService.registrar(formulario);
                setFeedback({ type: 'success', message: `Nivel educativo "${formulario.nombre}" registrado correctamente.` });
            }
            setModalFormularioAbierto(false);
            await cargarNiveles();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const editandoPorCodigo = () => {
        return niveles.some((n) => n.codigo === formulario.codigo && Boolean(formulario.id));
    };

    // Cambiar estado (Activar / Desactivar)
    const cambiarEstadoNivel = async () => {
        if (!nivelACambiarEstado) return;
        const nuevoEstado = nivelACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const targetKey = nivelACambiarEstado.id || nivelACambiarEstado.codigo;

        try {
            await nivelEducativoService.actualizar(targetKey, {
                ...nivelACambiarEstado,
                estado: nuevoEstado,
            });
            setFeedback({ type: 'success', message: `El nivel "${nivelACambiarEstado.nombre}" cambió a ${nuevoEstado}.` });
            setNivelACambiarEstado(null);
            await cargarNiveles();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        }
    };

    // Eliminar nivel
    const eliminarNivel = async () => {
        if (!nivelAEliminar) return;
        setEliminando(true);
        const targetKey = nivelAEliminar.id || nivelAEliminar.codigo;

        try {
            await nivelEducativoService.eliminar(targetKey);
            setFeedback({ type: 'success', message: `Nivel educativo "${nivelAEliminar.nombre}" eliminado correctamente.` });
            setNivelAEliminar(null);
            await cargarNiveles();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    // Filtrado de lista por buscador
    const nivelesFiltrados = niveles.filter((n) => {
        if (!busquedaAplicada.trim()) return true;
        const term = busquedaAplicada.toLowerCase();
        return (
            (n.codigo && n.codigo.toLowerCase().includes(term)) ||
            (n.nombre && n.nombre.toLowerCase().includes(term)) ||
            (n.descripcion && n.descripcion.toLowerCase().includes(term))
        );
    });

    const nivelesPaginados = nivelesFiltrados.slice(
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
                        justifyContent: 'space-between',
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
                            <School size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary, letterSpacing: '-0.5px' }}>
                                Gestión - Niveles Educativos
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Configura los niveles de procedencia (Colegio, Universidad, Instituto, etc.).
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* --- PANEL DE FILTROS Y BÚSQUEDA --- */}
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
                        <Grid item xs={12} md={8}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#475569' }}>
                                Buscar Nivel Educativo:
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por código, nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setPagina(0);
                                        setBusquedaAplicada(busqueda);
                                    }
                                }}
                                sx={inputStyle}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} color="#94a3b8" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                                variant="contained"
                                startIcon={<Filter size={16} />}
                                onClick={() => {
                                    setPagina(0);
                                    setBusquedaAplicada(busqueda);
                                }}
                                sx={{
                                    backgroundColor: '#0d9488',
                                    '&:hover': { backgroundColor: '#0f766e' },
                                    textTransform: 'none',
                                    borderRadius: 2.5,
                                    fontWeight: 700,
                                    px: 3,
                                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
                                    height: 40
                                }}
                            >
                                Filtrar
                            </Button>
                            <Button
                                variant="text"
                                startIcon={<RefreshCw size={16} />}
                                onClick={() => {
                                    setBusqueda('');
                                    setBusquedaAplicada('');
                                    setPagina(0);
                                    cargarNiveles();
                                }}
                                sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 600, color: '#64748b', height: 40 }}
                            >
                                Limpiar
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
                            <School size={20} />
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                                Niveles Educativos Registrados
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
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '15%', py: 2 }}>Código</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '30%' }}>Nombre Nivel</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '30%' }}>Descripción</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '10%' }}>Estado</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={32} thickness={5} sx={{ color: THEME_COLORS.primary }} />
                                        </TableCell>
                                    </TableRow>
                                ) : nivelesPaginados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-flex' }}>
                                                    <School size={32} color="#cbd5e1" />
                                                </Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>
                                                    No hay niveles educativos registrados
                                                </Typography>
                                                <Typography variant="body2">
                                                    Crea un nuevo nivel educativo presionando el botón "AGREGAR".
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    nivelesPaginados.map((row) => (
                                        <TableRow hover key={row.id || row.codigo} sx={{ '& td': { borderColor: '#f1f5f9' } }}>
                                            {/* Código */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                                    {row.codigo}
                                                </Typography>
                                            </TableCell>

                                            {/* Nombre Nivel */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                                    {row.nombre}
                                                </Typography>
                                            </TableCell>

                                            {/* Descripción */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                    {row.descripcion || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                <Chip
                                                    label={row.estado}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: '0.7rem',
                                                        letterSpacing: '0.5px',
                                                        borderRadius: '8px',
                                                        px: 1,
                                                        backgroundColor: String(row.estado).toUpperCase() === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                        color: String(row.estado).toUpperCase() === 'ACTIVO' ? '#166534' : '#991b1b',
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Botones de Acción */}
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    {/* Activar / Desactivar Toggle */}
                                                    <Button
                                                        size="small"
                                                        startIcon={row.estado === 'ACTIVO' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                                        onClick={() => setNivelACambiarEstado(row)}
                                                        sx={{
                                                            backgroundColor: row.estado === 'ACTIVO' ? '#f87171' : '#22c55e',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: row.estado === 'ACTIVO' ? '#ef4444' : '#16a34a' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.72rem',
                                                            borderRadius: '6px',
                                                            px: 1.5,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        {row.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                    </Button>

                                                    {/* Editar */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => abrirModalEditar(row)}
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

                                                    {/* Eliminar */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setNivelAEliminar(row)}
                                                        sx={{
                                                            backgroundColor: '#ef4444',
                                                            color: '#ffffff',
                                                            '&:hover': { backgroundColor: '#dc2626' },
                                                            borderRadius: '6px',
                                                            p: 0.6
                                                        }}
                                                    >
                                                        <Trash2 size={15} />
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
                                count={nivelesFiltrados.length}
                                page={pagina}
                                onPageChange={(e, newPage) => setPagina(newPage)}
                                rowsPerPage={filasPorPagina}
                                onRowsPerPageChange={(e) => {
                                    setFilasPorPagina(parseInt(e.target.value, 10));
                                    setPagina(0);
                                }}
                                labelRowsPerPage="Niveles por página:"
                            />
                        </Box>
                    </TableContainer>
                </Paper>

                {/* --- MODAL CREAR / EDITAR NIVEL EDUCATIVO --- */}
                <Dialog
                    open={modalFormularioAbierto}
                    onClose={cerrarModalFormulario}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}
                >
                    <Box component="form" onSubmit={guardarNivel}>
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ backgroundColor: '#f0f9ff', color: THEME_COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex' }}>
                                    <School size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                        {formulario.id ? 'Editar Nivel Educativo' : 'Nuevo Nivel Educativo'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                        Configure los datos del nivel académico o institución de origen.
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
                                        Código del Nivel <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. UNI, COL, INST"
                                        size="medium"
                                        value={formulario.codigo}
                                        onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
                                        disabled={Boolean(formulario.id)}
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
                                        Estado <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        required
                                        size="medium"
                                        value={formulario.estado}
                                        onChange={(e) => actualizarCampo('estado', e.target.value)}
                                        sx={inputStyle}
                                    >
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Nombre del Nivel <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. Universidad, Colegio, Instituto"
                                        size="medium"
                                        value={formulario.nombre}
                                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <School size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Descripción
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Descripción opcional o detalles adicionales..."
                                        size="medium"
                                        value={formulario.descripcion}
                                        onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                                        sx={inputStyle}
                                    />
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
                                {guardando ? <CircularProgress size={20} color="inherit" /> : 'Guardar Nivel'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* --- MODAL CONFIRMACIÓN CAMBIO DE ESTADO --- */}
                <Dialog
                    open={Boolean(nivelACambiarEstado)}
                    onClose={() => setNivelACambiarEstado(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <AlertTriangle size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Cambiar Estado del Nivel?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            El nivel <strong style={{ color: '#000' }}>{nivelACambiarEstado?.nombre}</strong> pasará a estar{' '}
                            <strong>{nivelACambiarEstado?.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}</strong>.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={() => setNivelACambiarEstado(null)}
                            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { backgroundColor: '#f1f5f9' } }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={cambiarEstadoNivel}
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

                {/* --- MODAL CONFIRMACIÓN ELIMINACIÓN --- */}
                <Dialog
                    open={Boolean(nivelAEliminar)}
                    onClose={() => !eliminando && setNivelAEliminar(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <Trash2 size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Eliminar Nivel Educativo?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            Se eliminará el nivel <strong style={{ color: '#000' }}>{nivelAEliminar?.nombre}</strong> ({nivelAEliminar?.codigo}). Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={() => setNivelAEliminar(null)}
                            disabled={eliminando}
                            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover': { backgroundColor: '#f1f5f9' } }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={eliminarNivel}
                            variant="contained"
                            color="error"
                            disabled={eliminando}
                            sx={{
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                            }}
                        >
                            {eliminando ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Fade>
    );
}