import React, { createContext, useContext, useSelector } from 'react';
import { Colors, ColorSchemes } from '../../../shared/constants';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const { preferences } = useSelector(state => state.user);
  
  // Get role-based theme
  const getRoleTheme = () => {
    if (!user?.role) return Colors;
    
    return {
      ...Colors,
      roleColors: user.role === 'PATIENT' ? Colors.patient : Colors.doctor,
    };
  };

  // Get color scheme (light/dark)
  const getColorScheme = () => {
    return preferences?.theme === 'dark' 
      ? ColorSchemes.dark 
      : ColorSchemes.light;
  };

  // Tailwind-like utility classes
  const theme = {
    colors: getRoleTheme(),
    scheme: getColorScheme(),
    
    // Spacing utilities (like Tailwind)
    space: {
      0: 0,
      1: 4,   // space-1
      2: 8,   // space-2  
      3: 12,  // space-3
      4: 16,  // space-4
      5: 20,  // space-5
      6: 24,  // space-6
      8: 32,  // space-8
      10: 40, // space-10
      12: 48, // space-12
      16: 64, // space-16
      20: 80, // space-20
    },
    
    // Text utilities
    text: {
      xs: { fontSize: 12, lineHeight: 16 },
      sm: { fontSize: 14, lineHeight: 20 },
      base: { fontSize: 16, lineHeight: 24 },
      lg: { fontSize: 18, lineHeight: 28 },
      xl: { fontSize: 20, lineHeight: 28 },
      '2xl': { fontSize: 24, lineHeight: 32 },
      '3xl': { fontSize: 30, lineHeight: 36 },
      '4xl': { fontSize: 36, lineHeight: 40 },
    },
    
    // Font weights
    font: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Border radius utilities
    rounded: {
      none: 0,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
      '2xl': 16,
      '3xl': 24,
      full: 999,
    },
    
    // Shadow utilities
    shadow: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 5,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 8,
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
