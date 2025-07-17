import React, { useEffect } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  Easing,
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Animated Pressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  size = 'medium',
  entering = true,
  delay = 0,
  rippleColor,
  elevation = 2,
  fullWidth = false,
  animationDuration = 300,
  ...props
}) => {
  const theme = useTheme();
  
  // Animation values
  const scale = useSharedValue(entering ? 0.9 : 1);
  const opacity = useSharedValue(entering ? 0 : 1);
  const pressed = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0.3);
  
  // Determine colors based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary,
          text: '#FFFFFF',
          border: theme.colors.primary,
        };
      case 'secondary':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          border: theme.colors.primary,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: theme.colors.text,
          border: theme.colors.gray300,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          background: theme.colors.error,
          text: '#FFFFFF',
          border: theme.colors.error,
        };
      default:
        return {
          background: theme.colors.primary,
          text: '#FFFFFF',
          border: theme.colors.primary,
        };
    }
  };
  
  const variantColors = getVariantColors();
  
  // Determine size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
          iconSize: 22,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 18,
        };
    }
  };
  
  const sizeStyles = getSizeStyles();

  // Initial animation when component mounts
  useEffect(() => {
    if (entering) {
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: animationDuration });
        scale.value = withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.back(2)) });
      }, delay);
    }
  }, [entering, delay]);

  // Button container animation style
  const animatedButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = disabled
      ? 'rgba(0,0,0,0.1)'
      : variant !== 'outline' && variant !== 'ghost'
        ? variantColors.background
        : 'transparent';
    
    const borderColor = disabled 
      ? 'rgba(0,0,0,0.1)' 
      : variantColors.border;
    
    return {
      opacity: opacity.value,
      backgroundColor,
      borderColor,
      transform: [{ scale: withTiming(disabled ? 1 : scale.value * (1 - pressed.value * 0.05)) }],
      elevation: variant !== 'outline' && variant !== 'ghost' ? elevation * (1 - pressed.value * 0.5) : 0,
    };
  });

  // Text animation style
  const animatedTextStyle = useAnimatedStyle(() => {
    const color = disabled 
      ? 'rgba(0,0,0,0.4)' 
      : variantColors.text;
    
    return {
      color,
      transform: [{ scale: withTiming(1 - pressed.value * 0.03) }],
    };
  });

  // Ripple animation style
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: rippleOpacity.value,
      transform: [{ scale: rippleScale.value }],
    };
  });

  // Handle press in animation
  const handlePressIn = () => {
    if (!disabled) {
      pressed.value = withTiming(1, { duration: 150 });
      rippleOpacity.value = withTiming(0.2, { duration: 100 });
      rippleScale.value = withTiming(1, { duration: 400 });
    }
  };

  // Handle press out animation
  const handlePressOut = () => {
    if (!disabled) {
      pressed.value = withTiming(0, { duration: 150 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
      rippleScale.value = withTiming(1.5, { duration: 400 });
    }
  };

  // Handle tap animation and trigger onPress
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderWidth: variant === 'outline' || variant === 'secondary' ? 2 : 0,
          width: fullWidth ? '100%' : undefined,
        },
        animatedButtonStyle,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: rippleColor || (variant === 'primary' ? '#ffffff' : theme.colors.primary),
          },
          rippleAnimatedStyle,
        ]}
      />
      
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantColors.text}
            style={styles.loader}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Icon
                name={icon}
                size={sizeStyles.iconSize}
                color={disabled ? 'rgba(0,0,0,0.4)' : variantColors.text}
                style={styles.leftIcon}
              />
            )}
            
            <Animated.Text
              style={[
                styles.text,
                {
                  fontSize: sizeStyles.fontSize,
                  opacity: loading ? 0 : 1,
                },
                animatedTextStyle,
                textStyle,
              ]}
            >
              {title}
            </Animated.Text>
            
            {icon && iconPosition === 'right' && (
              <Icon
                name={icon}
                size={sizeStyles.iconSize}
                color={disabled ? 'rgba(0,0,0,0.4)' : variantColors.text}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  loader: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});

export default AnimatedButton;
