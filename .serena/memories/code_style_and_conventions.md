# Code Style and Conventions

## 全般

- **言語**: 開発者は日本語を話すため、ドキュメントやコメントは日本語で記述
- **文字エンコーディング**: UTF-8

## TypeScript (API & Web)

### スタイル

- **リンター・フォーマッター**: Biome
- **命名規則**:
  - camelCase: 変数、関数
  - PascalCase: クラス、型、インターフェース、React コンポーネント
  - UPPER_SNAKE_CASE: 定数
  - kebab-case: ファイル名（例: `session-store.ts`, `rate-limiter.ts`）

### ベストプラクティス

- 型安全性を最大限活用
- `any`の使用を避ける
- 明示的な型アノテーションを推奨
- React: 関数コンポーネントと Hooks を使用
- 依存性注入（DI）パターンの活用（サービス層）
- レイヤードアーキテクチャの遵守（API）

## Go (Agent)

### スタイル

- 標準の `go fmt` を使用
- `go vet` でリンティング

### 命名規則

- camelCase: プライベート変数・関数
- PascalCase: エクスポートされる変数・関数・型
- snake_case: ファイル名（例: `komo_agent.go`）

### ベストプラクティス

- エラーハンドリングを適切に行う
- `defer` を活用したリソース管理
- シンプルで読みやすいコードを心がける

## Protocol Buffers

- **命名規則**: snake_case（フィールド名）
- **ファイル構造**: `/proto/` ディレクトリに集約
- **コード生成**: `buf generate` を使用

## ログ

### フォーマット

- **JSON Lines 形式** (`.jsonl`)
- **タイムスタンプ**: ISO 8601 形式
- **レベル**: INFO, WARN, ERROR

### 出力先

- 標準出力（常時）
- ファイル出力（オプション）
  - API: `logs/komo-api.log.jsonl` (開発), `/var/log/komoriuta/komo-api.log.jsonl` (本番)
  - Web: `logs/komo-web.log.jsonl` (開発), `/var/log/komoriuta/komo-web.log.jsonl` (本番)
  - Agent CLI: `/var/log/komoriuta/komo-agent.log.jsonl`
  - Agent Daemon: `/var/log/komoriuta/komolet.log.jsonl`

### セキュリティ

- 機密情報（パスワード、トークンなど）はマスクする
- ログファイルのパーミッション: 600

## セキュリティ

- **認証**: scrypt でパスワードハッシュ化
- **アクセストークン**: scrypt でハッシュ化、Bearer Token 方式
- **HTTPS 強制**: localhost を除く
- **CSRF 対策**: CORS 設定、SameSite=Strict
- **セッション管理**: HttpOnly, Secure 属性付き Cookie

## データベース

- **ライブラリ**: Bun:sqlite（生 SQL クエリ）
- **削除方式**: 物理削除
- **日時フィールド**: `created_at`, `updated_at`を含める
- **マイグレーション**: `src/db/migrations/` に配置、起動時に自動実行
- **ユーザー管理**: データベースではなく環境変数で管理（1 ユーザーのみ）

## Git

- **ブランチ戦略**: main ブランチ中心
- **コミットメッセージ**: 明確で簡潔な説明
- **Hooks**: lefthook 使用

## デザインパターン

- **設定管理**: 環境変数（API, Web）、JSON ファイル（Agent）
- **エラーハンドリング**: Connect RPC エラーコード、適切なログ出力
- **ステータス管理**: 状態遷移を明確に定義（Power Status, Heartbeat Status, Current Status）
- **依存性注入**: サービス層で DI パターンを使用（API）
- **リポジトリパターン**: データアクセスの抽象化（API）
- **レイヤードアーキテクチャ**: Infrastructure → Database → Services → Middleware → Routes（API）

## テスト

- **テストフレームワーク**: Bun Test (TypeScript), Go 標準テスト (Go)
- **テストファイル配置**: 各層の `__tests__/` ディレクトリに配置
- **テストファイル命名**: `.test.ts` サフィックス
- **モック**: DI パターンによりモック実装を注入可能

## ディレクトリ構造の規則

- **API**: レイヤードアーキテクチャに従う（infrastructure, db, services, routes, middleware, shared）
- **Web**: フロントエンド（frontend/）とサーバー（middleware/, utils/）を分離
- **共通**: shared/ ディレクトリで共通定義を管理
