/**
 * アクセストークンプレフィックスカラムの追加
 * O(N) scrypt DoS脆弱性の修正
 */

import type { Database } from 'bun:sqlite';

export default {
  version: 2,
  name: 'add_token_prefix',
  up: (db: Database) => {
    // token_prefixカラムを追加
    db.run(`
      ALTER TABLE access_tokens
      ADD COLUMN token_prefix TEXT
    `);

    // token_prefixにインデックスを作成（高速検索のため）
    db.run(`
      CREATE INDEX idx_access_tokens_token_prefix
      ON access_tokens(token_prefix)
    `);
  },
  down: (db: Database) => {
    // インデックスを削除
    db.run('DROP INDEX IF EXISTS idx_access_tokens_token_prefix');

    // SQLiteではALTER TABLE DROP COLUMNが使えないため、テーブル再作成
    db.run(`
      CREATE TABLE access_tokens_backup AS
      SELECT id, server_id, token_hash, expires_at, created_at, updated_at
      FROM access_tokens
    `);

    db.run('DROP TABLE access_tokens');

    db.run(`
      CREATE TABLE access_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      INSERT INTO access_tokens (id, server_id, token_hash, expires_at, created_at, updated_at)
      SELECT id, server_id, token_hash, expires_at, created_at, updated_at
      FROM access_tokens_backup
    `);

    db.run('DROP TABLE access_tokens_backup');
  },
};
