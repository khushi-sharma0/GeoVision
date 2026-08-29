/**
 * GeoVision — 3D ULPIN & Vertical Property Mapping System
 * Built for Cadastral Land Administration (LADM ISO 19152)
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CadastreProvider, useCadastre } from './context/CadastreContext';
import { LoginPage } from './components/auth/LoginPage';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { Viewer3DView } from './components/views/Viewer3DView';
import { Map2DView } from './components/views/Map2DView';
import { CreatePropertyView } from './components/views/CreatePropertyView';
import { PropertiesView } from './components/views/PropertiesView';
import { FloorUnitExplorerView } from './components/views/FloorUnitExplorerView';
import { AIAnalysisView } from './components/views/AIAnalysisView';
import { ValidationView } from './components/views/ValidationView';
import { OwnershipConflictsView } from './components/views/OwnershipConflictsView';
import { ReportsView } from './components/views/ReportsView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { DigitalPropertyCardModal } from './components/modals/DigitalPropertyCardModal';
import { OwnershipDocsModal } from './components/modals/OwnershipDocsModal';
import { FloorPlanModal } from './components/modals/FloorPlanModal';
import { ReportBoundaryModal } from './components/modals/ReportBoundaryModal';
import { CorrectionTransferModal } from './components/modals/CorrectionTransferModal';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const { activeTab } = useCadastre();

  // Show official login page if unauthenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    // If Citizen Mode is active, restrict access to Authority-only views
    if (userType === 'citizen') {
      switch (activeTab) {
        case 'viewer3d':
          return <Viewer3DView />;
        case 'map2d':
          return <Map2DView />;
        case 'properties':
          return <PropertiesView />;
        case 'explorer':
          return <FloorUnitExplorerView />;
        case 'reports':
          return <ReportsView />;
        default:
          return <Viewer3DView />;
      }
    }

    // Full Authority Mode view suite
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'viewer3d':
        return <Viewer3DView />;
      case 'map2d':
        return <Map2DView />;
      case 'create':
        return <CreatePropertyView />;
      case 'properties':
        return <PropertiesView />;
      case 'explorer':
        return <FloorUnitExplorerView />;
      case 'ai_analysis':
        return <AIAnalysisView />;
      case 'validation':
        return <ValidationView />;
      case 'conflicts':
        return <OwnershipConflictsView />;
      case 'reports':
        return <ReportsView />;
      case 'datasources':
        return <DataSourcesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-[#191412] text-[#291F1D] dark:text-[#F8F4EE] flex flex-col font-sans antialiased select-none">
      {/* Fixed Top Navbar */}
      <TopNavbar />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-hidden relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <DigitalPropertyCardModal />
      <OwnershipDocsModal />
      <FloorPlanModal />
      <ReportBoundaryModal />
      <CorrectionTransferModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CadastreProvider>
        <MainAppLayout />
      </CadastreProvider>
    </AuthProvider>
  );
}