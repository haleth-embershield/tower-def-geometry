# Neon Geometry Tower Defense - Refactoring Plan

This document outlines a proposed refactoring of the Neon Geometry Tower Defense codebase to improve organization, maintainability, and scalability.

## Current Structure

The current codebase is structured in two main files:
- `assets/index.html` - Contains all HTML, CSS, JavaScript, UI logic, and WebAssembly integration
- `src/main.zig` - Contains all game logic, rendering, game state management, and entity management

This monolithic approach makes the codebase difficult to maintain and extend, especially as more features are added.

## Proposed Backend Structure (Zig)

I propose refactoring the Zig codebase into the following structure:

```
src/
├── main.zig             # Entry point, minimal initialization code
├── game.zig             # Game state and main loop
├── entities/
│   ├── tower.zig        # Tower definition and logic
│   ├── enemy.zig        # Enemy definition and logic 
│   ├── projectile.zig   # Projectile definition and logic
│   └── path.zig         # Path system definition
├── systems/
│   ├── combat.zig       # Combat and collision detection logic
│   ├── wave.zig         # Wave and enemy spawning logic
│   ├── economy.zig      # Money and resource management
│   └── targeting.zig    # Tower targeting logic
├── rendering/
│   ├── renderer.zig     # Core rendering functionality
│   ├── effects.zig      # Visual effects (particles, animations)
│   └── ui.zig           # UI rendering
└── utils/
    ├── math.zig         # Math utilities
    ├── constants.zig    # Game constants
    └── logger.zig       # Logging utilities
```

### Specific Component Responsibilities

#### Core Components

1. **main.zig**
   - Entry point for WebAssembly
   - Module initialization
   - Exposed WebAssembly functions

2. **game.zig**
   - Game state management
   - Core game loop
   - Orchestrates updates to all systems
   - Game state transitions (menu, playing, paused, game over)

#### Entity Components

3. **entities/tower.zig**
   - Tower struct definition
   - Tower types and properties
   - Tower methods (init, update, etc.)
   - Tower upgrade logic

4. **entities/enemy.zig**
   - Enemy struct definition
   - Enemy types and properties
   - Enemy movement logic
   - Health and damage handling

5. **entities/projectile.zig**
   - Projectile struct definition
   - Projectile movement
   - Projectile lifecycle management

6. **entities/path.zig**
   - Path definition
   - Waypoint system
   - Path generation utilities

#### System Components

7. **systems/combat.zig**
   - Damage calculation
   - Collision detection
   - Effect application (slowing, area damage)

8. **systems/wave.zig**
   - Wave generation
   - Enemy spawning
   - Difficulty progression

9. **systems/economy.zig**
   - Money management
   - Tower costs and rewards
   - Resource tracking

10. **systems/targeting.zig**
    - Tower targeting strategies
    - Target selection logic
    - Range calculations

#### Rendering Components

11. **rendering/renderer.zig**
    - Core rendering functions
    - Interface with JavaScript drawing functions
    - Rendering optimization

12. **rendering/effects.zig**
    - Particle systems
    - Animation effects
    - Visual feedback systems

13. **rendering/ui.zig**
    - UI rendering
    - HUD elements
    - Menu screens

#### Utility Components

14. **utils/math.zig**
    - Vector operations
    - Collision helpers
    - Random number generation

15. **utils/constants.zig**
    - Game balance constants
    - Configuration settings
    - Tower/enemy properties

16. **utils/logger.zig**
    - Logging utilities
    - Debug information

## Proposed Frontend Structure (HTML/JS)

I propose refactoring the frontend code as follows:

```
assets/
├── index.html           # Main HTML structure (minimal)
├── css/
│   └── styles.css       # Extracted CSS styles
├── js/
│   ├── main.js          # Application entry point
│   ├── wasm-loader.js   # WebAssembly loading and initialization
│   ├── audio.js         # Audio system
│   ├── ui/
│   │   ├── ui-manager.js # UI state and event management
│   │   ├── tower-panel.js # Tower selection UI
│   │   └── game-status.js # Game status display
│   └── renderer/
│       ├── canvas.js    # Canvas management
│       └── draw.js      # Drawing functions
└── audio/
    └── (audio files)    # Same as current
```

### Specific Frontend Responsibilities

1. **index.html**
   - Core HTML structure
   - Container elements
   - Minimal inline scripts

2. **css/styles.css**
   - All styles extracted from index.html
   - Better organization with CSS comments

3. **js/main.js**
   - Application initialization
   - Event listeners setup
   - Game state management

4. **js/wasm-loader.js**
   - WebAssembly module loading
   - JS/WASM communication
   - Export interface functions

5. **js/audio.js**
   - Audio loading and playback
   - Sound effect management
   - Volume controls

6. **js/ui/ui-manager.js**
   - UI state management
   - Event handling for UI elements
   - UI updates based on game state

7. **js/ui/tower-panel.js**
   - Tower selection logic
   - Tower info display
   - Tower placement preview

8. **js/ui/game-status.js**
   - Game status display (money, lives, wave)
   - Wave countdown
   - Game over screen

9. **js/renderer/canvas.js**
   - Canvas initialization
   - Resize handling
   - Context management

10. **js/renderer/draw.js**
    - Drawing function implementations
    - Visual effects
    - Animation helpers

## Module Communication

The refactored code would use:

1. **For Zig components:**
   - Explicit imports between modules
   - Clearly defined public interfaces
   - Structs with methods rather than global functions
   - Component-based design patterns

2. **For JS components:**
   - ES modules for clean imports
   - Event-based communication
   - Clear separation of concerns

## Implementation Strategy

To implement this refactoring, I recommend a phased approach:

1. **Phase 1: Extract Common Utilities**
   - Create constants.zig and math.zig
   - Extract logger functionality

2. **Phase 2: Entity Separation**
   - Move entity definitions to their own files
   - Maintain the current game logic temporarily

3. **Phase 3: System Separation**
   - Extract core systems (combat, waves, economy)
   - Update main game loop to use these systems

4. **Phase 4: Frontend Refactoring**
   - Extract CSS to separate file
   - Split JavaScript code by responsibility
   - Implement module-based loading

5. **Phase 5: UI Improvements**
   - Enhance UI components with cleaner structure
   - Improve event handling

## Benefits of Refactoring

This refactoring would provide several benefits:

1. **Improved Maintainability**
   - Smaller, focused files are easier to understand and modify
   - Clear separation of concerns
   - Reduced merge conflicts for team development

2. **Better Testability**
   - Isolated components can be tested independently
   - Clear interfaces enable mock implementations for testing

3. **Easier Feature Development**
   - New features can be added without modifying unrelated code
   - Component-based architecture facilitates extension

4. **Performance Optimization Opportunities**
   - Isolated systems can be optimized independently
   - Clearer boundaries for memory management

5. **Better Onboarding for New Developers**
   - Logical organization makes it easier to learn the codebase
   - Clear separation between frontend and game logic

## Potential Challenges

1. **Refactoring Overhead**
   - Initial time investment to restructure code
   - Potential for regressions during refactoring

2. **WebAssembly Exposure**
   - Need to ensure exported functions remain accessible
   - Module boundaries need to be designed carefully

3. **Performance Considerations**
   - Module imports in Zig add minimal overhead
   - Need to maintain efficient data access patterns

These challenges are manageable with careful planning and incremental implementation. 