import React from 'react';
import {
  LayoutDashboard,
  Map,
  Box,
  PlusCircle,
  Building2,
  Layers,
  Cpu,
  CheckCheck,
  AlertOctagon,
  FileCheck2,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCadastre, ActiveTab } from '../../context/CadastreContext';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar, conflicts } = useCadastre();

  const unresolvedConflictsCount = conflicts.filter((c) => c.status !== 'Resolved').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map2d', label: '2D GIS Map', icon: Map },
    { id: 'viewer3d', label: '3D Property Viewer', icon: Box, badge: 'Main', badgeColor: 'bg-blue-600 text-white' },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'explorer', label: 'Floor & Unit Explorer', icon: Layers },
    { id: 'validation', label: 'Validation', icon: CheckCheck, badge: '1 Area Err', badgeColor: 'bg-amber-600 text-white' },
    {
      id: 'conflicts',
      label: 'Ownership Conflicts',
      icon: AlertOctagon,
      badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined,
      badgeColor: 'bg-red-600 text-white',
    },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'datasources', label: 'Data Sources (LiDAR/DEM)', icon: Database },
  ];

  return (
    <aside
      className={`relative h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-30 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!isSidebarCollapsed && (
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 px-3">
            Cadastral Layers
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors group ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              />

              {!isSidebarCollapsed && (
                <>
                  <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                        item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button & Collapsible Controls matching mockup */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 mt-auto flex flex-col gap-2">
        {!isSidebarCollapsed ? (
          <button
            onClick={() => setActiveTab('create')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Create 3D Property</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('create')}
            title="Create 3D Property"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        )}

        {/* Sidebar expand/collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center text-[11px]"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
