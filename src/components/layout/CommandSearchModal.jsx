import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, Wrench, FileText, ArrowRight, X } from 'lucide-react';
import { MOCK_ROADS } from '../../data/mockRoads';
import { MOCK_INSPECTIONS } from '../../data/mockInspections';
import { MOCK_WORK_ORDERS } from '../../data/mockWorkOrders';

export function CommandSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRoads = MOCK_ROADS.filter(
    (r) => r.code.toLowerCase().includes(query.toLowerCase()) || r.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredDefects = MOCK_INSPECTIONS.filter(
    (i) =>
      i.id.toLowerCase().includes(query.toLowerCase()) ||
      i.defectType.toLowerCase().includes(query.toLowerCase()) ||
      i.chainage.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredWorkOrders = MOCK_WORK_ORDERS.filter(
    (w) =>
      w.id.toLowerCase().includes(query.toLowerCase()) ||
      w.title.toLowerCase().includes(query.toLowerCase()) ||
      w.roadCode.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      {/* Search box */}
      <div className="relative w-full max-w-2xl bg-white border border-[#ddeae0] rounded-2xl shadow-elevated overflow-hidden z-10 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-[#ddeae0] flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search highway corridors, defects, work orders, chainages..."
            className="w-full bg-transparent text-sm text-[#1a3825] placeholder-[#7a9a83] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-surface-100 text-[#7a9a83] border border-[#ddeae0] rounded-lg">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-[#7a9a83] hover:text-[#1a3825] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-4 text-xs">
          {/* Highway Corridors */}
          {filteredRoads.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9a83] px-3 py-1">
                Highway Corridors
              </div>
              <div className="space-y-1 mt-1">
                {filteredRoads.map((road) => (
                  <button
                    key={road.id}
                    onClick={() => handleSelect(`/roads`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-brand-100 text-brand-600">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#1a3825] font-mono">{road.code}</span>
                        <span className="text-[#7a9a83] ml-2">{road.name}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#4a6b55]">PCI {road.pciScore}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Defects */}
          {filteredDefects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9a83] px-3 py-1">
                AI Detected Defects
              </div>
              <div className="space-y-1 mt-1">
                {filteredDefects.map((defect) => (
                  <button
                    key={defect.id}
                    onClick={() => handleSelect(`/inspections`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#1a3825]">{defect.defectType}</span>
                        <span className="text-[#7a9a83] ml-2 font-mono">{defect.roadCode} ({defect.chainage})</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                      {defect.severity.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Work Orders */}
          {filteredWorkOrders.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9a83] px-3 py-1">
                Maintenance Work Orders
              </div>
              <div className="space-y-1 mt-1">
                {filteredWorkOrders.map((wo) => (
                  <button
                    key={wo.id}
                    onClick={() => handleSelect(`/maintenance`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-[#1a3825] font-mono">{wo.id}</span>
                        <span className="text-[#7a9a83] ml-2">{wo.title}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#b5ccbc] group-hover:text-brand-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredRoads.length === 0 && filteredDefects.length === 0 && filteredWorkOrders.length === 0 && (
            <div className="py-8 text-center text-[#7a9a83]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No matching records found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#ddeae0] bg-surface-50 flex items-center gap-4 text-[10px] text-[#7a9a83] font-mono">
          <span>↩ to select</span>
          <span>↑↓ navigate</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
