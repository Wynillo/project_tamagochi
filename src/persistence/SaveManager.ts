import { IndexedDBClient } from './IndexedDBClient';
import { SaveCompression, SaveData } from './SaveCompression';

export class SaveManager {
  private static db = new IndexedDBClient();
  private static compression = new SaveCompression();
  private static debounceTimer: number | null = null;
  private static readonly DEBOUNCE_MS = 2000;

  static async save(slot: string = 'autosave', data: SaveData): Promise<void> {
    const saveData: SaveData = {
      ...data,
      version: '1.0.0',
      checksum: SaveManager.compression.generateChecksum(data),
      savedAt: Date.now(),
    };
    const compressed = SaveManager.compression.compress(saveData);
    await SaveManager.db.set('saves', slot, { compressed, savedAt: saveData.savedAt });
  }

  static async autoSave(data: SaveData): Promise<void> {
    if (SaveManager.debounceTimer) clearTimeout(SaveManager.debounceTimer);
    SaveManager.debounceTimer = window.setTimeout(() => {
      SaveManager.save('autosave', data).catch(console.error);
    }, SaveManager.DEBOUNCE_MS);
  }

  static async load(slot: string = 'autosave'): Promise<SaveData | null> {
    const record = await SaveManager.db.get<{ compressed: string; savedAt: number }>('saves', slot);
    if (!record) return null;
    const decompressed = SaveManager.compression.decompress(record.compressed);
    if (!decompressed) return null;
    if (!SaveManager.compression.validateChecksum(decompressed)) return null;
    return decompressed;
  }

  static async listSaves(): Promise<{ slot: string; savedAt: number }[]> {
    // We can't easily list keys with idb. For MVP, return known slots.
    const slots = ['autosave', 'manual_1', 'manual_2', 'manual_3'];
    const results: { slot: string; savedAt: number }[] = [];
    for (const slot of slots) {
      const record = await SaveManager.db.get<{ compressed: string; savedAt: number }>('saves', slot);
      if (record) results.push({ slot, savedAt: record.savedAt });
    }
    return results;
  }

  static async deleteSave(slot: string): Promise<void> {
    await SaveManager.db.delete('saves', slot);
  }

  static async hasSave(slot: string): Promise<boolean> {
    const record = await SaveManager.db.get('saves', slot);
    return record !== undefined;
  }

  static async saveToHallOfFame(creatureData: any): Promise<void> {
    await SaveManager.db.set('hallOfFame', Date.now(), creatureData);
  }

  static async loadHallOfFame(): Promise<any[]> {
    return SaveManager.db.getAll('hallOfFame');
  }
}
