import { AppError } from '../utils/app-error.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Rota ${req.method} ${req.originalUrl} não encontrada.` } });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, fields: err.fields } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'O corpo da requisição não é um JSON válido.' } });
  }

  console.error(err);
  return res
    .status(500)
    .json({ error: { message: 'Erro inesperado no servidor. Tente novamente em instantes.' } });
}
