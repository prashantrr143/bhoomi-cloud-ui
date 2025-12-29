import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { applyMode, applyDensity, Mode, Density } from '@cloudscape-design/global-styles';

type ThemeMode = 'light' | 'dark';
type ThemeDensity = 'comfortable' | 'compact';

interface ThemeContextType {
  mode: ThemeMode;
  density: ThemeDensity;
  setMode: (mode: ThemeMode) => void;
  setDensity: (density: ThemeDensity) => void;
  toggleMode: () => void;
  toggleDensity: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'bhoomi-theme-preferences';

interface ThemePreferences {
  mode: ThemeMode;
  density: ThemeDensity;
}

function getStoredPreferences(): ThemePreferences {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore localStorage errors
  }
  return { mode: 'light', density: 'comfortable' };
}

function storePreferences(preferences: ThemePreferences): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore localStorage errors
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultDensity?: ThemeDensity;
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
  defaultDensity = 'comfortable',
}: ThemeProviderProps) {
  const stored = getStoredPreferences();
  const [mode, setModeState] = useState<ThemeMode>(stored.mode || defaultMode);
  const [density, setDensityState] = useState<ThemeDensity>(stored.density || defaultDensity);

  // Apply mode on mount and changes
  useEffect(() => {
    applyMode(mode === 'dark' ? Mode.Dark : Mode.Light);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Apply density on mount and changes
  useEffect(() => {
    applyDensity(density === 'compact' ? Density.Compact : Density.Comfortable);
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    storePreferences({ mode: newMode, density });
  };

  const setDensity = (newDensity: ThemeDensity) => {
    setDensityState(newDensity);
    storePreferences({ mode, density: newDensity });
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const toggleDensity = () => {
    setDensity(density === 'comfortable' ? 'compact' : 'comfortable');
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        density,
        setMode,
        setDensity,
        toggleMode,
        toggleDensity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
