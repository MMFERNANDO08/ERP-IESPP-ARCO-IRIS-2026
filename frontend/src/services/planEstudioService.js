import api from './api';

export const planEstudioService = {
    // Listar planes de estudio con filtros opcionales (modalidad, programa, carrera_codigo)
    listar: async (params = {}) => {
        const response = await api.get('/planes-estudio', { params });
        return response.data;
    },

    // Obtener detalle de un plan de estudio por ID o código
    obtener: async (id) => {
        const response = await api.get(`/planes-estudio/${encodeURIComponent(id)}`);
        return response.data?.data || response.data;
    },

    // Registrar un nuevo plan de estudio
    registrar: async (datos) => {
        const response = await api.post('/planes-estudio', {
            curricula: datos.curricula,
            resolucion: datos.resolucion || '',
            modalidad: datos.modalidad || 'REGULAR',
            programa_academico: datos.programa_academico || '',
            especialidad_codigo: datos.especialidad_codigo || datos.carrera_id || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Actualizar datos de un plan de estudio existente
    actualizar: async (id, datos) => {
        const response = await api.put(`/planes-estudio/${encodeURIComponent(id)}`, datos);
        return response.data;
    },

    // Cambiar estado (ACTIVO / INACTIVO) de un plan de estudio
    cambiarEstado: async (id, estado) => {
        const response = await api.patch(`/planes-estudio/${encodeURIComponent(id)}/estado`, { estado });
        return response.data;
    },

    // Eliminar un plan de estudio por ID
    eliminar: async (id) => {
        const response = await api.delete(`/planes-estudio/${encodeURIComponent(id)}`);
        return response.data;
    },

    // Obtener cursos asociados a un plan de estudio puntual
    obtenerCursos: async (planId, params = {}) => {
        const response = await api.get(`/planes-estudio/${encodeURIComponent(planId)}/cursos`, { params });
        return response.data;
    },

    // Obtener módulos formativos asociados a un plan de estudio puntual
    obtenerModulos: async (planId, params = {}) => {
        const response = await api.get(`/planes-estudio/${encodeURIComponent(planId)}/modulos`, { params });
        return response.data;
    },
};