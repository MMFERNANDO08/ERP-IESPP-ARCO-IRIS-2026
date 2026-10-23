import api from './api';

export const periodoService = {
    listar: async (params = {}) => {
        const response = await api.get('/periodos', { params });
        return response.data;
    },

    obtener: async (codigo) => {
        const response = await api.get(`/periodos/${encodeURIComponent(codigo)}`);
        return response.data.data;
    },

    registrar: async (datos) => {
        const response = await api.post('/periodos', datos);
        return response.data;
    },

    actualizar: async (codigo, datos) => {
        const response = await api.put(`/periodos/${encodeURIComponent(codigo)}`, datos);
        return response.data;
    },

    eliminar: async (codigo) => {
        const response = await api.delete(`/periodos/${encodeURIComponent(codigo)}`);
        return response.data;
    },
};