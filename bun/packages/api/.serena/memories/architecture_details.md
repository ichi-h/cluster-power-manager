# API Package Architecture Details

## レイヤードアーキテクチャの詳細

### Infrastructure 層 (src/infrastructure/)

#### 責務

技術的な処理を抽象化するための層。インターフェース定義と実装を提供。

#### 主要コンポーネント

**ISessionStore / InMemorySessionStore** (`session-store.ts`)

- セッション管理の抽象化
- インメモリ実装（開発・テスト用）
- 将来的に Redis 等の永続化実装に切り替え可能

**IRateLimiter / InMemoryRateLimiter** (`rate-limiter.ts`)

- レート制限機能の抽象化
- インメモリ実装（開発・テスト用）
- 将来的に Redis 等の分散環境対応実装に切り替え可能

### Database 層 (src/db/)

#### 責務

データアクセスの抽象化、スキーマ定義、マイグレーション管理。

#### 主要コンポーネント

**schema.ts**

- TypeScript 型定義によるスキーマ定義
- テーブル: `servers`, `access_tokens`
- Bun:sqlite で生 SQL クエリを使用

**migrations.ts**

- マイグレーション実行ロジック
- マイグレーション履歴管理

**transaction.ts**

- トランザクション管理
- ロールバック・コミット処理

**repositories/** (リポジトリパターン)

- `servers.ts`: サーバー CRUD 操作
- `access-tokens.ts`: アクセストークン CRUD 操作
- データアクセス層の抽象化

### Services 層 (src/services/)

#### 責務

純粋なビジネスロジックの実装。依存性注入（DI）パターンを使用。

#### 主要サービス

**auth.ts** (認証サービス)

- ユーザー認証（ログイン・ログアウト）
- エージェント認証（Bearer Token 検証）
- セッション管理

**server.ts** (サーバー管理サービス)

- サーバー情報の CRUD 操作
- 電源ステータス管理
- カレントステータス計算

**heartbeat.ts** (ハートビートサービス)

- ハートビート受信処理
- ハートビートステータス更新
- タイムアウト検出

**wol.ts** (Wake-on-LAN サービス)

- Magic Packet 送信
- Wake-on-LAN 実行

#### DI（依存性注入）パターン

- サービスはインフラストラクチャ層のインターフェースに依存
- コンストラクタインジェクション
- テスト時はモック実装を注入可能

### Middleware 層 (src/middleware/)

#### 責務

リクエスト/レスポンスのインターセプト処理。

#### 主要ミドルウェア

**auth.ts** (認証ミドルウェア)

- セッション認証チェック
- エージェント認証チェック（Bearer Token）
- 認証情報を Fastify リクエストに注入

**error.ts** (エラーハンドリング)

- グローバルエラーハンドリング
- Connect RPC エラーレスポンス生成
- ログ出力

**rate-limit.ts** (レート制限)

- IRateLimiter の薄いラッパー
- エンドポイント毎のレート制限設定

### Routes 層 (src/routes/)

#### 責務

Connect RPC エンドポイントの定義と実装。

**connect.ts**

- Protocol Buffers スキーマから生成された Connect RPC ハンドラー
- 各エンドポイントの実装
- サービス層の呼び出し
- ミドルウェアの適用

### Shared 層 (src/shared/)

#### 責務

各層から共通で利用する型定義、定数、ユーティリティ。

**constants/**

- アプリケーション全体で使用する定数

**types/**

- 型定義
- Fastify 型拡張（リクエスト、レスポンス等）

**utils/**

- `logger.ts`: ログ出力ユーティリティ（JSON Lines 形式）
- `crypto.ts`: scrypt 暗号化・検証
- `env.ts`: 環境変数管理、バリデーション

## データフロー例

### ユーザーログイン

```
User Request
  ↓
Routes (connect.ts)
  ↓
Services (auth.ts)
  ↓ (ISessionStore)
Infrastructure (session-store.ts)
  ↓ (Repository)
Database (repositories/)
```

### サーバー情報取得

```
User Request
  ↓
Routes (connect.ts)
  ↓
Middleware (auth.ts) - セッション検証
  ↓
Services (server.ts)
  ↓ (Repository)
Database (repositories/servers.ts)
```

### ハートビート受信

```
Agent Request
  ↓
Routes (connect.ts)
  ↓
Middleware (auth.ts) - Bearer Token検証
  ↓
Services (heartbeat.ts)
  ↓ (Repository)
Database (repositories/servers.ts)
```

## 拡張ポイント

### 新しい API エンドポイントの追加

1. `/proto/` で Protocol Buffers スキーマ定義
2. `buf generate` でコード生成
3. `services/` にビジネスロジック実装（DI 使用）
4. `routes/connect.ts` にエンドポイント追加
5. 必要に応じて `middleware/` で認証・レート制限適用

### 新しいサービスの追加

1. 必要に応じて `infrastructure/` にインターフェースと実装作成
2. `services/` に新しいサービスファイル作成（DI パターン使用）
3. `routes/connect.ts` で Connect RPC エンドポイント公開
4. `db/schema.ts` でテーブル定義追加（必要に応じて）
5. `db/migrations/` でマイグレーション追加

### 新しい Infrastructure 実装の追加

1. `infrastructure/` にインターフェース定義
2. InMemory 実装作成（開発・テスト用）
3. 必要に応じて永続化実装追加（Redis 等）
4. `__tests__/` ディレクトリにユニットテスト作成
5. サービス層で DI パターンで利用

## テスト戦略

### ディレクトリ構造

各層のソースコードと同じディレクトリに `__tests__/` を配置し、テストファイルは `.test.ts` サフィックスを使用。

### テストの種類

- **ユニットテスト**: 各層の機能を個別にテスト
- **統合テスト**: サービス層とデータベース層の統合テスト
- **E2E テスト**: エンドポイント全体のテスト（将来的に）

### モックの活用

- DI パターンにより、インフラストラクチャ層のモック実装を注入可能
- データベース層のモックリポジトリでサービス層をテスト
