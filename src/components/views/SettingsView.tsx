import React, { useState } from 'react';
import {
  Sliders,
  Globe,
  Save,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { LadmComplianceSection } from './settings/LadmComplianceSection';
import { VerticalPropertyRulesSection } from './settings/VerticalPropertyRulesSection';
import { OwnershipRrrRulesSection } from './settings/OwnershipRrrRulesSection';
import { DataSourceFusionSection } from './settings/DataSourceFusionSection';
import { UlpinGovernanceSection } from './settings/UlpinGovernanceSection';
import { UnitsLocaleSection } from './settings/UnitsLocaleSection';
import { UserRolesPermissionsSection } from './settings/UserRolesPermissionsSection';

export const SettingsView: React.FC = () => {
  // Existing Card 1: CRS
  const [crs, setCrs] = useState<string>('EPSG:4326 (WGS 84 / Geographic)');
  
  // Existing Card 2: 3D ULPIN Syntax
  const [ulpinSeparator, setUlpinSeparator] = useState<string>('-');
  const [buildingCodePrefix, setBuildingCodePrefix] = useState<string>('B');
  const [floorCodePrefix, setFloorCodePrefix] = useState<string>('F');
  const [unitCodePrefix, setUnitCodePrefix] = useState<string>('U');

  // New Section 1: LADM & Compliance Rules
  const [isLadmOpen, setIsLadmOpen] = useState<boolean>(true);
  const [enforceTopology, setEnforceTopology] = useState<boolean>(true);
  const [selectedLadmClasses, setSelectedLadmClasses] = useState<string[]>([
    'Party',
    'RRR',
    'Spatial Unit',
    'Building Unit',
  ]);
  const [demDsmThreshold, setDemDsmThreshold] = useState<string>('10+ units');

  // New Section 2: Vertical Property Rules
  const [isVerticalOpen, setIsVerticalOpen] = useState<boolean>(true);
  const [minFloorHeight, setMinFloorHeight] = useState<number>(2.4);
  const [maxFloorHeight, setMaxFloorHeight] = useState<number>(5.0);
  const [maxBasementDepth, setMaxBasementDepth] = useState<number>(15.0);
  const [allowDuplexUnits, setAllowDuplexUnits] = useState<boolean>(true);

  // New Section 3: Ownership & RRR Rules
  const [isOwnershipRrrOpen, setIsOwnershipRrrOpen] = useState<boolean>(true);
  const [requireHundredPercent, setRequireHundredPercent] = useState<boolean>(true);
  const [allowedOwnerTypes, setAllowedOwnerTypes] = useState<string[]>([
    'Individual',
    'Company',
    'Trust',
    'Joint',
    'Government',
  ]);
  const [allowedTenureTypes, setAllowedTenureTypes] = useState<string[]>([
    'Freehold',
    'Leasehold',
    'Government Lease',
  ]);

  // New Section 4: Data Source & Fusion Thresholds
  const [isDataSourceOpen, setIsDataSourceOpen] = useState<boolean>(true);
  const [minLidarDensity, setMinLidarDensity] = useState<number>(15);
  const [minDroneResolutionGsd, setMinDroneResolutionGsd] = useState<number>(2.5);
  const [maxDataAgeMonths, setMaxDataAgeMonths] = useState<number>(12);
  const [maxGnssErrorCm, setMaxGnssErrorCm] = useState<number>(5.0);

  // New Section 5: ULPIN Governance
  const [isGovernanceOpen, setIsGovernanceOpen] = useState<boolean>(true);
  const [ulpinRegenerateRole, setUlpinRegenerateRole] = useState<string>(
    'Senior Surveyor / Admin only'
  );
  const [logUlpinChanges, setLogUlpinChanges] = useState<boolean>(true);

  // New Section 6: Units & Locale
  const [isLocaleOpen, setIsLocaleOpen] = useState<boolean>(true);
  const [areaUnit, setAreaUnit] = useState<string>('sq.m (Square Metres - SI Standard)');
  const [nameScript, setNameScript] = useState<string>('Latin (English Official Standard)');

  // New Section 7: User Roles & Permissions
  const [isRolesOpen, setIsRolesOpen] = useState<boolean>(true);
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>({
    Surveyor: {
      createProperty: true,
      editSettings: false,
      approveValidation: false,
      editDataSources: true,
    },
    'Senior Surveyor': {
      createProperty: true,
      editSettings: false,
      approveValidation: true,
      editDataSources: true,
    },
    Admin: {
      createProperty: true,
      editSettings: true,
      approveValidation: true,
      editDataSources: true,
    },
  });
  const [requireSecondSurveyor, setRequireSecondSurveyor] = useState<boolean>(true);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cadastral System Settings & 3D ULPIN Rules
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure geodetic reference systems, 3D ULPIN generation schema, LADM compliance rules, and vertical boundary constraints.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'All Settings Saved!' : 'Save Configurations'}</span>
          </button>
        </div>

        {/* Setting Groups 1 & 2 (Existing Cards Maintained Exactly) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Coordinate Reference System (CRS) & Projection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Primary Cadastral CRS
                </label>
                <select
                  value={crs}
                  onChange={(e) => setCrs(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="EPSG:4326 (WGS 84 / Geographic)">EPSG:4326 (WGS 84 / Geographic Lat-Long)</option>
                  <option value="EPSG:3857 (WGS 84 / Pseudo-Mercator)">EPSG:3857 (Pseudo-Mercator)</option>
                  <option value="EPSG:7760 (WGS 84 / UTM Zone 43N)">EPSG:7760 (UTM Zone 43N - India)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Vertical Elevation Datum
                </label>
                <input
                  type="text"
                  readOnly
                  value="EGM2008 (Mean Sea Level Orthometric)"
                  className="w-full h-8 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Hierarchical 3D ULPIN Syntax Template
            </h3>
            <p className="text-slate-500 mb-3">
              Standard format: <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">[ParentULPIN]-[Building]-[Floor]-[Unit]</code>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-slate-500 text-[10px] mb-1 font-sans font-semibold">
                  Separator Token
                </label>
                <input
                  type="text"
                  value={ulpinSeparator}
                  onChange={(e) => setUlpinSeparator(e.target.value)}
                  className="w-full h-8 px-2 text-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] mb-1 font-sans font-semibold">
                  Building Prefix
                </label>
                <input
                  type="text"
                  value={buildingCodePrefix}
                  onChange={(e) => setBuildingCodePrefix(e.target.value)}
                  className="w-full h-8 px-2 text-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] mb-1 font-sans font-semibold">
                  Floor Prefix
                </label>
                <input
                  type="text"
                  value={floorCodePrefix}
                  onChange={(e) => setFloorCodePrefix(e.target.value)}
                  className="w-full h-8 px-2 text-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] mb-1 font-sans font-semibold">
                  Unit Prefix
                </label>
                <input
                  type="text"
                  value={unitCodePrefix}
                  onChange={(e) => setUnitCodePrefix(e.target.value)}
                  className="w-full h-8 px-2 text-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 font-mono text-xs">
              <span className="text-slate-400 block text-[10px] font-sans">Formula Preview</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                27101500123456{ulpinSeparator}{buildingCodePrefix}A{ulpinSeparator}{floorCodePrefix}12{ulpinSeparator}{unitCodePrefix}03
              </span>
            </div>
          </div>
        </div>

        {/* New Modular Collapsible Settings Sections */}
        <LadmComplianceSection
          isExpanded={isLadmOpen}
          onToggle={() => setIsLadmOpen(!isLadmOpen)}
          enforceTopology={enforceTopology}
          setEnforceTopology={setEnforceTopology}
          selectedLadmClasses={selectedLadmClasses}
          setSelectedLadmClasses={setSelectedLadmClasses}
          demDsmThreshold={demDsmThreshold}
          setDemDsmThreshold={setDemDsmThreshold}
        />

        <VerticalPropertyRulesSection
          isExpanded={isVerticalOpen}
          onToggle={() => setIsVerticalOpen(!isVerticalOpen)}
          minFloorHeight={minFloorHeight}
          setMinFloorHeight={setMinFloorHeight}
          maxFloorHeight={maxFloorHeight}
          setMaxFloorHeight={setMaxFloorHeight}
          maxBasementDepth={maxBasementDepth}
          setMaxBasementDepth={setMaxBasementDepth}
          allowDuplexUnits={allowDuplexUnits}
          setAllowDuplexUnits={setAllowDuplexUnits}
        />

        <OwnershipRrrRulesSection
          isExpanded={isOwnershipRrrOpen}
          onToggle={() => setIsOwnershipRrrOpen(!isOwnershipRrrOpen)}
          requireHundredPercent={requireHundredPercent}
          setRequireHundredPercent={setRequireHundredPercent}
          allowedOwnerTypes={allowedOwnerTypes}
          setAllowedOwnerTypes={setAllowedOwnerTypes}
          allowedTenureTypes={allowedTenureTypes}
          setAllowedTenureTypes={setAllowedTenureTypes}
        />

        <DataSourceFusionSection
          isExpanded={isDataSourceOpen}
          onToggle={() => setIsDataSourceOpen(!isDataSourceOpen)}
          minLidarDensity={minLidarDensity}
          setMinLidarDensity={setMinLidarDensity}
          minDroneResolutionGsd={minDroneResolutionGsd}
          setMinDroneResolutionGsd={setMinDroneResolutionGsd}
          maxDataAgeMonths={maxDataAgeMonths}
          setMaxDataAgeMonths={setMaxDataAgeMonths}
          maxGnssErrorCm={maxGnssErrorCm}
          setMaxGnssErrorCm={setMaxGnssErrorCm}
        />

        <UlpinGovernanceSection
          isExpanded={isGovernanceOpen}
          onToggle={() => setIsGovernanceOpen(!isGovernanceOpen)}
          ulpinRegenerateRole={ulpinRegenerateRole}
          setUlpinRegenerateRole={setUlpinRegenerateRole}
          logUlpinChanges={logUlpinChanges}
          setLogUlpinChanges={setLogUlpinChanges}
        />

        <UnitsLocaleSection
          isExpanded={isLocaleOpen}
          onToggle={() => setIsLocaleOpen(!isLocaleOpen)}
          areaUnit={areaUnit}
          setAreaUnit={setAreaUnit}
          nameScript={nameScript}
          setNameScript={setNameScript}
        />

        <UserRolesPermissionsSection
          isExpanded={isRolesOpen}
          onToggle={() => setIsRolesOpen(!isRolesOpen)}
          permissionsMatrix={permissionsMatrix}
          setPermissionsMatrix={setPermissionsMatrix}
          requireSecondSurveyor={requireSecondSurveyor}
          setRequireSecondSurveyor={setRequireSecondSurveyor}
        />

      </div>
    </div>
  );
};

