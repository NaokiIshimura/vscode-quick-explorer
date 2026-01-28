import { describe, it, expect } from 'vitest';
import { SortOrder, sortOrderToString, stringToSortOrder } from '../types';

describe('SortOrder', () => {
  describe('enum values', () => {
    it('FolderFirstNameAsc should have correct value', () => {
      expect(SortOrder.FolderFirstNameAsc).toBe('folder-first-name-asc');
    });

    it('FolderFirstNameDesc should have correct value', () => {
      expect(SortOrder.FolderFirstNameDesc).toBe('folder-first-name-desc');
    });

    it('FolderFirstModifiedAsc should have correct value', () => {
      expect(SortOrder.FolderFirstModifiedAsc).toBe('folder-first-modified-asc');
    });

    it('FolderFirstModifiedDesc should have correct value', () => {
      expect(SortOrder.FolderFirstModifiedDesc).toBe('folder-first-modified-desc');
    });
  });
});

describe('sortOrderToString', () => {
  it('should convert FolderFirstNameAsc to folderFirstNameAsc', () => {
    expect(sortOrderToString(SortOrder.FolderFirstNameAsc)).toBe('folderFirstNameAsc');
  });

  it('should convert FolderFirstNameDesc to folderFirstNameDesc', () => {
    expect(sortOrderToString(SortOrder.FolderFirstNameDesc)).toBe('folderFirstNameDesc');
  });

  it('should convert FolderFirstModifiedAsc to folderFirstModifiedAsc', () => {
    expect(sortOrderToString(SortOrder.FolderFirstModifiedAsc)).toBe('folderFirstModifiedAsc');
  });

  it('should convert FolderFirstModifiedDesc to folderFirstModifiedDesc', () => {
    expect(sortOrderToString(SortOrder.FolderFirstModifiedDesc)).toBe('folderFirstModifiedDesc');
  });
});

describe('stringToSortOrder', () => {
  it('should convert folderFirstNameAsc to FolderFirstNameAsc', () => {
    expect(stringToSortOrder('folderFirstNameAsc')).toBe(SortOrder.FolderFirstNameAsc);
  });

  it('should convert folderFirstNameDesc to FolderFirstNameDesc', () => {
    expect(stringToSortOrder('folderFirstNameDesc')).toBe(SortOrder.FolderFirstNameDesc);
  });

  it('should convert folderFirstModifiedAsc to FolderFirstModifiedAsc', () => {
    expect(stringToSortOrder('folderFirstModifiedAsc')).toBe(SortOrder.FolderFirstModifiedAsc);
  });

  it('should convert folderFirstModifiedDesc to FolderFirstModifiedDesc', () => {
    expect(stringToSortOrder('folderFirstModifiedDesc')).toBe(SortOrder.FolderFirstModifiedDesc);
  });

  it('should return default FolderFirstNameAsc for unknown value', () => {
    expect(stringToSortOrder('unknown')).toBe(SortOrder.FolderFirstNameAsc);
  });

  it('should return default FolderFirstNameAsc for empty string', () => {
    expect(stringToSortOrder('')).toBe(SortOrder.FolderFirstNameAsc);
  });
});
