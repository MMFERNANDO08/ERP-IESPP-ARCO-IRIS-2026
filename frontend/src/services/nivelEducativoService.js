import api from './api';

export const nivelEducativoService = {
    // Listar todos los niveles educativos
    listar: async (params = {}) => {
        const response = await api.get('/niveles-educativos', { params });
        return response.data;
    },

    // Obtener detalle de un nivel educativo por ID o código
    obtener: async (idOrCodigo) => {
        const response = await api.get(`/niveles-educativos/${encodeURIComponent(idOrCodigo)}`);
        return response.data.data || response.data;
    },

    // Registrar un nuevo nivel educativo
    registrar: async (datos) => {
        const response = await api.post('/niveles-educativos', {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Actualizar nivel educativo por ID o código
    actualizar: async (idOrCodigo, datos) => {
        const response = await api.put(`/niveles-educativos/${encodeURIComponent(idOrCodigo)}`, {
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            estado: datos.estado || 'ACTIVO',
        });
        return response.data;
    },

    // Eliminar nivel educativo por ID o código
    eliminar: async (idOrCodigo) => {
        const response = await api.delete(`/niveles-educativos/${encodeURIComponent(idOrCodigo)}`);
        return response.data;
    },
};