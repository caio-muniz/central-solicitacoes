import axios from 'axios';

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export class ApiError extends Error {
  constructor(message, fields) {
    super(message);
    this.fields = fields || {};
  }
}

function toApiError(error) {
  if (error.response?.data?.error) {
    const { message, fields } = error.response.data.error;
    return new ApiError(message, fields);
  }
  if (error.request) {
    return new ApiError('Não foi possível conectar ao servidor. Verifique se a API está em execução.');
  }
  return new ApiError('Ocorreu um erro inesperado. Tente novamente.');
}

async function call(config) {
  try {
    const response = await http(config);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export const getMeta = () => call({ url: '/meta' }).then((body) => body.data);
export const getDashboard = () => call({ url: '/dashboard' }).then((body) => body.data);
export const listRequests = (params) => call({ url: '/requests', params });
export const getRequest = (id) => call({ url: `/requests/${id}` }).then((body) => body.data);
export const getHistory = (id) => call({ url: `/requests/${id}/history` }).then((body) => body.data);
export const createRequest = (data) =>
  call({ url: '/requests', method: 'post', data }).then((body) => body.data);
export const advanceStatus = (id, status) =>
  call({ url: `/requests/${id}/status`, method: 'patch', data: { status } }).then((body) => body.data);
