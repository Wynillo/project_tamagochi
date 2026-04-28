# Digital Companion — Technical Architecture Document
## Version 1.0 | Client-Only Single-Player Architecture

---

## 1. Architecture Overview

### 1.1 Philosophy
This is a **pure client-side architecture**. The entire game runs in the browser with zero backend dependencies. All game logic, state management, persistence, and time simulation execute locally. This minimizes infrastructure cost, eliminates latency concerns, and guarantees the game functions offline indefinitely.

### 1.2 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER ENVIRONMENT                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   PHASER 3  │  │   UI LAYER  │  │   SERVICE WORKER    │  │
│  │  Game Engine│  │(HTML/CSS/   │  │  (PWA / Offline)    │  │
│  │             │  │   React/Vue) │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                   │
│         └────────────────┼───────────────────┐               │
│                          ▼                   ▼               │
│              ┌─────────────────┐    ┌─────────────────┐      │
│              │  GAME STATE     │    │   ASSET CACHE   │      │
│              │   (Zustand)     │    │   (Phaser Load) │      │
│              └────────┬────────┘    └─────────────────┘      │
│                       │                                      │
│              ┌────────┴────────┐                             │
│              │  STATE MACHINES  │                            │
│              │ Combat, Evolution│                            │
│              │   Time, Needs    │                            │
│              └────────┬────────┘                             │
│                       │                                      │
│              ┌────────┴────────┐                             │
│              │  PERSISTENCE     │                            │
│              │   (IndexedDB)    │                            │
│              │  lz-string, idb  │                            │
│              └─────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Core Dependencies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Game Engine** | Phaser 3 | ^3.70.0 | 2D rendering, game loop, input, scenes, audio |
| **Language** | TypeScript | ^5.3.0 | Type safety, team maintainability |
| **Build Tool** | Vite | ^5.0.0 | Fast development, production bundling, PWA support |
| **State Management** | Zustand | ^4.5.0 | Lightweight reactive global state |
| **Persistence** | IndexedDB (via `idb` library) | ^8.0.0 | Async structured storage |
| **Save Compression** | lz-string | ^1.5.0 | Compress save data before storage |
| **State Serialization** | superjson | ^2.2.0 | Handles Date, Map, Set in JSON |
| **Math/Utilities** | lodash-es | ^4.17.0 | Deep clone, debounce, random utilities |
| **Asset Pipeline** | Vite plugins | — | Sprite atlas packing, audio optimization |

### 2.2 Why Phaser 3
- **Proven ecosystem:** 10+ years, extensive docs, active community.
- **Mobile-first:** Built-in touch input, virtual controller plugins, canvas/WebGL auto-detection.
- **Scene management:** Perfect for discrete game states (Hub, Combat, Training, Map).
- **Audio:** Web Audio API abstraction with spatial sound, looping, dynamic mixing.
- **Performance:** Object pooling, sprite batching, camera culling out of the box.

### 2.3 Why Zustand over Redux/MobX
- **Minimal boilerplate:** 1 file = 1 store. No providers, no selectors.
- **Phaser-friendly:** Can subscribe to state changes from outside React/Vue.
- **Lightweight:** 1KB gzipped. No performance overhead on mobile.
- **Persistence middleware:** `zustand/middleware` provides `persist` out of the box.

### 2.4 Why IndexedDB over LocalStorage
| Feature | LocalStorage | IndexedDB |
|---------|-------------|-----------|
| Storage Limit | ~5-10 MB | ~50MB+ (browser-dependent) |
| API | Synchronous (blocks main thread) | Asynchronous (non-blocking) |
| Data Types | Strings only | Objects, binary, files |
| Structure | Key-value flat | Indexed tables, queries |
| Performance | Slower at scale | Fast with large datasets |

**Verdict:** With 90-120 creatures × sprite data + world state + audio cache, we will exceed LocalStorage limits. IndexedDB is required.

---

## 3. State Architecture

### 3.1 State Store Hierarchy

```
GameStore (Zustand)
├── creature: CreatureState
│   ├── id, name, stage, speciesId
│   ├── stats: { str, spd, int, sta, maxSta }
│   ├── needs: { hunger, energy, mood, discipline }
│   ├── personality: PersonalityState
│   ├── evolution: EvolutionState
│   ├── statusEffects: StatusEffect[]
│   └── history: LifeEvent[]
├── world: WorldState
│   ├── currentRegion: RegionId
│   ├── unlockedRegions: RegionId[]
│   ├── npcStates: Map<NPCId, NPCState>
│   ├── encounterFlags: Record<string, boolean>
│   └── weather: WeatherState
├── time: TimeState
│   ├── gameTime: Date (in-game timestamp)
│   ├── lastRealTimestamp: number (Unix ms)
│   ├── totalPlayTime: number (seconds)
│   └── phase: 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight'
├── inventory: InventoryState
│   ├── items: Map<ItemId, number>
│   ├── maxCapacity: number
│   └── equipment: EquipmentSlots
├── player: PlayerState
│   ├── settings: GameSettings
│   ├── hallOfFame: RetiredCreature[]
│   ├── achievements: Achievement[]
│   └── tutorialFlags: TutorialProgress
└── session: SessionState
    ├── currentScene: SceneId
    ├── activeEvent: EventId | null
    ├── isPaused: boolean
    └── pendingNotifications: Notification[]
```

### 3.2 State Update Flow

```
┌──────────────┐     Action     ┌─────────────────┐
│  Player Input │───────────────▶│   Game Store    │
│  (Tap/Swipe)  │                │   (Zustand)     │
└──────────────┘                └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
            │  State Update │    │  Side Effects │    │  Persistence  │
            │  (Immer Draft)│    │  (Audio/VFX)  │    │  (Debounced)  │
            └──────┬───────┘    └──────────────┘    └──────────────┘
                   │
                   ▼
            ┌──────────────┐
            │  Reactivity   │
            │  (Subscriptions)│
            └──────┬───────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Phaser  │ │   HUD   │ │   DOM   │
│ Scene   │ │  Render │ │   UI    │
└─────────┘ └─────────┘ └─────────┘
```

### 3.3 State Mutation Rules
1. **No direct mutation:** All state updates go through Zustand actions.
2. **Immer integration:** Use `produce` from Immer for nested updates (provided by Zustand middleware).
3. **Time gate:** The `tick()` action is the ONLY way to advance game time. All time-consuming actions (train, travel, battle) call `tick(deltaMinutes)` internally.
4. **Validation:** Every action validates preconditions (e.g., cannot train if energy < 10%).

---

## 4. Time System Architecture

### 4.1 Time Model

```typescript
interface TimeState {
  gameTime: Date;              // In-game date/time (1 real min = 1 game min)
  lastRealTimestamp: number;   // When player last closed/app was active
  timeScale: 1;                // Could be adjusted for debugging
  isPaused: boolean;           // Only for menus — game time still advances
}
```

### 4.2 Game Loop Integration

```
Every 1000ms (realtime):
  1. Calculate delta: currentTime - lastTickTime
  2. Advance gameTime by delta minutes
  3. Run Need Decay tick (every 15 game minutes)
  4. Run Event Check tick (every 60 game minutes)
  5. Update lighting/phase state
  6. Persist time state
```

### 4.3 Offline Simulation (Absence Handler)

**Trigger:** On app startup, if `lastRealTimestamp` is > 5 minutes ago.

**Algorithm:**
```
Input: lastRealTimestamp, currentTimestamp, creatureState, worldState
Output: updatedState, summaryLog[]

1. deltaMinutes = (currentTimestamp - lastRealTimestamp) / 60000
2. cap deltaMinutes at 4320 (72 hours max simulation)
3. batchSize = 60 (simulate in 1-hour chunks for performance)
4. For i = 0 to deltaMinutes step batchSize:
   a. Apply need decay for batchSize minutes
   b. Check for care mistakes
   c. Check random events (scaled by probability)
   d. If creature would die: trigger emergency state, stop simulation
   e. Append to summaryLog
5. Return final state + summaryLog for "While you were away..." screen
```

**Performance target:** Simulate 72 hours in < 100ms on a mid-range Android device.

---

## 5. Persistence Architecture

### 5.1 Storage Schema (IndexedDB)

```
Database: DigitalCompanionDB (version 1)

Object Store: saves
├── key: 'autosave' | 'manual_1' | 'manual_2' | 'manual_3'
├── value: CompressedSaveData
└── index: timestamp

Object Store: hallOfFame
├── key: autoIncrement
├── value: RetiredCreatureData

Object Store: settings
├── key: 'gameSettings'
└── value: GameSettings

Object Store: assetCache (optional, for large audio/sprites)
├── key: assetUrl
└── value: Blob | ArrayBuffer
```

### 5.2 Save Data Format

```typescript
interface SaveData {
  version: string;           // "1.0.0" — for migration
  checksum: string;          // Hash of save data for integrity
  savedAt: number;           // Unix timestamp
  
  creature: SerializedCreature;
  world: SerializedWorld;
  time: SerializedTime;
  inventory: SerializedInventory;
  player: SerializedPlayer;
}
```

### 5.3 Compression Pipeline

```
Raw Save Object
    ▼
superjson.serialize()  // Handles Dates, Maps, Sets
    ▼
JSON.stringify()
    ▼
lz-string.compress()   // Typically 60-80% size reduction
    ▼
Store in IndexedDB
```

**Target save size:** < 500KB per save slot (compressed).

### 5.4 Save/Load Flow

**Auto-Save:**
- Trigger: Every 30 seconds of active play + every significant action.
- Debounce: 2-second debounce to batch rapid state changes.
- Target: Save completes in < 100ms without dropping frames.

**Load:**
- On startup: Load `autosave` → validate checksum → decompress → deserialize.
- If corrupt: Fall back to most recent manual save.
- If no saves: Trigger new-game flow.

---

## 6. Scene & Game Flow Architecture

### 6.1 Phaser Scene Hierarchy

```
BootScene          // Asset preloading, save validation
    │
    ▼
MainMenuScene      // New Game / Continue / Options
    │
    ├──▶ NewGameScene    // Egg selection, naming
    │
    └──▶ HubScene        // Main gameplay loop
            │
            ├──▶ TrainingScene   // Mini-game overlay
            │
            ├──▶ CombatScene     // Turn-based battle
            │
            ├──▶ MapScene        // Regional travel
            │
            ├──▶ InventoryScene  // Item management
            │
            ├──▶ CreatureScene   // Stats, evolution tree
            │
            ├──▶ ShopScene       // Buying/selling
            │
            ├──▶ EventScene      // Story/dialogue
            │
            └──▶ PhaseTransitionScene  // Dawn/dusk/etc cinematic
```

### 6.2 Scene Transition Rules

| From | To | Allowed? | Notes |
|------|-----|----------|-------|
| Hub | Combat | Yes | Triggered by encounter |
| Combat | Hub | Yes | On battle end |
| Hub | Training | Yes | Only if energy > 10% |
| Training | Hub | Yes | On mini-game complete |
| Hub | Map | Yes | Always |
| Map | Hub | Yes | On region select or cancel |
| Any | Inventory | Yes | Pauses Hub time, does not advance |
| Any (except Combat) | Menu | Yes | Pauses time |
| Combat | Training | No | Cannot mid-battle |
| Training | Combat | No | Cannot mid-training |

---

## 7. Data Architecture

### 7.1 Data Flow: Static vs. Dynamic

```
STATIC DATA (JSON Assets, loaded once)
├── Creatures:     /data/creatures.json      (90-120 entries)
├── Evolutions:    /data/evolutions.json     (graph data)
├── Regions:       /data/regions.json        (6 regions)
├── Encounters:    /data/encounterTables.json (weighted tables)
├── Items:         /data/items.json          (~50 items)
├── NPCs:          /data/npcs.json           (~25 NPCs)
├── Personalities: /data/personalities.json  (trait definitions)
└── Attacks:       /data/attacks.json        (combat moves)

DYNAMIC STATE (Zustand Store, persisted)
├── CreatureState   (player's current creature)
├── WorldState      (progress, flags, NPC states)
├── TimeState       (clock, phase)
├── InventoryState  (items, capacity)
└── PlayerState     (settings, hallOfFame)
```

### 7.2 Creature Data Model

```typescript
interface CreatureData {
  id: string;                    // "FIRE_LIZARD_01"
  name: string;                  // "Emberling"
  stage: LifeStage;              // 1-6
  element: ElementType;          // Fire, Water, Earth, etc.
  baseStats: Stats;              // At this stage
  growthRates: GrowthRates;      // How stats scale
  lifespanHours: number;         // Max hours in this stage
  sleepSchedule: SleepType;      // Diurnal, Nocturnal, etc.
  
  // Visual
  sprites: {
    idle: string;                // Atlas key
    happy: string;
    sad: string;
    sleeping: string;
    eating: string;
    training: string;
    battleIdle: string;
    attacks: string[];           // 2-4 attack animation keys
    evolutionIn: string;         // Cinematic intro
    evolutionOut: string;        // Cinematic outro
  };
  
  // Audio
  sounds: {
    cry: string;
    happy: string;
    hurt: string;
    attack: string[];
  };
  
  // Gameplay
  personalityAffinities: Record<PersonalityId, number>;
  evolutionPaths: EvolutionPath[];
  learnableAttacks: AttackId[];
  
  // Encyclopedia
  description: string;
  lore: string;
  discovered: boolean;           // Unlock flag
}
```

### 7.3 Evolution Data Model

```typescript
interface EvolutionPath {
  targetCreatureId: string;       // What it evolves into
  conditions: EvolutionCondition[]; // ALL must be met
  weightBonus: number;            // Added to candidate score
}

interface EvolutionCondition {
  type: 'statThreshold' | 'careQuality' | 'personality' | 'battleRecord' | 'hidden' | 'timeOfDay';
  key: string;
  operator: '>' | '<' | '==' | '>=' | '<=';
  value: number | string | boolean;
  weight: number;                 // How much this affects candidate score
}

interface EvolutionCandidate {
  creatureId: string;
  totalWeight: number;            // Sum of all matching conditions
  matchedConditions: string[];
  isHidden: boolean;
}

// Selection: Highest totalWeight wins. If tie, random weighted choice.
```

---

## 8. Combat Architecture

### 8.1 Turn-Based State Machine

```
CombatStates:
  INIT      → Select encounter, generate enemy
    │
    ▼
  START     → Apply opening effects, determine turn order
    │
    ▼
  PLAYER    → Wait for player tactic selection
    │           (Go All Out / Play It Safe / Use Your Head)
    │
    ├──▶ TACTIC_SELECTED
    │         │
    │         ▼
    │     CREATURE_AI    → Personality + Discipline roll
    │         │              determines if tactic is followed
    │         ▼
    │     ATTACK_CHOSEN  → AI selects specific attack
    │         │
    │         ▼
    │     RESOLVE        → Calculate damage, apply effects
    │         │
    │         ▼
    │     CHECK_WIN      → HP <= 0?
    │         │ Yes → VICTORY
    │         │ No  → ENEMY_TURN
    │         │
    ▼
  ENEMY_TURN → Enemy AI selects attack
    │          │
    │          ▼
    │      RESOLVE
    │          │
    │          ▼
    │      CHECK_LOSS  → Player HP <= 0?
    │          │ Yes → DEFEAT
    │          │ No  → PLAYER
    │
    ▼
  VICTORY   → Rewards, evolution flags, time skip
    │
    ▼
  DEFEAT    → Major care mistake, emergency state
    │
    ▼
  END       → Transition to HubScene
```

### 8.2 Combat AI: Player Creature

```
Input: tactic (from player), personality, discipline, availableAttacks

1. Discipline Check: Roll d100. If roll > discipline, override tactic based on personality.
2. Tactic Interpretation:
   - "Go All Out": Prefer high-risk attacks. 20% chance to pick highest-risk regardless.
   - "Play It Safe": Prefer low-risk attacks. 30% chance to skip turn for minor heal.
   - "Use Your Head": If enemy weakness known, exploit it. Else default to safest effective attack.
3. Attack Selection: Weighted random from available attacks matching tactic profile.
4. Execution: Play attack animation → calculate hit/miss → apply damage → check effects.
```

---

## 9. Training Mini-Game Architecture

### 9.1 Mini-Game Interface

```typescript
interface TrainingMiniGame {
  stat: StatType;                    // Which stat this trains
  difficulty: number;                // Scales with creature's current stat
  baseDuration: number;              // Seconds of real player time
  fatigueCost: number;               // Fatigue % gained
  timeSkipMinutes: number;           // Game time advanced
  
  // Phaser Scene config
  sceneKey: string;                  // e.g., "TrainingStrengthScene"
  config: MiniGameConfig;            // Stat-specific parameters
  
  // Scoring
  calculateScore(performance: PerformanceData): GameRank; // D, C, B, A, S
  calculateStatGain(rank: GameRank): number;
  calculateMoodChange(rank: GameRank): number;
}
```

### 9.2 Mini-Game Lifecycle

```
1. PLAYER selects stat to train
2. VALIDATE: energy > 10%, fatigue < 90%
3. TRANSITION to MiniGameScene (HubScene pauses)
4. PLAY mini-game (15-45 seconds real time)
5. CALCULATE: Rank (D-S) based on performance score
6. APPLY:
   - Stat gain (based on rank)
   - Fatigue increase
   - Mood change
   - Time skip (advance game clock)
7. SHOW results screen (rank, gains, time passed)
8. RETURN to HubScene
```

---

## 10. Asset Pipeline

### 10.1 Asset Types & Optimization

| Asset Type | Format | Pipeline | Target Size |
|------------|--------|----------|-------------|
| **Creature Sprites** | PNG → WebP | Atlas packing (TexturePacker) | < 50KB per form |
| **Tilemaps** | Tiled JSON + tileset | Vite static import | < 30KB per region |
| **UI Atlas** | PNG | 9-slice packing | < 20KB |
| **Music** | OGG + MP3 | Loop markers, 128kbps | < 2MB per track |
| **SFX** | WAV → OGG | Short, mono, normalized | < 10KB each |
| **Data (JSON)** | Raw | Vite tree-shaking | < 100KB total |

### 10.2 Loading Strategy

```
BootScene:
  1. Load critical assets (UI atlas, font, core sprites)
  2. Validate save data
  3. Load save-specific assets (current creature form, current region)
  4. Lazy-load non-critical assets in background during HubScene
```

### 10.3 Memory Budget (Mobile Target)
- **GPU Memory:** < 128MB (sprite atlases + textures)
- **Audio Memory:** < 32MB (decoded audio buffers)
- **Heap:** < 64MB (game state, JSON data)
- **Total Target:** < 256MB for stable 60fps on low-end devices.

---

## 11. Performance Architecture

### 11.1 Frame Budget (60fps on Mobile)
- **Total:** 16.67ms per frame
- **Phaser Render:** ~8ms
- **Game Logic/AI:** ~5ms
- **State Updates:** ~2ms
- **Garbage Collection Buffer:** ~1.67ms

### 11.2 Optimization Strategies
- **Object Pooling:** Reuse particle, projectile, and UI element objects.
- **Dirty Flagging:** Only re-render HUD elements when underlying state changes.
- **Spatial Hashing:** For encounter checks (only check entities near player).
- **Debounced Saves:** Batch state changes into single IndexedDB write.
- **Asset Streaming:** Load creature sprites on-demand, not all at startup.

---

## 12. Error Handling & Recovery

### 12.1 Save Corruption Recovery

```
On Load:
  1. Validate save checksum.
  2. If invalid: Try next manual save slot.
  3. If all invalid: Offer "New Game" or "Restore from Backup" (if PWA syncs to device backup).
  4. Log corruption event to console for debugging.
```

### 12.2 Runtime Error Boundaries
- **Phaser Scene crashes:** Catch in `scene.sys.events.on('error')` → transition to safe scene (MainMenu) with error report prompt.
- **Infinite loops:** Max iteration caps on all simulation loops (absence handler, encounter generation).
- **Storage quota exceeded:** Catch `QuotaExceededError` → prompt player to clear old Hall of Fame entries.

---

## 13. Security Considerations

Since this is client-only single-player, "cheating" is a non-issue (players can only affect their own experience). However:

- **Save file tampering:** Acceptable — it's their game. Optionally validate stat ranges on load to prevent corruption crashes.
- **Asset piracy:** Use standard web protections (no hotlinking, obfuscated asset URLs).
- **XSS:** Sanitize any player-generated text (creature names) before rendering.

---

## 14. Build & Deployment

### 14.1 Build Outputs
- `dist/index.html` — Entry point
- `dist/assets/` — Optimized sprites, audio, data JSON
- `dist/sw.js` — Service Worker for PWA offline support
- `dist/manifest.json` — PWA manifest

### 14.2 Deployment Targets
- **Primary:** Static hosting (Vercel, Netlify, GitHub Pages)
- **PWA:** Installable via browser "Add to Home Screen"
- **Optional:** Wrapped with Capacitor/Cordova for native app store distribution

---

## 15. Out of Scope (Explicit)

The following are **not included** in this architecture:
- **Backend server:** No API, no database, no authentication.
- **Cloud sync:** No cross-device play, no server-side save storage.
- **Multiplayer:** No PvP, no co-op, no leaderboards.
- **Real money transactions:** No IAP, no premium currency.
- **Social features:** No friends, no sharing, no guilds.

These can be added in a future Phase 2 with a dedicated backend architecture document.

---

## 16. Appendix A: Directory Structure

```
digital-companion/
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── creatures/          # Atlas per creature line
│   │   │   ├── environments/       # Region tilemaps + tilesets
│   │   │   ├── ui/                 # UI atlas, 9-slice elements
│   │   │   └── effects/            # Particle textures, VFX atlas
│   │   ├── audio/
│   │   │   ├── music/              # OGG + MP3 per track
│   │   │   └── sfx/                # OGG per effect
│   │   └── data/                   # Static JSON databases
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── main.ts                     # Entry point
│   ├── App.tsx                     # Root React component (UI overlay)
│   ├── game/
│   │   ├── Game.ts                 # Phaser game config + initialization
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── HubScene.ts
│   │   │   ├── CombatScene.ts
│   │   │   ├── TrainingScene.ts
│   │   │   ├── MapScene.ts
│   │   │   └── ...
│   │   ├── objects/
│   │   │   ├── CreatureSprite.ts
│   │   │   ├── PlayerCharacter.ts
│   │   │   └── ...
│   │   └── managers/
│   │       ├── TimeManager.ts
│   │       ├── AudioManager.ts
│   │       └── InputManager.ts
│   ├── state/
│   │   ├── useGameStore.ts         # Zustand store definition
│   │   ├── actions/                # Store action creators
│   │   └── selectors.ts            # Memoized selectors
│   ├── systems/
│   │   ├── evolution/
│   │   │   ├── EvolutionEngine.ts
│   │   │   └── EvolutionTree.ts
│   │   ├── combat/
│   │   │   ├── CombatEngine.ts
│   │   │   ├── CombatAI.ts
│   │   │   └── AttackResolver.ts
│   │   ├── training/
│   │   │   ├── TrainingManager.ts
│   │   │   └── mini-games/
│   │   │       ├── StrengthGame.ts
│   │   │       ├── SpeedGame.ts
│   │   │       ├── IntelligenceGame.ts
│   │   │       └── StaminaGame.ts
│   │   ├── needs/
│   │   │   └── NeedsEngine.ts
│   │   └── time/
│   │       ├── TimeEngine.ts
│   │       └── AbsenceSimulator.ts
│   ├── data/
│   │   ├── loaders/
│   │   │   └── DataLoader.ts       # Loads JSON assets
│   │   └── types/
│   │       ├── CreatureTypes.ts
│   │       ├── CombatTypes.ts
│   │       └── WorldTypes.ts
│   ├── persistence/
│   │   ├── IndexedDBClient.ts
│   │   ├── SaveManager.ts
│   │   └── SaveCompression.ts
│   ├── ui/
│   │   ├── components/             # Reusable React/Vue components
│   │   ├── hud/                    # Heads-up display
│   │   ├── menus/                  # Inventory, map, settings
│   │   └── overlays/               # Notifications, modals
│   └── utils/
│       ├── math.ts
│       ├── random.ts
│       └── time.ts
├── tests/
│   ├── unit/
│   │   ├── evolution/
│   │   ├── combat/
│   │   └── state/
│   └── integration/
│       └── save-load/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

*End of Technical Architecture Document*
