import api from './api';

export const cursoService = {
    // Listar cursos con filtros opcionales (ej. plan_estudio_id, ciclo)
    listar: async (params = {}) => {
        const response = await api.get('/cursos', { params });
        return response.data;
    },

    // Obtener detalle de un curso por ID
    obtener: async (id) => {
        const response = await api.get(`/cursos/${encodeURIComponent(id)}`);
        return response.data?.data || response.data;
    },

    // Registrar un nuevo curso (asignatura)
    registrar: async (datos) => {
        const response = await api.post('/cursos', {
            plan_estudio_id: datos.plan_estudio_id,
            codigo: datos.codigo,
            nombre: datos.nombre,
            ciclo: datos.ciclo || 'I',
            creditos: datos.creditos,
            horas_teoria: datos.horas_teoria || 0,
            horas_practica: datos.horas_practica || 0,
            tipo: datos.tipo || 'OBLIGATORIO',
            estado: datos.estado || 'ACTIVO'
        });
        return response.data;
    },

    // Actualizar datos de un curso existente
    actualizar: async (id, datos) => {
        const response = await api.put(`/cursos/${encodeURIComponent(id)}`, datos);
        return response.data;
    },

    // Cambiar estado (ACTIVO / INACTIVO) de un curso
    cambiarEstado: async (id, estado) => {
        const response = await api.patch(`/cursos/${encodeURIComponent(id)}/estado`, { estado });
        return response.data;
    },

    // Eliminar un curso por ID
    eliminar: async (id) => {
        const response = await api.delete(`/cursos/${encodeURIComponent(id)}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS ADICIONALES PARA LA SIGUIENTE FASE (Prerrequisitos)
    // --------------------------------------------------------

    // Obtener los prerrequisitos de un curso específico
    obtenerPrerrequisitos: async (id) => {
        const response = await api.get(`/cursos/${encodeURIComponent(id)}/prerrequisitos`);
        return response.data;
    },

    // Asignar un prerrequisito a un curso
    agregarPrerrequisito: async (cursoId, prerrequisitoId) => {
        const response = await api.post(`/cursos/${encodeURIComponent(cursoId)}/prerrequisitos`, {
            prerrequisito_id: prerrequisitoId
        });
        return response.data;
    },

    // Eliminar un prerrequisito de un curso
    eliminarPrerrequisito: async (cursoId, prerrequisitoId) => {
        const response = await api.delete(`/cursos/${encodeURIComponent(cursoId)}/prerrequisitos/${encodeURIComponent(prerrequisitoId)}`);
        return response.data;
    }
};