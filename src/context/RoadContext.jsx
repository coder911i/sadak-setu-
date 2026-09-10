import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { roadService } from '../services/roadService';

const RoadContext = createContext(null);

export function RoadProvider({ children }) {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedRoadId, setSelectedRoadId] = useState('road-nh48'); // Default active corridor
  const [stats, setStats] = useState({ totalKm: 0, avgPci: 0, totalCorridors: 0, totalDefects: 0, criticalDefects: 0 });

  const fetchRoads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roadService.getRoads();
      const statsData = await roadService.getCorridorStats();
      setRoads(data);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load roads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoads();
  }, [fetchRoads]);

  const filteredRoads = roads.filter((r) => {
    if (selectedZone === 'all') return true;
    return r.zone === selectedZone;
  });

  const activeRoad = roads.find((r) => r.id === selectedRoadId) || roads[0] || null;

  return (
    <RoadContext.Provider
      value={{
        roads: filteredRoads,
        allRoads: roads,
        activeRoad,
        selectedRoadId,
        setSelectedRoadId,
        selectedZone,
        setSelectedZone,
        loading,
        stats,
        refreshRoads: fetchRoads,
      }}
    >
      {children}
    </RoadContext.Provider>
  );
}

export function useRoadContext() {
  const context = useContext(RoadContext);
  if (!context) {
    throw new Error('useRoadContext must be used within RoadProvider');
  }
  return context;
}
