import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';


const currentDir = path.dirname(fileURLToPath(import.meta.url));

const databasePath = path.resolve(currentDir, '../../database/central.db')

mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT NOT NULL,
    priority    TEXT NOT NULL CHECK (priority IN ('Baixa', 'Média', 'Alta')),
    status      TEXT NOT NULL DEFAULT 'Aberta'
                CHECK (status IN ('Aberta', 'Em andamento', 'Concluída')),
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS status_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id      INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    new_status      TEXT NOT NULL,
    changed_at      TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
  CREATE INDEX IF NOT EXISTS idx_history_request ON status_history(request_id);
`);

export function runInTransaction(callback) {
  return db.transaction(callback)();
}

export default db;


