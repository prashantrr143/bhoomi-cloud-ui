import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  accountId: string;
  organizationId: string;
  defaultAccountId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for multi-tenancy
interface DemoUser {
  email: string;
  password: string;
  userData: User;
}

const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@bhoomi.cloud',
    password: 'admin123',
    userData: {
      id: 'user-001',
      email: 'admin@bhoomi.cloud',
      name: 'Organization Admin',
      accountId: '123456789012',
      organizationId: 'o-bhoomi001',
      defaultAccountId: '123456789012',
    },
  },
  {
    email: 'developer@bhoomi.cloud',
    password: 'dev123',
    userData: {
      id: 'user-002',
      email: 'developer@bhoomi.cloud',
      name: 'Developer User',
      accountId: '345678901234',
      organizationId: 'o-bhoomi001',
      defaultAccountId: '345678901234',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('bhoomi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check against demo users
    const matchedUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (matchedUser) {
      setUser(matchedUser.userData);
      localStorage.setItem('bhoomi_user', JSON.stringify(matchedUser.userData));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bhoomi_user');
    localStorage.removeItem('bhoomi_current_account');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
