import api from './api';

export const modalidadService = {
    // Listar todas las modalidades (con soporte de parámetros de filtro como solo_activos)
    listar: async (params = {}) => {
        const response = await api.get('/modalidades', { params });
        return response.data;
    },

    // Obtener detalle de una modalidad por su ID o código
    obtener: async (idOrCodigo) => {
        const response = await api.get(`/modalidades/${encodeURIComponent(idOrCodigo)}`);
        return response.data.data || response.data;
    },

    // Registrar una nueva modalidad
    registrar: async (datos) => {
        const response = await api.post('/modalidades', {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Actualizar una modalidad existente por ID o código
    actualizar: async (idOrCodigo, datos) => {
        const response = await api.put(`/modalidades/${encodeURIComponent(idOrCodigo)}`, {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Eliminar modalidad por ID o código
    eliminar: async (idOrCodigo) => {
        const response = await api.delete(`/modalidades/${encodeURIComponent(idOrCodigo)}`);
        return response.data;
    },
};