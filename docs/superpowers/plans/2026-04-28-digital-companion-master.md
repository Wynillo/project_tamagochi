# Digital Companion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-only 2D creature-raising RPG (Tamagotchi/Digimon-style) running in the browser as a PWA.

**Architecture:** Pure client-side TypeScript + Phaser 3 + Vite. Zustand for state, IndexedDB for persistence, lz-string for compression. All game logic runs locally with offline simulation when app is closed.

**Tech Stack:** TypeScript 5.3, Phaser 3.70+, Vite 5+, Zustand 4.5+, idb 8+, lz-string 1.5+, superjson 2.2+, lodash-es 4.17+

---

## File Structure

```
digital-companion/
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── creatures/
│   │   │   ├── environments/
│   │   │   ├── ui/
│   │   │   └── effects/
│   │   ├── audio/
│   │   │   ├── music/
│   │   │   └── sfx/
│   │   └── data/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── main.ts
│   ├── App.tsx
│   ├── game/
│   │   ├── Game.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MainMenuScene.ts
│   │   │   ├── NewGameScene.ts
│   │   │   ├── HubScene.ts
│   │   │   ├── CombatScene.ts
│   │   │   ├── TrainingScene.ts
│   │   │   ├── MapScene.ts
│   │   │   ├── InventoryScene.ts
│   │   │   ├── CreatureScene.ts
│   │   │   ├── ShopScene.ts
│   │   │   ├── EventScene.ts
│   │   │   └── PhaseTransitionScene.ts
│   │   ├── objects/
│   │   │   ├── CreatureSprite.ts
│   │   │   ├── PlayerCharacter.ts
│   │   │   └── BattleCreature.ts
│   │   └── managers/
│   │       ├── TimeManager.ts
│   │       ├── AudioManager.ts
│   │       └── InputManager.ts
│   ├── state/
│   │   ├── useGameStore.ts
│   │   ├── actions/
│   │   │   ├── creatureActions.ts
│   │   │   ├── worldActions.ts
│   │   │   ├── timeActions.ts
│   │   │   ├── inventoryActions.ts
│   │   │   └── playerActions.ts
│   │   └── selectors.ts
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
│   │   │   └── DataLoader.ts
│   │   ├── types/
│   │   │   ├── CreatureTypes.ts
│   │   │   ├── CombatTypes.ts
│   │   │   ├── WorldTypes.ts
│   │   │   ├── ItemTypes.ts
│   │   │   ├── TimeTypes.ts
│   │   │   └── CommonTypes.ts
│   │   └── constants/
│   │       ├── GameConstants.ts
│   │       └── CreatureDatabase.ts
│   ├── persistence/
│   │   ├── IndexedDBClient.ts
│   │   ├── SaveManager.ts
│   │   └── SaveCompression.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── HUD.tsx
│   │   │   ├── RadialMenu.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   ├── StatBar.tsx
│   │   │   ├── ClockDisplay.tsx
│   │   │   └── CreatureEmote.tsx
│   │   ├── menus/
│   │   │   ├── MainMenu.tsx
│   │   │   ├── InventoryMenu.tsx
│   │   │   ├── MapMenu.tsx
│   │   │   ├── CreatureProfile.tsx
│   │   │   ├── SettingsMenu.tsx
│   │   │   └── HallOfFame.tsx
│   │   └── overlays/
│   │       ├── AwaySummaryOverlay.tsx
│   │       ├── EvolutionCinematic.tsx
│   │       ├── TrainingResult.tsx
│   │       └── BattleResult.tsx
│   └── utils/
│       ├── math.ts
│       ├── random.ts
│       └── time.ts
├── tests/
│   ├── unit/
│   │   ├── evolution/
│   │   ├── combat/
│   │   ├── state/
│   │   └── needs/
│   └── integration/
│       └── save-load/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── vite-env.d.ts
```

---

## Phase 1: Project Scaffold & Foundation

### Task 1.1: Initialize Vite + TypeScript + Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `vite-env.d.ts`
- Create: `.gitignore`
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `src/main.ts`

**Dependencies to install:**
```bash
npm install phaser zustand idb lz-string superjson lodash-es
npm install -D @types/lodash-es typescript vite @vitejs/plugin-react react react-dom @types/react @types/react-dom
```

**Steps:**
- [ ] Create `package.json` with all dependencies.
- [ ] Create `tsconfig.json` with strict mode on, ES2022 target, moduleResolution bundler, include `src/**/*.ts`, `src/**/*.tsx`.
- [ ] Create `vite.config.ts` with basic Vite config, React plugin, and alias `@/` pointing to `./src/`.
- [ ] Create `index.html` referencing `src/main.ts`.
- [ ] Create `vite-env.d.ts` with `/// <reference types="vite/client" />`.
- [ ] Create `.gitignore` ignoring `node_modules`, `dist`, `.vscode`.
- [ ] Create `public/manifest.json` with PWA manifest (name: "Digital Companion", short_name: "DigiCompanion", start_url: "/", display: "standalone", background_color: "#1a1a2e", theme_color: "#16213e", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }]).
- [ ] Create `public/sw.js` — a basic service worker that caches `index.html` and assets in `offline` cache.
- [ ] Create `src/main.ts` as entry point that registers service worker and bootstraps the app.
- [ ] Run `npm install`.
- [ ] Verify `npx tsc --noEmit` passes.

### Task 1.2: Core TypeScript Types

**Files:**
- Create: `src/data/types/CommonTypes.ts`
- Create: `src/data/types/CreatureTypes.ts`
- Create: `src/data/types/CombatTypes.ts`
- Create: `src/data/types/WorldTypes.ts`
- Create: `src/data/types/ItemTypes.ts`
- Create: `src/data/types/TimeTypes.ts`

**Steps:**
- [ ] **CommonTypes.ts:** Define `LifeStage = 'egg' | 'baby' | 'child' | 'adult' | 'mature' | 'elder'`, `ElementType = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'nature' | 'tech'`, `PersonalityId = 'reckless' | 'cautious' | 'greedy' | 'loyal' | 'lazy' | 'hyperactive'`, `GameRank = 'D' | 'C' | 'B' | 'A' | 'S'`, `TimePhase = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight'`, `RegionId = 'nursery' | 'verdantThicket' | 'searingDunes' | 'ruinsOfAethelgard' | 'codeSpire' | 'shimmeringDeeps'`, `SceneId = 'boot' | 'mainMenu' | 'newGame' | 'hub' | 'combat' | 'training' | 'map' | 'inventory' | 'creature' | 'shop' | 'event' | 'phaseTransition'`, `Position = { x: number; y: number }`, `Stats = { str: number; spd: number; int: number; sta: number }`, `GrowthRates = { str: number; spd: number; int: number; sta: number }`.
- [ ] **CreatureTypes.ts:** Define `CreatureData` (id, name, stage, element, baseStats, growthRates, lifespanHours, sleepSchedule, sprites (string keys), sounds (string keys), personalityAffinities, evolutionPaths, learnableAttacks, description, lore, discovered), `CreatureState` (id, name, stage, speciesId, stats, needs, personality, evolution, statusEffects, history), `Needs` (hunger, energy, mood, discipline), `PersonalityState` (traits: PersonalityId[], traitStrengths: Record<PersonalityId, number>), `EvolutionState` (currentFormId, evolutionHistory: string[], nextEvolutionAt: number | null, evolutionCandidates: EvolutionCandidate[]), `EvolutionPath` (targetCreatureId, conditions: EvolutionCondition[], weightBonus), `EvolutionCondition` (type, key, operator, value, weight), `EvolutionCandidate` (creatureId, totalWeight, matchedConditions, isHidden), `LifeEvent` (timestamp, type, description), `StatusEffect` (id, type, durationMinutes, remainingMinutes), `SleepType = 'diurnal' | 'nocturnal' | 'crepuscular' | 'polyphasic'`.
- [ ] **CombatTypes.ts:** Define `AttackData` (id, name, element, power, accuracy, riskLevel, specialEffect?), `Attack` (id, currentCooldown: number), `CombatState` (phase: 'init' | 'start' | 'player' | 'tacticSelected' | 'creatureAI' | 'attackChosen' | 'resolve' | 'checkWin' | 'enemyTurn' | 'victory' | 'defeat' | 'end', playerCreature: CombatCreature, enemyCreature: CombatCreature, turnOrder: 'player' | 'enemy', roundNumber: number, selectedTactic: Tactic | null), `CombatCreature` (creatureId, currentHp, maxHp, stats, attacks: Attack[], availableAttacks: AttackData[], personality, discipline), `Tactic = 'goAllOut' | 'playItSafe' | 'useYourHead'`, `BattleResult` (winner: 'player' | 'enemy' | 'fled', rewards: ItemReward[], flags: string[], timeSkipped: number), `ItemReward` (itemId, quantity).
- [ ] **WorldTypes.ts:** Define `RegionData` (id, name, description, travelTime, dangerLevel, encounters: EncounterEntry[], timeOfDayEncounters: Record<TimePhase, EncounterEntry[]>, tilemapKey, musicKey), `EncounterEntry` (type: 'wildCreature' | 'npc' | 'event' | 'boss', weight: number, dataId: string, conditions?), `NPCData` (id, name, regionId, dialogue, shopItems?, questId?), `NPCState` (id, dialogueIndex, questProgress, isActive), `WeatherState` (type: 'clear' | 'rain' | 'heat' | 'fog' | 'storm', intensity: 0-1), `WorldState` (currentRegion, unlockedRegions, npcStates, encounterFlags, weather).
- [ ] **ItemTypes.ts:** Define `ItemData` (id, name, type: 'food' | 'training' | 'battle' | 'key', description, effect, value, rarity), `ItemEffect` (type, key, value), `InventoryState` (items: Record<string, number>, maxCapacity, equipment), `EquipmentSlots` (head, body, accessory).
- [ ] **TimeTypes.ts:** Define `TimeState` (gameTime: Date, lastRealTimestamp: number, totalPlayTime: number, phase: TimePhase, timeScale: number, isPaused: boolean, nextTickAt: number).

### Task 1.3: Game Constants

**Files:**
- Create: `src/data/constants/GameConstants.ts`

**Steps:**
- [ ] Define `NEED_DECAY_RATES` per stage: `Adult: { hunger: -0.08, energyDay: -0.06, energyNight: -0.12, mood: -0.04, discipline: -0.02 }`. Scale for other stages: Baby ×0.5, Child ×0.75, Adult ×1.0, Mature ×1.0, Elder ×1.2.
- [ ] Define `CARE_MISTAKE_THRESHOLDS`: hungerAtZeroMinutes = 15, energyForcedSleepDay = true, moodAtZeroMinutes = 30.
- [ ] Define `TIME_PHASES` with hour ranges: dawn 6-10, day 10-14, afternoon 14-18, dusk 18-22, night 22-2, deepNight 2-6.
- [ ] Define `STAT_TRAINING_GAINS`: D=1, C=2, B=3, A=5, S=8.
- [ ] Define `FATIGUE_THRESHOLDS`: warning=0.7, refusal=0.9, decayRatePerHour=0.1.
- [ ] Define `EVOLUTION_WEIGHTS`: careQuality=0.30, trainingFocus=0.25, battlePerformance=0.15, disciplineScore=0.15, mistakesNeglect=0.10, hiddenConditions=0.05.
- [ ] Define `LIFE_STAGE_THRESHOLDS` in game hours: egg=0.5, baby=2, child=8, adult=48, mature=120.
- [ ] Define `OFFLINE_SIMULATION`: maxSimulatedHours=72, batchSizeMinutes=60.
- [ ] Define `SAVE_SETTINGS`: autoSaveIntervalMs=30000, debounceMs=2000.

### Task 1.4: Static JSON Data Assets (MVP)

**Files:**
- Create: `public/assets/data/creatures.json`
- Create: `public/assets/data/items.json`
- Create: `public/assets/data/regions.json`
- Create: `public/assets/data/attacks.json`
- Create: `public/assets/data/personalities.json`
- Create: `public/assets/data/npcs.json`
- Create: `public/assets/data/encounterTables.json`

**Steps:**
- [ ] **creatures.json:** Define a complete "starter tree" with 6 forms spanning all stages: Egg("Sparklesphere"), Baby("Lumibud"), Child("Glowpup" with 2 branches: "Flarepup" high-care, "Dimmutt" low-care), Adult ("Blazewolf" high-STR, "Mindfox" high-INT), Mature ("Solarhound" normal, "Eclipsedog" hidden), Elder ("Auroradrake"). Each entry needs id, name, stage, element, baseStats, growthRates, lifespanHours, sleepSchedule, personalityAffinities, evolutionPaths (with conditions), learnableAttacks, description, lore, discovered.
- [ ] **items.json:** ~15 items: 8 food (basic: "NutriPellet" +3 hunger, "SweetBerry" +5 hunger +2 mood, "MeatyChunk" +8 hunger -1 mood, "EnergyBar" +5 hunger +3 energy, "SoothingLeaf" +3 hunger +5 mood, "SpicyPepper" +2 hunger +2 energy, "GourmetCrystal" +10 hunger +5 mood, "MedicinalRoot" +4 hunger cures poison), 3 training ("FocusCharm" +20% stat gain, "EnduranceBand" -20% fatigue, "WisdomGem" +INT bonus), 2 battle ("HealSpray" heal 30HP, "EscapeRope" flee battle), 2 key ("ThicketKey", "DuneCompass").
- [ ] **regions.json:** Define all 6 regions with id, name, description, travelTime, dangerLevel, encounters (weighted), timeOfDayEncounters per phase, tilemapKey, musicKey.
- [ ] **attacks.json:** ~10 attacks with id, name, element, power, accuracy, riskLevel, specialEffect: "emberBite" (fire, 30pwr, 95acc, low), "flameRush" (fire, 60pwr, 85acc, med), "infernoCrash" (fire, 100pwr, 70acc, high, recoil 10%), "mindSpark" (tech, 40pwr, 90acc, low), "staticClaw" (tech, 55pwr, 80acc, med, paralyze chance), "healLight" (light, 0pwr, 100acc, low, heal 20%), "tackle" (normal, 25pwr, 100acc, low), "dodgeStep" (normal, 0pwr, 100acc, low, evade up), "shadowBite" (dark, 45pwr, 90acc, med, steal HP), "torrentWave" (water, 65pwr, 80acc, med).
- [ ] **personalities.json:** Define all 6 personalities with id, name, description, statModifiers (e.g., reckless: +str -int), behaviorFlags (e.g., reckless: prefersHighRisk, overtrains).
- [ ] **npcs.json:** 1 per region (~6 total) with id, name, regionId, dialogue array, shopItems (if applicable).
- [ ] **encounterTables.json:** Weighted encounter tables per region per time-of-day phase.

---

## Phase 2: Core Game Systems

### Task 2.1: Data Loader

**Files:**
- Create: `src/data/loaders/DataLoader.ts`

**Steps:**
- [ ] Create async `DataLoader` class with methods: `loadCreatures()`, `loadItems()`, `loadRegions()`, `loadAttacks()`, `loadPersonalities()`, `loadNPCs()`, `loadEncounterTables()`.
- [ ] Each method fetches from `/assets/data/<file>.json` and returns typed data.
- [ ] Add caching: store loaded data in singleton, return cached on subsequent calls.
- [ ] Add `preloadAll()` that loads all data files in parallel with `Promise.all`.
- [ ] Handle fetch errors with fallback to empty arrays and console.error.

### Task 2.2: Zustand Game Store

**Files:**
- Create: `src/state/useGameStore.ts`
- Create: `src/state/actions/creatureActions.ts`
- Create: `src/state/actions/worldActions.ts`
- Create: `src/state/actions/timeActions.ts`
- Create: `src/state/actions/inventoryActions.ts`
- Create: `src/state/actions/playerActions.ts`
- Create: `src/state/selectors.ts`

**Steps:**
- [ ] **useGameStore.ts:** Define the full Zustand store with all state slices (creature, world, time, inventory, player, session) using `create<StoreState>()(...)` from zustand. Include `immer` middleware for immutable updates. Include `persist` middleware with custom storage adapter that uses IndexedDB (via SaveManager). Define `StoreActions` interface with all action methods.
- [ ] **creatureActions.ts:** Implement actions: `setCreatureName(name)`, `updateNeeds(needsDelta)`, `setNeed(needType, value)`, `addStatGain(stat, amount)`, `addPersonalityTrait(trait)`, `recordCareMistake(type)`, `setStage(stage)`, `setSpecies(speciesId)`, `addLifeEvent(event)`, `addStatusEffect(effect)`, `removeStatusEffect(id)`, `clearExpiredStatusEffects(currentTime)`.
- [ ] **worldActions.ts:** Implement actions: `setCurrentRegion(regionId)`, `unlockRegion(regionId)`, `setNPCState(npcId, state)`, `setEncounterFlag(flag, value)`, `setWeather(weather)`.
- [ ] **timeActions.ts:** Implement actions: `tick(deltaMinutes)`, `setGameTime(time)`, `setPhase(phase)`, `advanceTime(minutes)`, `pauseGame()`, `resumeGame()`, `setTimeScale(scale)`, `updateLastRealTimestamp(timestamp)`.
- [ ] **inventoryActions.ts:** Implement actions: `addItem(itemId, quantity)`, `removeItem(itemId, quantity)`, `equipItem(slot, itemId)`, `unequipItem(slot)`, `setMaxCapacity(capacity)`.
- [ ] **playerActions.ts:** Implement actions: `updateSettings(settings)`, `addToHallOfFame(creature)`, `unlockAchievement(achievementId)`, `setTutorialFlag(flag, value)`.
- [ ] **selectors.ts:** Export memoized selectors: `selectCreatureNeeds`, `selectCurrentRegion`, `selectTimePhase`, `selectInventoryItems`, `selectCanTrain`, `selectCanBattle`, etc.

### Task 2.3: TimeEngine + AbsenceSimulator

**Files:**
- Create: `src/systems/time/TimeEngine.ts`
- Create: `src/systems/time/AbsenceSimulator.ts`

**Steps:**
- [ ] **TimeEngine.ts:** Create `TimeEngine` class. Constructor takes `getState/setState` callbacks. Methods: `start()`, `stop()`, `tick()`, `getCurrentPhase()`, `advanceTime(minutes)`. The `tick()` method runs on a 1000ms interval (configurable), calculates delta from last tick, advances gameTime by delta minutes, updates phase, persists time state. Must handle time-of-day phase transitions by checking `TimePhase` constants. Trigger `phaseChange` callbacks when phase changes.
- [ ] **AbsenceSimulator.ts:** Create `AbsenceSimulator` class. Method `simulateAbsence(lastTimestamp, currentTimestamp, creatureState, worldState)` returns `{ updatedState, summaryLog[] }`. Algorithm: cap delta at 72 hours, simulate in 1-hour batches. For each batch: apply need decay (using stage-appropriate rates), check care mistakes (if need hits 0 for threshold duration), check random events (scaled probability), check for creature death (if implemented). Return final state and a summary log for "While you were away..." screen.

### Task 2.4: NeedsEngine

**Files:**
- Create: `src/systems/needs/NeedsEngine.ts`

**Steps:**
- [ ] Create `NeedsEngine` class. Constructor takes `getState/setState`.
- [ ] Method `tick(deltaMinutes)` applies decay to all needs based on current stage and time-of-day (energy decays faster at night).
- [ ] Method `checkCareMistakes(currentNeeds, previousNeeds, deltaMinutes)` records care mistakes when thresholds are crossed.
- [ ] Method `feed(foodItemId)` looks up item, validates it's food, applies hunger restoration, may apply side effects (mood, energy), records life event.
- [ ] Method `sleep(hours)` sets energy to 100% (or scaled by sleep quality), reduces fatigue, advances time.
- [ ] Method `play()` increases mood, small energy cost, advances time by 15 minutes, records life event.
- [ ] Method `scold()` increases discipline, decreases mood, records life event.
- [ ] Track cumulative care mistakes per stage. If 3+ in a stage, flag for suboptimal evolution.

### Task 2.5: EvolutionEngine + EvolutionTree

**Files:**
- Create: `src/systems/evolution/EvolutionEngine.ts`
- Create: `src/systems/evolution/EvolutionTree.ts`

**Steps:**
- [ ] **EvolutionTree.ts:** Create class that builds evolution graph from `creatures.json`. Methods: `getPossibleEvolutions(currentFormId)` returns all `EvolutionPath[]` from current form. `getCreatureData(id)` returns `CreatureData`. Validate that the graph is acyclic and all referenced IDs exist.
- [ ] **EvolutionEngine.ts:** Create class. Method `checkEvolution(creatureState, worldState, timeState)` calculates if creature meets evolution conditions. Returns `EvolutionCandidate[]` sorted by totalWeight. Method `calculateCandidates(creatureState)` iterates all possible evolutions from current form, evaluates each `EvolutionCondition`:
  - `statThreshold`: compare creature stat to value
  - `careQuality`: ratio of needs met vs neglected
  - `personality`: check if trait is present
  - `battleRecord`: win/loss ratio
  - `hidden`: check hidden flags
  - `timeOfDay`: check current phase
  Sum weights for matching conditions + weightBonus. Return sorted candidates.
- [ ] Method `evolve(targetCreatureId)` returns updated creature state with new form, resets stage timer, records evolution in history, triggers cinematic flag.
- [ ] Method `shouldEvolve(creatureState)` checks if stage time threshold is met AND at least one candidate has weight > minimum threshold.

### Task 2.6: CombatEngine + CombatAI + AttackResolver

**Files:**
- Create: `src/systems/combat/CombatEngine.ts`
- Create: `src/systems/combat/CombatAI.ts`
- Create: `src/systems/combat/AttackResolver.ts`

**Steps:**
- [ ] **CombatEngine.ts:** Implement turn-based state machine matching the GDD exactly. States: INIT → START → PLAYER → TACTIC_SELECTED → CREATURE_AI → ATTACK_CHOSEN → RESOLVE → CHECK_WIN → ENEMY_TURN → VICTORY/DEFEAT → END. Method `startCombat(playerCreature, enemyData)` initializes combat state. Method `selectTactic(tactic)` transitions state. Method `executeTurn()` runs the full turn sequence. Methods for each phase transition with validation.
- [ ] **CombatAI.ts:** Implement player creature AI. Input: tactic, personality, discipline, availableAttacks. Step 1: Discipline check — roll d100, if > discipline, override tactic based on personality (Reckless→goAllOut, Cautious→playItSafe, etc.). Step 2: Tactic interpretation. Step 3: Attack selection weighted by risk level matching tactic. Step 4: Return chosen attack ID.
- [ ] Implement enemy AI: weighted random attack selection, slightly favoring attacks that exploit player weaknesses.
- [ ] **AttackResolver.ts:** Method `resolveAttack(attacker, defender, attack)` calculates damage: base = attack.power × (attacker.str or attacker.int / 10), apply element effectiveness (0.5×, 1×, 2×), apply random variance (±10%), apply accuracy roll (miss if roll > accuracy), apply critical (5% chance, 1.5× damage), apply recoil if applicable, apply status effects. Return result object with damage, isHit, isCrit, effectsApplied, recoilDamage.
- [ ] Combat ends when HP ≤ 0. Victory: rewards items, evolution flags, time skip 15 min. Defeat: major care mistake, emergency state.

### Task 2.7: TrainingManager + Mini-Games

**Files:**
- Create: `src/systems/training/TrainingManager.ts`
- Create: `src/systems/training/mini-games/StrengthGame.ts`
- Create: `src/systems/training/mini-games/SpeedGame.ts`
- Create: `src/systems/training/mini-games/IntelligenceGame.ts`
- Create: `src/systems/training/mini-games/StaminaGame.ts`

**Steps:**
- [ ] **TrainingManager.ts:** Class with methods: `canTrain(stat, creatureState)` validates energy > 10%, fatigue < 90%. `startTraining(stat)` returns mini-game config. `completeTraining(stat, performanceData)` calculates rank (D-S), stat gain, fatigue increase, mood change, time skip. Store fatigue in creature state (hidden field).
- [ ] **StrengthGame.ts:** Implement "Weight Lifting" mini-game. Tap rapidly to fill power bar. Release at green zone. Timing gets stricter with higher stat levels. Difficulty scales with current STR. Returns performance score (0-100).
- [ ] **SpeedGame.ts:** Implement "Obstacle Dash" mini-game. Objects fall from top, player taps left/right to dodge. Speed increases with stat level. Returns performance score.
- [ ] **IntelligenceGame.ts:** Implement "Pattern Match" (Simon Says). Sequence of colors/sounds, player repeats. Length increases with INT. Returns performance score.
- [ ] **StaminaGame.ts:** Implement "Breathing Exercise". Hold and release breath meter in rhythm. Precision required increases with STA. Returns performance score.
- [ ] Each mini-game is a Phaser scene extending `Phaser.Scene`.

### Task 2.8: Persistence Layer

**Files:**
- Create: `src/persistence/IndexedDBClient.ts`
- Create: `src/persistence/SaveCompression.ts`
- Create: `src/persistence/SaveManager.ts`

**Steps:**
- [ ] **IndexedDBClient.ts:** Wrapper around `idb` library. Opens database "DigitalCompanionDB" v1. Object stores: `saves` (key: string, value: any), `hallOfFame` (autoIncrement, value: any), `settings` (key: string, value: any), `assetCache` (key: string, value: Blob). Methods: `get(store, key)`, `set(store, key, value)`, `getAll(store)`, `delete(store, key)`, `clear(store)`.
- [ ] **SaveCompression.ts:** Methods: `compress(data)` serializes with superjson, stringifies, compresses with lz-string, returns compressed string. `decompress(compressed)` reverses the pipeline. `generateChecksum(data)` creates a simple hash of the serialized data.
- [ ] **SaveManager.ts:** Main persistence coordinator. Methods: `save(slot = 'autosave', state)` compresses and stores. `load(slot = 'autosave')` retrieves, decompresses, validates checksum. `autoSave(state)` debounced save (2s). `listSaves()` returns available slots. `deleteSave(slot)`. `hasSave(slot)`.
- [ ] On load: validate version, if mismatch attempt migration or start new game. If checksum invalid: try manual slots, if all invalid start new game.

---

## Phase 3: Phaser Scenes & UI

### Task 3.1: Main Game Setup

**Files:**
- Create: `src/game/Game.ts`

**Steps:**
- [ ] Create `Game` class/config that initializes Phaser.Game with responsive sizing (mobile-first), default scene `BootScene`, disable right-click menu, enable touch input.
- [ ] Configure canvas to fill viewport, maintain aspect ratio, responsive resize handler.

### Task 3.2: Core Scenes

**Files:**
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/MainMenuScene.ts`
- Create: `src/game/scenes/NewGameScene.ts`
- Create: `src/game/scenes/HubScene.ts`

**Steps:**
- [ ] **BootScene.ts:** Preload critical assets (UI atlas placeholder, font, minimal sprites). Validate save data via SaveManager. If save exists → transition to HubScene. If no save → transition to MainMenuScene. Show loading bar.
- [ ] **MainMenuScene.ts:** Display title, "New Game", "Continue" (disabled if no save), "Options". Background: animated pixel stars or simple gradient. Button interactions.
- [ ] **NewGameScene.ts:** Show 6 starter egg choices (use PlaceholderRectangles with colors for MVP). Click egg → naming input (sanitize for XSS, max 12 chars). Confirm → create initial creature state (Egg stage), save, transition to HubScene.
- [ ] **HubScene.ts:** Main gameplay loop scene. Display creature sprite (idle animation), environment background based on current region. Handle tap on creature → show radial menu (Feed, Play, Scold, Info). Handle bottom bar buttons (Inventory, Train, Map, Menu). Run time tick. Update creature visual state (posture, tint, emotes) based on needs. Handle phase transition effects (lighting overlay).

### Task 3.3: Secondary Scenes

**Files:**
- Create: `src/game/scenes/CombatScene.ts`
- Create: `src/game/scenes/TrainingScene.ts`
- Create: `src/game/scenes/MapScene.ts`
- Create: `src/game/scenes/InventoryScene.ts`
- Create: `src/game/scenes/CreatureScene.ts`
- Create: `src/game/scenes/ShopScene.ts`
- Create: `src/game/scenes/EventScene.ts`
- Create: `src/game/scenes/PhaseTransitionScene.ts`

**Steps:**
- [ ] **CombatScene.ts:** Turn-based UI. Show player creature + enemy sprites. Bottom: tactic buttons ("Go All Out", "Play It Safe", "Use Your Head"). Show HP bars, turn indicator. After tactic selected, show creature action (attack animation). Show damage numbers. On victory/defeat, show result screen with rewards/care mistake, then return to HubScene.
- [ ] **TrainingScene.ts:** Overlay scene that launches the correct mini-game scene based on selected stat. Shows stat selection UI first. After mini-game, shows result overlay with rank and gains.
- [ ] **MapScene.ts:** Show world map with region nodes. Highlight current region, show unlocked/locked regions. Tap region → show travel time, confirm/cancel. On confirm: advance time, transition to HubScene with new region background.
- [ ] **InventoryScene.ts:** Grid of items with quantities. Tabs: Food, Items, Key Items. Tap item → show details + use button (if applicable). Show capacity indicator.
- [ ] **CreatureScene.ts:** Full-screen stats view. Show name, stage, species, stats bars (STR, SPD, INT, STA), needs bars, personality traits, care mistake count, life events history, evolution tree preview (show discovered forms).
- [ ] **ShopScene.ts:** If region has shop NPC, show buyable items with prices. Player money (if implemented; else use barter/items). Confirm purchase → update inventory.
- [ ] **EventScene.ts:** Dialogue/text event overlay. Shows NPC portrait (placeholder), dialogue text (typewriter effect), choice buttons if applicable.
- [ ] **PhaseTransitionScene.ts:** Brief cinematic when time phase changes. Show phase name, lighting shift, creature reaction.

### Task 3.4: Game Objects

**Files:**
- Create: `src/game/objects/CreatureSprite.ts`
- Create: `src/game/objects/PlayerCharacter.ts`
- Create: `src/game/objects/BattleCreature.ts`

**Steps:**
- [ ] **CreatureSprite.ts:** Phaser.GameObjects.Sprite subclass. Handles idle animation loop, reaction animations (happy, sad, eating, sleeping), state-based tint (pale when hungry, dark when sad), emote particles (hearts, anger marks, Z's, sweat). Methods: `playReaction(type)`, `setStateTint(needState)`, `showEmote(emoteType)`.
- [ ] **PlayerCharacter.ts:** Represents the player avatar in HubScene. Simple sprite that can move with virtual joystick (or tap-to-move for MVP). Position relative to creature.
- [ ] **BattleCreature.ts:** Creature sprite specialized for combat. Handles battle idle stance, attack animations (by attackId), hurt reaction, death/faint. Methods: `playAttack(attackId)`, `playHurt()`, `playFaint()`.

### Task 3.5: React UI Layer

**Files:**
- Create: `src/App.tsx`
- Create: `src/ui/components/HUD.tsx`
- Create: `src/ui/components/StatBar.tsx`
- Create: `src/ui/components/ClockDisplay.tsx`
- Create: `src/ui/components/CreatureEmote.tsx`
- Create: `src/ui/components/NotificationToast.tsx`
- Create: `src/ui/components/RadialMenu.tsx`
- Create: `src/ui/menus/MainMenu.tsx`
- Create: `src/ui/menus/InventoryMenu.tsx`
- Create: `src/ui/menus/MapMenu.tsx`
- Create: `src/ui/menus/CreatureProfile.tsx`
- Create: `src/ui/menus/SettingsMenu.tsx`
- Create: `src/ui/menus/HallOfFame.tsx`
- Create: `src/ui/overlays/AwaySummaryOverlay.tsx`
- Create: `src/ui/overlays/EvolutionCinematic.tsx`
- Create: `src/ui/overlays/TrainingResult.tsx`
- Create: `src/ui/overlays/BattleResult.tsx`

**Steps:**
- [ ] **App.tsx:** Root React component. Renders Phaser canvas container. Conditionally renders React UI overlays based on current scene (from Zustand session state). Use `useEffect` to initialize Phaser game.
- [ ] **HUD.tsx:** Always-on top bar + right-side stat bars + bottom action bar. Uses Zustand selectors for live updates. Top bar: Clock (HH:MM), day/night icon, creature name + stage. Right side: Need bars (Hunger, Energy, Mood, Discipline) with color coding. Bottom bar: [Inventory] [Train] [Map] [Menu] buttons. Touch targets ≥44px.
- [ ] **StatBar.tsx:** Reusable bar component. Props: label, value (0-100), color, width. Shows percentage text.
- [ ] **ClockDisplay.tsx:** Formats game time as HH:MM. Shows day/night icon.
- [ ] **CreatureEmote.tsx:** Floating emote above creature sprite. Props: emoteType ('heart', 'anger', 'zz', 'sweat'). Auto-dismisses after 2s.
- [ ] **NotificationToast.tsx:** Slide-in notification for game events ("Creature is very hungry!", "Evolution imminent!"). Stacks up to 3. Auto-dismiss 4s.
- [ ] **RadialMenu.tsx:** Circular menu around creature on tap. Options: Feed, Play, Scold, Info. Tap outside to dismiss. Each option has icon + label.
- [ ] **MainMenu.tsx:** React overlay for non-Phaser main menu (alternative to Phaser scene). Title, buttons.
- [ ] **InventoryMenu.tsx:** Full-screen overlay. Grid layout, tabs, item details panel.
- [ ] **MapMenu.tsx:** Region nodes on a stylized map. Current region highlighted. Travel time shown on hover/tap.
- [ ] **CreatureProfile.tsx:** Stats view, evolution tree (simple tree diagram showing known forms as nodes, locked forms as silhouettes).
- [ ] **SettingsMenu.tsx:** Toggle options: sound, notifications, time scale (for debug), reset game.
- [ ] **HallOfFame.tsx:** Grid of retired creatures. Show name, final form, lifespan, achievements.
- [ ] **AwaySummaryOverlay.tsx:** Modal shown on startup after absence. "While you were away for X hours..." bullet list summary. Continue button.
- [ ] **EvolutionCinematic.tsx:** Full-screen overlay during evolution. Shows current form → transformation effect (CSS animation) → new form. Name reveal. 5-10 seconds.
- [ ] **TrainingResult.tsx:** Shows rank (D-S with color), stat gain, fatigue increase, mood change, time passed.
- [ ] **BattleResult.tsx:** Victory/defeat banner, rewards list, time skipped, care mistake if lost.

---

## Phase 4: Exploration & Polish

### Task 4.1: Exploration System

**Files:**
- Modify: `src/state/actions/worldActions.ts`

**Steps:**
- [ ] Add `travelToRegion(regionId)` action: validates region is unlocked, calculates travel time, advances game time, sets current region, may trigger random encounter check.
- [ ] Add `checkEncounter()` action: rolls against encounter table for current region + time phase. If encounter: sets active event. Types: wildCreature→transition to CombatScene, npc→EventScene, event→EventScene, boss→CombatScene.
- [ ] Add `cancelTravel()` action: if mid-travel, return home with half time cost.
- [ ] Add `exploreRegion()` action: small time advance (5-15 min), chance to find item, trigger event, or encounter.

### Task 4.2: Audio Manager

**Files:**
- Create: `src/game/managers/AudioManager.ts`

**Steps:**
- [ ] Create `AudioManager` class. Uses Phaser.Sound. Methods: `playMusic(key, fadeDuration?)`, `stopMusic(fadeDuration?)`, `playSFX(key)`, `setMasterVolume(vol)`, `setMusicVolume(vol)`, `setSFXVolume(vol)`.
- [ ] Music layering (MVP simplification): just switch tracks per scene/region. Load 3 placeholder tracks: "morning", "night", "battle".
- [ ] SFX mapping: feed, train, battleHit, evolution, levelUp, buttonClick.
- [ ] Crossfade between tracks when transitioning regions/phases.

### Task 4.3: PWA Setup

**Files:**
- Already created: `public/manifest.json`, `public/sw.js`
- Modify: `src/main.ts`

**Steps:**
- [ ] In `main.ts`, register service worker: `navigator.serviceWorker.register('/sw.js')`. Handle update.
- [ ] Service worker: cache all assets in `install` event. Serve from cache in `fetch` event, fallback to network.
- [ ] Add install prompt logic (deferred).

### Task 4.4: Tests

**Files:**
- Create: `tests/unit/evolution/EvolutionEngine.test.ts`
- Create: `tests/unit/combat/CombatEngine.test.ts`
- Create: `tests/unit/state/useGameStore.test.ts`
- Create: `tests/unit/needs/NeedsEngine.test.ts`
- Create: `tests/integration/save-load/SaveManager.test.ts`

**Steps:**
- [ ] Install vitest (dev dependency), configure in vite.config.ts.
- [ ] EvolutionEngine tests: test candidate calculation with known inputs, test evolution trigger conditions, test weight distribution.
- [ ] CombatEngine tests: test state machine transitions, test damage calculation, test victory/defeat conditions.
- [ ] useGameStore tests: test all action creators, test immutability, test selectors.
- [ ] NeedsEngine tests: test decay rates, test care mistake detection, test feeding/sleeping.
- [ ] SaveManager integration tests: test save → load roundtrip, test compression ratio, test checksum validation, test corruption recovery.

---

## Phase 5: Final Integration

### Task 5.1: Wire Everything Together

**Files:**
- Modify: `src/main.ts`
- Modify: `src/App.tsx`
- Modify: `src/game/Game.ts`

**Steps:**
- [ ] Ensure all scenes are registered in Phaser config.
- [ ] Ensure Zustand store is created once and passed to systems.
- [ ] Ensure TimeEngine starts when HubScene starts, stops when game pauses.
- [ ] Ensure auto-save runs every 30s during active play.
- [ ] Ensure absence simulation runs on startup before showing any scene.

### Task 5.2: Build Verification

**Steps:**
- [ ] Run `npm run build`.
- [ ] Verify `dist/` contains all expected files.
- [ ] Run `npx tsc --noEmit` — no type errors.
- [ ] Run `npm test` — all tests pass.
- [ ] Serve `dist/` locally and verify game loads.
- [ ] Test new game flow: Boot → MainMenu → NewGame → Hub.
- [ ] Test core loops: feed creature, train creature, travel, enter combat.

---

## Spec Coverage Checklist

| GDD Section | Plan Tasks | Status |
|---|---|---|
| 3.1 Creature Lifecycle | 1.2, 1.4, 2.5, 3.2, 3.3 | Covered |
| 3.2 Time System | 1.3, 2.3, 3.2, 3.3 | Covered |
| 3.3 Needs System | 1.3, 2.4, 3.5 | Covered |
| 3.4 Training System | 1.3, 2.7, 3.3, 3.5 | Covered |
| 3.5 Combat System | 1.2, 1.4, 2.6, 3.3, 3.5 | Covered |
| 3.6 Exploration System | 1.4, 2.2, 3.3, 4.1 | Covered |
| 5 Visual Style | 3.2, 3.4, 3.5 (CSS/placement) | Partial |
| 6 Audio Design | 4.2 | Partial (MVP) |
| 7 UI/UX | 3.5, 4.3 (mobile-first) | Covered |
| 8 Persistence | 2.8, 4.4 | Covered |

---

*Plan written with writing-plans skill. Execute with subagent-driven-development or executing-plans.*
