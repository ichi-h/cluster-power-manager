# Project Overview

## プロジェクト名
Komoriuta（子守唄）

## プロジェクトの目的
オンプレミス環境のサーバー電源管理システム。複数のサーバーの電源ON/OFFを簡単に管理し、使わない時間帯の電源を落とすことで、サーバーの負荷軽減と電気代削減を実現する。

## 主な機能
- 各サーバーの電源管理（起動・停止・監視）
- サーバーの追加・編集・削除
- Webベースの管理画面の提供
- Wake-on-LAN (WoL) による電源起動
- ハートビート監視による状態管理

## アーキテクチャ
- **API (komo-api)**: バックエンドAPIサーバー（Connect RPC）
- **Web (komo-web)**: フロントエンドWebアプリケーション + 静的ファイル配信サーバー
- **Agent**: 各サーバーに常駐するデーモン（komolet）とCLIツール（komo-agent）
- **Database**: SQLite

## 技術スタック

### API (komo-api)
- 言語: TypeScript (Bun)
- フレームワーク: Fastify
- プロトコル: Connect (Protocol Buffers)
- 実行形式: 単一実行ファイル（bin/komo-api）

### Web (komo-web)
- 言語: TypeScript (Bun)
- サーバー: Bun Serve（静的ファイル配信 + HMR対応）
- フロントエンド: React
- UIライブラリ: Tailwind CSS、将来的にshadcn/ui
- プロトコル: Connect (Protocol Buffers)
- 実行形式: 単一実行ファイル（bin/komo-web、フロントエンドアセット含む）

### Agent
- 言語: Go
- プロトコル: Connect (Protocol Buffers)
- 実行形式:
  - komo-agent: CLI
  - komolet: デーモン

### 共通
- コンテナ: Podman
- スキーマ定義: Protocol Buffers

## ディレクトリ構造
- `/proto/`: Protocol Buffers スキーマ定義
- `/bun/`: Bun/TypeScript 開発環境
  - `/bun/packages/api/`: バックエンドAPI (komo-api)
  - `/bun/packages/web/`: フロントエンドWeb (komo-web)
  - `/bun/packages/connect/`: Protocol Buffersから生成されたConnect用コード
- `/go/`: Agent (Go) 開発環境
- `/docs/`: ドキュメント（PRD, SRS, SDD, QA）
- `/.github/`: GitHub設定、Copilot instructions

## 開発環境
NixとdirenvによるNixベースの開発環境。各サブディレクトリにflake.nixが存在し、必要なツールを提供。
