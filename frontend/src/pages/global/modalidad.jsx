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

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: 'REGULAR',
    descripcion: 'Programa ofertado por el Instituto Arco Iris',
    estado: 'ACTIVO',
};

export default function Modalidades() {
    const [modalidades, setModalidades] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [feedback, setFeedback] = useState(null);
    
    // Estados para búsqueda y filtros
    const [busqueda, setBusqueda] = useState('');
    const [soloActivas, setSoloActivas] = useState(false);

    // Estados del Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Estado para confirmar eliminación
    const [modalidadAEliminar, setModalidadAEliminar] = useState(null);

    // Cargar datos con filtros
    const cargarModalidades = useCallback(async () => {
        setCargando(true);
        try {
            // Nota: Aquí podrías enviar los parámetros de búsqueda al backend si lo deseas
            // const res = await axios.get(`/api/plan-estudios/modalidades-crud?buscar=${busqueda}`);
            const res = await axios.get('/api/plan-estudios/modalidades-crud');
            setModalidades(res.data);
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'Error al cargar las modalidades.' });
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarModalidades();
    }, [cargarModalidades]);

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
        setFormulario(FORMULARIO_VACIO);
        setModalAbierto(true);
    };

    const handleEditar = (modalidad) => {
        setEditandoId(modalidad.id);
        setFormulario({
            codigo: modalidad.codigo,
            nombre: modalidad.nombre,
            descripcion: modalidad.descripcion || '',
            estado: modalidad.estado,
        });
        setModalAbierto(true);
    };

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
    );
}