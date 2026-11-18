import db from '../config/database.js';


// Registrar no banco uma mudança de status
export function create({ requestId, previousStatus, newStatus, changedAt }) {
    db.prepare(
        `INSERT INTO status_history (request_id, previous_status, new_status, changed_at)
     VALUES (?, ?, ?, ?)`
    ).run(requestId, previousStatus, newStatus, changedAt);
}

// Buscar todo o historico de uma solicitação especifica
export function findByRequestId(requestId) {
    return db
        .prepare('SELECT * FROM status_history WHERE request_id = ? ORDER BY changed_at ASC, id ASC')
        .all(requestId);
}
