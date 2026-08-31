import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  badgeNumber: string;
  jurisdiction: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  switchUserRole: (roleType: 'official' | 'citizen') => void;
}

export const OFFICIAL_DEMO_USER: AuthUser = {
  id: 'OFF-MH-2024-8841',
  name: 'Rajesh S. Kulkarni',
  email: 'official@geovision.gov.in',
  role: 'Senior Cadastral Surveyor',
  department: 'Department of Land Records & Survey',
  designation: 'Nodal Officer — 3D Strata Mapping',
  badgeNumber: 'DLR-MUM-8841',
  jurisdiction: 'Mumbai Metropolitan Region (MMR)',
};

export const CITIZEN_DEMO_USER: AuthUser = {
  id: 'CIT-MH-2024-1049',
  name: 'Aarav Mehta',
  email: 'aarav.mehta@citizen.gov.in',
  role: 'Citizen Account',
  department: 'Citizen Portal',
  designation: 'Registered Property Owner',
  badgeNumber: 'CIT-NAG-4001',
  jurisdiction: 'Nagpur / Mumbai Urban',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem('geovision_auth_session');
    return session === 'true';
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = localStorage.getItem('geovision_auth_session');
    if (session === 'true') {
      const stored = localStorage.getItem('geovision_user_profile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return CITIZEN_DEMO_USER;
        }
      }
      return CITIZEN_DEMO_USER;
    }
    return null;
  });

  const login = (emailInput: string, passwordInput: string, rememberMe: boolean = true) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (cleanEmail.includes('citizen')) {
      setIsAuthenticated(true);
      setUser(CITIZEN_DEMO_USER);
      localStorage.setItem('geovision_auth_session', 'true');
      localStorage.setItem('geovision_user_profile', JSON.stringify(CITIZEN_DEMO_USER));
      localStorage.setItem('geovision_user_role', 'citizen');
      return { success: true };
    }

    const isEmailValid = cleanEmail === 'official@geovision.gov.in' || cleanEmail === 'admin@geovision.gov.in';
    const isPassValid = cleanPass === 'GeoVision@123';

    if (isEmailValid && isPassValid) {
      setIsAuthenticated(true);
      setUser(OFFICIAL_DEMO_USER);
      localStorage.setItem('geovision_auth_session', 'true');
      localStorage.setItem('geovision_user_profile', JSON.stringify(OFFICIAL_DEMO_USER));
      localStorage.setItem('geovision_user_role', 'official');
      return { success: true };
    }

    return { success: false, error: 'Invalid ID or password.' };
  };

  const switchUserRole = (roleType: 'official' | 'citizen') => {
    const newUser = roleType === 'citizen' ? CITIZEN_DEMO_USER : OFFICIAL_DEMO_USER;
    setUser(newUser);
    localStorage.setItem('geovision_user_profile', JSON.stringify(newUser));
    localStorage.setItem('geovision_user_role', roleType);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('geovision_auth_session');
    localStorage.removeItem('geovision_user_profile');
    localStorage.removeItem('geovision_user_role');
    sessionStorage.removeItem('geovision_auth_session');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, switchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};