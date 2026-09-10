import React, { useState } from 'react';
import { useRoads } from '../hooks/useRoads';
import { RoadCard } from '../components/roads/RoadCard';
import { RoadTable } from '../components/roads/RoadTable';
import { RoadMapView } from '../components/roads/RoadMapView';
import { AddRoadModal } from '../components/roads/AddRoadModal';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterBar, FilterSelect } from '../components/ui/FilterBar';
import { Button } from '../components/ui/Button';
import {
  Route,
  PlusCircle,
  LayoutGrid,
  List,
  Map,
  Filter,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export function RoadsPage() {
  const { roads, loading, refreshRoads } = useRoads();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'map'
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inspectionFilter, setInspectionFilter] = useState('all');
  const [isAddRoadOpen, setIsAddRoadOpen] = useState(false);

  // Extract unique districts from mock roads
  const uniqueDistricts = Array.from(new Set(roads.map((r) => r.district).filter(Boolean)));

  // Filter logic covering all 5 requested dimensions + search
  const filteredRoads = roads.filter((r) => {
    // 1. Search Query
    if (search) {
      const q = search.toLowerCase();
      const matches =
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.state?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 2. District Filter
    if (districtFilter !== 'all' && r.district !== districtFilter) return false;

    // 3. Priority Filter
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;

    // 4. Health Score Filter
    const score = Number(r.healthScore || r.pciScore || 0);
    if (healthFilter === 'good' && score < 85) return false;
    if (healthFilter === 'satisfactory' && (score < 70 || score >= 85)) return false;
    if (healthFilter === 'fair' && (score < 55 || score >= 70)) return false;
    if (healthFilter === 'critical' && score >= 55) return false;

    // 5. Road Status Filter
    if (statusFilter === 'critical_alert' && r.priority !== 'Immediate') return false;
    if (statusFilter === 'under_maintenance' && r.priority !== 'High') return false;
    if (statusFilter === 'normal' && r.priority !== 'Monitor') return false;

    // 6. Last Inspection Filter
    if (inspectionFilter !== 'all') {
      const inspTime = new Date(r.latestInspection || r.lastInspected).getTime();
      const now = new Date().getTime();
      const diffHours = (now - inspTime) / (1000 * 3600);
      if (inspectionFilter === '24h' && diffHours > 24) return false;
      if (inspectionFilter === '7d' && diffHours > 168) return false;
      if (inspectionFilter === '30d' && diffHours > 720) return false;
    }

    return true;
  });

  const handleAddRoad = async (newRoad) => {
    const saved = localStorage.getItem('sadak_setu_roads');
    let list = roads;
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const updated = [newRoad, ...list];
    localStorage.setItem('sadak_setu_roads', JSON.stringify(updated));
    refreshRoads();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e2ebe4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#123320] tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-brand-700" />
            <span>Road Corridors &amp; Network Map</span>
          </h1>
          <p className="text-xs text-[#3b5e47] mt-1">
            Comprehensive PMGSY rural connectors, district networks, and national highway condition registry.
          </p>
        </div>

        {/* View Toggle & Add Road Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Map/List/Grid Toggle */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#e2ebe4] shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-[#728a79] hover:text-[#123320]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>GIS Map</span>
            </button>
          </div>

          {/* Add Road Button */}
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setIsAddRoadOpen(true)}
          >
            Add Corridor
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by Corridor ID, Name, District..."
            />
          </div>

          <div className="text-xs text-[#728a79] font-mono">
            Showing <strong className="text-[#123320]">{filteredRoads.length}</strong> of {roads.length} Corridors
          </div>
        </div>

        {/* Filters Row */}
        <FilterBar>
          <FilterSelect
            label="District"
            value={districtFilter}
            onChange={setDistrictFilter}
            options={[
              { value: 'all', label: 'All Districts' },
              ...uniqueDistricts.map((d) => ({ value: d, label: d })),
            ]}
          />

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'Immediate', label: 'Immediate' },
              { value: 'High', label: 'High' },
              { value: 'Monitor', label: 'Monitor' },
            ]}
          />

          <FilterSelect
            label="Health Score"
            value={healthFilter}
            onChange={setHealthFilter}
            options={[
              { value: 'all', label: 'All Health Scores' },
              { value: 'good', label: 'Good (85-100)' },
              { value: 'satisfactory', label: 'Satisfactory (70-84)' },
              { value: 'fair', label: 'Fair (55-69)' },
              { value: 'critical', label: 'Critical (<55)' },
            ]}
          />

          <FilterSelect
            label="Condition Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'critical_alert', label: 'Critical Alert' },
              { value: 'under_maintenance', label: 'Under Maintenance' },
              { value: 'normal', label: 'Normal' },
            ]}
          />

          <FilterSelect
            label="Last Inspected"
            value={inspectionFilter}
            onChange={setInspectionFilter}
            options={[
              { value: 'all', label: 'Anytime' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </FilterBar>
      </div>

      {/* 3. Main Views (Grid, Table, GIS Map) */}
      {viewMode === 'map' ? (
        <RoadMapView />
      ) : viewMode === 'table' ? (
        <RoadTable roads={filteredRoads} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRoads.map((road) => (
            <RoadCard key={road.id} road={road} />
          ))}
        </div>
      )}

      {/* Add Road Modal */}
      <AddRoadModal
        isOpen={isAddRoadOpen}
        onClose={() => setIsAddRoadOpen(false)}
        onSubmit={handleAddRoad}
      />
    </div>
  );
}
