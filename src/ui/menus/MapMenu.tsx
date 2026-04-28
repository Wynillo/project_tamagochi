import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';
import type { RegionId } from '../../data/types/CommonTypes';

interface MapMenuProps {
  onClose?: () => void;
  onTravel?: (regionId: RegionId) => void;
}

interface RegionInfo {
  id: RegionId;
  name: string;
  description: string;
  x: number;
  y: number;
}

const REGIONS: RegionInfo[] = [
  { id: 'nursery', name: 'Nursery', description: 'A safe haven for young creatures. Gentle meadows and warm sunlight.', x: 50, y: 60 },
  { id: 'verdantThicket', name: 'Verdant Thicket', description: 'Dense forests teeming with wild creatures and rare plants.', x: 25, y: 35 },
  { id: 'searingDunes', name: 'Searing Dunes', description: 'Scorching desert with ancient ruins buried beneath the sand.', x: 75, y: 30 },
  { id: 'ruinsOfAethelgard', name: 'Ruins of Aethelgard', description: 'Crumbling towers echo with forgotten magic.', x: 30, y: 75 },
  { id: 'codeSpire', name: 'Code Spire', description: 'A shimmering tower of digital energy and arcane technology.', x: 70, y: 70 },
  { id: 'shimmeringDeeps', name: 'Shimmering Deeps', description: 'Underwater caverns where bioluminescent creatures dwell.', x: 50, y: 20 },
];

const REGION_COLORS: Record<string, string> = {
  nursery: '#4caf50',
  verdantThicket: '#2e7d32',
  searingDunes: '#ff9800',
  ruinsOfAethelgard: '#7e57c2',
  codeSpire: '#6c63ff',
  shimmeringDeeps: '#0097a7',
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15, 14, 26, 0.95)',
    display: 'flex',
    fontFamily: '"Courier New", monospace',
    zIndex: 1000,
    color: '#b8b8d4',
  },
  mapArea: {
    flex: 1,
    position: 'relative' as const,
  },
  node: (isDiscovered: boolean, isCurrent: boolean): React.CSSProperties => ({
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: isCurrent ? '60px' : '48px',
    height: isCurrent ? '60px' : '48px',
    borderRadius: '50%',
    background: isDiscovered ? (REGION_COLORS[isCurrent ? 'current' : ''] || '#1a1a3e') : '#2a2a3e',
    border: isCurrent ? '3px solid #6c63ff' : isDiscovered ? '2px solid #3a3a6c' : '2px solid #1a1a3e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDiscovered ? 'pointer' : 'default',
    transition: 'all 0.15s ease',
    fontSize: '0.7rem',
    color: isDiscovered ? '#e0e0ff' : '#3a3a5c',
    textAlign: 'center' as const,
  }),
  sidebar: {
    width: '280px',
    background: '#0f0e1a',
    borderLeft: '1px solid #3a3a6c',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  sidebarTitle: { fontSize: '1.1rem', color: '#e0e0ff', margin: 0 },
  sidebarDesc: { fontSize: '0.85rem', color: '#6c6c8c', lineHeight: 1.5 },
  travelBtn: (canTravel: boolean) => ({
    padding: '0.7rem',
    background: canTravel ? '#4caf50' : '#3a3a5c',
    color: canTravel ? '#fff' : '#6c6c8c',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: canTravel ? 'pointer' : 'default',
  }),
  closeBtn: {
    padding: '0.7rem',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"Courier New", monospace',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginTop: 'auto',
  },
};

export const MapMenu: React.FC<MapMenuProps> = ({ onClose, onTravel }) => {
  const store = useGameStore();
  const [selected, setSelected] = useState<RegionId | null>(null);

  const discovered = store.world.discoveredRegions;
  const current = store.world.currentRegion;

  const selectedRegion = REGIONS.find(r => r.id === selected);
  const isSelectedDiscovered = selected ? discovered.includes(selected) : false;
  const isCurrentRegion = selected === current;

  return (
    <div style={styles.overlay}>
      <div style={styles.mapArea}>
        {REGIONS.map(region => {
          const isDiscovered = discovered.includes(region.id);
          const isCurrent = region.id === current;
          const nodeStyle = styles.node(isDiscovered, isCurrent);
          if (isDiscovered && !isCurrent) {
            nodeStyle.background = REGION_COLORS[region.id] || '#1a1a3e';
          }
          if (isCurrent) {
            nodeStyle.background = REGION_COLORS[region.id] || '#6c63ff';
            nodeStyle.boxShadow = `0 0 16px ${REGION_COLORS[region.id] || '#6c63ff'}80`;
          }

          return (
            <div
              key={region.id}
              style={{ ...nodeStyle, left: `${region.x}%`, top: `${region.y}%` }}
              onClick={() => isDiscovered && setSelected(region.id)}
            >
              {isDiscovered ? region.name.substring(0, 5) : '???'}
            </div>
          );
        })}
      </div>

      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>
          {selectedRegion ? selectedRegion.name : 'Select a region'}
        </h3>

        {selectedRegion && isSelectedDiscovered && (
          <>
            <p style={styles.sidebarDesc}>{selectedRegion.description}</p>
            <button
              style={styles.travelBtn(!isCurrentRegion)}
              disabled={isCurrentRegion}
              onClick={() => {
                if (onTravel && selected) onTravel(selected);
                if (selected) store.setCurrentRegion(selected);
                onClose?.();
              }}
            >
              {isCurrentRegion ? 'Currently here' : 'Travel'}
            </button>
          </>
        )}

        {selected && !isSelectedDiscovered && (
          <p style={styles.sidebarDesc}>This region has not been discovered yet.</p>
        )}

        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MapMenu;
