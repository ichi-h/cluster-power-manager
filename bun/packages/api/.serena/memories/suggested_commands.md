# Suggested Commands for API Package

このファイルは、komo-apiパッケージで使用する主要なコマンドをまとめたものです。

## 開発環境のセットアップ

```bash
# パッケージディレクトリに移動
cd bun/packages/api

# direnvを許可（自動的にNix開発環境に入る）
direnv allow

# 依存関係のインストール
bun install
```

## 開発

```bash
# 開発サーバー起動
bun run dev

# 開発サーバー起動（ウォッチモード）
bun --watch src/index.ts
```

## ビルド・実行

```bash
# ビルド（単一実行ファイル bin/komo-api を生成）
bun run build

# 実行
bun run start

# または直接実行
./bin/komo-api
```

## テスト

```bash
# すべてのテストを実行
bun test

# 特定のテストファイルを実行
bun test src/services/__tests__/auth.test.ts

# ウォッチモードでテスト実行
bun test --watch
```

## リンティング・フォーマット

```bash
# リンティング（問題を検出）
biome check .

# フォーマット（自動修正）
biome format .

# リンティング + フォーマット（自動修正）
biome check --write .
```

## データベース

```bash
# マイグレーション実行（アプリ起動時に自動実行）
# 手動で実行する場合は以下のコードを実行
bun run src/db/migrations.ts

# データベースファイルの場所
# 開発: ./data/komoriuta.db
# 本番: /var/lib/komoriuta/komoriuta.db (環境変数で変更可能)
```

## デバッグ

```bash
# ログ出力の確認（開発環境）
tail -f logs/komo-api.log.jsonl

# ログ出力の確認（本番環境）
tail -f /var/log/komoriuta/komo-api.log.jsonl
```

## Protocol Buffers

```bash
# スキーマからコード生成（protoディレクトリで実行）
cd ../../../proto
buf generate
cd -
```

## 環境変数

```bash
# .envファイルの作成（開発環境）
cp .env.example .env

# .envファイルを編集
vim .env
```

## トラブルシューティング

```bash
# 依存関係の再インストール
rm -rf node_modules
bun install

# ビルドキャッシュのクリア
rm -rf bin/

# データベースのリセット（注意: データが削除されます）
rm -rf data/komoriuta.db
```

## その他

```bash
# パッケージ情報の確認
bun run --version

# 依存関係の確認
bun pm ls
```
