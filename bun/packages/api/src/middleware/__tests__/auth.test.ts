/**
 * verifyAccessToken関数のテスト
 * O(N) scrypt DoS脆弱性の修正確認
 */

import { Database } from 'bun:sqlite';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { AccessTokensRepository } from '../../db/repositories/access-tokens';
import { ServersRepository } from '../../db/repositories/servers';
import { verifyAccessToken } from '../../middleware/auth';
import { generateAccessToken, hashPassword } from '../../shared/utils/crypto';

describe('verifyAccessToken', () => {
  let db: Database;
  let serversRepo: ServersRepository;
  let tokensRepo: AccessTokensRepository;

  beforeEach(() => {
    // インメモリデータベースを作成
    db = new Database(':memory:');

    // テーブルを作成
    db.run(`
      CREATE TABLE servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        mac_address TEXT NOT NULL,
        power_status INTEGER NOT NULL DEFAULT 0,
        heartbeat_status INTEGER NOT NULL DEFAULT 0,
        previous_heartbeat_status INTEGER NOT NULL DEFAULT 0,
        heartbeat_interval INTEGER NOT NULL DEFAULT 60,
        last_heartbeat_at DATETIME,
        last_power_changed_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE access_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        token_prefix TEXT,
        expires_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE INDEX idx_access_tokens_token_prefix
      ON access_tokens(token_prefix)
    `);

    serversRepo = new ServersRepository(db);
    tokensRepo = new AccessTokensRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test('正しいトークンでサーバーIDを返す', async () => {
    // サーバー作成
    const serverId = serversRepo.create({
      uuid: crypto.randomUUID(),
      name: 'Test Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    // トークン作成
    const token = generateAccessToken();
    const tokenHash = hashPassword(token);
    const tokenPrefix = token.substring(0, 8);

    tokensRepo.create({
      serverId,
      tokenHash,
      tokenPrefix,
      expiresAt: null,
    });

    // 検証（リポジトリを注入）
    const result = await verifyAccessToken(token, tokensRepo);
    expect(result).toBe(serverId);
  });

  test('間違ったトークンでnullを返す', async () => {
    // サーバー作成
    const serverId = serversRepo.create({
      uuid: crypto.randomUUID(),
      name: 'Test Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    // トークン作成
    const token = generateAccessToken();
    const tokenHash = hashPassword(token);
    const tokenPrefix = token.substring(0, 8);

    tokensRepo.create({
      serverId,
      tokenHash,
      tokenPrefix,
      expiresAt: null,
    });

    // 異なるトークンで検証
    const wrongToken = generateAccessToken();
    const result = await verifyAccessToken(wrongToken, tokensRepo);
    expect(result).toBeNull();
  });

  test('期限切れトークンでnullを返す', async () => {
    // サーバー作成
    const serverId = serversRepo.create({
      uuid: crypto.randomUUID(),
      name: 'Test Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    // 期限切れトークン作成
    const token = generateAccessToken();
    const tokenHash = hashPassword(token);
    const tokenPrefix = token.substring(0, 8);
    const expiresAt = new Date(Date.now() - 1000).toISOString(); // 1秒前に期限切れ

    tokensRepo.create({
      serverId,
      tokenHash,
      tokenPrefix,
      expiresAt,
    });

    // 検証
    const result = await verifyAccessToken(token, tokensRepo);
    expect(result).toBeNull();
  });

  test('複数サーバーが存在してもO(1)で検証できる（token_prefix最適化）', async () => {
    // 100個のサーバーとトークンを作成
    const servers: Array<{ id: number; token: string }> = [];

    for (let i = 0; i < 100; i++) {
      const serverId = serversRepo.create({
        uuid: crypto.randomUUID(),
        name: `Server ${i}`,
        macAddress: `00:11:22:33:44:${i.toString(16).padStart(2, '0')}`,
        heartbeatInterval: 60,
      });

      const token = generateAccessToken();
      const tokenHash = hashPassword(token);
      const tokenPrefix = token.substring(0, 8);

      tokensRepo.create({
        serverId,
        tokenHash,
        tokenPrefix,
        expiresAt: null,
      });

      servers.push({ id: serverId, token });
    }

    // ランダムなサーバーのトークンで検証
    const targetServer = servers[42];
    if (!targetServer) throw new Error('Server not found');

    const startTime = Date.now();
    const result = await verifyAccessToken(targetServer.token, tokensRepo);
    const duration = Date.now() - startTime;

    expect(result).toBe(targetServer.id);

    // O(1)最適化により、100個のサーバーでも高速に検証できる
    // token_prefixで絞り込むため、scryptは1回のみ実行される
    // （従来はO(N)で最悪100回のscryptを実行）
    console.log(`Verification time with 100 servers: ${duration}ms`);
    expect(duration).toBeLessThan(100); // 100ms以内に完了するはず
  });

  test('token_prefixが同じでハッシュが異なる場合は拒否', async () => {
    // サーバー作成
    const serverId = serversRepo.create({
      uuid: crypto.randomUUID(),
      name: 'Test Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    // トークン作成
    const token = 'abcdefgh12345678901234567890ABCD'; // 32文字
    const tokenHash = hashPassword(token);
    const tokenPrefix = token.substring(0, 8); // "abcdefgh"

    tokensRepo.create({
      serverId,
      tokenHash,
      tokenPrefix,
      expiresAt: null,
    });

    // 同じプレフィックスだが異なるトークンで検証
    const fakeToken = 'abcdefghXXXXXXXXXXXXXXXXXXXXXXXX'; // プレフィックス同じ
    const result = await verifyAccessToken(fakeToken, tokensRepo);

    // token_prefixでは引っかかるが、scrypt検証で弾かれる
    expect(result).toBeNull();
  });

  test('token_prefixがnullの既存トークンは検証されない', async () => {
    // マイグレーション前の既存トークン（token_prefix = null）を想定
    const serverId = serversRepo.create({
      uuid: crypto.randomUUID(),
      name: 'Legacy Server',
      macAddress: '00:11:22:33:44:55',
      heartbeatInterval: 60,
    });

    const token = generateAccessToken();
    const tokenHash = hashPassword(token);

    // token_prefixをnullで作成（既存データの想定）
    db.run(
      'INSERT INTO access_tokens (server_id, token_hash, token_prefix, expires_at) VALUES (?, ?, NULL, NULL)',
      [serverId, tokenHash],
    );

    // 検証
    const result = await verifyAccessToken(token, tokensRepo);

    // token_prefixがnullなので見つからない
    expect(result).toBeNull();
  });
});
