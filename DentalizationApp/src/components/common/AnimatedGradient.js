import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';

const { width } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const AnimatedGradient = ({
  style,
  children,
  colors,
  waveIntensity = 5,
  duration = 2000,
  direction = 'horizontal',
}) => {
  const theme = useTheme();
  
  // Use theme colors if no custom colors provided
  const gradientColors = colors || [
    `${theme.colors.primary}15`,
    `${theme.colors.primary}30`,
    `${theme.colors.primary}15`,
  ];
  
  // Animation values
  const animation = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  // Start animations
  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,  // Infinite repetitions
      true // Reverse when complete
    );
    
    rotationValue.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: duration * 1.2 }),
        withTiming(-0.1, { duration: duration * 1.2 }),
      ),
      -1,
      true
    );
  }, [duration]);

  // Create animated styles
  const animatedStyles = useAnimatedStyle(() => {
    const translateX = direction === 'horizontal' 
      ? interpolate(
          animation.value,
          [0, 1],
          [-width / waveIntensity, width / waveIntensity],
          Extrapolation.CLAMP
        )
      : 0;
    
    const translateY = direction === 'vertical'
      ? interpolate(
          animation.value,
          [0, 1],
          [-width / waveIntensity, width / waveIntensity],
          Extrapolation.CLAMP
        )
      : 0;
    
    const rotate = `${rotationValue.value}deg`;
    
    return {
      transform: [
        { translateX },
        { translateY },
        { rotate }
      ],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: direction === 'horizontal' ? 1 : 0, y: direction === 'vertical' ? 1 : 0 }}
        style={[styles.gradient, animatedStyles]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default AnimatedGradient;
