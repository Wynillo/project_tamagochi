import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../state/useGameStore';
import type { InventoryItem } from '../../data/types/ItemTypes';
import type { ItemType } from '../../data/types/CommonTypes';

interface InventoryMenuProps {
  onClose?: () => void;
}

type TabId = 'food' | 'items' | 'key';

const TABS: { id: TabId; label: string }[] = [
  { id: 'food', label: 'Food' },
  { id: 'items', label: 'Items' },
  { id: 'key', label: 'Key Items' },
];

const classifyItem = (itemId: string): TabId => {
  if (itemId.startsWith('food')) return 'food';
  if (itemId.startsWith('key')) return 'key';
  return 'items';
};

const TYPE_COLORS: Record<ItemType, string> = {
  food: '#4caf50',
  training: '#ff9800',
  battle: '#f44336',
  key: '#ffd700',
};

const getItemType = (id: string): ItemType => {
  if (id.startsWith('food')) return 'food';
  if (id.startsWith('train')) return 'training';
  if (id.startsWith('battle')) return 'battle';
  return 'key';
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15, 14, 26, 0.95)',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '"Courier New", monospace',
    zIndex: 1000,
    color: '#b8b8d4',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #3a3a6c',
  },
  title: { fontSize: '1.3rem', color: '#e0e0ff', margin: 0 },
  points: { fontSize: '0.85rem', color: '#ffd700' },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '0 1.5rem',
    borderBottom: '1px solid #1a1a3e',
  },
  tab: (active: boolean) => ({
    padding: '0.6rem 1.2rem',
    background: active ? '#1a1a3e' : 'transparent',
    color: active ? '#e0e0ff' : '#6c6c8c',
    border: 'none',
    borderBottom: active ? '2px solid #6c63ff' : '2px solid transparent',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    padding: '1rem 1.5rem',
    overflowY: 'auto' as const,
    flex: 1,
  },
  cell: {
    background: '#1a1a3e',
    border: '1px solid #3a3a6c',
    borderRadius: '8px',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  cellName: { fontSize: '0.75rem', color: '#b8b8d4', textAlign: 'center' as const },
  cellQty: { fontSize: '0.85rem', color: '#e0e0ff' },
  closeBtn: {
    padding: '0.8rem',
    margin: '0.8rem 1.5rem',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  empty: { padding: '2rem', textAlign: 'center' as const, color: '#6c6c8c' },
  searchBar: {
    margin: '0.5rem 1.5rem',
    padding: '0.5rem 0.8rem',
    background: '#1a1a3e',
    border: '1px solid #3a3a6c',
    borderRadius: '6px',
    color: '#b8b8d4',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.85rem',
    width: 'calc(100% - 3rem)',
    outline: 'none',
  },
};

export const InventoryMenu: React.FC<InventoryMenuProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('food');
  const [search, setSearch] = useState('');
  const store = useGameStore();
  const items = store.inventory.items;

  const filtered = useMemo(() => {
    const byType = items.filter((item: InventoryItem) => classifyItem(item.itemId) === activeTab);
    if (!search) return byType;
    return byType.filter((item: InventoryItem) => item.itemId.toLowerCase().includes(search.toLowerCase()));
  }, [items, activeTab, search]);

  const useItem = (item: InventoryItem) => {
    if (item.itemId.startsWith('food')) {
      store.updateNeeds({ hunger: Math.min(100, store.creature.needs.hunger + 20) });
      store.removeItem(item.itemId, 1);
    } else if (item.itemId.startsWith('train')) {
      store.addStatGain('str', 1);
      store.removeItem(item.itemId, 1);
    } else if (item.itemId.startsWith('battle')) {
      store.updateNeeds({ energy: Math.min(100, store.creature.needs.energy + 15) });
      store.removeItem(item.itemId, 1);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <h2 style={styles.title}>Inventory</h2>
        <span style={styles.points}>Points: {store.inventory.currency.points}</span>
      </div>

      <div style={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        style={styles.searchBar}
        placeholder="Search items..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div style={styles.empty}>No items in this category</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item: InventoryItem) => (
            <div
              key={item.itemId}
              style={styles.cell}
              onClick={() => useItem(item)}
              onMouseEnter={e => (e.currentTarget.style.background = '#2a2a5e')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1a1a3e')}
            >
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: TYPE_COLORS[getItemType(item.itemId)] }} />
              <span style={styles.cellName}>{item.itemId.replace(/_/g, ' ')}</span>
              <span style={styles.cellQty}>x{item.quantity ?? 1}</span>
            </div>
          ))}
        </div>
      )}

      <button style={styles.closeBtn} onClick={onClose}>Close</button>
    </div>
  );
};

export default InventoryMenu;
