# TypeScript Integration Roadmap for Neon Geometry Tower Defense

## Current Project Analysis

The current project is a Tower Defense game with the following architecture:
- Backend: Written in Zig, compiled to WebAssembly (WASM)
- Frontend: Plain JavaScript, HTML, and CSS
- Build System: Zig build script that compiles Zig to WASM and deploys assets to a `www` directory
- Server: Simple HTTP server (http-zerver) for local development

The Zig code exposes functions through WebAssembly that are called by the JavaScript frontend. The current workflow compiles Zig code to WASM, copies it to the `www` directory along with all the web assets, and serves them via a simple HTTP server.

## Benefits of TypeScript Integration

1. **Type Safety**: TypeScript will provide type checking to catch errors at compile time rather than runtime.
2. **Better IDE Support**: Code completion, refactoring tools, and inline documentation.
3. **Modern JavaScript Features**: Access to the latest ECMAScript features, transpiled to work in all browsers.
4. **Improved Maintainability**: Types as documentation, easier refactoring, and better organization with modules.
5. **Better Integration with WASM**: TypeScript allows defining proper interfaces for WASM module interactions.

## Recommendations for TypeScript Integration

### 1. Project Structure

I recommend reorganizing the project structure as follows:

```
tower-def-geometry/
├── src/                      # Zig source code (unchanged)
├── build.zig                 # Zig build file (to be updated)
├── assets/                   # Game assets (unchanged)
├── web/                      # Renamed from www
│   ├── src/                  # TypeScript source files
│   │   ├── main.ts           # Main entry point
│   │   ├── wasm/             # WASM interaction layer
│   │   │   └── wasm-loader.ts # TypeScript version of wasm-loader
│   │   ├── game/             # Game-specific logic
│   │   ├── renderer/         # Rendering logic
│   │   ├── audio/            # Audio system
│   │   └── ui/               # UI components
│   ├── types/                # TypeScript declaration files
│   │   └── wasm.d.ts         # Type definitions for WASM functions
│   ├── styles/               # CSS files (renamed from css)
│   ├── public/               # Static assets that don't need processing
│   │   ├── audio/            # Audio files
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── index.html            # Main HTML file
│   └── tsconfig.json         # TypeScript configuration
├── dist/                     # Output directory for deployed files
│   ├── js/                   # Compiled JavaScript
│   ├── css/                  # Processed CSS
│   ├── audio/                # Audio files
│   ├── towerd.wasm           # WASM file
│   ├── index.html            # Processed HTML
│   └── ...                   # Other assets
└── package.json              # Bun package configuration
```

### 2. Build Tools Selection

#### TypeScript Compiler and Bundler

For TypeScript compilation and bundling, we will use Bun exclusively. Bun provides:

- Native TypeScript support without additional dependencies
- Extremely fast compilation and bundling
- Built-in development server with hot reloading
- Minimal configuration required

This approach keeps dependencies minimal and simplifies the development workflow by using a single tool for package management, TypeScript compilation, bundling, and serving.

#### Development Server

We will replace the custom HTTP server (http-zerver) with Bun's built-in server. This reduces dependencies and simplifies the setup, requiring only Zig and Bun to be installed.

### 3. Implementation Plan

#### Step 1: Initialize TypeScript Project

1. Create a `package.json` file:
```bash
bun init
```

2. Install required dependencies:
```bash
bun add typescript --dev
bun add @types/web --dev  # For web API types
```

3. Create a `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist/js",
    "rootDir": "./web/src",
    "sourceMap": true,
    "declaration": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["web/src/*"]
    }
  },
  "include": ["web/src/**/*.ts", "web/types/**/*.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

#### Step 2: Create TypeScript Declaration Files for WASM

Create a `web/types/wasm.d.ts` file to define the interface between TypeScript and the WASM module:

```typescript
// Type definitions for tower-def-geometry WASM module
declare module "wasm" {
  // Functions exported from Zig to JavaScript
  export function init(width: number, height: number): void;
  export function resetGame(): void;
  export function update(deltaTime: number): void;
  export function handleClick(x: number, y: number): void;
  export function selectTowerType(towerType: number): void;
  export function canPlaceTower(x: number, y: number): boolean;
  export function getTowerRange(): number;
  
  // Add additional exported functions as needed
}
```

#### Step 3: Convert JavaScript Files to TypeScript

Convert the existing JavaScript files to TypeScript, starting with the WASM loader:

1. Create `web/src/wasm/wasm-loader.ts` based on the current `wasm-loader.js`
2. Create `web/src/main.ts` based on the current `main.js`
3. Convert other JavaScript files to TypeScript, adding appropriate types

#### Step 4: Update the Build Process

Modify `build.zig` to incorporate TypeScript compilation and asset processing using Bun:

1. Add a step to run the Bun build process
2. Update the deployment paths to the new structure
3. Configure the build to output to the `dist` directory
4. Replace http-zerver with Bun's server

#### Step 5: Add Development Scripts

Add useful scripts to the `package.json`:

```json
{
  "scripts": {
    "dev": "bun --hot web/src/main.ts --serve --port 8000",
    "build": "bun build web/src/main.ts --outdir dist/js",
    "check": "tsc --noEmit",
    "start": "zig build run"
  }
}
```

### 4. Integration with Zig Build System

Here's how to update `build.zig` to incorporate Bun for TypeScript compilation and serving:

```zig
// Add to build.zig
const bun_build_cmd = if (builtin.os.tag == .windows)
    &[_][]const u8{"cmd", "/c", "bun", "run", "build"}
else
    &[_][]const u8{"bun", "run", "build"};

const build_ts = b.addSystemCommand(bun_build_cmd);
build_ts.step.dependOn(&make_dirs.step);

// Update the output paths
const copy_wasm = b.addInstallFile(exe.getEmittedBin(), "../dist/towerd.wasm");
copy_wasm.step.dependOn(b.getInstallStep());
copy_wasm.step.dependOn(&build_ts.step);

// Use Bun as the development server
const bun_serve_cmd = if (builtin.os.tag == .windows)
    &[_][]const u8{"cmd", "/c", "bun", "serve", "--port", "8000", "dist"}
else
    &[_][]const u8{"bun", "serve", "--port", "8000", "dist"};

const run_cmd = b.addSystemCommand(bun_serve_cmd);
```

### 5. Development Workflow

The new development workflow will be:

1. Write Zig code in the `src` directory
2. Write TypeScript code in the `web/src` directory
3. Run `bun run dev` for TypeScript development with hot reloading
4. Run `zig build run` to:
   - Compile Zig to WASM
   - Compile TypeScript to JavaScript using Bun
   - Copy all assets to the `dist` directory
   - Start the Bun development server

## Implementation Notes

### Type-safe WASM Integration

For a better typed interface to the WASM module, consider this approach in your TypeScript:

```typescript
// web/src/wasm/wasm-loader.ts
import type { WasmModule } from "../types/wasm";

export class WasmLoader {
  private wasmModule: WasmModule | null = null;
  
  async loadWasm(): Promise<WasmModule> {
    if (this.wasmModule) return this.wasmModule;
    
    try {
      const importObject = {
        env: {
          // Any required JavaScript functions that Zig calls
        }
      };
      
      const response = await fetch('towerd.wasm');
      const bytes = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, importObject);
      
      this.wasmModule = instance.exports as unknown as WasmModule;
      return this.wasmModule;
    } catch (error) {
      console.error('Failed to load WASM module:', error);
      throw error;
    }
  }
}
```

### Linting

For code quality and consistency, consider adding ESLint with TypeScript support:

```bash
bun add eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev
```

Create an `.eslintrc.js` configuration:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // Custom rules
  }
};
```

### Future Enhancements: WebGPU Integration

A stretch goal for this project is to incorporate WebGPU for hardware-accelerated graphics:

1. **Initial Implementation**: Use ThreeJS with its WebGPU renderer for 3D graphics
2. **Advanced Implementation**: Create direct Zig WebGPU bindings for maximum performance
3. **Benefits**:
   - Hardware-accelerated rendering
   - Access to modern GPU features
   - Compute capabilities for physics and simulations

## Conclusion

This roadmap provides a comprehensive plan for integrating TypeScript into your Zig WebAssembly tower defense game. The approach focuses on:

1. Minimizing dependencies by using Bun exclusively for all frontend tooling
2. Creating a clear separation between Zig and TypeScript code
3. Ensuring type safety across the codebase
4. Maintaining a simple build process
5. Keeping the development workflow efficient
6. Providing a path to WebGPU integration for future enhancements

By following this roadmap, you'll have a modern, type-safe frontend that integrates seamlessly with your Zig WebAssembly backend while maintaining a minimal dependency footprint. 