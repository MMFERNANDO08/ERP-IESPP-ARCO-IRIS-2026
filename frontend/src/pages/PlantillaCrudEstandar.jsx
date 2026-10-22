import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Chip, FormControlLabel, Checkbox,
    Grid, MenuItem, InputAdornment, Switch
} from '@mui/material';
import {
    Plus, Search, RefreshCw, Pencil, Trash2, X, Calendar, AlertTriangle
} from 'lucide-react';

// ============================================================================
// 1. IMPORTAR EL SERVICIO Y TEMA DE COLORES
// ============================================================================
import { periodoService as crudService } from '../../services/periodoService';
import { THEME_COLORS } from '../../theme/colors';

// ============================================================================
// 2. CONFIGURACIÓN ESTÁNDAR DEL MÓDULO (PERIODO)
// ============================================================================
const CONFIG = {
    titulo: 'Gestión de Periodos Académicos',
    subtitulo: 'Administra los ciclos académicos, aperturas de actas y accesos web institucionales.',
    entidadSingular: 'Periodo',
    entidadPlural: 'periodos',
    llavePrimaria: 'codigo',
    placeholderBusqueda: 'Buscar por código (ej. 20262) o nombre (ej. 2026-II)...',
    mostrarFiltroActivos: false, // Usaremos un filtro específico de estado si se requiere, o se gestiona vía búsqueda
    tamanoModal: 'md', 
    IconoModulo: Calendar,
};

// ============================================================================
// 3. ESTADO INICIAL DEL FORMULARIO
// ============================================================================
const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    flag_per: '1',
    flag_cur: '0',
    activo: 'ABIERTO',
    web_adm: '1',
    web_doc: '1',
    web_alu: '1',
    inicio: '',
    fin: '',
};

function obtenerErrores(error) {
    const errores = error?.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error?.response?.data?.message || error?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function GestionPeriodos() {
    const [registros, setRegistros] = useState([]);
    const [totalServidor, setTotalServidor] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    const [registroAEliminar, setRegistroAEliminar] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };
    const { IconoModulo } = CONFIG;

    const cargarRegistros = useCallback(async () => {
        setCargando(true);
        try {
            const params = {
                page: pagina + 1,
                per_page: filasPorPagina,
            };
            if (busqueda.trim()) params.buscar = busqueda.trim();

            const respuesta = await crudService.listar(params);

            if (Array.isArray(respuesta)) {
                setRegistros(respuesta);
                setTotalServidor(null);
            } else if (Array.isArray(respuesta?.data)) {
                setRegistros(respuesta.data);
                setTotalServidor(typeof respuesta.total === 'number' ? respuesta.total : null);
            } else {
                setRegistros([]);
                setTotalServidor(0);
            }
        } catch (error) {
            setRegistros([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, pagina, filasPorPagina]);

    useEffect(() => {
        cargarRegistros();
    }, [cargarRegistros]);

    const actualizarCampo = (campo, valor) => {
        setFormulario((prev) => ({ ...prev, [campo]: valor }));
    };

    const abrirModalNuevo = () => {
        setIdEdicion(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirModalEdicion = async (fila) => {
        const identificador = fila[CONFIG.llavePrimaria];
        try {
            const detalle = await crudService.obtener(identificador);
            const dataObj = detalle?.data || detalle;
            setIdEdicion(identificador);
            setFormulario({
                ...FORMULARIO_VACIO,
                ...dataObj,
                inicio: dataObj.inicio ? String(dataObj.inicio).slice(0, 10) : '',
                fin: dataObj.fin ? String(dataObj.fin).slice(0, 10) : '',
            });
            setModalAbierto(true);
        } catch {
            setIdEdicion(identificador);
            setFormulario({
                ...FORMULARIO_VACIO,
                ...fila,
                inicio: fila.inicio ? String(fila.inicio).slice(0, 10) : '',
                fin: fila.fin ? String(fila.fin).slice(0, 10) : '',
            });
            setModalAbierto(true);
        }
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setIdEdicion(null);
    };

    const guardarRegistro = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const payload = Object.keys(formulario).reduce((acc, key) => {
            const valor = formulario[key];
            acc[key] = typeof valor === 'string' ? valor.trim() : valor;
            return acc;
        }, {});

        if (payload.codigo) {
            payload.codigo = payload.codigo.toUpperCase();
        }

        try {
            if (idEdicion !== null) {
                const res = await crudService.actualizar(idEdicion, payload);
                setFeedback({
                    type: 'success',
                    message: res?.message || `${CONFIG.entidadSingular} actualizado(a) correctamente.`,
                });
            } else {
                const res = await crudService.registrar(payload);
                setFeedback({
                    type: 'success',
                    message: res?.message || `${CONFIG.entidadSingular} registrado(a) correctamente.`,
                });
            }
            setModalAbierto(false);
            setIdEdicion(null);
            await cargarRegistros();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!registroAEliminar) return;
        const identificador = registroAEliminar[CONFIG.llavePrimaria];
        setEliminando(true);

        try {
            const res = await crudService.eliminar(identificador);
            setFeedback({
                type: 'success',
                message: res?.message || `${CONFIG.entidadSingular} eliminado(a) correctamente.`,
            });
            setRegistroAEliminar(null);
            await cargarRegistros();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    const filasVisibles = totalServidor !== null
        ? registros
        : registros.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    const totalRegistros = totalServidor !== null ? totalServidor : registros.length;

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>

            {/* ENCABEZADO */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                        {CONFIG.titulo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                        {CONFIG.subtitulo}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={abrirModalNuevo}
                    sx={{
                        backgroundColor: THEME_COLORS.primary,
                        '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 2.5,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                    }}
                >
                    {`Nuevo ${CONFIG.entidadSingular}`}
                </Button>
            </Box>

            {/* FEEDBACK */}
            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {feedback.message}
                </Alert>
            )}

            {/* FILTROS */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${THEME_COLORS.border}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', flex: 1 }}>
                    <TextField
                        placeholder={CONFIG.placeholderBusqueda}
                        size="small"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(0);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && cargarRegistros()}
                        sx={{ width: { xs: '100%', sm: 420 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} style={{ color: THEME_COLORS.textSecondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Search size={16} />}
                        onClick={() => { setPagina(0); cargarRegistros(); }}
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={16} />}
                        onClick={() => {
                            setBusqueda('');
                            setPagina(0);
                        }}
                        size="small"
                        sx={{ textTransform: 'none', color: THEME_COLORS.textSecondary, borderColor: THEME_COLORS.border }}
                    >
                        Limpiar
                    </Button>
                </Box>
            </Paper>

            {/* TABLA */}
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Flag Per</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Flag Cur</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Estado</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Web Adm</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Web Doc</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Web Alu</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Inicio</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Fin</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : filasVisibles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                    <IconoModulo size={40} color={THEME_COLORS.border} style={{ marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {`No se encontraron ${CONFIG.entidadPlural}`}
                                    </Typography>
                                    <Typography variant="body2">
                                        Ajusta los criterios de búsqueda o registra un nuevo elemento.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filasVisibles.map((item) => {
                                const clave = item[CONFIG.llavePrimaria];
                                const esAbierto = item.activo === 'ABIERTO';
                                return (
                                    <TableRow hover key={clave}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                                                {item.codigo}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                                {item.nombre}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={String(item.flag_per) === '1' ? 'Sí' : 'No'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={String(item.flag_cur) === '1' ? 'Sí' : 'No'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={item.activo}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.72rem',
                                                    backgroundColor: esAbierto ? '#dcfce7' : '#fee2e2',
                                                    color: esAbierto ? '#166534' : '#991b1b',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={String(item.web_adm) === '1' ? 'Sí' : 'No'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={String(item.web_doc) === '1' ? 'Sí' : 'No'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={String(item.web_alu) === '1' ? 'Sí' : 'No'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                                {item.inicio ? String(item.inicio).slice(0, 10) : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                                {item.fin ? String(item.fin).slice(0, 10) : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Editar Periodo">
                                                    <IconButton
                                                        onClick={() => abrirModalEdicion(item)}
                                                        size="small"
                                                        sx={{
                                                            color: THEME_COLORS.primary,
                                                            backgroundColor: '#f0f9ff',
                                                            borderRadius: 2,
                                                            '&:hover': { backgroundColor: '#e0f2fe' },
                                                        }}
                                                    >
                                                        <Pencil size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar Periodo">
                                                    <IconButton
                                                        onClick={() => setRegistroAEliminar(item)}
                                                        size="small"
                                                        sx={{
                                                            color: '#dc2626',
                                                            backgroundColor: '#fef2f2',
                                                            borderRadius: 2,
                                                            '&:hover': { backgroundColor: '#fee2e2' },
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={totalRegistros}
                    page={pagina}
                    onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
                    rowsPerPage={filasPorPagina}
                    onRowsPerPageChange={(e) => {
                        setFilasPorPagina(parseInt(e.target.value, 10));
                        setPagina(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    sx={{ borderTop: `1px solid ${THEME_COLORS.border}` }}
                />
            </TableContainer>

            {/* MODAL CREAR / EDITAR */}
            <Dialog
                open={modalAbierto}
                onClose={cerrarModal}
                fullWidth
                maxWidth={CONFIG.tamanoModal}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={guardarRegistro}>
                    <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
                                <IconoModulo size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {idEdicion !== null ? `Actualizar Periodo (${idEdicion})` : 'Nuevo Periodo'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                    Configuración de ciclos y permisos institucionales
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={cerrarModal} size="small" sx={{ backgroundColor: '#f1f5f9' }}>
                            <X size={18} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Periodo (Código)"
                                    placeholder="Ej. 20262"
                                    size="small"
                                    value={formulario.codigo}
                                    disabled={idEdicion !== null}
                                    onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nombre"
                                    placeholder="Ej. 2026-II"
                                    size="small"
                                    value={formulario.nombre}
                                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formulario.flag_per === '1'}
                                            onChange={(e) => actualizarCampo('flag_per', e.target.checked ? '1' : '0')}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Flag Per</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formulario.flag_cur === '1'}
                                            onChange={(e) => actualizarCampo('flag_cur', e.target.checked ? '1' : '0')}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Flag Cur</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formulario.web_adm === '1'}
                                            onChange={(e) => actualizarCampo('web_adm', e.target.checked ? '1' : '0')}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Web Adm</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formulario.web_doc === '1'}
                                            onChange={(e) => actualizarCampo('web_doc', e.target.checked ? '1' : '0')}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Web Doc</Typography>}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formulario.web_alu === '1'}
                                            onChange={(e) => actualizarCampo('web_alu', e.target.checked ? '1' : '0')}
                                        />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Web Alu</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label="Estado Activo"
                                    size="small"
                                    value={formulario.activo}
                                    onChange={(e) => actualizarCampo('activo', e.target.value)}
                                    sx={inputStyle}
                                >
                                    <MenuItem value="ABIERTO">ABIERTO (Permite re-abrir actas, registrar asistencia)</MenuItem>
                                    <MenuItem value="CERRADO">CERRADO</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    type="date"
                                    label="Fecha Inicio"
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={formulario.inicio}
                                    onChange={(e) => actualizarCampo('inicio', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    type="date"
                                    label="Fecha Fin"
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                    value={formulario.fin}
                                    onChange={(e) => actualizarCampo('fin', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                        <Button
                            onClick={cerrarModal}
                            disabled={guardando}
                            sx={{ color: THEME_COLORS.textSecondary, fontWeight: 600, textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={guardando}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            }}
                        >
                            {guardando ? 'Guardando...' : idEdicion !== null ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* MODAL ELIMINAR */}
            <Dialog
                open={Boolean(registroAEliminar)}
                onClose={() => !eliminando && setRegistroAEliminar(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ backgroundColor: '#fef2f2', color: '#dc2626', p: 1, borderRadius: 2, display: 'flex' }}>
                        <AlertTriangle size={20} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Confirmar Eliminación
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                        ¿Estás seguro de que deseas eliminar el periodo <strong>{registroAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                    <Button
                        onClick={() => setRegistroAEliminar(null)}
                        disabled={eliminando}
                        sx={{ color: THEME_COLORS.textSecondary, fontWeight: 600, textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmarEliminacion}
                        variant="contained"
                        disabled={eliminando}
                        sx={{
                            backgroundColor: '#dc2626',
                            '&:hover': { backgroundColor: '#b91c1c' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                        }}
                    >
                        {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}