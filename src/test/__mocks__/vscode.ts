/**
 * VSCode APIのモック
 */

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2,
}

export class Uri {
  readonly fsPath: string;
  readonly scheme: string;
  readonly path: string;

  private constructor(fsPath: string) {
    this.fsPath = fsPath;
    this.scheme = 'file';
    this.path = fsPath;
  }

  static file(path: string): Uri {
    return new Uri(path);
  }

  toString(): string {
    return this.fsPath;
  }
}

export class ThemeIcon {
  constructor(public readonly id: string) {}
}

export class TreeItem {
  label?: string;
  resourceUri?: Uri;
  collapsibleState?: TreeItemCollapsibleState;
  command?: Command;
  contextValue?: string;
  tooltip?: string;
  iconPath?: ThemeIcon | Uri;
  description?: string;

  constructor(
    labelOrResourceUri: string | Uri,
    collapsibleState?: TreeItemCollapsibleState
  ) {
    if (typeof labelOrResourceUri === 'string') {
      this.label = labelOrResourceUri;
    } else {
      this.resourceUri = labelOrResourceUri;
    }
    this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None;
  }
}

export interface Command {
  command: string;
  title: string;
  arguments?: unknown[];
}

export class EventEmitter<T> {
  private listeners: ((e: T) => void)[] = [];

  event = (listener: (e: T) => void) => {
    this.listeners.push(listener);
    return {
      dispose: () => {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
          this.listeners.splice(index, 1);
        }
      },
    };
  };

  fire(data: T) {
    this.listeners.forEach((listener) => listener(data));
  }
}

export interface WorkspaceFolder {
  uri: Uri;
  name: string;
  index: number;
}

// モック設定値を保持するストア
const configStore: Record<string, Record<string, unknown>> = {
  quickExplorer: {
    defaultPath: '',
    defaultSortOrder: 'folderFirstNameAsc',
  },
};

export const workspace = {
  workspaceFolders: undefined as WorkspaceFolder[] | undefined,
  getConfiguration: (section: string) => ({
    get: <T>(key: string, defaultValue?: T): T => {
      const sectionConfig = configStore[section] || {};
      return (sectionConfig[key] as T) ?? (defaultValue as T);
    },
    update: async (key: string, value: unknown, _target?: unknown) => {
      if (!configStore[section]) {
        configStore[section] = {};
      }
      configStore[section][key] = value;
    },
  }),
};

// モック設定をリセットする関数
export function resetMockConfig() {
  configStore.quickExplorer = {
    defaultPath: '',
    defaultSortOrder: 'folderFirstNameAsc',
  };
}

// モック設定を設定する関数
export function setMockConfig(section: string, key: string, value: unknown) {
  if (!configStore[section]) {
    configStore[section] = {};
  }
  configStore[section][key] = value;
}

// モックワークスペースを設定する関数
export function setMockWorkspaceFolders(folders: WorkspaceFolder[] | undefined) {
  workspace.workspaceFolders = folders;
}

export const window = {
  showErrorMessage: (message: string) => {
    console.error('[Mock Error]:', message);
    return Promise.resolve(undefined);
  },
  showWarningMessage: (message: string) => {
    console.warn('[Mock Warning]:', message);
    return Promise.resolve(undefined);
  },
  showInformationMessage: (message: string) => {
    console.log('[Mock Info]:', message);
    return Promise.resolve(undefined);
  },
  createTreeView: () => ({
    description: '',
    dispose: () => {},
  }),
};

export const commands = {
  registerCommand: () => ({
    dispose: () => {},
  }),
  executeCommand: () => Promise.resolve(),
};

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}
