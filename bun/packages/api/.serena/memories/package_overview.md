# komo-api Package Overview

## パッケージ名

komo-api

## パッケージの目的

Komoriuta のバックエンド API サーバー。サーバー電源管理のビジネスロジックと Connect RPC エンドポイントを提供。

## 主な機能

- サーバー情報の管理（CRUD 操作）
- 認証・認可（ユーザー、エージェント）
- ハートビート受信と処理
- Wake-on-LAN (WoL) による電源起動
- アクセストークン管理
- セッション管理
- レート制限

## アーキテクチャ

レイヤードアーキテクチャを採用

### 依存関係

```
Routes → Middleware
Routes → Services
Services → Infrastructure
Services → Database
Middleware → Infrastructure
Middleware → Database
```

## 技術スタック

- TypeScript (Bun)
- Fastify (Web フレームワーク)
- Connect (Protocol Buffers RPC)
- SQLite (データベース)
- Biome (リンター・フォーマッター)

## ディレクトリ構成

```
src/
├── infrastructure/  # インフラストラクチャ層
│   ├── session-store.ts      # セッションストア（ISessionStore, InMemorySessionStore）
│   ├── rate-limiter.ts        # レート制限（IRateLimiter, InMemoryRateLimiter）
│   └── __tests__/             # テスト
├── db/              # データベース層
│   ├── schema.ts              # スキーマ定義（TypeScript型定義）
│   ├── migrations.ts          # マイグレーション管理
│   ├── transaction.ts         # トランザクション管理
│   ├── migrations/            # マイグレーションファイル
│   │   └── 001_create_initial_schema.ts
│   └── repositories/          # リポジトリパターン
│       ├── servers.ts         # サーバーリポジトリ
│       ├── access-tokens.ts   # アクセストークンリポジトリ
│       └── index.ts
├── services/        # ビジネスロジック層
│   ├── auth.ts                # 認証サービス
│   ├── server.ts              # サーバー管理サービス
│   ├── heartbeat.ts           # ハートビートサービス
│   ├── wol.ts                 # Wake-on-LANサービス
│   └── __tests__/             # テスト
├── routes/          # ルーティング層
│   └── connect.ts             # Connect RPCエンドポイント定義
├── middleware/      # ミドルウェア層
│   ├── auth.ts                # 認証ミドルウェア
│   ├── error.ts               # エラーハンドリング
│   ├── rate-limit.ts          # レート制限
│   └── __tests__/             # テスト
├── shared/          # 共通定義
│   ├── constants/             # 定数
│   ├── types/                 # 型定義、Fastify型拡張
│   └── utils/                 # ユーティリティ
│       ├── logger.ts          # ログユーティリティ
│       ├── crypto.ts          # scrypt暗号化
│       └── env.ts             # 環境変数管理
├── scripts/         # スクリプト
│   └── seed/                  # シードデータ
├── index.ts         # エントリーポイント
└── server.ts        # Fastifyサーバー設定
```

## ビルド・実行

- 開発: `bun run dev`
- ビルド: `bun run build` → 単一実行ファイル `bin/komo-api` を生成
- 実行: `bun run start` または `./bin/komo-api`

## データベース

- SQLite (ファイル: `data/komoriuta.db`)
- Bun:sqlite 使用（生 SQL クエリ）
- マイグレーション管理: `src/db/migrations/`

## テスト

- テストフレームワーク: Bun Test
- テストファイル: 各層の `__tests__/` ディレクトリに配置

## ログ

- JSON Lines 形式 (`.jsonl`)
- 出力先: 標準出力 + ファイル（`logs/komo-api.log.jsonl`）
- 本番環境: `/var/log/komoriuta/komo-api.log.jsonl`

## 環境変数

主要な環境変数は `src/shared/utils/env.ts` で管理

## セキュリティ

- ユーザー認証: 環境変数で 1 ユーザーのみ管理（USER_ID, PASSWORD_HASH）
- パスワード: scrypt ハッシュ化
- アクセストークン: scrypt ハッシュ化（データベースに保存）
- セッション: Cookie-based、HttpOnly, Secure 属性
- HTTPS 強制（localhost 以外）
- CORS 設定: 同一オリジンのみ
- CSRF 対策: SameSite=Strict

## 関連ドキュメント

- `/docs/prd.md`: プロダクト要求定義
- `/docs/srs.md`: ソフトウェア要件定義
- `/docs/sdd.md`: システム設計ドキュメント
- `./ARCHITECTURE.md`: パッケージアーキテクチャ設計
- `./README.md`: 開発者向けドキュメント
