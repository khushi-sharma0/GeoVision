import React, { createContext, useContext, useState } from 'react';

export type UserRoleType = 'citizen' | 'authority';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: UserRoleType;
  role: string;
  department?: string;
  designation?: string;
  badgeNumber?: string;
  jurisdiction?: string;
  nationalIdMasked?: string;
  associatedULPINs?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  userType: UserRoleType;
  login: (email: string, password: string, mode: UserRoleType, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
}

const OFFICIAL_DEMO_USER: AuthUser = {
  id: 'OFF-MH-2024-8841',
  name: 'Rajesh S. Kulkarni',
  email: 'official@geovision.gov.in',
  userType: 'authority',
  role: 'Senior Cadastral Surveyor',
  department: 'Department of Land Records & Survey',
  designation: 'Nodal Officer — 3D Strata Mapping',
  badgeNumber: 'DLR-MUM-8841',
  jurisdiction: 'Mumbai Metropolitan Region (MMR)',
};

const CITIZEN_DEMO_USER: AuthUser = {
  id: 'CIT-MH-2024-5512',
  name: 'Aarav Mehta',
  email: 'citizen@geovision.gov.in',
  userType: 'citizen',
  role: 'Registered Property Owner',
  nationalIdMasked: 'XXXX-XXXX-4912',
  associatedULPINs: ['27101500123456-BA-F3-U03'],
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
          return OFFICIAL_DEMO_USER;
        }
      }
      return OFFICIAL_DEMO_USER;
    }
    return null;
  });

  const userType: UserRoleType = user?.userType || 'authority';

  const login = (
    emailInput: string,
    passwordInput: string,
    mode: UserRoleType,
    rememberMe: boolean = true
  ) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (mode === 'citizen') {
      const isCitizenEmail = cleanEmail === 'citizen@geovision.gov.in' || cleanEmail === 'user@geovision.gov.in';
      const isCitizenPass = cleanPass === 'Citizen@123';

      if (isCitizenEmail && isCitizenPass) {
        setIsAuthenticated(true);
        setUser(CITIZEN_DEMO_USER);
        if (rememberMe) {
          localStorage.setItem('geovision_auth_session', 'true');
          localStorage.setItem('geovision_user_profile', JSON.stringify(CITIZEN_DEMO_USER));
        } else {
          sessionStorage.setItem('geovision_auth_session', 'true');
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid Citizen email or password. Use demo button below.' };
    } else {
      const isAuthorityEmail = cleanEmail === 'official@geovision.gov.in' || cleanEmail === 'admin@geovision.gov.in';
      const isAuthorityPass = cleanPass === 'GeoVision@123';

      if (isAuthorityEmail && isAuthorityPass) {
        setIsAuthenticated(true);
        setUser(OFFICIAL_DEMO_USER);
        if (rememberMe) {
          localStorage.setItem('geovision_auth_session', 'true');
          localStorage.setItem('geovision_user_profile', JSON.stringify(OFFICIAL_DEMO_USER));
        } else {
          sessionStorage.setItem('geovision_auth_session', 'true');
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid Official ID or password.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('geovision_auth_session');
    localStorage.removeItem('geovision_user_profile');
    sessionStorage.removeItem('geovision_auth_session');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userType, login, logout }}>
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