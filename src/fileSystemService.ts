import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';

/**
 * ファイル/フォルダエントリの情報
 */
export interface FileEntry {
  /** ファイル/フォルダ名 */
  name: string;
  /** 絶対パス */
  path: string;
  /** ディレクトリかどうか */
  isDirectory: boolean;
}

/**
 * ファイルシステム操作を担当するサービス
 */
export class FileSystemService {
  /**
   * 指定されたディレクトリの内容を取得する
   * @param directoryPath ディレクトリの絶対パス
   * @returns ファイル/フォルダエントリの配列（フォルダ優先、アルファベット順でソート済み）
   */
  async getDirectoryContents(directoryPath: string): Promise<FileEntry[]> {
    try {
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });

      const fileEntries: FileEntry[] = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(directoryPath, entry.name);
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
          };
        })
      );

      // フォルダ優先、アルファベット順でソート
      return fileEntries.sort((a, b) => {
        // フォルダ優先
        if (a.isDirectory && !b.isDirectory) {
          return -1;
        }
        if (!a.isDirectory && b.isDirectory) {
          return 1;
        }
        // 同じタイプの場合はアルファベット順
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to read directory: ${directoryPath}. ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * 指定されたパスがディレクトリかどうかを判定する
   * @param filePath ファイル/ディレクトリのパス
   * @returns ディレクトリの場合true
   */
  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * ワークスペースのルートディレクトリを取得する
   * @returns ワークスペースのルートパス（存在しない場合はundefined）
   */
  getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
    return undefined;
  }

  /**
   * ユーザーのホームディレクトリを取得する
   * @returns ホームディレクトリのパス
   */
  getHomeDirectory(): string {
    return os.homedir();
  }

  /**
   * 初期ディレクトリを取得する
   * ワークスペースが開かれている場合はそのルート、そうでない場合はホームディレクトリを返す
   * @returns 初期ディレクトリのパス
   */
  getInitialDirectory(): string {
    return this.getWorkspaceRoot() || this.getHomeDirectory();
  }

  /**
   * 親ディレクトリのパスを取得する
   * @param currentPath 現在のディレクトリパス
   * @returns 親ディレクトリのパス
   */
  getParentDirectory(currentPath: string): string {
    return path.dirname(currentPath);
  }

  /**
   * 指定されたパスがルートディレクトリかどうかを判定する
   * @param directoryPath ディレクトリパス
   * @returns ルートディレクトリの場合true
   */
  isRootDirectory(directoryPath: string): boolean {
    const parentPath = path.dirname(directoryPath);
    return parentPath === directoryPath;
  }
}
