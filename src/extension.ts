import * as vscode from 'vscode';
import { FileSystemService } from './fileSystemService';
import { QuickExplorerViewProvider } from './quickExplorerViewProvider';

/**
 * 拡張機能のアクティベーション時に呼ばれる関数
 * @param context 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Quick Explorer extension is now active');

  // FileSystemServiceのインスタンス化
  const fileSystemService = new FileSystemService();

  // QuickExplorerViewProviderのインスタンス化
  const folderViewProvider = new QuickExplorerViewProvider(fileSystemService);

  // TreeViewの作成と登録
  const treeView = vscode.window.createTreeView('quickExplorer', {
    treeDataProvider: folderViewProvider,
    showCollapseAll: false,
  });

  // TreeViewのタイトルにプロジェクトルートからの相対パスを表示
  updateTreeViewTitle(treeView, folderViewProvider);

  // changeDirectoryコマンドの登録
  const changeDirectoryCommand = vscode.commands.registerCommand(
    'quickExplorer.changeDirectory',
    async (directoryPath: string) => {
      await folderViewProvider.changeDirectory(directoryPath);
      updateTreeViewTitle(treeView, folderViewProvider);
    }
  );

  // refreshコマンドの登録
  const refreshCommand = vscode.commands.registerCommand('quickExplorer.refresh', () => {
    folderViewProvider.refresh();
    vscode.window.showInformationMessage('Quick Explorer refreshed');
  });

  // goUpコマンドの登録
  const goUpCommand = vscode.commands.registerCommand('quickExplorer.goUp', async () => {
    await folderViewProvider.goUp();
    updateTreeViewTitle(treeView, folderViewProvider);
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
 * @param provider QuickExplorerViewProvider
 */
function updateTreeViewTitle(treeView: vscode.TreeView<vscode.TreeItem>, provider: QuickExplorerViewProvider) {
  treeView.description = provider.getRelativePath();
}

/**
 * 拡張機能の非アクティブ化時に呼ばれる関数
 */
export function deactivate() {
  console.log('Quick Explorer extension is now deactivated');
}
