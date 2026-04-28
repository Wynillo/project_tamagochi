import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DigitalCompanionDB extends DBSchema {
  saves: { key: string; value: any };
  hallOfFame: { key: number; value: any; indexes: { byTimestamp: number } };
  settings: { key: string; value: any };
  assetCache: { key: string; value: Blob };
}

export class IndexedDBClient {
  private db: IDBPDatabase<DigitalCompanionDB> | null = null;

  async open(): Promise<IDBPDatabase<DigitalCompanionDB>> {
    if (this.db) return this.db;
    this.db = await openDB<DigitalCompanionDB>('DigitalCompanionDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('saves')) db.createObjectStore('saves');
        if (!db.objectStoreNames.contains('hallOfFame')) {
          const store = db.createObjectStore('hallOfFame', { autoIncrement: true });
          store.createIndex('byTimestamp', 'retiredAt');
        }
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
        if (!db.objectStoreNames.contains('assetCache')) db.createObjectStore('assetCache');
      },
    });
    return this.db;
  }

  async get<T>(storeName: keyof DigitalCompanionDB, key: string | number): Promise<T | undefined> {
    const db = await this.open();
    return db.get(storeName as any, key as any) as Promise<T | undefined>;
  }

  async set<T>(storeName: keyof DigitalCompanionDB, key: string | number, value: T): Promise<void> {
    const db = await this.open();
    await db.put(storeName as any, value, key as any);
  }

  async delete(storeName: keyof DigitalCompanionDB, key: string | number): Promise<void> {
    const db = await this.open();
    await db.delete(storeName as any, key as any);
  }

  async getAll<T>(storeName: keyof DigitalCompanionDB): Promise<T[]> {
    const db = await this.open();
    return db.getAll(storeName as any) as Promise<T[]>;
  }

  async clear(storeName: keyof DigitalCompanionDB): Promise<void> {
    const db = await this.open();
    await db.clear(storeName as any);
  }
}
