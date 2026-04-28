export type LifeStage = 'egg' | 'baby' | 'child' | 'adult' | 'mature' | 'elder';
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'nature' | 'tech';
export type PersonalityId = 'reckless' | 'cautious' | 'greedy' | 'loyal' | 'lazy' | 'hyperactive';
export type GameRank = 'D' | 'C' | 'B' | 'A' | 'S';
export type TimePhase = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night' | 'deepNight';
export type RegionId = 'nursery' | 'verdantThicket' | 'searingDunes' | 'ruinsOfAethelgard' | 'codeSpire' | 'shimmeringDeeps';
export type SceneId = 'boot' | 'mainMenu' | 'newGame' | 'hub' | 'combat' | 'training' | 'map' | 'inventory' | 'creature' | 'shop' | 'event' | 'phaseTransition';
export type Tactic = 'goAllOut' | 'playItSafe' | 'useYourHead';
export type NeedType = 'hunger' | 'energy' | 'mood' | 'discipline';
export type StatType = 'str' | 'spd' | 'int' | 'sta';
export type SleepType = 'diurnal' | 'nocturnal' | 'crepuscular' | 'polyphasic';
export type ItemType = 'food' | 'training' | 'battle' | 'key';
export type AttackRiskLevel = 'low' | 'medium' | 'high' | 'special';
export type EncounterType = 'wildCreature' | 'npc' | 'event' | 'boss';
export type WeatherType = 'clear' | 'rain' | 'heat' | 'fog' | 'storm';
export type StatusEffectType = 'poison' | 'paralyze' | 'sleep' | 'burn' | 'slow' | 'recoil';
export type EmoteType = 'heart' | 'anger' | 'zz' | 'sweat' | 'question';

export interface Position { x: number; y: number; }
export interface Stats { str: number; spd: number; int: number; sta: number; }
export interface GrowthRates { str: number; spd: number; int: number; sta: number; }
