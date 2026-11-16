import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
// node:sqlite é nativo do Node >= 22.13: sem dependências nativas para compilar.
import { DatabaseSync } from 'node:sqlite';
import { env } from './env';
import { ensureSeed, applyContentMigrations } from './cms/seed';
import { ensureBootstrapAdmin } from './auth/bootstrap';

type G = { __grifoDb?: DatabaseSync };
const g = globalThis as unknown as G;

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
    totp_secret TEXT,
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,               -- sha256 do token (o token em si nunca é salvo)
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    mfa_pending INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    draft TEXT NOT NULL,
    published TEXT,
    draft_seo TEXT NOT NULL DEFAULT '{}',
    published_seo TEXT,
    placeholder INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    published_at INTEGER,
    updated_by INTEGER,
    UNIQUE(type, slug)
  );
  CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type, sort);
  CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    seo TEXT NOT NULL DEFAULT '{}',
    user_id INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_revisions_doc ON revisions(document_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt TEXT NOT NULL DEFAULT '',
    uploaded_by INTEGER,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    segment TEXT NOT NULL,
    demand TEXT NOT NULL,
    message TEXT,
    form TEXT NOT NULL DEFAULT 'contato',
    extra TEXT NOT NULL DEFAULT '{}',
    consent_at INTEGER NOT NULL,
    consent_version TEXT NOT NULL,
    utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
    landing_page TEXT, referrer TEXT, page TEXT,
    ip_hash TEXT,
    status TEXT NOT NULL DEFAULT 'novo',
    notes TEXT NOT NULL DEFAULT '',
    crm_status TEXT NOT NULL DEFAULT 'pendente',
    crm_response TEXT,
    notified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    window_start INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    target TEXT,
    detail TEXT,
    ip_hash TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
];

function open(): DatabaseSync {
  fs.mkdirSync(env.dataDir, { recursive: true });
  fs.mkdirSync(path.join(env.dataDir, 'uploads'), { recursive: true });
  const db = new DatabaseSync(path.join(env.dataDir, 'grifo.db'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;');
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (v INTEGER NOT NULL)');
  const row = db.prepare('SELECT v FROM schema_version').get() as { v: number } | undefined;
  let v = row?.v ?? 0;
  if (!row) db.prepare('INSERT INTO schema_version (v) VALUES (0)').run();
  while (v < MIGRATIONS.length) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      v += 1;
      db.prepare('UPDATE schema_version SET v = ?').run(v);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
  return db;
}

let booting = false;
export function db(): DatabaseSync {
  if (!g.__grifoDb) {
    g.__grifoDb = open();
    if (!booting) {
      booting = true;
      // Seed e bootstrap do admin rodam uma única vez por processo.
      ensureSeed(g.__grifoDb);
      applyContentMigrations(g.__grifoDb);
      ensureBootstrapAdmin(g.__grifoDb);
    }
  }
  return g.__grifoDb;
}

export const now = () => Date.now();

export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    d.exec('COMMIT');
    return r;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
