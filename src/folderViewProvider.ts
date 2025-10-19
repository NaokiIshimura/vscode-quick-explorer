import * as vscode from 'vscode';
import { FileSystemService } from './fileSystemService';
import { FolderTreeItem, ParentDirectoryTreeItem } from './folderTreeItem';

/**
 * Folder ViewのTreeDataProvider
 * ディレクトリ内容の表示とナビゲーションを担当
 */
export class FolderViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  /** 現在表示しているディレクトリのパス */
  private currentDirectory: string;

  /** プロジェクトルート（これより上には移動しない） */
  private readonly projectRoot: string;

  /** ビュー更新のためのイベントエミッター */
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> =
    new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();

  /** ビュー更新イベント */
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  /**
   * @param fileSystemService ファイルシステムサービス
   */
  constructor(private fileSystemService: FileSystemService) {
    // 初期ディレクトリを設定（ワークスペースルートまたはホームディレクトリ）
    this.currentDirectory = this.fileSystemService.getInitialDirectory();
    this.projectRoot = this.currentDirectory;
  }

  /**
   * TreeItemを取得する
   * @param element ツリー要素
   * @returns TreeItem
   */
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * 子要素を取得する
   * @param element 親要素（undefinedの場合はルート）
   * @returns 子要素の配列
   */
  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    // ルート要素の場合、currentDirectoryの内容を返す
    if (!element) {
      try {
        const items: vscode.TreeItem[] = [];

        // プロジェクトルートでない場合は、親ディレクトリへの移動アイテムを追加
        if (!this.isAtProjectRoot()) {
          const parentPath = this.fileSystemService.getParentDirectory(this.currentDirectory);
          items.push(new ParentDirectoryTreeItem(parentPath));
        }

        // 現在のディレクトリの内容を取得
        const entries = await this.fileSystemService.getDirectoryContents(this.currentDirectory);

        // 各エントリをTreeItemに変換
        const treeItems = entries.map((entry) => {
          const item = new FolderTreeItem(
            entry.name,
            vscode.Uri.file(entry.path),
            entry.isDirectory
          );
          return item;
        });

        items.push(...treeItems);
        return items;
      } catch (error) {
        // エラーが発生した場合は空の配列を返す
        console.error('Failed to get directory contents:', error);
        return [];
      }
    }

    // 子要素を持たない（フラットなリスト表示）
    return [];
  }

  /**
   * ディレクトリを変更する
   * @param directoryPath 新しいディレクトリのパス
   */
  async changeDirectory(directoryPath: string): Promise<void> {
    try {
      // パスがディレクトリであることを確認
      const isDir = await this.fileSystemService.isDirectory(directoryPath);
      if (!isDir) {
        vscode.window.showWarningMessage(`Not a directory: ${directoryPath}`);
        return;
      }

      // プロジェクトルートより上には移動しない
      if (!this.isPathWithinProjectRoot(directoryPath)) {
        vscode.window.showInformationMessage('Cannot navigate above project root');
        return;
      }

      // currentDirectoryを更新
      this.currentDirectory = directoryPath;

      // ビューをリフレッシュ
      this.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to change directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * ビューをリフレッシュする
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * 現在のディレクトリパスを取得する
   * @returns 現在のディレクトリパス
   */
  getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  /**
   * 親ディレクトリに移動する
   */
  async goUp(): Promise<void> {
    if (!this.isAtProjectRoot()) {
      const parentPath = this.fileSystemService.getParentDirectory(this.currentDirectory);
      await this.changeDirectory(parentPath);
    } else {
      vscode.window.showInformationMessage('Already at project root');
    }
  }

  /**
   * 現在のディレクトリがプロジェクトルートかどうかを判定する
   * @returns プロジェクトルートの場合true
   */
  private isAtProjectRoot(): boolean {
    return this.currentDirectory === this.projectRoot;
  }

  /**
   * 指定されたパスがプロジェクトルート配下かどうかを判定する
   * @param path 判定するパス
   * @returns プロジェクトルート配下の場合true
   */
  private isPathWithinProjectRoot(path: string): boolean {
    // パスを正規化して比較
    const normalizedPath = path.replace(/\\/g, '/');
    const normalizedRoot = this.projectRoot.replace(/\\/g, '/');

    return normalizedPath === normalizedRoot || normalizedPath.startsWith(normalizedRoot + '/');
  }
}
