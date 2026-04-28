import type { CreatureData } from '../types/CreatureTypes';
import type { ItemData } from '../types/ItemTypes';
import type { RegionData } from '../types/WorldTypes';
import type { AttackData } from '../types/CombatTypes';
import type { PersonalityId } from '../types/CommonTypes';
import type { NPCData } from '../types/WorldTypes';
import type { EncounterEntry } from '../types/WorldTypes';

export interface PersonalityData {
  id: PersonalityId;
  name: string;
  description: string;
  statAffinities: Record<string, number>;
  behaviorModifiers: Record<string, number>;
}

export interface EncounterTableData {
  id: string;
  regionId: string;
  encounters: EncounterEntry[];
}

/**
 * DataLoader - Singleton class for loading and caching game data.
 * All data is fetched from /assets/data/*.json files.
 */
export class DataLoader {
  private static instance: DataLoader | null = null;

  private creaturesCache: CreatureData[] | null = null;
  private itemsCache: ItemData[] | null = null;
  private regionsCache: RegionData[] | null = null;
  private attacksCache: AttackData[] | null = null;
  private personalitiesCache: PersonalityData[] | null = null;
  private npcsCache: NPCData[] | null = null;
  private encounterTablesCache: EncounterTableData[] | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of DataLoader.
   */
  public static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load creature data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadCreatures(): Promise<CreatureData[] | null> {
    if (this.creaturesCache !== null) {
      return this.creaturesCache;
    }

    const response = await fetch('/assets/data/creatures.json');
    if (!response.ok) {
      return null;
    }
    this.creaturesCache = await response.json();
    return this.creaturesCache;
  }

  /**
   * Load item data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadItems(): Promise<ItemData[] | null> {
    if (this.itemsCache !== null) {
      return this.itemsCache;
    }

    const response = await fetch('/assets/data/items.json');
    if (!response.ok) {
      return null;
    }
    this.itemsCache = await response.json();
    return this.itemsCache;
  }

  /**
   * Load region data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadRegions(): Promise<RegionData[] | null> {
    if (this.regionsCache !== null) {
      return this.regionsCache;
    }

    const response = await fetch('/assets/data/regions.json');
    if (!response.ok) {
      return null;
    }
    this.regionsCache = await response.json();
    return this.regionsCache;
  }

  /**
   * Load attack data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadAttacks(): Promise<AttackData[] | null> {
    if (this.attacksCache !== null) {
      return this.attacksCache;
    }

    const response = await fetch('/assets/data/attacks.json');
    if (!response.ok) {
      return null;
    }
    this.attacksCache = await response.json();
    return this.attacksCache;
  }

  /**
   * Load personality data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadPersonalities(): Promise<PersonalityData[] | null> {
    if (this.personalitiesCache !== null) {
      return this.personalitiesCache;
    }

    const response = await fetch('/assets/data/personalities.json');
    if (!response.ok) {
      return null;
    }
    this.personalitiesCache = await response.json();
    return this.personalitiesCache;
  }

  /**
   * Load NPC data from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadNPCs(): Promise<NPCData[] | null> {
    if (this.npcsCache !== null) {
      return this.npcsCache;
    }

    const response = await fetch('/assets/data/npcs.json');
    if (!response.ok) {
      return null;
    }
    this.npcsCache = await response.json();
    return this.npcsCache;
  }

  /**
   * Load encounter tables from JSON file.
   * Returns cached data if already loaded.
   */
  public async loadEncounterTables(): Promise<EncounterTableData[] | null> {
    if (this.encounterTablesCache !== null) {
      return this.encounterTablesCache;
    }

    const response = await fetch('/assets/data/encounters.json');
    if (!response.ok) {
      return null;
    }
    this.encounterTablesCache = await response.json();
    return this.encounterTablesCache;
  }

  /**
   * Preload all game data in parallel.
   * Should be called during game initialization.
   */
  public async preloadAll(): Promise<void> {
    await Promise.all([
      this.loadCreatures(),
      this.loadItems(),
      this.loadRegions(),
      this.loadAttacks(),
      this.loadPersonalities(),
      this.loadNPCs(),
      this.loadEncounterTables(),
    ]);
  }

  /**
   * Clear all cached data.
   * Useful for development hot-reloading or memory management.
   */
  public clearCache(): void {
    this.creaturesCache = null;
    this.itemsCache = null;
    this.regionsCache = null;
    this.attacksCache = null;
    this.personalitiesCache = null;
    this.npcsCache = null;
    this.encounterTablesCache = null;
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();
