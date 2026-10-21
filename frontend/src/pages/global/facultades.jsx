import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, Fade, IconButton
} from '@mui/material';
import {
    Plus, Search, RefreshCw, X, Building2, AlertTriangle, Hash,
    Edit3, CheckCircle2, XCircle, Filter, Trash2, AlignLeft
} from 'lucide-react';

import { facultadService } from '../../services/facultadService';
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

    const cargarFacultades = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const resp = await facultadService.listar();
            setFacultades(extraerArreglo(resp));
        } catch (error) {
            setFacultades([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarFacultades();
    }, [cargarFacultades]);

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

    const guardarFacultad = async (e) => {
        e.preventDefault();
        setGuardando(true);

        try {
            if (formulario.id) {
                await facultadService.actualizar(formulario.id, formulario);
                setFeedback({ type: 'success', message: `Facultad "${formulario.nombre}" actualizada correctamente.` });
            } else {
                await facultadService.registrar(formulario);
                setFeedback({ type: 'success', message: `Facultad "${formulario.nombre}" registrada correctamente.` });
            }
            setModalFormularioAbierto(false);
            await cargarFacultades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const cambiarEstadoFacultad = async () => {
        if (!facultadACambiarEstado) return;
        const nuevoEstado = facultadACambiarEstado.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const targetKey = facultadACambiarEstado.id || facultadACambiarEstado.codigo;

        try {
            await facultadService.actualizar(targetKey, { ...facultadACambiarEstado, estado: nuevoEstado });
            setFeedback({ type: 'success', message: `La facultad "${facultadACambiarEstado.nombre}" cambió a ${nuevoEstado}.` });
            setFacultadACambiarEstado(null);
            await cargarFacultades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        }
    };

    const eliminarFacultad = async () => {
        if (!facultadAEliminar) return;
        setEliminando(true);
        const targetKey = facultadAEliminar.id || facultadAEliminar.codigo;

        try {
            await facultadService.eliminar(targetKey);
            setFeedback({ type: 'success', message: `Facultad "${facultadAEliminar.nombre}" eliminada correctamente.` });
            setFacultadAEliminar(null);
            await cargarFacultades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    const facultadesFiltradas = facultades.filter((f) => {
        if (!busquedaAplicada.trim()) return true;
        const term = busquedaAplicada.toLowerCase();
        return (
            (f.codigo && f.codigo.toLowerCase().includes(term)) ||
            (f.nombre && f.nombre.toLowerCase().includes(term)) ||
            (f.descripcion && f.descripcion.toLowerCase().includes(term))
        );
    });

    const facultadesPaginadas = facultadesFiltradas.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, backgroundColor: '#e0f2fe', color: THEME_COLORS.primary, display: 'flex' }}>
                            <Building2 size={28} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary, letterSpacing: '-0.5px' }}>
                                Gestión - Facultades
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Configura las facultades institucionales que agrupan las especialidades y carreras.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={abrirModalNuevo}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            borderRadius: 2.5,
                            px: 3,
                            py: 1.2,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                            '&:hover': { backgroundColor: THEME_COLORS.primaryHover }
                        }}
                    >
                        Nueva Facultad
                    </Button>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* --- PANEL DE FILTROS Y BÚSQUEDA --- */}
                <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                    <Grid container spacing={2.5} alignItems="flex-end">
                        <Grid item xs={12} md={8}>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, color: '#475569' }}>
                                Buscar Facultad:
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por código, nombre o descripción..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && setBusquedaAplicada(busqueda)}
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
                                onClick={() => setBusquedaAplicada(busqueda)}
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
                                    cargarFacultades();
                                }}
                                sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 600, color: '#64748b', height: 40 }}
                            >
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* --- SECCIÓN PRINCIPAL DE TABLA --- */}
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, width: '15%' }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '30%' }}>Nombre Facultad</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '35%' }}>Descripción</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%' }}>Estado</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} thickness={5} sx={{ color: THEME_COLORS.primary }} />
                                    </TableCell>
                                </TableRow>
                            ) : facultadesPaginadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-flex' }}>
                                                <Building2 size={32} color="#cbd5e1" />
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>No hay facultades registradas</Typography>
                                            <Typography variant="body2">Crea una nueva facultad presionando "Nueva Facultad".</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                facultadesPaginadas.map((row) => (
                                    <TableRow hover key={row.id || row.codigo} sx={{ '& td': { borderColor: '#f1f5f9' }, transition: 'backgroundColor 0.2s' }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: THEME_COLORS.primary }}>
                                                {row.codigo}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                {row.nombre}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                {row.descripcion || '—'}
                                            </Typography>
                                        </TableCell>

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

                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    startIcon={row.estado === 'ACTIVO' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                                    onClick={() => setFacultadACambiarEstado(row)}
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

                                                <IconButton
                                                    size="small"
                                                    onClick={() => abrirModalEditar(row)}
                                                    sx={{ backgroundColor: '#eab308', color: '#ffffff', '&:hover': { backgroundColor: '#ca8a04' }, borderRadius: '6px', p: 0.6 }}
                                                >
                                                    <Edit3 size={15} />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => setFacultadAEliminar(row)}
                                                    sx={{ backgroundColor: '#ef4444', color: '#ffffff', '&:hover': { backgroundColor: '#dc2626' }, borderRadius: '6px', p: 0.6 }}
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
                            count={facultadesFiltradas.length}
                            page={pagina}
                            onPageChange={(e, newPage) => setPagina(newPage)}
                            rowsPerPage={filasPorPagina}
                            onRowsPerPageChange={(e) => {
                                setFilasPorPagina(parseInt(e.target.value, 10));
                                setPagina(0);
                            }}
                            labelRowsPerPage="Facultades por página:"
                        />
                    </Box>
                </TableContainer>

                {/* --- MODAL CREAR / EDITAR FACULTAD --- */}
                <Dialog open={modalFormularioAbierto} onClose={cerrarModalFormulario} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}>
                    <Box component="form" onSubmit={guardarFacultad}>
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ backgroundColor: '#f0f9ff', color: THEME_COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex' }}>
                                    <Building2 size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                        {formulario.id ? 'Editar Facultad' : 'Nueva Facultad'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                        Configure los datos identificativos de la facultad institucional.
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
                                        Código de Facultad <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. FAC-EDU, FAC-ING"
                                        size="medium"
                                        value={formulario.codigo}
                                        onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
                                        disabled={Boolean(formulario.id)}
                                        sx={inputStyle}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Hash size={18} color="#94a3b8" /></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Estado Operativo <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField select fullWidth required size="medium" value={formulario.estado} onChange={(e) => actualizarCampo('estado', e.target.value)} sx={inputStyle}>
                                        <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                        <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Nombre de la Facultad <span style={{ color: '#ef4444' }}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. Facultad de Educación y Humanidades"
                                        size="medium"
                                        value={formulario.nombre}
                                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><AlignLeft size={18} color="#94a3b8" /></InputAdornment> }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>Descripción</Typography>
                                    <TextField fullWidth multiline rows={3} placeholder="Descripción opcional..." size="medium" value={formulario.descripcion} onChange={(e) => actualizarCampo('descripcion', e.target.value)} sx={inputStyle} />
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5, borderTop: '1px solid #f1f5f9', mt: 1 }}>
                            <Button type="button" onClick={cerrarModalFormulario} disabled={guardando} sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3 }}>
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
                                    '&:hover': { backgroundColor: THEME_COLORS.primaryHover }
                                }}
                            >
                                {guardando ? 'Guardando...' : 'Guardar Facultad'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* --- MODAL CONFIRMACIÓN CAMBIO DE ESTADO --- */}
                <Dialog open={Boolean(facultadACambiarEstado)} onClose={() => setFacultadACambiarEstado(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}>
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <AlertTriangle size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Cambiar Estado de la Facultad?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            La facultad <strong style={{ color: '#000' }}>{facultadACambiarEstado?.nombre}</strong> pasará a estar{' '}
                            <strong>{facultadACambiarEstado?.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}</strong>.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button type="button" onClick={() => setFacultadACambiarEstado(null)} sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3 }}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={cambiarEstadoFacultad} variant="contained" sx={{ backgroundColor: THEME_COLORS.primary, borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 4, py: 1 }}>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* --- MODAL CONFIRMACIÓN ELIMINACIÓN --- */}
                <Dialog open={Boolean(facultadAEliminar)} onClose={() => !eliminando && setFacultadAEliminar(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}>
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <Trash2 size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Eliminar Facultad?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            Se eliminará la facultad <strong style={{ color: '#000' }}>{facultadAEliminar?.nombre}</strong> ({facultadAEliminar?.codigo}). Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button type="button" onClick={() => setFacultadAEliminar(null)} disabled={eliminando} sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3 }}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={eliminarFacultad} variant="contained" disabled={eliminando} sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 4, py: 1, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}>
                            {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Fade>
    );
}