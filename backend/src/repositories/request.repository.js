
import db from '../config/database.js';

// Permitir apenas ordenações previamente definidas
const ORDER_BY = {
  recent: 'created_at DESC, id DESC',
  oldest: 'created_at ASC, id ASC',
};

// Escapa caracteres especiais do LIKE para a buscaconsiderar %, _ e \ como caracteres comuns
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

// Cadastrar uma solicitação com status inicial "Aberta". Usamos o horário para manter o controle das datas na camada de serviços
export function create({ title, description, category, priority, now }) {
  const result = db
    .prepare(
      `INSERT INTO requests (
        title, description, category, priority,
        status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 'Aberta', ?, ?)`
    )
    .run(title, description, category, priority, now, now);

  return findById(result.lastInsertRowid);
}

// Buscar uma solicitação pelo seu id
export function findById(id) {
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
}

// Lista solicitações aplicando filtros opcionais, os valores são enviados por parâmetros para evitar SQL injection
export function findAll({ status, priority, search, sort }) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (search) {
    const term = `%${escapeLike(search)}%`;

    conditions.push(
      "(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')"
    );

    params.push(term, term);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // A ordenação utiliza somente opções previamente autorizadas
  const orderBy = ORDER_BY[sort] ?? ORDER_BY.recent;

  return db
    .prepare(`SELECT * FROM requests ${where} ORDER BY ${orderBy}`)
    .all(...params);
}

// Atualiza o status e a data da última modificação.
export function updateStatus(id, status, now) {
  db.prepare(
    'UPDATE requests SET status = ?, updated_at = ? WHERE id = ?'
  ).run(status, now, id);

  return findById(id);
}

// Função para atualizar uma solicitacao
export function update(id, { title, description, category, priority, now }) {
  db.prepare(
    `UPDATE requests
     SET title = ?, description = ?, category = ?, priority = ?, updated_at = ?
     WHERE id = ?`
  ).run(title, description, category, priority, now, id);
  return findById(id);
}

// Funçao para excluir uma solicitação
export function remove(id) {
  db.prepare('DELETE FROM requests WHERE id = ?').run(id);
}

export function countByStatus() {
  return db
    .prepare(`
      SELECT status, COUNT(*) AS total
      FROM requests
      GROUP BY status
    `)
    .all();
}

export function findRecent(limit = 5) {
  return db
    .prepare(`
      SELECT *
      FROM requests
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `)
    .all(limit);
}
