import { describe, it, expect, vi } from 'vitest';

// VSCode APIをモック
vi.mock('vscode', () => import('./__mocks__/vscode'));

import { QuickExplorerTreeItem, ParentDirectoryTreeItem } from '../quickExplorerTreeItem';
import { Uri, TreeItemCollapsibleState } from './__mocks__/vscode';

describe('QuickExplorerTreeItem', () => {
  describe('directory item', () => {
    it('should create a directory item with correct properties', () => {
      const uri = Uri.file('/workspace/project/src');
      const item = new QuickExplorerTreeItem('src', uri, true);

      expect(item.label).toBe('src');
      expect(item.isDirectory).toBe(true);
      expect(item.contextValue).toBe('folder');
      expect(item.collapsibleState).toBe(TreeItemCollapsibleState.None);
    });

    it('should set folder icon for directory', () => {
      const uri = Uri.file('/workspace/project/src');
      const item = new QuickExplorerTreeItem('src', uri, true);

      expect(item.iconPath).toBeDefined();
      expect((item.iconPath as { id: string }).id).toBe('symbol-folder');
    });

    it('should set changeDirectory command for directory', () => {
      const uri = Uri.file('/workspace/project/src');
      const item = new QuickExplorerTreeItem('src', uri, true);

      expect(item.command).toBeDefined();
      expect(item.command!.command).toBe('quickExplorer.changeDirectory');
      expect(item.command!.title).toBe('Change Directory');
      expect(item.command!.arguments).toEqual(['/workspace/project/src']);
    });

    it('should show relative path as tooltip when projectRoot is provided', () => {
      const uri = Uri.file('/workspace/project/src/components');
      const item = new QuickExplorerTreeItem('components', uri, true, '/workspace/project');

      expect(item.tooltip).toBe('src/components');
    });

    it('should show absolute path as tooltip when projectRoot is not provided', () => {
      const uri = Uri.file('/workspace/project/src');
      const item = new QuickExplorerTreeItem('src', uri, true);

      expect(item.tooltip).toBe('/workspace/project/src');
    });

    it('should show "." as tooltip when path equals projectRoot', () => {
      const uri = Uri.file('/workspace/project');
      const item = new QuickExplorerTreeItem('project', uri, true, '/workspace/project');

      expect(item.tooltip).toBe('.');
    });
  });

  describe('file item', () => {
    it('should create a file item with correct properties', () => {
      const uri = Uri.file('/workspace/project/index.ts');
      const item = new QuickExplorerTreeItem('index.ts', uri, false);

      expect(item.label).toBe('index.ts');
      expect(item.isDirectory).toBe(false);
      expect(item.contextValue).toBe('file');
      expect(item.collapsibleState).toBe(TreeItemCollapsibleState.None);
    });

    it('should not set folder icon for file', () => {
      const uri = Uri.file('/workspace/project/index.ts');
      const item = new QuickExplorerTreeItem('index.ts', uri, false);

      // ファイルの場合はiconPathが設定されない（VSCodeがファイルタイプに応じてアイコンを設定）
      expect(item.iconPath).toBeUndefined();
    });

    it('should set vscode.open command for file', () => {
      const uri = Uri.file('/workspace/project/index.ts');
      const item = new QuickExplorerTreeItem('index.ts', uri, false);

      expect(item.command).toBeDefined();
      expect(item.command!.command).toBe('vscode.open');
      expect(item.command!.title).toBe('Open File');
      expect(item.command!.arguments).toHaveLength(1);
      expect((item.command!.arguments![0] as Uri).fsPath).toBe('/workspace/project/index.ts');
    });
  });
});

describe('ParentDirectoryTreeItem', () => {
  it('should create parent directory item with ".." label', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project');

    expect(item.label).toBe('..');
    expect(item.collapsibleState).toBe(TreeItemCollapsibleState.None);
    expect(item.contextValue).toBe('parentDirectory');
  });

  it('should set arrow-up icon', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project');

    expect(item.iconPath).toBeDefined();
    expect((item.iconPath as { id: string }).id).toBe('arrow-up');
  });

  it('should set changeDirectory command with parent path', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project');

    expect(item.command).toBeDefined();
    expect(item.command!.command).toBe('quickExplorer.changeDirectory');
    expect(item.command!.title).toBe('Go to Parent Directory');
    expect(item.command!.arguments).toEqual(['/workspace/project']);
  });

  it('should show relative path in tooltip when projectRoot is provided', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project/src', '/workspace/project');

    expect(item.tooltip).toBe('Go to parent directory: src');
  });

  it('should show absolute path in tooltip when projectRoot is not provided', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project');

    expect(item.tooltip).toBe('Go to parent directory: /workspace/project');
  });

  it('should show "." in tooltip when parent is projectRoot', () => {
    const item = new ParentDirectoryTreeItem('/workspace/project', '/workspace/project');

    expect(item.tooltip).toBe('Go to parent directory: .');
  });
});
