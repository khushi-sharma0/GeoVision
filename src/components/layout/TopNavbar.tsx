import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  ShieldCheck,
  ChevronDown,
  Building,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import { useCadastre } from '../../context/CadastreContext';
import { useAuth } from '../../context/AuthContext';

export const TopNavbar: React.FC = () => {
  const {
    isDark,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    performSearch,
    parcels,
    units,
    ownerships,
    conflicts,
    setActiveTab,
    setSelectedUnitId,
    setSelectedFloorId,
    setSelectedBuildingId,
    setSelectedParcelId,
  } = useCadastre();

  const { user, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter search results dynamically
  const filteredResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedUnits = units.filter(
      (u) => u.full3DULPIN.toLowerCase().includes(q) || u.unitCode.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedOwners = ownerships.filter(
      (o) => o.ownerName.toLowerCase().includes(q) || o.docRefNo.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedParcels = parcels.filter(
      (p) =>
        p.ulpin.toLowerCase().includes(q) ||
        p.localParcelId.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      units: matchedUnits,
      owners: matchedOwners,
      parcels: matchedParcels,
      totalCount: matchedUnits.length + matchedOwners.length + matchedParcels.length,
    };
  }, [searchQuery, units, ownerships, parcels]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUnit = (unitId: string, floorId: string, bldgId: string) => {
    setSelectedUnitId(unitId);
    setSelectedFloorId(floorId);
    setSelectedBuildingId(bldgId);
    setActiveTab('viewer3d');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectParcel = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    setActiveTab('map2d');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 transition-colors">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Brand Logo & System Title */}
<div
  onClick={() => setActiveTab('dashboard')}
  className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
>
  <div className="w-9 h-9 rounded-lg bg-white p-0.5 shadow-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
    <img
      src="/logo.jpeg"
      alt="GeoVision Logo"
      className="w-full h-full object-contain"
    />
  </div>
  <div>
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
        GeoVision
      </h1>
      <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
        3D Cadastre
      </span>
    </div>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold leading-none mt-0.5">
      3D ULPIN & Vertical Mapping
    </p>
  </div>
</div>
        

        {/* Center: Global Search Bar matching theme */}
        <div ref={searchRef} className="relative flex-1 max-w-xl px-2 sm:px-6 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  performSearch(searchQuery);
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search by ULPIN / Owner / Location..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 pl-10 pr-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && filteredResults && filteredResults.totalCount > 0 && (
            <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-96 overflow-y-auto">
              {filteredResults.units.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Units & 3D ULPINs
                  </div>
                  {filteredResults.units.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUnit(u.id, u.floorId, u.buildingId)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                            {u.unitCode} ({u.unitType})
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {u.full3DULPIN}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{u.carpetAreaSqM} m²</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredResults.owners.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Ownership Records
                  </div>
                  {filteredResults.owners.map((o) => {
                    const u = units.find((un) => un.id === o.unitId);
                    return (
                      <button
                        key={o.id}
                        onClick={() => {
                          if (u) handleSelectUnit(u.id, u.floorId, u.buildingId);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {o.ownerName} ({o.ownershipType})
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              Unit {o.unitCode} • Doc: {o.docRefNo}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-medium">
                          {o.verificationStatus}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredResults.parcels.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Land Parcels
                  </div>
                  {filteredResults.parcels.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectParcel(p.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                            {p.localParcelId} — {p.ulpin}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.locationName}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{p.areaSqM} m²</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Notifications, Theme Switch, Admin User */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle - Outline icon with 150ms crossfade rotation */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="w-9 h-9 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun-icon"
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-[18px] h-[18px] text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon-icon"
                  initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-[18px] h-[18px] text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cadastral Alerts ({conflicts.length + 1})
                  </span>
                  <span className="text-[11px] text-blue-600 cursor-pointer hover:underline">
                    Mark read
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    onClick={() => {
                      setActiveTab('conflicts');
                      setIsNotifOpen(false);
                    }}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 cursor-pointer hover:bg-red-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Potential Ownership Conflict</span>
                    </div>
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                      Unit F3-303: Double conveyance claim registered.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab('validation');
                      setIsNotifOpen(false);
                    }}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 cursor-pointer hover:bg-amber-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Area Mismatch (Floor F4)</span>
                    </div>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                      Unit total (1175 m²) exceeds registered slab (1000 m²).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Profile with Border Separation */}
          <div className="relative border-l pl-4 border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <button
              onClick={() => setIsAdminMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
            >
              <div className="w-7 h-7 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs">
                {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RK'}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Rajesh S. Kulkarni'}
                </p>
                <p className="text-[9px] text-slate-500 leading-none">
                  {user?.role || 'Senior Cadastral Officer'}
                </p>
              </div>
            </button>

            {isAdminMenuOpen && (
              <div className="absolute right-0 top-10 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{user?.name || 'Rajesh S. Kulkarni'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.department || 'Dept of Land Records & Survey'}
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                    Badge: {user?.badgeNumber || 'DLR-MUM-8841'}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsAdminMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    Cadastre Settings & CRS
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('datasources');
                      setIsAdminMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    Spatial Data Sources (LiDAR/DEM)
                  </button>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Official Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
