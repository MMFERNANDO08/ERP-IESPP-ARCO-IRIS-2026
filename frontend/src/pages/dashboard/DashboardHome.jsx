import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
// Se agregó el ícono Library para los cursos
import { GraduationCap, User, ShieldAlert, BookOpen, Layers, Building2, Library } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { planEstudioService } from '../../services/planEstudioService';
import { especialidadService } from '../../services/especialidadService';
import { facultadService } from '../../services/facultadService';
import { modalidadService } from '../../services/modalidadService';
import { cursoService } from '../../services/cursoService'; // <-- Importar el servicio de cursos

export default function DashboardHome() {
    const { user, hasRole } = useAuth();
    
    // Estados para contar los registros reales del ERP académico
    const [totalPlanes, setTotalPlanes] = useState(0);
    const [totalEspecialidades, setTotalEspecialidades] = useState(0);
    const [totalFacultades, setTotalFacultades] = useState(0);
    const [totalModalidades, setTotalModalidades] = useState(0);
    const [totalCursos, setTotalCursos] = useState(0); // <-- Nuevo estado para cursos
    const [cargandoStats, setCargandoStats] = useState(true);

    // Cargar estadísticas generales de la institución desde los servicios
    useEffect(() => {
        const cargarEstadisticas = async () => {
            try {
                // Se agregó cursoService al Promise.all
                const [planesRes, espRes, facRes, modRes, cursosRes] = await Promise.all([
                    planEstudioService.listar().catch(() => []),
                    especialidadService.listar().catch(() => []),
                    facultadService.listar().catch(() => []),
                    modalidadService.listar().catch(() => []),
                    cursoService.listar().catch(() => []), 
                ]);

                const extraer = (resp) => {
                    if (Array.isArray(resp)) return resp;
                    if (resp?.data && Array.isArray(resp.data)) return resp.data;
                    if (resp?.data?.data && Array.isArray(resp.data.data)) return resp.data.data;
                    return [];
                };

                setTotalPlanes(extraer(planesRes).length);
                setTotalEspecialidades(extraer(espRes).length);
                setTotalFacultades(extraer(facRes).length);
                setTotalModalidades(extraer(modRes).length);
                setTotalCursos(extraer(cursosRes).length); // <-- Guardar cantidad de cursos
            } catch (error) {
                console.error("Error al cargar estadísticas del dashboard:", error);
            } finally {
                setCargandoStats(false);
            }
        };

        cargarEstadisticas();
    }, []);

    // Contextual icon and information based on user role
    const getRoleBadge = () => {
        if (hasRole('superadmin')) {
            return {
                label: 'Super Administrador',
                color: 'error',
                icon: <ShieldAlert size={32} />,
                desc: 'Tiene control completo sobre todo el ERP y la configuración del sistema.',
            };
        }
        if (hasRole('admin')) {
            return {
                label: 'Administrador',
                color: 'primary',
                icon: <ShieldAlert size={32} />,
                desc: 'Tiene acceso a la gestión de usuarios y módulos administrativos asignados.',
            };
        }
        if (hasRole('docente')) {
            return {
                label: 'Docente',
                color: 'secondary',
                icon: <BookOpen size={32} />,
                desc: 'Acceso al portal docente y gestión académica de asignaturas.',
            };
        }
        if (hasRole('estudiante')) {
            return {
                label: 'Estudiante',
                color: 'info',
                icon: <GraduationCap size={32} />,
                desc: 'Acceso al portal del estudiante, notas, matrículas y trámites.',
            };
        }
        return {
            label: 'Usuario',
            color: 'default',
            icon: <User size={32} />,
            desc: 'Usuario institucional.',
        };
    };

    const roleInfo = getRoleBadge();

    return (
        <Box>
            {/* Header Banner */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    color: 'white',
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'white',
                                color: '#0d9488',
                                fontWeight: 'bold',
                                fontSize: '1.8rem',
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" fontWeight="bold">
                            ¡Bienvenido(a), {user?.name}!
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Panel institucional del IESPP Arco Iris.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Quick Stat Cards (Módulos Académicos) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, borderLeft: '4px solid #0d9488', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    PLANES DE ESTUDIO
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'var(--slate-900)' }}>
                                    {cargandoStats ? '...' : totalPlanes}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', width: 48, height: 48 }}>
                                <BookOpen size={24} />
                            </Avatar>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, borderLeft: '4px solid #0284c7', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    ESPECIALIDADES
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'var(--slate-900)' }}>
                                    {cargandoStats ? '...' : totalEspecialidades}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', width: 48, height: 48 }}>
                                <GraduationCap size={24} />
                            </Avatar>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, borderLeft: '4px solid #6366f1', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    FACULTADES
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'var(--slate-900)' }}>
                                    {cargandoStats ? '...' : totalFacultades}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', width: 48, height: 48 }}>
                                <Building2 size={24} />
                            </Avatar>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, borderLeft: '4px solid #f59e0b', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    MODALIDADES
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'var(--slate-900)' }}>
                                    {cargandoStats ? '...' : totalModalidades}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 48, height: 48 }}>
                                <Layers size={24} />
                            </Avatar>
                        </CardContent>
                    </Card>
                </Grid>

                {/* <-- Nueva Card para Cursos --> */}
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ borderRadius: 3, borderLeft: '4px solid #8b5cf6', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                    CURSOS REGISTRADOS
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'var(--slate-900)' }}>
                                    {cargandoStats ? '...' : totalCursos}
                                </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: 48, height: 48 }}>
                                <Library size={24} />
                            </Avatar>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Profile & Role Info Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: `${roleInfo.color}.light`, color: `${roleInfo.color}.main` }}>
                                    {roleInfo.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Perfil y Rol Asignado
                                    </Typography>
                                    <Chip
                                        label={roleInfo.label}
                                        color={roleInfo.color}
                                        size="small"
                                        sx={{ mt: 0.5, fontWeight: 'bold' }}
                                    />
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                {roleInfo.desc}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Datos de la Sesión Actual
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>Nombre:</strong> {user?.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Correo Electrónico:</strong> {user?.email}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Estado:</strong> {user?.is_active ? 'Activo' : 'Inactivo'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}