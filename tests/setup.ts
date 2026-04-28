import { vi } from 'vitest';
// Mock IndexedDB for tests
globalThis.indexedDB = {
  open: vi.fn(() => ({ readyState: 'done' })),
} as any;
