import api from './api';

export const facultadService = {
    // Listar todas las facultades
    listar: async (params = {}) => {
        const response = await api.get('/facultades', { params });
        return response.data;
    },

    // Obtener detalle de una facultad por ID o código
    obtener: async (idOrCodigo) => {
        const response = await api.get(`/facultades/${encodeURIComponent(idOrCodigo)}`);
        return response.data.data || response.data;
    },

    // Registrar una nueva facultad
    registrar: async (datos) => {
        const response = await api.post('/facultades', {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Actualizar facultad por ID o código
    actualizar: async (idOrCodigo, datos) => {
        const response = await api.put(`/facultades/${encodeURIComponent(idOrCodigo)}`, {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Eliminar facultad por ID o código
    eliminar: async (idOrCodigo) => {
        const response = await api.delete(`/facultades/${encodeURIComponent(idOrCodigo)}`);
        return response.data;
    },
};