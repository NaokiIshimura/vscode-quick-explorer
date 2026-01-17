---
description: リリース準備を実行する（ブランチ作成、README更新、コミット、PR作成）
---

リリース準備を開始します。

実行前に `npm run compile` が成功することを確認してください。

## 注意事項

- コミットメッセージは英語で記述してください
- PRのタイトルは英語で記述してください
- PRのdescriptionは英語で記述してください
- ファイル末尾には必ず空行を含めてください

---

# リリース準備手順

## 1. 事前確認

```bash
# 現在のブランチを確認
git branch --show-current

# package.jsonからバージョンを取得
cat package.json | grep '"version"'

# 未コミットの変更を確認
git status
```

## 2. バージョン更新

package.jsonのバージョンを手動で更新します。

- セマンティックバージョニング（X.Y.Z）に従う
  - X: メジャーバージョン（破壊的変更）
  - Y: マイナーバージョン（新機能追加）
  - Z: パッチバージョン（バグ修正）

```bash
# package.jsonを編集してバージョンを更新
# 例: "version": "0.0.5" → "version": "0.0.6"
```

## 3. ブランチ作成

- ブランチ名: `v{バージョン}` （例: `v0.0.6`）
- mainブランチから作成

```bash
git checkout main
git pull origin main
git checkout -b v{バージョン}
```

## 4. CLAUDE.md & README更新

対象ファイル：
- `CLAUDE.md`（プロジェクトドキュメント）
- `README.md`（英語版）

### CLAUDE.md更新ルール

**更新内容**：
- 新機能・変更に伴うアーキテクチャの更新
- ファイル構成の変更を反映
- 開発コマンドの追加・変更
- デバッグ方法の更新
- 重要な注意事項の追加

**言語**：
- 日本語で記述（コードベースへのチェックイン用プロジェクト説明）

### README更新ルール

**構造**（現在の構造を維持）：
1. プロジェクト概要
2. 主な機能
3. インストール方法
4. 使い方
5. 設定項目
6. 開発方法
7. ライセンス

**更新内容**：
- 新機能・変更を適切なセクションに反映
- スクリーンショットの更新（必要な場合）
- バージョン番号の更新

**言語**：
- README.md: 英語で記述

## 5. Git Commit

```bash
# 変更をステージング（.claude, .vscodeは除外）
git add package.json CLAUDE.md README.md

# コミット（英語メッセージ）
git commit -m "Release v{バージョン}: Update documentation and version"
```

## 6. Push

```bash
git push origin v{バージョン}
```

## 7. PR作成

GitHub MCPまたはghコマンドを使用してPRを作成：

- **base**: `main`
- **head**: `v{バージョン}`
- **title**: `[v{バージョン}] {変更の要約}` （英語）
- **description**: 変更内容の要約（英語）

**PR descriptionのテンプレート**：
```markdown
## Summary
- Brief description of changes

## Changes
### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

## Test Checklist
- [ ] npm run compile succeeds
- [ ] Extension works in debug mode
- [ ] Main features work correctly
```

---

# 言語ルール一覧

| 項目 | 言語 |
|------|------|
| UI表記 | 英語 |
| commitメッセージ | 英語 |
| PR title | 英語 |
| PR description | 英語 |
| CLAUDE.md | 日本語 |
| README.md | 英語 |

---

# エラーハンドリング

- ブランチが既に存在する場合: 既存ブランチにチェックアウト
- コンフリクトが発生した場合: ユーザーに報告して手動解決を依頼
- PR作成に失敗した場合: エラー内容を報告

---

# 完了報告

すべての手順が完了したら、以下を報告：
- 作成/更新したブランチ名
- 更新したファイル一覧
- 作成したPRのURL
- 次のステップ（レビュー、マージ等）
