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
    // Save to localStorage or state
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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header: "Road Monitoring" */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-brand-400" />
            <span>Road Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive PMGSY rural connectors, district networks, and national highway condition registry.
          </p>
        </div>

        {/* View Toggle & Add Road Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Map/List/Grid Toggle */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
            Add Road
          </Button>
        </div>
      </div>

      {/* 2. Search & 5 Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by Road ID, Name, District, or State..."
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-slate-200">{filteredRoads.length}</strong> of {roads.length} Roads
          </div>
        </div>

        {/* 5 Filters Row */}
        <FilterBar>
          {/* District Filter */}
          <FilterSelect
            label="District"
            value={districtFilter}
            onChange={setDistrictFilter}
            options={[
              { value: 'all', label: 'All Districts' },
              ...uniqueDistricts.map((d) => ({ value: d, label: d })),
            ]}
          />

          {/* Priority Filter */}
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'Immediate', label: 'Immediate Action' },
              { value: 'High', label: 'High Priority' },
              { value: 'Monitor', label: 'Monitor' },
            ]}
          />

          {/* Health Score Filter */}
          <FilterSelect
            label="Health Score"
            value={healthFilter}
            onChange={setHealthFilter}
            options={[
              { value: 'all', label: 'All Health Scores' },
              { value: 'good', label: 'Optimal (85–100)' },
              { value: 'satisfactory', label: 'Satisfactory (70–84)' },
              { value: 'fair', label: 'Fair / Degraded (55–69)' },
              { value: 'critical', label: 'Critical Failure (<55)' },
            ]}
          />

          {/* Road Status Filter */}
          <FilterSelect
            label="Road Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'normal', label: 'Normal / Stable' },
              { value: 'under_maintenance', label: 'Under Maintenance' },
              { value: 'critical_alert', label: 'Critical Alert' },
            ]}
          />

          {/* Last Inspection Filter */}
          <FilterSelect
            label="Last Inspection"
            value={inspectionFilter}
            onChange={setInspectionFilter}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </FilterBar>
      </div>

      {/* 3. Main Views: Grid / Table / Map */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoads.map((road) => (
            <RoadCard key={road.id} road={road} />
          ))}
          {filteredRoads.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
              No roads match your current search and filter criteria.
            </div>
          )}
        </div>
      )}

      {viewMode === 'table' && (
        <RoadTable roads={filteredRoads} loading={loading} />
      )}

      {viewMode === 'map' && (
        <RoadMapView />
      )}

      {/* Add Road Modal */}
      <AddRoadModal
        isOpen={isAddRoadOpen}
        onClose={() => setIsAddRoadOpen(false)}
        onAddRoad={handleAddRoad}
      />
    </div>
  );
}
