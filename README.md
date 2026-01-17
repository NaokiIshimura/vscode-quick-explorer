# Quick Explorer

Quick and interactive explorer for VSCode

## Features

- **Explorer Integration**: Adds a "Quick Explorer" panel to the VSCode Explorer sidebar
- **Directory Navigation**: Click on folders to navigate through directories
- **Parent Directory Navigation**: Use ".." to move up to the parent directory
- **File Opening**: Click on files to open them in the VSCode editor
- **Project Root Restriction**: Cannot navigate above the project root directory
- **Relative Path Display**: View title shows the relative path from the project root
- **Icon Support**: Folders and files are displayed with appropriate icons

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
6. The view title shows your current location relative to the project root

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
│   └── fileSystemService.ts         # File system operations
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
