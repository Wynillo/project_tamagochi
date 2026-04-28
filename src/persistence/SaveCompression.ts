import { compress, decompress } from 'lz-string';
import { serialize, deserialize } from 'superjson';

export interface SaveData {
  version: string;
  checksum: string;
  savedAt: number;
  creature: any;
  world: any;
  time: any;
  inventory: any;
  player: any;
}

export class SaveCompression {
  compress(data: SaveData): string {
    const serialized = serialize(data);
    const json = JSON.stringify(serialized);
    return compress(json);
  }

  decompress(compressed: string): SaveData | null {
    try {
      const json = decompress(compressed);
      if (!json) return null;
      const parsed = JSON.parse(json);
      return deserialize<SaveData>(parsed);
    } catch {
      return null;
    }
  }

  generateChecksum(data: SaveData): string {
    // Simple checksum: JSON stringify of core fields, then charCode sum modulo uint32
    const str = JSON.stringify({
      creature: data.creature,
      world: data.world,
      time: data.time,
      inventory: data.inventory,
      player: data.player,
    });
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return hash.toString(16);
  }

  validateChecksum(data: SaveData): boolean {
    return data.checksum === this.generateChecksum(data);
  }
}
