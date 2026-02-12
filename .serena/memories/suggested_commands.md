# Suggested Commands

## 重要: Nix コマンドの実行方法

このプロジェクトでは Nix と direnv を使用しています。  
nix develop の開発環境へは、direnv allow が行われていれば、各 flake.nix が配置されたディレクトリへ移動するだけで自動的に入ることができます。

## 開発環境のセットアップ

### ルートディレクトリ

```bash
# Nix開発環境に入る（Serena MCPサーバーを利用可能に）
nix develop

# direnvを使用する場合（自動的に開発環境をロード）
direnv allow
```

## Protocol Buffers

```bash
cd proto

# .envrcが許可されていなかったら許可する
direnv allow

# スキーマからコード生成
buf generate
```

## API (Bun/TypeScript) - /bun/packages/api

```bash
cd bun/packages/api

# .envrcが許可されていなかったら許可する
direnv allow

# パッケージのインストール（Bun使用）
bun install

# 開発サーバー起動
bun run dev

# ビルド（単一実行ファイル bin/komo-api を生成）
bun run build

# 実行
bun run start
# または
./bin/komo-api

# リンティング & フォーマット（Biome使用）
biome check .
biome format .

# テスト実行
bun test
```

## Web (Bun/TypeScript) - /bun/packages/web

```bash
cd bun/packages/web

# .envrcが許可されていなかったら許可する
direnv allow

# パッケージのインストール（Bun使用）
bun install

# 開発サーバー起動（HMR有効）
bun run dev

# ビルド（単一実行ファイル bin/komo-web を生成、フロントエンドアセット含む）
bun run build

# 実行
bun run start
# または
./bin/komo-web

# リンティング & フォーマット（Biome使用）
biome check .
biome format .
```

## Agent (Go) - /go

```bash
cd go

# .envrcが許可されていなかったら許可する
direnv allow

# ビルド
go build

# テスト
go test ./...

# リンティング
go vet ./...

# フォーマット
go fmt ./...
```

## Git 操作

```bash
# 通常のgitコマンドが使用可能
git status
git add .
git commit -m "message"
git push
```

## ユーティリティコマンド（Linux）

```bash
# ファイル・ディレクトリ操作
ls -la
cd <directory>
find . -name "*.ts"
grep -r "pattern" .

# プロセス管理
ps aux | grep komo
systemctl status <service>

# ログ確認
tail -f /var/log/komoriuta/komo-api.log.jsonl
tail -f /var/log/komoriuta/komo-web.log.jsonl
journalctl -u <service> -f
```

## Podmanコンテナ操作

```bash
# イメージビルド
podman build -t komoriuta .

# コンテナ起動
podman run -d --name komoriuta komoriuta

# コンテナ停止
podman stop komoriuta

# ログ確認
podman logs komoriuta
```
