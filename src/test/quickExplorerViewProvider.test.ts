import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

// VSCode APIをモック
vi.mock('vscode', () => import('./__mocks__/vscode'));

import { QuickExplorerViewProvider } from '../quickExplorerViewProvider';
import { FileSystemService } from '../fileSystemService';
import { SortOrder } from '../types';
import { QuickExplorerTreeItem, ParentDirectoryTreeItem } from '../quickExplorerTreeItem';
import { setMockWorkspaceFolders, resetMockConfig, Uri, setMockConfig } from './__mocks__/vscode';

describe('QuickExplorerViewProvider', () => {
  let provider: QuickExplorerViewProvider;
  let fileSystemService: FileSystemService;
  let testDir: string;

  beforeEach(async () => {
    resetMockConfig();

    // テスト用の一時ディレクトリを作成
    testDir = path.join(os.tmpdir(), `quick-explorer-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'subdir'));
    await fs.writeFile(path.join(testDir, 'file.txt'), 'content');

    // ワークスペースフォルダをテストディレクトリに設定
    setMockWorkspaceFolders([
      { uri: Uri.file(testDir), name: 'test', index: 0 },
    ]);

    fileSystemService = new FileSystemService();
    provider = new QuickExplorerViewProvider(fileSystemService);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // 削除に失敗しても無視
    }
  });

  describe('initialization', () => {
    it('should initialize with workspace root as current directory', () => {
      expect(provider.getCurrentDirectory()).toBe(testDir);
    });

    it('should initialize with workspace root as project root', () => {
      expect(provider.getProjectRoot()).toBe(testDir);
    });

    it('should initialize with default sort order', () => {
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstNameAsc);
    });

    it('should load sort order from config', () => {
      setMockConfig('quickExplorer', 'defaultSortOrder', 'folderFirstNameDesc');
      const newProvider = new QuickExplorerViewProvider(fileSystemService);
      expect(newProvider.getSortOrder()).toBe(SortOrder.FolderFirstNameDesc);
    });
  });

  describe('getTreeItem', () => {
    it('should return the same tree item', () => {
      const uri = Uri.file('/workspace/project/src');
      const item = new QuickExplorerTreeItem('src', uri, true);
      const result = provider.getTreeItem(item);
      expect(result).toBe(item);
    });
  });

  describe('getChildren', () => {
    it('should return directory contents when element is undefined', async () => {
      const children = await provider.getChildren();

      expect(children.length).toBeGreaterThan(0);
      // ファイルとディレクトリが含まれる
      const names = children.map((c) => (c as QuickExplorerTreeItem).label);
      expect(names).toContain('subdir');
      expect(names).toContain('file.txt');
    });

    it('should not include parent directory item when at project root', async () => {
      const children = await provider.getChildren();

      const hasParentItem = children.some((c) => c instanceof ParentDirectoryTreeItem);
      expect(hasParentItem).toBe(false);
    });

    it('should include parent directory item when not at project root', async () => {
      await provider.changeDirectory(path.join(testDir, 'subdir'));
      const children = await provider.getChildren();

      const hasParentItem = children.some((c) => c.label === '..');
      expect(hasParentItem).toBe(true);
    });

    it('should return empty array for non-root element (flat list)', async () => {
      const uri = Uri.file(path.join(testDir, 'subdir'));
      const item = new QuickExplorerTreeItem('subdir', uri, true);
      const children = await provider.getChildren(item);

      expect(children).toEqual([]);
    });
  });

  describe('changeDirectory', () => {
    it('should change current directory', async () => {
      const subDirPath = path.join(testDir, 'subdir');
      await provider.changeDirectory(subDirPath);

      expect(provider.getCurrentDirectory()).toBe(subDirPath);
    });

    it('should not change to non-directory path', async () => {
      const filePath = path.join(testDir, 'file.txt');
      const originalDir = provider.getCurrentDirectory();

      await provider.changeDirectory(filePath);

      expect(provider.getCurrentDirectory()).toBe(originalDir);
    });

    it('should not navigate above project root', async () => {
      const parentPath = path.dirname(testDir);

      await provider.changeDirectory(parentPath);

      expect(provider.getCurrentDirectory()).toBe(testDir);
    });
  });

  describe('goUp', () => {
    it('should navigate to parent directory', async () => {
      const subDirPath = path.join(testDir, 'subdir');
      await provider.changeDirectory(subDirPath);

      await provider.goUp();

      expect(provider.getCurrentDirectory()).toBe(testDir);
    });

    it('should not navigate above project root', async () => {
      await provider.goUp();

      expect(provider.getCurrentDirectory()).toBe(testDir);
    });
  });

  describe('getRelativePath', () => {
    it('should return "." for project root', () => {
      expect(provider.getRelativePath()).toBe('.');
    });

    it('should return relative path for subdirectory', async () => {
      await provider.changeDirectory(path.join(testDir, 'subdir'));

      expect(provider.getRelativePath()).toBe('subdir');
    });
  });

  describe('toggleSortOrder', () => {
    it('should cycle through sort orders', () => {
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstNameAsc);

      provider.toggleSortOrder();
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstNameDesc);

      provider.toggleSortOrder();
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstModifiedAsc);

      provider.toggleSortOrder();
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstModifiedDesc);

      provider.toggleSortOrder();
      expect(provider.getSortOrder()).toBe(SortOrder.FolderFirstNameAsc);
    });
  });

  describe('refresh', () => {
    it('should fire onDidChangeTreeData event', () => {
      let fired = false;
      provider.onDidChangeTreeData(() => {
        fired = true;
      });

      provider.refresh();

      expect(fired).toBe(true);
    });
  });
});
