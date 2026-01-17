import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Tree View内の各アイテム（フォルダ/ファイル）を表すクラス
 */
export class QuickExplorerTreeItem extends vscode.TreeItem {
  /**
   * @param label 表示名
   * @param resourceUri ファイルシステム上のURI
   * @param isDirectory ディレクトリかどうか
   * @param projectRoot プロジェクトルートのパス
   */
  constructor(
    public readonly label: string,
    resourceUri: vscode.Uri,
    public readonly isDirectory: boolean,
    projectRoot?: string
  ) {
    super(resourceUri, vscode.TreeItemCollapsibleState.None);

    // ツールチップにプロジェクトルートからの相対パスを表示
    if (projectRoot) {
      const relativePath = path.relative(projectRoot, resourceUri.fsPath);
      this.tooltip = relativePath || '.';
    } else {
      this.tooltip = resourceUri.fsPath;
    }

    // アイコンを設定
    if (this.isDirectory) {
      this.iconPath = new vscode.ThemeIcon('symbol-folder');
    }

    // ファイルの場合は、クリック時にファイルを開くコマンドを設定
    if (!this.isDirectory) {
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [resourceUri],
      };
    } else {
      // フォルダの場合は、ディレクトリを変更するコマンドを設定
      this.command = {
        command: 'quickExplorer.changeDirectory',
        title: 'Change Directory',
        arguments: [resourceUri.fsPath],
      };
    }

    // コンテキスト値（将来的なコンテキストメニュー用）
    this.contextValue = this.isDirectory ? 'folder' : 'file';
  }
}

/**
 * 親ディレクトリへの移動を表す特別なアイテム
 */
export class ParentDirectoryTreeItem extends vscode.TreeItem {
  /**
   * @param parentPath 親ディレクトリのパス
   * @param projectRoot プロジェクトルートのパス
   */
  constructor(public readonly parentPath: string, projectRoot?: string) {
    super('..', vscode.TreeItemCollapsibleState.None);

    // ツールチップにプロジェクトルートからの相対パスを表示
    if (projectRoot) {
      const relativePath = path.relative(projectRoot, parentPath);
      this.tooltip = `Go to parent directory: ${relativePath || '.'}`;
    } else {
      this.tooltip = `Go to parent directory: ${parentPath}`;
    }
    this.iconPath = new vscode.ThemeIcon('arrow-up');
    this.command = {
      command: 'quickExplorer.changeDirectory',
      title: 'Go to Parent Directory',
      arguments: [parentPath],
    };
    this.contextValue = 'parentDirectory';
  }
}
