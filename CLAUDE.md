# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quick Explorerは、VSCode用のシンプルなディレクトリ・ファイル閲覧拡張機能です。Explorer側でプロジェクトルート配下のディレクトリをナビゲートし、ファイルを素早く開くことができます。

## Development Commands

### Build and Compilation
```bash
# TypeScriptをコンパイル
npm run compile

# Watch モードでコンパイル（開発時）
npm run watch

# 本番用ビルド（VSIX作成前）
npm run vscode:prepublish
```

### Linting
```bash
# ESLintを実行
npm run lint
```

### Testing
```bash
# テストを実行
npm test

# ウォッチモードでテスト
npm run test:watch

# カバレッジ付きでテスト
npm run test:coverage
```

### Development
```bash
# F5キーを押してExtension Development Hostを起動
# または、VSCodeのRun > Start Debugging を使用
```

### VSIX Package Creation
```bash
# VSIXパッケージを作成
npx vsce package
```

## Architecture

### 主要コンポーネント

このプロジェクトは、VSCode拡張機能の標準的なMVCパターンに従っています。

1. **extension.ts** - エントリーポイント
   - `activate()`: 拡張機能の起動時に呼ばれる
   - ViewProviderの初期化とコマンドの登録を行う
   - TreeViewのタイトル更新を管理
   - 登録コマンド:
     - `quickExplorer.changeDirectory`: ディレクトリ変更
     - `quickExplorer.refresh`: ビュー更新
     - `quickExplorer.goUp`: 親ディレクトリへ移動
     - `quickExplorer.toggleSortOrder`: ソート順を切り替え（TreeViewヘッダーのソートアイコン）
     - `quickExplorer.openSettings`: 設定画面を開く（TreeViewヘッダーのギアアイコン）

2. **QuickExplorerViewProvider** - TreeDataProvider実装
   - ディレクトリ内容の取得と表示を担当
   - `currentDirectory`と`projectRoot`を管理
   - プロジェクトルートより上には移動不可の制限を実装
   - ビューの更新通知（EventEmitter）を管理
   - ソート順の管理と設定への永続化を担当

3. **QuickExplorerTreeItem** - TreeItemの具象実装
   - フォルダとファイルの表示を担当
   - フォルダクリック時は`quickExplorer.changeDirectory`コマンドを実行
   - ファイルクリック時は`vscode.open`コマンドを実行
   - `ParentDirectoryTreeItem`: ".."表示用の特別なTreeItem

4. **FileSystemService** - ファイルシステム操作のラッパー
   - ディレクトリ内容の取得（ソート順に応じてソート）
   - パスの妥当性チェック
   - 初期ディレクトリの決定（ワークスペースルート or ホームディレクトリ）

5. **types.ts** - 型定義とヘルパー関数
   - `SortOrder` enum: ソート順の定義
   - `sortOrderToString()`: SortOrder enum → 設定値文字列への変換
   - `stringToSortOrder()`: 設定値文字列 → SortOrder enumへの変換

### データフロー

```
User Click
  → TreeItem.command
    → Extension.registerCommand
      → ViewProvider.changeDirectory()
        → FileSystemService.getDirectoryContents()
          → ViewProvider.refresh()
            → TreeDataProvider.onDidChangeTreeData.fire()
              → VSCode updates TreeView
```

### 重要な制約

- **プロジェクトルート制限**: ユーザーはプロジェクトルート（初期ディレクトリ）より上には移動できません
- **相対パス表示**: TreeViewのdescriptionには、プロジェクトルートからの相対パスを表示
- **フラットリスト**: サブディレクトリは展開せず、常にフラットなリスト表示

### ソート機能

- **ソート順の種類**:
  - フォルダ優先 + 名前昇順（デフォルト）
  - フォルダ優先 + 名前降順
  - フォルダ優先 + 変更日時昇順
  - フォルダ優先 + 変更日時降順
- **ソート順の切り替え**: TreeViewヘッダーのソートアイコンをクリックして循環的に切り替え
- **設定の永続化**: ソート順はVSCodeの設定ファイル（`quickExplorer.defaultSortOrder`）に保存され、VSCode再起動後も保持されます

## Code Conventions

### コメント
- **日本語コメント**: このプロジェクトでは、コメントは日本語で記述します
- クラス、メソッド、複雑なロジックにはJSDocスタイルのコメントを付けます

### ファイル構成
- ファイル末尾には必ず空行を追加
- `src/`配下にTypeScriptソースを配置
- `src/test/`配下にテストファイルを配置
- `out/`にコンパイル済みJavaScriptが生成される

### テスト構成
- **フレームワーク**: Vitest
- **モック**: `src/test/__mocks__/vscode.ts`にVSCode APIのモック
- **カバレッジ**: v8プロバイダーを使用

### TypeScript設定
- Strict mode有効
- Target: ES2020
- Module: CommonJS

## Release Process

リリースはGitHub Actionsで自動化されています（`.github/workflows/release-vsix.yml`）:

1. `master`ブランチへのプッシュまたはリリースの公開時に自動実行
2. 依存関係のインストール → コンパイル → VSIXパッケージ作成
3. GitHub Releasesに`.vsix`ファイルをアップロード
