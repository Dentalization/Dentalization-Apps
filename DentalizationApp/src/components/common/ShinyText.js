import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ShinyText = ({ 
  text,
  children, 
  style = {}, 
  disabled = false, 
  speed = 5,
  className = '',
  baseColor = '#333333',
  ...props 
}) => {
  const duration = speed * 1000;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!disabled) {
      const startAnimation = () => {
        shimmerAnimation.setValue(0);
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }).start(() => {
          startAnimation();
        });
      };
      startAnimation();
    }
    return () => {
      shimmerAnimation.stopAnimation();
    };
  }, [disabled, duration]);

  const shimmerColors = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      [baseColor, baseColor, baseColor],
      [baseColor, '#ffffff', baseColor],
      [baseColor, baseColor, baseColor]
    ]
  });

  const displayText = text || children;

  if (disabled) {
    return (
      <Text style={[style, { color: baseColor }]} {...props}>
        {displayText}
      </Text>
    );
  }

  // Create animated text with shimmer effect using color interpolation
  const animatedTextStyle = {
    ...style,
    color: shimmerAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [baseColor, '#ffffff', '#ffffff', baseColor]
    })
  };

  return (
    <Animated.Text style={animatedTextStyle} {...props}>
      {displayText}
    </Animated.Text>
  );
};

export default ShinyText;