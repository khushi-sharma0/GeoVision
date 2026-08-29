import React from 'react';
import {
  Building2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useCadastre } from '../../context/CadastreContext';

export const DashboardView: React.FC = () => {
  const { parcels, buildings, floors, units, conflicts, setActiveTab, selectProperty, isDark } = useCadastre();

  // Live-computed KPIs from context data (matches PropertiesView totals exactly)
  const totalParcels = parcels.length;
  const totalBuildings = buildings.length;
  const totalFloors = floors.length;
  const totalUnits = units.length;
  const totalConflicts = conflicts.length;
  const verifiedUnits = units.filter((u) => u.status === 'Verified').length;
  const pendingUnits = units.filter((u) => u.status === 'Pending').length;
  const verifiedPct = totalUnits > 0 ? ((verifiedUnits / totalUnits) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: 'TOTAL PARCELS', value: String(totalParcels), sub: 'Registered 2D Parcels', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'BUILDINGS', value: String(totalBuildings), sub: 'Multi-Storey Structures', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/50' },
    { label: 'FLOORS', value: String(totalFloors), sub: 'Vertical Strata Slabs', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50' },
    { label: 'UNITS', value: String(totalUnits), sub: '3D Cadastral Spatial Units', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/50' },
    { label: 'VERIFIED', value: String(verifiedUnits), sub: `${verifiedPct}% Clear Ownership`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'CONFLICTS', value: String(totalConflicts), sub: 'Flagged for Adjudication', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/50' },
    { label: 'PENDING', value: String(pendingUnits), sub: 'Awaiting Sub-Registrar', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  ];

  // Chart 1: Properties by Land Use
  const landUseData = [
    { name: 'Residential', value: 12, color: '#3b82f6' },
    { name: 'Commercial', value: 5, color: '#06b6d4' },
    { name: 'Mixed Use', value: 2, color: '#8b5cf6' },
    { name: 'Institutional', value: 1, color: '#10b981' },
  ];

  // Chart 2: Units by Floor Level
  const unitsByFloorData = [
    { floor: 'B2', units: 6 },
    { floor: 'B1', units: 12 },
    { floor: 'GF', units: 24 },
    { floor: 'F1', units: 48 },
    { floor: 'F2', units: 54 },
    { floor: 'F3', units: 58 },
    { floor: 'F4', units: 46 },
    { floor: 'F5', units: 40 },
    { floor: 'Terrace', units: 24 },
  ];

  // Chart 3: Verification Status
  const verificationData = [
    { name: 'Verified', count: 286, color: '#22c55e' },
    { name: 'Pending Review', count: 18, color: '#f59e0b' },
    { name: 'Flagged Conflict', count: 8, color: '#ef4444' },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner / System Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Cadastral Operations & 3D ULPIN Registry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                LIVE
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Interactive 3D cadastral system extending 2D land parcel identification (ULPIN) to building, floor, and volumetric unit tenure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('viewer3d')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Launch 3D Viewer</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              + Create 3D Property
            </button>
          </div>
        </div>

        {/* Top 7 Statistics Cards matching specification */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {stats.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {st.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${st.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${st.color}`} />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                    {st.value}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {st.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Chart 1: Land Use Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              Properties by Land Use
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={landUseData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {landUseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: 8, fontSize: 11 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Units by Floor Level */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              Vertical Units per Floor Slab
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitsByFloorData}>
                  <XAxis dataKey="floor" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Verification & Conflicts */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              Cadastral Verification Status
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {verificationData.map((entry, index) => (
                      <Cell key={`vcell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Registered Parcels Directory Preview Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Registered Cadastral Parcels (Maharashtra)
              </h3>
              <p className="text-xs text-slate-400">
                Click any parcel to inspect 3D volumetric strata and ownership cards
              </p>
            </div>

            <button
              onClick={() => setActiveTab('properties')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>View All {totalParcels} Parcels</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">Parcel ID</th>
                  <th className="p-2.5">2D ULPIN</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Area (m²)</th>
                  <th className="p-2.5">Land Use</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {parcels.slice(0, 5).map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => {
                      selectProperty(p.id);
                      setActiveTab('viewer3d');
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">
                      {p.localParcelId}
                    </td>
                    <td className="p-2.5 font-semibold">{p.ulpin}</td>
                    <td className="p-2.5 font-sans font-medium">{p.locationName}</td>
                    <td className="p-2.5">{p.areaSqM.toFixed(2)}</td>
                    <td className="p-2.5 font-sans">{p.landUse}</td>
                    <td className="p-2.5 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-sans">
                      <button className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[11px]">
                        View 3D
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

