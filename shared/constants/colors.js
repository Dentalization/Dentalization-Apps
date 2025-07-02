// Dentalization Color Palette & Style Guide
// Based on design system defined in color.md

export const Colors = {
  // Primary Color
  primary: '#483AA0',
  primaryRgb: '72, 58, 160',

  // Accent Color
  accent: '#A08A48',
  accentRgb: '160, 138, 72',

  // Tertiary Colors
  lightViolet: '#6854C0',
  softBlue: '#4848C0',

  // Neutral Shades
  background: '#F2F1F8',
  secondaryText: '#6E6E6E',
  primaryText: '#333333',

  // Functional Colors
  success: '#4CAF50',
  warning: '#FFB300',
  error: '#E53935',
  info: '#2196F3',

  // Role-specific themes (mentioned in roadmap)
  patient: {
    primary: '#2196F3', // Blue theme for patients
    secondary: '#E3F2FD',
    accent: '#1976D2',
  },
  doctor: {
    primary: '#4CAF50', // Green theme for doctors
    secondary: '#E8F5E8',
    accent: '#388E3C',
  },

  // Common UI colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
};

export const ColorSchemes = {
  light: {
    background: Colors.background,
    surface: Colors.white,
    primary: Colors.primary,
    text: Colors.primaryText,
    textSecondary: Colors.secondaryText,
    border: Colors.gray300,
  },
  dark: {
    background: Colors.gray900,
    surface: Colors.gray800,
    primary: Colors.primary,
    text: Colors.white,
    textSecondary: Colors.gray300,
    border: Colors.gray600,
  },
};

export default Colors;
