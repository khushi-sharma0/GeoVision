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

const MainAppLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { activeTab } = useCadastre();

  const isCitizen = !user || user.role?.toLowerCase().includes('citizen') || user.role === 'Citizen';

  // If not authenticated, show official login screen first
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    // Guard admin-only views from Citizen Mode
    if (isCitizen && ['create', 'validation', 'conflicts', 'settings', 'datasources'].includes(activeTab)) {
      return <DashboardView />;
    }

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
        return <Viewer3DView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-[#191412] text-[#291F1D] dark:text-[#F8F4EE] flex flex-col font-sans antialiased select-none">
      {/* Fixed Top Navbar */}
      <TopNavbar />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar with independent scroll */}
        <Sidebar />

        {/* Dynamic View Canvas with controlled scrolling */}
        <main className="flex-1 overflow-hidden relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <DigitalPropertyCardModal />
      <OwnershipDocsModal />
      <FloorPlanModal />
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