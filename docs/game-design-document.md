# Digital Companion - Game Design Document
## Version 1.0 | Document for Development Team Handoff

---

## 1. Executive Summary

**Project Name:** Digital Companion (Working Title)  
**Genre:** 2D Monster-Raising RPG / Life Simulation  
**Platform:** Browser (Mobile-First)  
**Inspiration:** Digimon World 1 (PSX), late-90s creature lifecycle games  
**Target Audience:** Nostalgic millennials, life-sim enthusiasts, mobile RPG players  
**Session Length:** 2-5 minutes (check-in), 15-30 minutes (active play)  
**Monetization:** Premium one-time purchase or cosmetic DLC (out of scope for core design)

**Core Thesis:** The player forms an emotional bond with a unique digital creature by making meaningful daily care decisions in a persistent, real-time world. Time is the ultimate strategic resource — every choice has consequences that ripple through the creature's entire lifecycle.

---

## 2. Core Pillars

1. **Persistent Real-Time World:** The game clock runs continuously. The world lives while the player sleeps.
2. **Emotional Attachment Through Consequence:** Neglect has real, visible, permanent effects. Care has rewards.
3. **Strategic Time Management:** Every action consumes time. "What should I do in the next 2 hours of game time?"
4. **Discovery & Mystery:** Hidden evolution paths, secret conditions, and unpredictable outcomes encourage experimentation.
5. **No Idle/AFK Progression:** The only way forward is through player decisions. The game never plays itself.

---

## 3. Game Systems

### 3.1 Creature Lifecycle System

The creature progresses through distinct life stages with no reversals.

#### Life Stages
- **Stage 1: Egg** (0-30 min game time)
  - No stats, no interaction. Player can nickname. Hatches automatically.
  - Visual: Pulsing digital egg with color hints at potential type.
  
- **Stage 2: Baby** (30 min - 2 hours game time)
  - Basic needs unlock (hunger, energy)
  - Simple, cute form. High care requirements.
  - Cannot battle or train intensely.
  - Care mistakes here have amplified consequences.
  
- **Stage 3: Child** (2-8 hours game time)
  - All needs active. Training unlocks.
  - First branching evolution paths appear.
  - Personality traits begin forming.
  
- **Stage 4: Adult** (8-48 hours game time)
  - Full combat capability. All regions accessible.
  - Major evolution branches realized.
  - Peak performance window.
  
- **Stage 5: Mature** (48-120 hours game time)
  - Stats may begin declining slowly.
  - Special "wisdom" abilities unlock.
  - Final evolution forms possible.
  
- **Stage 6: Elder** (120+ hours game time)
  - Significant stat decay.
  - Unique elder-exclusive evolutions.
  - Upon "retirement" (natural lifespan end), creature becomes a "Legend" in the player's Hall of Fame, and a new egg is gifted based on the elder's legacy.

#### Evolution Mechanics
- **Evolution Trigger:** Reached when specific stat thresholds, care quality scores, and game-time conditions are met.
- **Evolution Candidates:** When conditions are met, the system calculates a weighted list of possible next forms. Only ONE path is taken — the highest-weighted match.
- **Evolve-Time:** Evolving is a significant event that shows a cinematic transformation (5-10 seconds) and advances game time by 30 minutes.

#### Evolution Factors (Weighted Algorithm)
1. **Care Quality (30% weight):** Ratio of needs met vs. needs neglected over the current stage.
2. **Training Focus (25% weight):** Which stats were most trained (strength, speed, intelligence, stamina).
3. **Battle Performance (15% weight):** Win/loss ratio, risk-taking vs. safety preference.
4. **Discipline Score (15% weight):** How often the player corrected misbehavior vs. let it slide.
5. **Mistakes & Neglect (10% weight):** Care mistakes reduce weights toward "ideal" paths and increase weights toward "neglect" evolutions.
6. **Hidden Conditions (5% weight):** Secret triggers (e.g., trained at night 5 times, won a battle with 1 HP, etc.).

#### "Failure" / Neglect Evolutions
- Every creature line has at least one "neglect" evolution — a weak, malformed, or depressing form.
- These are NOT game over. They are valid playthroughs with unique mechanics and may unlock hidden late-game content.
- Neglect evolutions have shorter lifespans but may have unexpected advantages (e.g., high resilience, special infection attacks).

#### Personality Traits
- Each creature develops 2-4 personality traits that affect autonomous behavior.
- **Examples:**
  - Reckless: Prefers risky attacks in combat. Overtrains easily.
  - Cautious: Prefers safe options. May refuse to enter dangerous areas.
  - Greedy: Eats more food. May steal items.
  - Loyal: Higher obedience. Better combat performance when HP is low.
  - Lazy: Slow stat gains from training. Recovers energy faster.
  - Hyperactive: Fast stat gains. Burns energy quickly.
- Traits affect evolution weights and can be influenced by player actions over time.

---

### 3.2 Time System (CRITICAL)

#### Real-Time Clock
- The game operates on a **24-hour real-time day/night cycle** that maps 1 real-world minute = 1 game-world minute.
- **Game time NEVER pauses.** When the app is closed, time continues to pass.
- On app load, the system calculates time delta since last save and **simulates** what happened during absence.

#### Time-Of-Day Effects
| Time | Phase | Lighting | Creature Behavior | World Effects |
|------|-------|----------|-------------------|---------------|
| 06:00-10:00 | Dawn | Warm orange tint | Energy rises faster | Shop restocks; early-bird NPCs appear |
| 10:00-14:00 | Day | Bright, full color | Normal behavior | All shops open; most encounters available |
| 14:00-18:00 | Afternoon | Slight yellow tint | Mood drops if overtrained | Training effectiveness +10% |
| 18:00-22:00 | Dusk | Purple/blue tint | Creatures become drowsy | Night creatures begin appearing |
| 22:00-02:00 | Night | Dark, blue desaturated | Energy drains fast; sleep urge high | Shops closed; rare night encounters |
| 02:00-06:00 | Deep Night | Very dark, starlight | Forced sleep if energy <20% | Dangerous encounters; hidden areas visible |

#### Time Skipping Mechanism
Certain actions visibly fast-forward the clock:
- **Training:** 15-45 minutes depending on intensity
- **Battles:** 5-15 minutes depending on length
- **Traveling:** See below
- **Resting/Sleeping:** Player can choose to let creature sleep. Fast-forwards to target wake time (max 8 hours).
- **Events/Cutscenes:** Variable

**Visual Feedback:** When time advances, the clock UI spins forward rapidly (0.5-2 seconds), the lighting palette shifts smoothly, and a "Time Passed: X hours" notification appears.

#### Strategic Time Management
- The player CANNOT do everything in one day.
- Training consumes precious awake hours. Overtraining leaves the creature exhausted at night.
- Traveling to a distant region might take so long that shops close before arrival.
- Key Design Phrase: *"If I train now, I'll be too tired to battle before the shop closes."*

---

### 3.3 Creature Needs System (Real-Time)

Four core needs that decay continuously over time.

#### Need Decay Rates (Base, Adult Stage)
| Need | Base Decay / Game Hour | Consequence at 0% |
|------|------------------------|-------------------|
| Hunger | -8% | Health loss; care mistake recorded |
| Energy | -6% (day), -12% (night) | Cannot train/battle; forced sleep |
| Mood | -4% | Refuses commands; training ineffective |
| Discipline | -2% (slow natural decay) | Nothing directly; provides buffer |

#### Filling Needs
- **Hunger:** Feed items from inventory. Different foods provide different satiety + side effects.
- **Energy:** Sleep (automatic at night, or player-initiated nap). Energy restore rate varies by creature.
- **Mood:** Play mini-games, give gifts, win battles. Scolding lowers mood temporarily.
- **Discipline:** Scolding when creature misbehaves (refuses food, sleeps at wrong time, runs away in battle). Raises discipline but lowers mood.

#### Care Mistakes
A care mistake is recorded when:
- Hunger reaches 0% for >15 minutes game time
- Energy reaches 0% (forced sleep) during day hours
- Mood reaches 0% for >30 minutes game time
- Creature dies in battle (if death mechanic implemented; otherwise severe care mistake)

**Effects of Care Mistakes:**
- Permanent record on creature's profile.
- Increases weight toward neglect evolutions.
- May trigger emergency medical event (costs time + resources).
- 3+ care mistakes in a single stage guarantees a suboptimal evolution path.

---

### 3.4 Training System

#### Stats
1. **Strength (STR):** Melee attack damage.
2. **Speed (SPD):** Turn order, evasion, travel speed.
3. **Intelligence (INT):** Special attack damage, combat AI quality, training mini-game complexity.
4. **Stamina (STA):** Max energy, energy recovery rate, HP in combat.

#### Training Mini-Games
Each stat has a unique interactive mini-game. These are NOT idle — they require player input.

**Mini-Game Design Principles:**
- Must take 15-45 seconds of real player time.
- Score determines stat gain (D rank = +1, C = +2, B = +3, A = +5, S = +8).
- Performance should visibly improve as the stat grows (positive feedback loop).
- Fatigue builds with consecutive sessions.

**Mini-Game Examples:**
- **Strength (Weight Lifting):** Tap rapidly to fill a power bar. Release at the green zone. Timing gets stricter with higher levels.
- **Speed (Obstacle Dash):** Swipe/drag to avoid obstacles in a vertical scrolling lane. Speed increases with stat level.
- **Intelligence (Pattern Match):** Simon-says style pattern memorization. Pattern length increases with stat level.
- **Stamina (Breathing Exercise):** Hold and release a breath meter in rhythm. Precision required increases with level.

#### Overtraining
- Each training session raises a hidden "fatigue" meter.
- If fatigue exceeds 70%, stat gains are halved and mood drops sharply.
- If fatigue exceeds 90%, the creature may refuse further training.
- Fatigue decays when the creature is not training (primarily during sleep).

---

### 3.5 Combat System

#### Turn-Based Structure
- Combat encounters happen in specific areas or triggered by events.
- **Turn Order:** Determined by SPD stat (+ random variance).
- **Victory Condition:** Reduce enemy HP to 0, or enemy flees.
- **Defeat Condition:** Creature HP reaches 0. This is a **major care mistake.**

#### Limited Player Control
- The creature has autonomous AI influenced by its personality and discipline.
- The player chooses from 2-3 high-level **tactics** each turn:
  1. **"Go All Out"** — High-risk, high-reward. Creature may use powerful attacks but takes more damage.
  2. **"Play It Safe"** — Defensive. Prioritize survival over damage.
  3. **"Use Your Head"** — Tactical. Creature uses INT to exploit enemy weaknesses (if known).
- Higher discipline = creature follows tactics more reliably.
- Low discipline = creature may ignore commands and act on personality.

#### Attack Types
Each creature has 2-4 learned attacks categorized by risk:
- **Low Risk:** Reliable damage, low miss chance.
- **Medium Risk:** Better damage, moderate trade-offs.
- **High Risk:** High damage/crit chance, but may backfire (miss, recoil, waste turn).
- **Special:** Unique attacks tied to creature type/personality.

#### Battle Effects on Evolution
- Win/Loss ratio contributes 15% to evolution weighting.
- Winning with risky tactics increases "courage" personality weight.
- Winning while low HP unlocks hidden evolution paths.
- Fleeing from battle is allowed but counts as a minor care mistake.

---

### 3.6 Exploration System

#### World Regions
| Region | Description | Travel Time | Time-of-Day Encounters |
|--------|-------------|-------------|------------------------|
| **The Nursery** | Starting safe zone. Player's home base. | N/A | Tutorial creatures |
| **Verdant Thicket** | Dense forest. Low danger. | 15 min | Bugs, small beasts (day) |
| **Searing Dunes** | Desert. High heat drains energy. | 45 min | Reptiles, constructs (day) |
| **Ruins of Aethelgard** | Ancient ruins. Medium danger. | 30 min | Ghosts, golems (dusk/night) |
| **The Code Spire** | Tech zone. High danger. | 1 hour | Digital entities (night) |
| **Shimmering Deeps** | Underwater cave. Secret area. | 2 hours | Rare aquatic forms (deep night) |

#### Travel Mechanics
- Moving between regions consumes game time.
- Travel is not instantaneous — the clock visibly advances.
- **Short Travel:** Nearby regions (15-30 min). Safe.
- **Long Travel:** Distant regions (1-2 hours). May trigger random events (ambush, find item, meet NPC).
- The player can **cancel travel** mid-way, returning home (wastes half the time).

#### Encounters
- Each region has an encounter table weighted by:
  - Time of day
  - Player's creature stage/type
  - Weather (if weather system implemented)
  - Hidden flags (e.g., first visit, completed event)
- Encounters may be:
  - **Wild creatures** (battle optional — flee allowed)
  - **NPCs** (quests, trades, lore)
  - **Events** (found item, environmental hazard, special scene)
  - **Boss encounters** (rare, major rewards)

---

## 4. Creature Design Guidelines

### 4.1 Design Principles
- **100% Original IP.** No copyrighted creatures, names, or visual references.
- Each creature should be recognizable at small sizes (mobile screen).
- Silhouette readability is critical for combat clarity.
- Color palette should communicate type/element at a glance.

### 4.2 Creature Anatomy Requirements
Every creature needs:
- **Base Stats:** STR, SPD, INT, STA (scale 1-100 per stage)
- **Stat Growth Modifiers:** Which stats grow faster/slower.
- **Personality Affinities:** Which personalities are more likely to develop.
- **Lifespan Modifier:** Some lines live longer than others.
- **Sleep Schedule Modifier:** Some are nocturnal; some need more sleep.
- **Element/Type:** Determines weaknesses/resistances in combat.

### 4.3 Evolution Tree Structure
- Each stage has 2-4 possible next forms.
- Total creature count per "family tree": ~15-20 forms (covering all 6 stages).
- Multiple starting eggs branch into completely different trees.
- **Example Tree (simplified):**
  - Form A (Stage 2) → Form B (Stage 3, high care) OR Form C (Stage 3, neglect)
  - Form B → Form D (high STR) OR Form E (high INT)
  - Form D → Form F (normal) OR Form G (hidden: won 10 battles)
  - etc.

### 4.4 Visual Stages
- Each creature form needs sprites for:
  - Idle (2-4 frame loop)
  - Happy (reaction)
  - Sad/Injured (reaction)
  - Sleeping
  - Eating
  - Training (unique per stat mini-game)
  - Battle stance (idle)
  - Attack animations (2-4 per creature)
  - Evolution cinematic (transform sequence)

---

## 5. Visual Style & Art Direction

### 5.1 Overall Aesthetic
- **2D pixel art** OR **clean stylized 2D** (vector-like with crisp edges).
- Late-90s digital nostalgia — CRT scanlines optional but fitting.
- Color palettes shift dramatically with time of day.
- Creatures should feel "alive" through expressive idle animations.

### 5.2 Perspective
- **Top-down** OR **slightly angled (isometric-lite)**.
- Mobile constraint: Avoid true isometric (hard to control with virtual joystick).
- Top-down with slight perspective tilt (like classic Zelda: Link's Awakening) is recommended.

### 5.3 Time-of-Day Visuals
| Phase | Environment Brightness | Creature Tint | UI Tint |
|-------|------------------------|---------------|---------|
| Dawn | 80% brightness | Warm orange overlay | Orange highlights |
| Day | 100% brightness | Normal | White/blue highlights |
| Afternoon | 95% brightness | Slight yellow | Yellow highlights |
| Dusk | 60% brightness | Cool purple overlay | Purple highlights |
| Night | 35% brightness | Blue desaturated | Blue highlights |
| Deep Night | 20% brightness | Very desaturated | Dark blue |

### 5.4 Creature State Visualization
- **Health/condition:** Visible through posture, sprite tint (pale when hungry, dark when sad), and floating emotes.
- **Mood:** Heart emotes (happy), anger marks (irritated), Z's (sleepy), sweat drops (tired).
- **Discipline:** Sparkle effects when obedient, slouching posture when undisciplined.

---

## 6. Audio Design

### 6.1 Music System (Dynamic Layers)
- Music is split into 2-3 layers per track (rhythm, melody, harmony).
- **Time of day** determines base track selection (calm morning, energetic day, eerie night).
- **Location** determines instrumentation (forest = acoustic, tech zone = synth).
- **Creature state** determines layer intensity (calm = minimal layers, battle readiness = full layers).
- Transitions must be smooth (crossfade, not abrupt cuts).

### 6.2 Sound Effects
- Retro-inspired chiptune aesthetic but clean (not crunchy/low-quality).
- Every interaction needs feedback: feeding (crunch), training (success chime), battle hits (impact), evolution (rising scale).
- Creature vocalizations: Each creature type should have a unique "cry" sound (synthesized, not recorded animals to avoid copyright).

---

## 7. UI/UX Design

### 7.1 Mobile-First Constraints
- Target screen: 375px - 430px width (iPhone SE through Pro Max).
- All touch targets minimum 44x44pt.
- UI must work with virtual joystick and tap interactions.
- No hover states. No right-clicks. No keyboard shortcuts (primary input).

### 7.2 Always-On-HUD
The following must be visible at all times during active play:

```
[Top Bar - Height: ~60px]
| Clock (HH:MM) | Day/Night Icon | Creature Name (Stage) |
[Right Side - Vertical]
| Hunger: ████████░░ 80% |
| Energy: ██████░░░░ 60%  |
| Mood:   ███████░░░ 70%  |
| Disc:   █████████░ 90%  |
[Bottom Bar - Height: ~80px]
| [Inventory] | [Train] | [Map] | [Menu] |
```

#### Quick Action Menu (Bottom Bar)
- **Inventory:** Opens full-screen overlay with tabs (Food, Items, Key Items).
- **Train:** Opens training selection screen (STR/SPD/INT/STA).
- **Map:** Opens regional map. Tap region to travel. Shows travel time cost.
- **Menu:** Opens system menu (Save, Options, Creature Profile, Hall of Fame).

### 7.3 Interaction Patterns
- **Creature Interaction:** Tap creature to open radial menu (Feed, Play, Scold, Info).
- **World Interaction:** Tap NPCs or interactables. Virtual joystick for movement.
- **Training Mini-Games:** Full-screen, context-aware input (tap, hold, swipe, rhythm).
- **Combat:** Turn-based, bottom-of-screen tactic buttons.

### 7.4 Notifications
- Push notifications (if web/PWA enabled) for:
  - Creature is very hungry
  - Creature is exhausted
  - A shop is about to close
  - Evolution is imminent
  - Special event occurring
- In-game: Floating text + emote for immediate feedback.

---

## 8. Persistence & Save System

### 8.1 Save Data Requirements
- **Required:** LocalStorage/IndexedDB save system.
- **Data to persist:**
  - Creature state (stats, stage, evolution history, personality, care mistakes)
  - Inventory (all items, quantities)
  - World state (current region, unlocked regions, NPC states, quest progress)
  - Time state (last known game timestamp, total accumulated game time)
  - Player profile (settings, Hall of Fame, achievements)
- **Save frequency:** Auto-save every 30 seconds + on every significant action (travel, evolution, battle).
- **Save format:** JSON, versioned for backward compatibility.

### 8.2 Offline Simulation (Critical)
When the player loads the game after absence:
1. Calculate delta time since last save.
2. Cap simulation at 72 hours (prevent absurd outcomes from months-away players).
3. Run tick simulation in compressed time (at least 1 tick per hour missed).
4. Apply need decay, care mistakes, and random events.
5. If creature would have died (if death is implemented), trigger "near-death" emergency state with 1 hour to save it.
6. Show summary screen: "While you were away for 8 hours..." with bullet points of what happened.

### 8.3 Cloud Sync (Optional)
- **Goal:** Allow cross-device play.
- **Trigger:** Manual sync button + auto-sync on save.
- **Conflict resolution:** Timestamp-based. If cloud is newer, offer choice (keep local, keep cloud, or merge stats).

---

## 9. Content Scope Estimate

### 9.1 Creature Count
- **Starting Eggs:** 6 (giving players initial choice)
- **Evolution Forms per Tree:** ~15-20
- **Total Unique Creatures:** ~90-120
- **Note:** Full implementation would require art + stats + animations for all. MVP should focus on 1-2 complete trees (~20 creatures) with the system scalable to add more.

### 9.2 Regions
- 6 regions as listed in 3.6.
- MVP should include Nursery + 2 regions fully implemented, with the remaining 4 as stubs or locked content.

### 9.3 NPCs
- **Shopkeepers:** 1 per region = ~6
- **Quest Givers:** 2-3 per region = ~15
- **Wandering Trainers:** Procedurally generated or rotating cast.
- **Special NPCs:** Lore characters, unique event triggers = ~5-10.

### 9.4 Items
- **Food:** ~20 types (basic, gourmet, medicinal, regional specialties).
- **Training Items:** ~10 (boost specific stats temporarily).
- **Battle Items:** ~10 (healing, buffs, escape tools).
- **Key Items:** ~15 (quest items, region unlocks, lore collectibles).

---

## 10. Design Principles Checklist

For every feature added, verify:
- [ ] Does this encourage player engagement, not idle waiting?
- [ ] Does time have strategic weight in this feature?
- [ ] Does this deepen emotional attachment to the creature?
- [ ] Does neglect have meaningful (but not game-ending) consequences?
- [ ] Is this explainable to a new player in under 30 seconds?
- [ ] Does this work on a 375px wide screen with thumbs?

---

## 11. Open Questions for Team

1. **Death Mechanic:** Should creatures permanently die from extreme neglect, or should they enter a "coma" state recoverable with time/resources? (Death = hardcore roguelike feel; Coma = forgiving but still punishing)
2. **PvP:** Should players be able to battle each other's creatures asynchronously? This adds significant backend complexity.
3. **Weather System:** Should weather be a factor in encounters/training, or is time-of-day sufficient complexity?
4. **Crafting:** Should players be able to combine items (e.g., food + medicine = superfood), or keep items simple?
5. **Gacha/Unlock System:** Should new starting eggs be unlockable through progress, or are all available from the start?

---

## 12. Glossary

- **Care Mistake:** A recorded instance of the player's creature's need reaching 0%.
- **Evolution Candidate:** A potential next form the creature could evolve into, calculated by the evolution algorithm.
- **Game Time:** The in-world time, running continuously at 1 real minute = 1 game minute.
- **Neglect Evolution:** A weaker or "failed" evolution form triggered by poor care quality.
- **Stage:** One of the 6 lifecycle phases (Egg, Baby, Child, Adult, Mature, Elder).
- **Tactic:** A high-level combat command given by the player (e.g., "Go All Out").

---

*End of Game Design Document*
