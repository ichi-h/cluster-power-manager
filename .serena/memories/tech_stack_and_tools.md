# Tech Stack and Tools

## 開発環境管理

- **Nix**: 再現可能な開発環境を提供
- **direnv**: 自動的に開発環境をロード（.envrc 使用）

## API (TypeScript/Bun)

### 言語・ランタイム

- TypeScript
- Bun (高速な JavaScript ランタイム)

### フレームワーク・ライブラリ

- **Fastify**: バックエンドフレームワーク
  - Bun で動作する軽量かつ高速な Web フレームワーク
  - Connect を用いて protobuf からサーバーコードを生成可能
- **Connect**: Protocol Buffers ベースの gRPC-like 通信（RPC フレームワーク）

### ツール

- **Biome**: リンター・フォーマッター

## Web (TypeScript/Bun)

### 言語・ランタイム

- TypeScript
- Bun (高速な JavaScript ランタイム)

### フレームワーク・ライブラリ

- **Bun Serve**: 静的ファイル配信サーバー、HMR（Hot Module Replacement）対応
- **React**: UI ライブラリ
- **Tailwind CSS**: CSS フレームワーク（@tailwind ディレクティブ使用、設定ファイルなし）
- **shadcn/ui** (将来): 再利用可能な UI コンポーネントライブラリ
- **Connect**: Protocol Buffers クライアントコード生成

### ツール

- **Biome**: リンター・フォーマッター

## Agent (Go)

### 言語

- Go

### ライブラリ

- **Connect**: Protocol Buffers クライアントコード生成

## データベース

- **SQLite**: 組み込み RDB

## Protocol

- **Protocol Buffers**: スキーマ定義
- **Connect**: HTTP/2 ベースの RPC（gRPC 互換、より軽量）
- **buf**: Protocol Buffers コード生成ツール

## システムツール

- **systemd**: プロセス管理（komolet 用）
- **logrotate**: ログローテーション

## コンテナ

- **Podman**: コンテナランタイム（Docker 互換）

## ビルドツール

- **Bun**: TypeScript のビルド、単一実行ファイル生成
- **Go**: 標準のビルドツール
