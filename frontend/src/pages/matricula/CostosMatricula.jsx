import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, TextField, MenuItem, Button, Paper
} from '@mui/material';
import axios from 'axios';

export default function CostosMatricula() {
    // Estados para los datos de los combos
    const [modalidades, setModalidades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [periodos, setPeriodos] = useState([]);

    // Estados para los valores seleccionados
    const [filtros, setFiltros] = useState({
        modalidad_id: '',
        periodo_id: '2026-II', // Valor por defecto como en tu imagen
        tipo_matricula: 'REGULAR',
        programa_id: '',
        carrera_id: '',
        sede: 'PRINCIPAL'
    });

    // Cargar datos de la BD al iniciar
        useEffect(() => {
        const cargarCombos = async () => {
            try {
                const [resMod, resProg, resPer] = await Promise.all([
                    axios.get('/api/matricula/modalidades'), 
                    axios.get('/api/matricula/programas'),   
                    axios.get('/api/matricula/periodos')     
                ]);
                setModalidades(resMod.data);
                setProgramas(resProg.data);
                setPeriodos(resPer.data);
            } catch (error) {
                console.error("Error cargando combos", error);
            }
        };
        cargarCombos();
    }, []);

    const handleChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const handleVerCostos = () => {
        console.log("Buscando costos para:", filtros);
        // Aquí irá la lógica para llamar al backend y traer la tabla de costos
    };

    // Estilo común para los selectores
    const selectStyle = { 
        backgroundColor: '#fff',
        '& .MuiOutlinedInput-root': { borderRadius: 1 } 
    };

    return (
        <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl" disableGutters>
                
                {/* Título de la página */}
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600, mb: 3, fontSize: '0.95rem' }}>
                    COSTOS DE MATRICULA
                </Typography>

                {/* Formulario de Filtros */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    {/* Fila 1 */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Seleccionar Modalidad:
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="modalidad_id"
                            value={filtros.modalidad_id} onChange={handleChange} sx={selectStyle}
                        >
                            <MenuItem value="">== SELECCIONE ==</MenuItem>
                            {modalidades.map((mod) => (
                                <MenuItem key={mod.id} value={mod.id}>{mod.nombre}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Seleccionar Periodo:
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="periodo_id"
                            value={filtros.periodo_id} onChange={handleChange} sx={selectStyle}
                        >
                            {periodos.map((per) => (
                                <MenuItem key={per.id} value={per.id}>{per.nombre}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Tipo Matrícula:
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="tipo_matricula"
                            value={filtros.tipo_matricula} onChange={handleChange} sx={selectStyle}
                        >
                            <MenuItem value="REGULAR">REGULAR</MenuItem>
                            <MenuItem value="EXTEMPORANEA">EXTEMPORANEA</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Fila 2 */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Seleccionar Prog. Académico:
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="programa_id"
                            value={filtros.programa_id} onChange={handleChange} sx={selectStyle}
                        >
                            <MenuItem value="">== SELECCIONE ==</MenuItem>
                            {programas.map((prog) => (
                                <MenuItem key={prog.id} value={prog.id}>{prog.nombre}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Seleccionar Carrera
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="carrera_id"
                            value={filtros.carrera_id} onChange={handleChange} sx={selectStyle}
                            disabled // Deshabilitado hasta elegir programa (lógica pendiente)
                        >
                            <MenuItem value="">== SELECCIONE ==</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                            Seleccionar Sede
                        </Typography>
                        <TextField
                            select fullWidth size="small" name="sede"
                            value={filtros.sede} onChange={handleChange} sx={selectStyle}
                        >
                            <MenuItem value="PRINCIPAL">PRINCIPAL</MenuItem>
                            <MenuItem value="FILIAL">FILIAL</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Botón Verde */}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleVerCostos}
                            sx={{
                                backgroundColor: '#84cc16', // Verde lima de tu imagen
                                color: '#fff',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 0.8,
                                mt: 1,
                                '&:hover': { backgroundColor: '#65a30d' }
                            }}
                        >
                            Ver Costos
                        </Button>
                    </Grid>
                </Grid>

                {/* Espacio reservado para la Tabla de Costos (Futuro) */}
                <Paper sx={{ p: 4, textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }} elevation={0}>
                    Los resultados de los costos se mostrarán aquí.
                </Paper>

            </Container>
        </Box>
    );
}