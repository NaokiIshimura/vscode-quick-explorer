import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// VSCode APIをモック
vi.mock('vscode', () => import('./__mocks__/vscode'));

import { FileSystemService } from '../fileSystemService';
import { SortOrder } from '../types';
import { setMockWorkspaceFolders, resetMockConfig, Uri, setMockConfig } from './__mocks__/vscode';

// テスト用のディレクトリを作成するヘルパー関数
async function createTestDir(): Promise<string> {
  const testDir = path.join(os.tmpdir(), `quick-explorer-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(testDir, { recursive: true });
  return testDir;
}

// テスト用のディレクトリを削除するヘルパー関数
async function removeTestDir(testDir: string): Promise<void> {
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch {
    // 削除に失敗しても無視
  }
}

// ソートテスト用のファイルとディレクトリを作成するヘルパー関数
async function createSortTestFiles(testDir: string): Promise<void> {
  await fs.mkdir(path.join(testDir, 'folderA'));
  await fs.mkdir(path.join(testDir, 'folderB'));
  await fs.writeFile(path.join(testDir, 'fileA.txt'), 'content A');
  await fs.writeFile(path.join(testDir, 'fileB.txt'), 'content B');

  // 変更日時を設定（fileA: 古い, fileB: 新しい）
  const oldTime = new Date('2020-01-01');
  const newTime = new Date('2024-01-01');
  await fs.utimes(path.join(testDir, 'fileA.txt'), oldTime, oldTime);
  await fs.utimes(path.join(testDir, 'fileB.txt'), newTime, newTime);
  await fs.utimes(path.join(testDir, 'folderA'), oldTime, oldTime);
  await fs.utimes(path.join(testDir, 'folderB'), newTime, newTime);
}

describe('FileSystemService', () => {
  let service: FileSystemService;

  beforeEach(() => {
    service = new FileSystemService();
    resetMockConfig();
    setMockWorkspaceFolders(undefined);
  });

  describe('getDirectoryContents', () => {
    it('should return directory contents', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir);

        expect(entries).toHaveLength(4);
        expect(entries.map((e) => e.name)).toContain('folderA');
        expect(entries.map((e) => e.name)).toContain('folderB');
        expect(entries.map((e) => e.name)).toContain('fileA.txt');
        expect(entries.map((e) => e.name)).toContain('fileB.txt');
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should sort folders first by name ascending (default)', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir, SortOrder.FolderFirstNameAsc);

        // フォルダが先、名前昇順
        expect(entries[0].name).toBe('folderA');
        expect(entries[0].isDirectory).toBe(true);
        expect(entries[1].name).toBe('folderB');
        expect(entries[1].isDirectory).toBe(true);
        expect(entries[2].name).toBe('fileA.txt');
        expect(entries[2].isDirectory).toBe(false);
        expect(entries[3].name).toBe('fileB.txt');
        expect(entries[3].isDirectory).toBe(false);
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should sort folders first by name descending', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir, SortOrder.FolderFirstNameDesc);

        // フォルダが先、名前降順
        expect(entries[0].name).toBe('folderB');
        expect(entries[1].name).toBe('folderA');
        expect(entries[2].name).toBe('fileB.txt');
        expect(entries[3].name).toBe('fileA.txt');
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should sort folders first by modified time ascending', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir, SortOrder.FolderFirstModifiedAsc);

        // フォルダが先、変更日時昇順（古い順）
        expect(entries[0].name).toBe('folderA'); // 古い
        expect(entries[1].name).toBe('folderB'); // 新しい
        expect(entries[2].name).toBe('fileA.txt'); // 古い
        expect(entries[3].name).toBe('fileB.txt'); // 新しい
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should sort folders first by modified time descending', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir, SortOrder.FolderFirstModifiedDesc);

        // フォルダが先、変更日時降順（新しい順）
        expect(entries[0].name).toBe('folderB'); // 新しい
        expect(entries[1].name).toBe('folderA'); // 古い
        expect(entries[2].name).toBe('fileB.txt'); // 新しい
        expect(entries[3].name).toBe('fileA.txt'); // 古い
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should include correct file entry properties', async () => {
      const testDir = await createTestDir();
      try {
        await createSortTestFiles(testDir);
        const entries = await service.getDirectoryContents(testDir);
        const fileEntry = entries.find((e) => e.name === 'fileA.txt');

        expect(fileEntry).toBeDefined();
        expect(fileEntry!.path).toBe(path.join(testDir, 'fileA.txt'));
        expect(fileEntry!.isDirectory).toBe(false);
        expect(fileEntry!.modifiedTime).toBeInstanceOf(Date);
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should throw error for non-existent directory', async () => {
      const testDir = await createTestDir();
      try {
        const nonExistentDir = path.join(testDir, 'non-existent');
        await expect(service.getDirectoryContents(nonExistentDir)).rejects.toThrow();
      } finally {
        await removeTestDir(testDir);
      }
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', async () => {
      const testDir = await createTestDir();
      try {
        await fs.mkdir(path.join(testDir, 'subfolder'));
        const result = await service.isDirectory(path.join(testDir, 'subfolder'));
        expect(result).toBe(true);
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should return false for file', async () => {
      const testDir = await createTestDir();
      try {
        await fs.writeFile(path.join(testDir, 'file.txt'), 'content');
        const result = await service.isDirectory(path.join(testDir, 'file.txt'));
        expect(result).toBe(false);
      } finally {
        await removeTestDir(testDir);
      }
    });

    it('should return false for non-existent path', async () => {
      const testDir = await createTestDir();
      try {
        const result = await service.isDirectory(path.join(testDir, 'non-existent'));
        expect(result).toBe(false);
      } finally {
        await removeTestDir(testDir);
      }
    });
  });

  describe('getWorkspaceRoot', () => {
    it('should return undefined when no workspace folders', () => {
      setMockWorkspaceFolders(undefined);
      const result = service.getWorkspaceRoot();
      expect(result).toBeUndefined();
    });

    it('should return first workspace folder path', () => {
      setMockWorkspaceFolders([
        { uri: Uri.file('/workspace/project'), name: 'project', index: 0 },
      ]);
      const result = service.getWorkspaceRoot();
      expect(result).toBe('/workspace/project');
    });
  });

  describe('getHomeDirectory', () => {
    it('should return home directory', () => {
      const result = service.getHomeDirectory();
      expect(result).toBe(os.homedir());
    });
  });

  describe('getInitialDirectory', () => {
    it('should return workspace root when available', () => {
      setMockWorkspaceFolders([
        { uri: Uri.file('/workspace/project'), name: 'project', index: 0 },
      ]);
      const result = service.getInitialDirectory();
      expect(result).toBe('/workspace/project');
    });

    it('should return home directory when no workspace', () => {
      setMockWorkspaceFolders(undefined);
      const result = service.getInitialDirectory();
      expect(result).toBe(os.homedir());
    });

    it('should return configured path when valid', async () => {
      const testDir = await createTestDir();
      try {
        setMockConfig('quickExplorer', 'defaultPath', testDir);
        const newService = new FileSystemService();
        const result = newService.getInitialDirectory();
        expect(result).toBe(testDir);
      } finally {
        await removeTestDir(testDir);
      }
    });
  });

  describe('getParentDirectory', () => {
    it('should return parent directory path', () => {
      const result = service.getParentDirectory('/workspace/project/src');
      expect(result).toBe('/workspace/project');
    });

    it('should handle root directory', () => {
      const result = service.getParentDirectory('/');
      expect(result).toBe('/');
    });
  });

  describe('isRootDirectory', () => {
    it('should return true for root directory', () => {
      const result = service.isRootDirectory('/');
      expect(result).toBe(true);
    });

    it('should return false for non-root directory', () => {
      const result = service.isRootDirectory('/workspace/project');
      expect(result).toBe(false);
    });
  });
});
