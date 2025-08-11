import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Scale functions
export const widthPercentageToDP = (widthPercent) => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

export const heightPercentageToDP = (heightPercent) => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

// Responsive width and height
export const wp = widthPercentageToDP;
export const hp = heightPercentageToDP;

// Font scaling
export const responsiveFontSize = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.max(12, PixelRatio.roundToNearestPixel(newSize));
};

export const RFPercentage = (percent) => {
  const heightPercent = (percent * SCREEN_HEIGHT) / 100;
  return PixelRatio.roundToNearestPixel(heightPercent);
};

// Responsive font size with min/max constraints
export const RFValue = (fontSize, standardScreenHeight = 812) => {
  const heightPercent = (fontSize * SCREEN_HEIGHT) / standardScreenHeight;
  return PixelRatio.roundToNearestPixel(heightPercent);
};

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  } else {
    return (
      pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
    );
  }
};

export const isSmallDevice = () => SCREEN_WIDTH < 375;
export const isMediumDevice = () => SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = () => SCREEN_WIDTH >= 414;

// Responsive spacing
export const spacing = {
  xs: wp(1),
  sm: wp(2),
  md: wp(4),
  lg: wp(6),
  xl: wp(8),
  xxl: wp(12),
};

// Responsive border radius
export const borderRadius = {
  xs: wp(1),
  sm: wp(2),
  md: wp(3),
  lg: wp(4),
  xl: wp(6),
  xxl: wp(8),
};

// Responsive icon sizes
export const iconSizes = {
  xs: RFValue(12),
  sm: RFValue(16),
  md: RFValue(20),
  lg: RFValue(24),
  xl: RFValue(28),
  xxl: RFValue(32),
};

// Responsive font sizes
export const fontSizes = {
  xs: RFValue(10),
  sm: RFValue(12),
  md: RFValue(14),
  lg: RFValue(16),
  xl: RFValue(18),
  xxl: RFValue(20),
  title: RFValue(24),
  heading: RFValue(28),
  display: RFValue(32),
};

// Layout helpers
export const getResponsiveCardWidth = () => {
  if (isTablet()) return wp(45);
  if (isLargeDevice()) return wp(85);
  return wp(90);
};

export const getResponsiveColumns = () => {
  if (isTablet()) return 3;
  if (isLargeDevice()) return 2;
  return 1;
};

// Responsive dimensions object
export const responsiveDimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isTablet: isTablet(),
  isSmallDevice: isSmallDevice(),
  isMediumDevice: isMediumDevice(),
  isLargeDevice: isLargeDevice(),
};

export default {
  wp,
  hp,
  RFValue,
  RFPercentage,
  responsiveFontSize,
  spacing,
  borderRadius,
  iconSizes,
  fontSizes,
  isTablet,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  getResponsiveCardWidth,
  getResponsiveColumns,
  responsiveDimensions,
};