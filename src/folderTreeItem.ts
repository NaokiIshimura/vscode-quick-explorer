import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Tree View内の各アイテム（フォルダ/ファイル）を表すクラス
 */
export class FolderTreeItem extends vscode.TreeItem {
  /**
   * @param label 表示名
   * @param resourceUri ファイルシステム上のURI
   * @param isDirectory ディレクトリかどうか
   */
  constructor(
    public readonly label: string,
    resourceUri: vscode.Uri,
    public readonly isDirectory: boolean
  ) {
    super(resourceUri, vscode.TreeItemCollapsibleState.None);

    // ツールチップに完全なパスを表示
    this.tooltip = resourceUri.fsPath;

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
        command: 'folderViewer.changeDirectory',
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
   */
  constructor(public readonly parentPath: string) {
    super('..', vscode.TreeItemCollapsibleState.None);

    this.tooltip = `Go to parent directory: ${parentPath}`;
    this.iconPath = new vscode.ThemeIcon('arrow-up');
    this.command = {
      command: 'folderViewer.changeDirectory',
      title: 'Go to Parent Directory',
      arguments: [parentPath],
    };
    this.contextValue = 'parentDirectory';
  }
}
