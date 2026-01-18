/**
 * ソート順の種類を定義するEnum
 */
export enum SortOrder {
  /** フォルダ優先 + 名前昇順（デフォルト） */
  FolderFirstNameAsc = 'folder-first-name-asc',
  /** フォルダ優先 + 名前降順 */
  FolderFirstNameDesc = 'folder-first-name-desc',
  /** フォルダ優先 + 変更日時昇順 */
  FolderFirstModifiedAsc = 'folder-first-modified-asc',
  /** フォルダ優先 + 変更日時降順 */
  FolderFirstModifiedDesc = 'folder-first-modified-desc'
}

/**
 * SortOrder enumを設定値の文字列に変換
 * @param sortOrder SortOrder enum値
 * @returns 設定値の文字列
 */
export function sortOrderToString(sortOrder: SortOrder): string {
  switch (sortOrder) {
    case SortOrder.FolderFirstNameAsc:
      return 'folderFirstNameAsc';
    case SortOrder.FolderFirstNameDesc:
      return 'folderFirstNameDesc';
    case SortOrder.FolderFirstModifiedAsc:
      return 'folderFirstModifiedAsc';
    case SortOrder.FolderFirstModifiedDesc:
      return 'folderFirstModifiedDesc';
  }
}

/**
 * 設定値の文字列をSortOrder enumに変換
 * @param value 設定値の文字列
 * @returns SortOrder enum値
 */
export function stringToSortOrder(value: string): SortOrder {
  switch (value) {
    case 'folderFirstNameDesc':
      return SortOrder.FolderFirstNameDesc;
    case 'folderFirstModifiedAsc':
      return SortOrder.FolderFirstModifiedAsc;
    case 'folderFirstModifiedDesc':
      return SortOrder.FolderFirstModifiedDesc;
    case 'folderFirstNameAsc':
    default:
      return SortOrder.FolderFirstNameAsc;
  }
}
