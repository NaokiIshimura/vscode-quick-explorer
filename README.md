# Quick Explorer

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/NaokiIshimura/vscode-quick-explorer/releases) [![VS Code](https://img.shields.io/badge/VS%20Code-1.105.0%2B-blue)](https://code.visualstudio.com/) [![License](https://img.shields.io/badge/license-ISC-green)](https://opensource.org/licenses/ISC)

Quick and interactive explorer for VSCode

## Features

- **Quick Directory Navigation**: Click folders to navigate, use ".." to go up, and open files instantly. The view displays intuitive icons and shows your current path relative to the project root.
- **Flexible Sorting Options**: Toggle between 4 sort orders (folders-first with name/date, ascending/descending). Your preference is automatically saved and restored across VSCode restarts.
- **Project Root Protection**: Safely navigate within your project - you cannot accidentally move above the project root directory.
- **Seamless VSCode Integration**: Adds a native "Quick Explorer" panel to your Explorer sidebar with quick access to extension settings via the gear icon.

## Installation

### From VSIX File

1. Download the latest `.vsix` file from the [Releases](https://github.com/NaokiIshimura/vscode-quick-explorer/releases) page
2. Open VSCode
3. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/NaokiIshimura/vscode-quick-explorer.git
   cd vscode-quick-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Press F5 to open a new VSCode window with the extension loaded

## Usage

1. Open the Explorer sidebar in VSCode
2. Find the "Quick Explorer" panel
3. Click on folders to navigate into them
4. Click on ".." to go to the parent directory
5. Click on files to open them in the editor
6. Click the sort icon in the view header to toggle between sort orders:
   - Folders first, then by name (A-Z)
   - Folders first, then by name (Z-A)
   - Folders first, then by modification time (oldest first)
   - Folders first, then by modification time (newest first)
7. The view title shows your current location relative to the project root

## Settings

This extension provides the following configuration options:

- **`quickExplorer.defaultPath`**: Default directory to open on startup
  - Type: `string`
  - Default: `""` (uses workspace root or home directory)
  - Description: Specify an absolute path or a relative path from the workspace root. If empty, the workspace root or home directory will be used.

- **`quickExplorer.defaultSortOrder`**: Default sort order for files and folders
  - Type: `string` (enum)
  - Options: `folderFirstNameAsc`, `folderFirstNameDesc`, `folderFirstModifiedAsc`, `folderFirstModifiedDesc`
  - Default: `folderFirstNameAsc`
  - Description: Determines how files and folders are sorted in the explorer. This setting is automatically updated when you toggle the sort order using the sort icon.

To configure these settings:
1. Click the gear icon in the Quick Explorer view header, or
2. Go to File > Preferences > Settings and search for "Quick Explorer"

## Requirements

- VSCode version 1.105.0 or higher

## Development

### Project Structure

```
vscode-quick-explorer/
├── src/
│   ├── extension.ts                 # Extension entry point
│   ├── quickExplorerViewProvider.ts # TreeDataProvider implementation
│   ├── quickExplorerTreeItem.ts     # Tree item implementations
│   ├── fileSystemService.ts         # File system operations
│   └── types.ts                     # Type definitions and helper functions
├── out/                              # Compiled JavaScript files
├── package.json                      # Extension manifest
└── tsconfig.json                    # TypeScript configuration
```

### Build Commands

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm run lint` - Run ESLint

### Building VSIX

To create a `.vsix` package:

```bash
npx vsce package
```

## License

ISC

## Repository

https://github.com/NaokiIshimura/vscode-quick-explorer

