import { runInTransaction } from '../config/database.js';
import * as requestRepository from '../repositories/request.repository.js';
import * as historyRepository from '../repositories/history.repository.js';
import { AppError } from '../utils/app-error.js';


// Define a sequência obrigatória de evolução das solicitações
export const STATUS_FLOW = ['Aberta', 'Em andamento', 'Concluída'];
export const PRIORITIES = ['Baixa', 'Média', 'Alta'];
export const CATEGORIES = [
  'Suporte de TI',
  'Infraestrutura',
  'Recursos Humanos',
  'Financeiro',
  'Compras',
  'Outros',
];
export const SORT_OPTIONS = ['recent', 'oldest'];

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 2000;
const RECENT_LIMIT = 5;

function getNextStatus(status) {
  const index = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW[index + 1] ?? null;
}

// Converte os dados do banco para o formato utilizado pela API
function toRequestResponse(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    nextStatus: getNextStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toHistoryResponse(row) {
  return {
    id: row.id,
    requestId: row.request_id,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    changedAt: row.changed_at,
  };
}

// Remove espaços extras e garante que o valor seja uma string
function asTrimmedText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Valida os dados recebidos antes de realizar o cadastro
function validateRequestData(input = {}, action) {
  const data = {
    title: asTrimmedText(input.title),
    description: asTrimmedText(input.description),
    category: asTrimmedText(input.category),
    priority: asTrimmedText(input.priority),
  };
  const fields = {};

  if (!data.title) fields.title = 'O título é obrigatório.';
  else if (data.title.length > TITLE_MAX_LENGTH)
    fields.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`;

  if (!data.description) fields.description = 'A descrição é obrigatória.';
  else if (data.description.length > DESCRIPTION_MAX_LENGTH)
    fields.description = `A descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;

  if (!data.category) fields.category = 'A categoria é obrigatória.';
  else if (!CATEGORIES.includes(data.category))
    fields.category = `Categoria inválida. Valores aceitos: ${CATEGORIES.join(', ')}.`;

  if (!data.priority) fields.priority = 'A prioridade é obrigatória.';
  else if (!PRIORITIES.includes(data.priority))
    fields.priority = `Prioridade inválida. Valores aceitos: ${PRIORITIES.join(', ')}.`;

  if (Object.keys(fields).length > 0) {
    throw new AppError(400, `Não foi possível ${action} a solicitação. Revise os campos.`, fields);
  }
  return data;
}

function validateFilters(query = {}) {
  const status = asTrimmedText(query.status);
  const priority = asTrimmedText(query.priority);
  const search = asTrimmedText(query.search);
  const sort = asTrimmedText(query.sort) || 'recent';

  if (status && !STATUS_FLOW.includes(status))
    throw new AppError(400, `Status inválido. Valores aceitos: ${STATUS_FLOW.join(', ')}.`);
  if (priority && !PRIORITIES.includes(priority))
    throw new AppError(400, `Prioridade inválida. Valores aceitos: ${PRIORITIES.join(', ')}.`);
  if (!SORT_OPTIONS.includes(sort))
    throw new AppError(400, `Ordenação inválida. Valores aceitos: ${SORT_OPTIONS.join(', ')}.`);

  return { status, priority, search, sort };
}

function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'O identificador da solicitação deve ser um número inteiro positivo.');
  }
  return id;
}

// Garante que a solicitação exista antes de executar operações
function findExistingRequest(rawId) {
  const id = parseId(rawId);
  const row = requestRepository.findById(id);
  if (!row) throw new AppError(404, `Solicitação ${id} não encontrada.`);
  return row;
}

export function getMetadata() {
  return { categories: CATEGORIES, priorities: PRIORITIES, statuses: STATUS_FLOW };
}

export function createRequest(input) {
  const data = validateRequestData(input, 'cadastrar');
  const row = requestRepository.create({ ...data, now: new Date().toISOString() });
  return toRequestResponse(row);
}

export function updateRequest(rawId, input) {
  const request = findExistingRequest(rawId);
  const data = validateRequestData(input, 'atualizar');
  const row = requestRepository.update(request.id, { ...data, now: new Date().toISOString() });
  return toRequestResponse(row);
}

export function deleteRequest(rawId) {
  const request = findExistingRequest(rawId);
  requestRepository.remove(request.id);
  return { id: request.id };
}

export function listRequests(query) {
  return requestRepository.findAll(validateFilters(query)).map(toRequestResponse);
}

export function getRequest(rawId) {
  return toRequestResponse(findExistingRequest(rawId));
}

export function getRequestHistory(rawId) {
  const request = findExistingRequest(rawId);
  return historyRepository.findByRequestId(request.id).map(toHistoryResponse);
}

// Avança a solicitação somente para o próximo status permitido
export function advanceStatus(rawId, input = {}) {
  const request = findExistingRequest(rawId);
  const targetStatus = asTrimmedText(input.status);

  if (!targetStatus) throw new AppError(400, 'Informe o novo status no campo "status".');
  if (!STATUS_FLOW.includes(targetStatus))
    throw new AppError(400, `Status inválido. Valores aceitos: ${STATUS_FLOW.join(', ')}.`);

  const nextStatus = getNextStatus(request.status);
  if (!nextStatus) {
    throw new AppError(400, 'Esta solicitação já está Concluída e não pode avançar novamente.');
  }
  if (targetStatus !== nextStatus) {
    throw new AppError(
      400,
      `Transição inválida: de "${request.status}" só é possível avançar para "${nextStatus}".`
    );
  }

  const updated = runInTransaction(() => {
    const now = new Date().toISOString();
    const row = requestRepository.updateStatus(request.id, nextStatus, now);
    historyRepository.create({
      requestId: request.id,
      previousStatus: request.status,
      newStatus: nextStatus,
      changedAt: now,
    });
    return row;
  });
  return toRequestResponse(updated);
}

export function getDashboard() {
  const byStatus = Object.fromEntries(STATUS_FLOW.map((status) => [status, 0]));
  for (const { status, total } of requestRepository.countByStatus()) byStatus[status] = total;

  return {
    total: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
    byStatus,
    recent: requestRepository.findRecent(RECENT_LIMIT).map(toRequestResponse),
  };
}
