import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, FormControlLabel, Checkbox, Fade, IconButton
} from '@mui/material';
import {
    Plus, Search, RefreshCw, X, Globe, Edit2, Trash2, Hash, AlignLeft, AlertTriangle
} from 'lucide-react';

import { modalidadService } from '../../services/modalidadService';
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

export default function GestionModalidades() {
    // Estado principal de modalidades
    const [modalidades, setModalidades] = useState([]);
    
    // Estados de búsqueda, filtro y paginación
    const [busqueda, setBusqueda] = useState('');
    const [soloActivos, setSoloActivos] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    // Estados de carga y retroalimentación
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Estados de Modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [modalidadAEliminar, setModalidadAEliminar] = useState(null);

    // Carga de datos: Modalidades
    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            const params = {};
            if (soloActivos) params.solo_activos = 1;
            
            const resp = await modalidadService.listar(params);
            let lista = extraerArreglo(resp);

            // Filtro local de búsqueda por código o nombre
            if (busqueda.trim()) {
                const term = busqueda.toLowerCase().trim();
                lista = lista.filter(m => 
                    (m.codigo && String(m.codigo).toLowerCase().includes(term)) || 
                    (m.nombre && String(m.nombre).toLowerCase().includes(term)) ||
                    (m.descripcion && String(m.descripcion).toLowerCase().includes(term))
                );
            }

            setModalidades(lista);
        } catch (error) {
            setModalidades([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Abrir modal para crear
    const abrirCrearModalidad = () => {
        setModoEdicion(false);
        setFormulario(FORMULARIO_VACIO);
        setModalAbierto(true);
    };

    // Abrir modal para editar
    const abrirEditarModalidad = (modalidad) => {
        setModoEdicion(true);
        setFormulario({
            id: modalidad.id || modalidad.codigo,
            codigo: modalidad.codigo || '',
            nombre: modalidad.nombre || '',
            descripcion: modalidad.descripcion || '',
            estado: modalidad.estado || 'ACTIVO',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
    };

    const actualizarCampo = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarModalidad = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const codigoMod = formulario.codigo.trim().toUpperCase();
        const datos = {
            codigo: codigoMod,
            nombre: formulario.nombre.trim(),
            descripcion: formulario.descripcion.trim(),
            estado: formulario.estado,
        };

        try {
            if (modoEdicion) {
                if (modalidadService.actualizar) {
                    await modalidadService.actualizar(formulario.id, datos);
                } else {
                    await modalidadService.registrar({ ...datos, id: formulario.id });
                }
                setFeedback({ type: 'success', message: `Modalidad "${codigoMod}" actualizada correctamente.` });
            } else {
                await modalidadService.registrar(datos);
                setFeedback({ type: 'success', message: `Modalidad "${codigoMod}" registrada correctamente.` });
            }

            setModalAbierto(false);
            await cargarDatos();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!modalidadAEliminar) return;
        setEliminando(true);

        try {
            const idAEliminar = modalidadAEliminar.id || modalidadAEliminar.codigo;
            await modalidadService.eliminar(idAEliminar);
            
            setFeedback({ type: 'success', message: `Modalidad "${modalidadAEliminar.codigo}" eliminada correctamente.` });
            setModalidadAEliminar(null);
            await cargarDatos();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    const modalidadesPaginadas = modalidades.slice(
        pagina * filasPorPagina,
        pagina * filasPorPagina + filasPorPagina
    );

    const inputStyle = { 
        '& .MuiOutlinedInput-root': { 
            borderRadius: 2,
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
                            <Globe size={26} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary, letterSpacing: '-0.5px' }}>
                                Gestión Global — Modalidades
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Configura las modalidades de estudio (Presencial, Semipresencial, Virtual, etc.).
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={abrirCrearModalidad}
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
                        Nueva Modalidad
                    </Button>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', md: 'center' },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', flex: 1 }}>
                        <TextField
                            placeholder="Buscar por código, nombre o descripción..."
                            size="small"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPagina(0);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && cargarDatos()}
                            sx={{ 
                                width: { xs: '100%', sm: 400 },
                                '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#f8fafc' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="#94a3b8" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={soloActivos}
                                    onChange={(e) => {
                                        setSoloActivos(e.target.checked);
                                        setPagina(0);
                                    }}
                                    sx={{ color: THEME_COLORS.primary, '&.Mui-checked': { color: THEME_COLORS.primary } }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: THEME_COLORS.textPrimary, fontWeight: 600 }}>
                                    Solo modalidades activas
                                </Typography>
                            }
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Search size={16} />}
                            onClick={() => { setPagina(0); cargarDatos(); }}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 2 }}
                        >
                            Buscar
                        </Button>
                        <Button
                            variant="text"
                            startIcon={<RefreshCw size={16} />}
                            onClick={() => {
                                setBusqueda('');
                                setSoloActivos(false);
                                setPagina(0);
                                cargarDatos();
                            }}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, color: '#64748b' }}
                        >
                            Limpiar
                        </Button>
                    </Box>
                </Paper>

                {/* --- TABLA PRINCIPAL --- */}
                <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 3, 
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, width: '15%' }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '30%' }}>Modalidad</TableCell>
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
                            ) : modalidadesPaginadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-flex' }}>
                                                <Globe size={32} color="#cbd5e1" />
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>No se encontraron modalidades</Typography>
                                            <Typography variant="body2">Ajusta tu búsqueda o registra una nueva modalidad.</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                modalidadesPaginadas.map((modalidad) => (
                                    <TableRow hover key={modalidad.id || modalidad.codigo} sx={{ '& td': { borderColor: '#f1f5f9' }, transition: 'backgroundColor 0.2s' }}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: THEME_COLORS.primary }}>
                                                {modalidad.codigo}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                {modalidad.nombre}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                {modalidad.descripcion || '—'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={modalidad.estado}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    letterSpacing: '0.5px',
                                                    borderRadius: '8px',
                                                    px: 1,
                                                    backgroundColor: String(modalidad.estado).toUpperCase() === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                    color: String(modalidad.estado).toUpperCase() === 'ACTIVO' ? '#166534' : '#991b1b',
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="Editar Modalidad">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => abrirEditarModalidad(modalidad)}
                                                        sx={{ color: '#0284c7', backgroundColor: '#f0f9ff', '&:hover': { backgroundColor: '#e0f2fe' } }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar Modalidad">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setModalidadAEliminar(modalidad)}
                                                        sx={{ color: '#ef4444', backgroundColor: '#fef2f2', '&:hover': { backgroundColor: '#fee2e2' } }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
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
                            count={modalidades.length}
                            page={pagina}
                            onPageChange={(e, newPage) => setPagina(newPage)}
                            rowsPerPage={filasPorPagina}
                            onRowsPerPageChange={(e) => {
                                setFilasPorPagina(parseInt(e.target.value, 10));
                                setPagina(0);
                            }}
                            labelRowsPerPage="Modalidades por página:"
                        />
                    </Box>
                </TableContainer>

                {/* --- MODAL DE REGISTRO / EDICIÓN --- */}
                <Dialog
                    open={modalAbierto}
                    onClose={cerrarModal}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}
                >
                    <Box component="form" onSubmit={guardarModalidad}>
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ backgroundColor: '#f0f9ff', color: THEME_COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex' }}>
                                    <Globe size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                        {modoEdicion ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                        {modoEdicion ? 'Modifique los datos de la modalidad de estudio.' : 'Complete la información para registrar la nueva modalidad.'}
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={cerrarModal} size="small" sx={{ backgroundColor: '#f1f5f9', '&:hover':{backgroundColor:'#e2e8f0'} }}>
                                <X size={20} color="#64748b" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pb: 4, pt: '10px !important' }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Código <span style={{color: '#ef4444'}}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. PRES, SEMI, VIR"
                                        size="medium"
                                        value={formulario.codigo}
                                        onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
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
                                        Estado Operativo <span style={{color: '#ef4444'}}>*</span>
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
                                        <MenuItem value="ACTIVO">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>ACTIVO</Typography>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="INACTIVO">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>INACTIVO</Typography>
                                            </Box>
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Nombre de la Modalidad <span style={{color: '#ef4444'}}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. PRESENCIAL, SEMIPRESENCIAL, VIRTUAL"
                                        size="medium"
                                        value={formulario.nombre}
                                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AlignLeft size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Descripción <span style={{color: '#94a3b8', fontWeight: 500}}>(Opcional)</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Detalles sobre el régimen de asistencia, requerimientos técnicos, etc."
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
                                onClick={cerrarModal}
                                disabled={guardando}
                                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover':{backgroundColor: '#f1f5f9'} }}
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
                                {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar Modalidad' : 'Guardar Modalidad'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
                <Dialog
                    open={Boolean(modalidadAEliminar)}
                    onClose={() => !eliminando && setModalidadAEliminar(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <AlertTriangle size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Eliminar Modalidad?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            Se eliminará la modalidad <strong style={{color: '#000'}}>{modalidadAEliminar?.nombre}</strong> ({modalidadAEliminar?.codigo}). Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={() => setModalidadAEliminar(null)}
                            disabled={eliminando}
                            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover':{backgroundColor: '#f1f5f9'} }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmarEliminacion}
                            variant="contained"
                            disabled={eliminando}
                            sx={{
                                backgroundColor: '#ef4444',
                                '&:hover': { backgroundColor: '#dc2626' },
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Fade>
    );
}