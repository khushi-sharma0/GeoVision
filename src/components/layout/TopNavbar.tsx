import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  User,
  ShieldCheck,
  Building,
  MapPin,
  AlertTriangle,
  X,
  LogOut,
  Shield,
  UserCheck,
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

  const { user, logout, switchUserRole } = useAuth();

  const isCitizen =
    !user ||
    user.role?.toLowerCase().includes('citizen') ||
    user.name?.toLowerCase().includes('aarav') ||
    localStorage.getItem('geovision_user_role') === 'citizen';

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
              <span
                className={`hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                  isCitizen
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}
              >
                {isCitizen ? 'CITIZEN PORTAL' : '3D Cadastre'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold leading-none mt-0.5">
              3D ULPIN & Vertical Property System
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
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
              placeholder="Search your property by ULPIN / Owner Name..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 pl-10 pr-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Notifications, Theme Switch, Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-9 h-9 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer focus:outline-none overflow-hidden"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.div
                  key="sun-icon"
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
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
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-[18px] h-[18px] text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* User Profile Menu */}
          <div className="relative border-l pl-4 border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <button
              onClick={() => setIsAdminMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
            >
              <div className="w-7 h-7 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs">
                {user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'AM'}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Aarav Mehta'}
                </p>
                <p className="text-[9px] text-slate-500 leading-none">
                  {user?.role || 'Citizen Account'}
                </p>
              </div>
            </button>

            {isAdminMenuOpen && (
              <div className="absolute right-0 top-10 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{user?.name || 'Aarav Mehta'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.role || 'Citizen Account'}
                  </p>
                </div>

                <div className="py-1 space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Mode / View
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole('citizen');
                      setIsAdminMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer ${
                      isCitizen ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Citizen Mode</span>
                    {isCitizen && <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">Active</span>}
                  </button>

                  <button
                    onClick={() => {
                      switchUserRole('official');
                      setIsAdminMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between cursor-pointer ${
                      !isCitizen ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>Official Surveyor Mode</span>
                    {!isCitizen && <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">Active</span>}
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
                    <span>Sign Out</span>
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