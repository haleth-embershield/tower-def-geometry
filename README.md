# Zig + TypeScript = WebAssembly Project Template

A modern project template for building web applications using Zig for backend logic compiled to WebAssembly, with a TypeScript frontend. The template uses a tower defense game as an example implementation.

## Technology Stack

This template demonstrates a lightweight but powerful architecture:

- **Backend**: [Zig](https://ziglang.org/) (v0.14+) compiled to WebAssembly
- **Frontend**: [TypeScript](https://www.typescriptlang.org/) with strict type-checking 
- **Package Manager**: [Bun](https://bun.sh/) for fast dependency management and development server
- **Bundler**: [esbuild](https://esbuild.github.io/) for efficient TypeScript compilation and bundling
- **Development Server**: Simple HTTP server via Zig's build system

## Why This Stack?

### Zig + WebAssembly
- **Performance**: Near-native performance for compute-intensive operations
- **Memory Safety**: Zig provides memory safety without garbage collection
- **Small Footprint**: Minimal runtime and small binary sizes
- **WebAssembly**: Runs in all modern browsers without plugins

### TypeScript Frontend
- **Type Safety**: Catch errors at compile time rather than runtime
- **Better IDE Support**: Rich code completion and inline documentation
- **Maintainability**: Types as documentation and easier refactoring
- **Modern JavaScript**: Access to the latest ECMAScript features with backwards compatibility

### Bun + esbuild
- **Speed**: Extremely fast package installation and builds
- **Simplicity**: Minimal configuration needed
- **Developer Experience**: Quick feedback loop during development

## Requirements

- [Zig](https://ziglang.org/download/) v0.14.0+
- [Bun](https://bun.sh/docs/installation) v1.0.0+
- Modern web browser with WebAssembly support

## Project Structure

```
project-root/
├── src/                      # Zig source code
├── build.zig                 # Zig build system configuration
├── setup_zerver.zig          # Development server setup
├── assets/                   # Static assets
├── web/                      # Frontend code
│   ├── src/                  # TypeScript source files
│   │   ├── main.ts           # Main entry point
│   │   ├── wasm/             # WASM interaction layer
│   │   ├── game/             # Application-specific logic
│   │   ├── renderer/         # Rendering utilities
│   │   ├── audio/            # Audio system
│   │   └── ui/               # UI components
│   ├── types/                # TypeScript declaration files
│   │   └── wasm.d.ts         # Type definitions for WASM functions
│   ├── styles/               # CSS files
│   ├── public/               # Static assets that don't need processing
│   └── index.html            # Main HTML file
├── dist/                     # Output directory for built files
├── package.json              # Bun/npm dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Getting Started

### Initial Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/zig-ts-wasm-template.git
cd zig-ts-wasm-template
```

2. Install dependencies:
```bash
bun install
```

### Development Workflow

#### For TypeScript Frontend Development

```bash
# Start the development server with hot reloading
bun run dev
```

#### For Full-Stack Development (Zig + TypeScript)

```bash
# Build everything and start the server
zig build run
```

This command:
1. Compiles Zig code to WebAssembly
2. Compiles TypeScript to JavaScript
3. Bundles JS and CSS files
4. Copies all assets to the dist directory
5. Starts the HTTP server

#### Other Useful Commands

```bash
# Type check TypeScript without emitting files
bun run check

# Lint TypeScript files
bun run lint

# Format TypeScript files
bun run format

# Build without starting the server
zig build deploy
```

## Example Implementation

This template includes a minimal tower defense game implementation:

- Zig backend handles game logic, physics, and state management
- TypeScript frontend provides UI, rendering, and audio
- WebAssembly connects the two, providing type-safe communication

### Game Features

- Four unique geometric towers with different attack patterns
- Wave-based enemy progression
- Grid-based tower placement system
- Visual and audio feedback

## Creating Your Own Project

To use this as a template for your own project:

1. Replace the game-specific logic in `src/` with your own Zig code
2. Update the TypeScript interfaces in `web/types/wasm.d.ts` to match your exports
3. Modify the frontend in `web/src/` to implement your application UI
4. Update this README.md with your project details

## Contributing

Contributions to improve this template are welcome! Please feel free to submit issues or pull requests.
