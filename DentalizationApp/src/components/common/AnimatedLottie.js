import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

// Create an animated LottieView component
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const AnimatedLottie = ({
  source,
  style,
  loop = true,
  autoPlay = true,
  speed = 1,
  entering = true,
  delay = 0,
  duration = 500,
  width,
  height,
  onAnimationFinish,
  resizeMode = 'contain',
  floating = false,
  floatingIntensity = 10,
  floatingDuration = 2000,
  pulsing = false,
  pulsingIntensity = 0.05,
  pulsingDuration = 2000,
}) => {
  const lottieRef = useRef(null);
  
  // Animation values
  const opacity = useSharedValue(entering ? 0 : 1);
  const scale = useSharedValue(entering ? 0.8 : 1);
  const translateY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  // Calculate dimensions
  const finalWidth = width || screenWidth * 0.8;
  const finalHeight = height || finalWidth;

  // Initial entrance animation
  useEffect(() => {
    if (entering) {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
      );
      scale.value = withDelay(
        delay,
        withTiming(1, { duration, easing: Easing.out(Easing.back(1.5)) })
      );
    }
  }, [entering, delay]);

  // Set up floating animation if enabled
  useEffect(() => {
    if (floating) {
      translateY.value = withDelay(
        delay, 
        withRepeat(
          withTiming(-floatingIntensity, { 
            duration: floatingDuration, 
            easing: Easing.inOut(Easing.sine) 
          }),
          -1, // infinite repeats
          true // reverse
        )
      );
    }
  }, [floating, floatingIntensity, delay]);

  // Set up pulse animation if enabled
  useEffect(() => {
    if (pulsing) {
      pulseScale.value = withDelay(
        delay,
        withRepeat(
          withTiming(1 + pulsingIntensity, { 
            duration: pulsingDuration / 2, 
            easing: Easing.inOut(Easing.sine) 
          }),
          -1, // infinite repeats
          true // reverse
        )
      );
    }
  }, [pulsing, pulsingIntensity, delay]);

  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value * pulseScale.value }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <AnimatedLottieView
        ref={lottieRef}
        source={source}
        style={[
          {
            width: finalWidth,
            height: finalHeight,
          }
        ]}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
        resizeMode={resizeMode}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedLottie;
