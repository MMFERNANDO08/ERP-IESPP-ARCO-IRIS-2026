import api from './api';

export const tipoPagoService = {
    listar: async (params = {}) => {
        const response = await api.get('/tipos-pago', { params });
        return response.data;
    },

    obtener: async (id) => {
        const response = await api.get(`/tipos-pago/${id}`);
        return response.data.data;
    },

    registrar: async (datos) => {
        const response = await api.post('/tipos-pago', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/tipos-pago/${id}`, datos);
        return response.data;
    },

    cambiarEstado: async (id, estado) => {
        const response = await api.patch(`/tipos-pago/${id}/estado`, { estado });
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/tipos-pago/${id}`);
        return response.data;
    },
};