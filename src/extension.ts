import * as vscode from 'vscode';
import { FileSystemService } from './fileSystemService';
import { FolderViewProvider } from './folderViewProvider';

/**
 * 拡張機能のアクティベーション時に呼ばれる関数
 * @param context 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Folder Viewer extension is now active');

  // FileSystemServiceのインスタンス化
  const fileSystemService = new FileSystemService();

  // FolderViewProviderのインスタンス化
  const folderViewProvider = new FolderViewProvider(fileSystemService);

  // TreeViewの作成と登録
  const treeView = vscode.window.createTreeView('folderViewer', {
    treeDataProvider: folderViewProvider,
    showCollapseAll: false,
  });

  // TreeViewのタイトルに現在のディレクトリパスを表示
  updateTreeViewTitle(treeView, folderViewProvider.getCurrentDirectory());

  // changeDirectoryコマンドの登録
  const changeDirectoryCommand = vscode.commands.registerCommand(
    'folderViewer.changeDirectory',
    async (directoryPath: string) => {
      await folderViewProvider.changeDirectory(directoryPath);
      updateTreeViewTitle(treeView, folderViewProvider.getCurrentDirectory());
    }
  );

  // refreshコマンドの登録
  const refreshCommand = vscode.commands.registerCommand('folderViewer.refresh', () => {
    folderViewProvider.refresh();
    vscode.window.showInformationMessage('Folder Viewer refreshed');
  });

  // goUpコマンドの登録
  const goUpCommand = vscode.commands.registerCommand('folderViewer.goUp', async () => {
    await folderViewProvider.goUp();
    updateTreeViewTitle(treeView, folderViewProvider.getCurrentDirectory());
  });

  // コンテキストに登録（拡張機能の非アクティブ化時にクリーンアップされる）
  context.subscriptions.push(treeView);
  context.subscriptions.push(changeDirectoryCommand);
  context.subscriptions.push(refreshCommand);
  context.subscriptions.push(goUpCommand);
}

/**
 * TreeViewのタイトルを更新する
 * @param treeView TreeView
 * @param currentPath 現在のディレクトリパス
 */
function updateTreeViewTitle(treeView: vscode.TreeView<vscode.TreeItem>, currentPath: string) {
  treeView.description = currentPath;
}

/**
 * 拡張機能の非アクティブ化時に呼ばれる関数
 */
export function deactivate() {
  console.log('Folder Viewer extension is now deactivated');
}
