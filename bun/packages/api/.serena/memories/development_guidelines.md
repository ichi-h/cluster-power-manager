# Development Guidelines

## コードスタイル

### TypeScript命名規則
- **camelCase**: 変数、関数
- **PascalCase**: クラス、型、インターフェース
- **UPPER_SNAKE_CASE**: 定数

### ファイル命名規則
- **kebab-case**: ファイル名（例: `session-store.ts`, `rate-limiter.ts`）
- **テストファイル**: `.test.ts` サフィックス

## ベストプラクティス

### 型安全性
- `any`の使用を避ける
- 明示的な型アノテーションを推奨
- 型推論を活用しつつ、公開APIには型を明示

### 依存性注入（DI）
- サービス層はコンストラクタインジェクションを使用
- インフラストラクチャ層のインターフェースに依存
- 実装の切り替えが容易（InMemory ↔ Redis等）

### エラーハンドリング
- Connect RPCエラーコードを適切に使用
- ログに機密情報を含めない
- エラーメッセージは明確かつ簡潔に

### セキュリティ
- パスワード・トークンはscryptでハッシュ化
- ログに機密情報をマスク
- 環境変数で機密情報を管理（ハードコード禁止）

### ログ
- JSON Lines形式（`.jsonl`）
- レベル: INFO, WARN, ERROR
- タイムスタンプ: ISO 8601形式
- 機密情報のマスク処理

## ディレクトリ配置規則

### 新しいファイルの配置

**Infrastructure層**
- インターフェース定義 + InMemory実装を同じファイルに配置
- ファイル名: 機能を表す名前（例: `session-store.ts`）
- テスト: `__tests__/<ファイル名>.test.ts`

**Database層**
- スキーマ: `schema.ts`
- マイグレーション: `migrations/<番号>_<説明>.ts`
- リポジトリ: `repositories/<テーブル名>.ts`

**Services層**
- サービス: `<機能名>.ts`（例: `auth.ts`, `server.ts`）
- テスト: `__tests__/<ファイル名>.test.ts`

**Middleware層**
- ミドルウェア: `<機能名>.ts`（例: `auth.ts`, `error.ts`）
- テスト: `__tests__/<ファイル名>.test.ts`

**Routes層**
- すべてのConnect RPCエンドポイントを `connect.ts` に集約

**Shared層**
- 定数: `constants/index.ts`
- 型: `types/index.ts`, `types/fastify.d.ts`
- ユーティリティ: `utils/<機能名>.ts`

## コミット前チェックリスト

```bash
# リンティング
biome check .

# フォーマット
biome format .

# テスト実行
bun test

# ビルド確認
bun run build
```

## テスト作成ガイドライン

### テストファイル配置
各層のソースコードと同じディレクトリに `__tests__/` を配置

### テストの粒度
- **ユニットテスト**: 単一の関数・クラスをテスト
- **統合テスト**: 複数のコンポーネントの連携をテスト

### モックの使用
- DIパターンにより、依存関係をモック化
- データベース操作はモックリポジトリを使用

### テストの命名
- `describe`: テスト対象の機能・クラス名
- `it` / `test`: 具体的な動作やシナリオ

## 環境変数管理

### 開発環境
- `.env.example` をコピーして `.env` を作成
- `.env` はgitignoreに含める

### 環境変数の追加
1. `src/shared/utils/env.ts` に環境変数を追加
2. バリデーションロジックを実装
3. `.env.example` に例を追加
4. READMEに説明を追加

## データベースマイグレーション

### マイグレーションファイルの作成
1. `src/db/migrations/` に新しいファイル作成
2. ファイル名: `<番号>_<説明>.ts`（例: `002_add_users_table.ts`）
3. `up` 関数と `down` 関数を実装

### マイグレーション実行
- 起動時に自動的に実行される（`src/db/migrations.ts`）

## ログ出力ガイドライン

### ログレベルの使い分け
- **INFO**: 正常な動作、重要なイベント
- **WARN**: 警告、異常な状態（エラーではない）
- **ERROR**: エラー、例外

### ログの内容
- 必要な情報を簡潔に記載
- 機密情報（パスワード、トークン等）はマスク
- JSON Lines形式で構造化

### ログの例
```typescript
logger.info({ event: 'user_login', userId: 'xxx' });
logger.error({ event: 'database_error', error: err.message });
```
