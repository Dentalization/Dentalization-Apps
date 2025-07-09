import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';

const AnimatedCard = ({
  children,
  style,
  onPress,
  entering = true,
  elevation = 2,
  animationDuration = 300,
  disabled = false,
  delayStart = 0,
}) => {
  const theme = useTheme();
  
  // Animation values
  const scale = useSharedValue(entering ? 0.95 : 1);
  const opacity = useSharedValue(entering ? 0 : 1);
  const translateY = useSharedValue(entering ? 20 : 0);
  const pressAnim = useSharedValue(1);

  // Initial entrance animation
  useEffect(() => {
    if (entering) {
      opacity.value = withDelay(
        delayStart,
        withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withDelay(
        delayStart,
        withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.back(2)) })
      );
      translateY.value = withDelay(
        delayStart,
        withTiming(0, { duration: animationDuration, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [entering, delayStart]);

  // Create animated styles
  const animatedStyles = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [0.95, 1, 1.05],
      [0.1, 0.15, 0.2],
      Extrapolation.CLAMP
    );
    
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: interpolate(
            pressAnim.value,
            [0.95, 1],
            [0.98, 1],
            Extrapolation.CLAMP
          ) * scale.value 
        }
      ],
      shadowOpacity,
      shadowRadius: elevation * 2,
      elevation: elevation * pressAnim.value,
    };
  });

  // Handle press animation
  const handlePressIn = () => {
    if (!disabled && onPress) {
      pressAnim.value = withTiming(0.95, { duration: 150, easing: Easing.inOut(Easing.quad) });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      pressAnim.value = withSequence(
        withTiming(1.02, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 100 })
      );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface || '#FFFFFF' },
          animatedStyles,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AnimatedCard;
