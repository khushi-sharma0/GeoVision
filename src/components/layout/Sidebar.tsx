import React from 'react';
import {
  LayoutDashboard,
  Map,
  Box,
  PlusCircle,
  Building2,
  Layers,
  CheckCheck,
  AlertOctagon,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  AlertTriangle,
  FileCheck2,
  User,
  Shield,
} from 'lucide-react';
import { useCadastre, ActiveTab } from '../../context/CadastreContext';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar, conflicts } = useCadastre();
  const { userType, user } = useAuth();

  const unresolvedConflictsCount = conflicts.filter((c) => c.status !== 'Resolved').length;

  // Authority Navigation List (All admin tools)
  const authorityNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map2d', label: '2D GIS Map', icon: Map },
    { id: 'viewer3d', label: '3D Property Viewer', icon: Box, badge: '3D', badgeColor: 'bg-emerald-600 text-white' },
    { id: 'properties', label: 'Properties Registry', icon: Building2 },
    { id: 'explorer', label: 'Floor & Unit Explorer', icon: Layers },
    { id: 'validation', label: 'Topology Validation', icon: CheckCheck, badge: '1 Error', badgeColor: 'bg-amber-600 text-white' },
    {
      id: 'conflicts',
      label: 'Ownership Conflicts',
      icon: AlertOctagon,
      badge: unresolvedConflictsCount > 0 ? unresolvedConflictsCount : undefined,
      badgeColor: 'bg-red-600 text-white',
    },
    { id: 'datasources', label: 'LiDAR & Drone Data', icon: Database },
    { id: 'settings', label: 'LADM Settings', icon: Sliders },
  ];

  // Citizen Navigation List (Specific citizen tools matching your requirements)
  const citizenNavItems: NavItem[] = [
    { id: 'viewer3d', label: 'View 3D Property', icon: Box, badge: 'Citizen', badgeColor: 'bg-blue-600 text-white' },
    { id: 'map2d', label: '2D GIS Map', icon: Map },
    { id: 'properties', label: 'Search Property & Owner', icon: Search },
    { id: 'explorer', label: 'Download Property Record', icon: FileText },
    { id: 'report_boundary' as ActiveTab, label: 'Report Boundary Error', icon: AlertTriangle, badge: 'Citizen', badgeColor: 'bg-amber-500 text-white' },
    { id: 'apply_correction' as ActiveTab, label: 'Apply Correction/Transfer', icon: FileCheck2 },
  ];

  const navItems = userType === 'citizen' ? citizenNavItems : authorityNavItems;

  return (
    <aside
      className={`relative h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-30 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* User Mode Header Badge */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div
            className={`p-2 rounded-xl border flex items-center gap-2 ${
              userType === 'citizen'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                userType === 'citizen' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}
            >
              {userType === 'citizen' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-extrabold uppercase tracking-wider leading-tight">
                {userType === 'citizen' ? 'Citizen Portal' : 'Authority Portal'}
              </div>
              <div className="text-[10px] opacity-80 truncate">{user?.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {!isSidebarCollapsed && (
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 px-3">
            {userType === 'citizen' ? 'Citizen Services' : 'Cadastral Administration'}
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors group ${
                isActive
                  ? userType === 'citizen'
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? userType === 'citizen'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
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

      {/* Action Button for Authority vs Citizen Quick Action */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 mt-auto flex flex-col gap-2">
        {userType === 'authority' ? (
          !isSidebarCollapsed ? (
            <button
              onClick={() => setActiveTab('create')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create 3D Property</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('create')}
              title="Create 3D Property"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )
        ) : (
          !isSidebarCollapsed ? (
            <button
              onClick={() => setActiveTab('report_boundary' as ActiveTab)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-xl text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Incorrect Boundary</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('report_boundary' as ActiveTab)}
              title="Report Incorrect Boundary"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl text-center font-bold text-xs shadow-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          )
        )}

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center text-[11px] cursor-pointer"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};