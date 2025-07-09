import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';

const AnimatedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  editable = true,
  entering = true,
  delayStart = 0,
  animationDuration = 300,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const inputRef = useRef(null);
  
  // Animation values
  const focusAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(entering ? 0.95 : 1);
  const opacityAnim = useSharedValue(entering ? 0 : 1);
  const translateYAnim = useSharedValue(entering ? 10 : 0);
  
  // Label animation values
  const labelScale = useSharedValue(!!value ? 0.85 : 1);
  const labelY = useSharedValue(!!value ? -22 : 0);

  // Handle entering animation
  useEffect(() => {
    if (entering) {
      setTimeout(() => {
        scaleAnim.value = withTiming(1, { duration: animationDuration, easing: Easing.out(Easing.back(2)) });
        opacityAnim.value = withTiming(1, { duration: animationDuration });
        translateYAnim.value = withTiming(0, { duration: animationDuration });
      }, delayStart);
    }
  }, [entering, delayStart]);

  // Handle focus state change
  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  // Handle label animation based on focus or value
  useEffect(() => {
    if (isFocused || value) {
      labelScale.value = withTiming(0.85, { duration: 200 });
      labelY.value = withTiming(-22, { duration: 200 });
    } else {
      labelScale.value = withTiming(1, { duration: 200 });
      labelY.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused, value]);

  // Create animated styles for the container
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
      transform: [
        { scale: scaleAnim.value },
        { translateY: translateYAnim.value }
      ],
    };
  });
  
  // Create animated styles for the input container
  const inputContainerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? theme.colors.error
      : interpolateColor(
          focusAnim.value,
          [0, 1],
          [theme.colors.gray300 || '#E5E7EB', theme.colors.primary]
        );
        
    const backgroundColor = editable
      ? theme.colors.surface || '#FFFFFF'
      : theme.colors.gray100 || '#F3F4F6';
        
    return {
      borderColor,
      backgroundColor,
      transform: [
        { scale: interpolate(
            focusAnim.value,
            [0, 1],
            [1, 1.01],
            Extrapolation.CLAMP
          )
        }
      ],
      shadowOpacity: interpolate(
        focusAnim.value,
        [0, 1],
        [0, 0.1],
        Extrapolation.CLAMP
      ),
    };
  });
  
  // Create animated styles for the label
  const labelAnimatedStyle = useAnimatedStyle(() => {
    const labelColor = error
      ? theme.colors.error
      : interpolateColor(
          focusAnim.value,
          [0, 1],
          [theme.colors.textSecondary || '#9CA3AF', theme.colors.primary]
        );
        
    return {
      transform: [
        { scale: labelScale.value },
        { translateY: labelY.value }
      ],
      color: labelColor,
    };
  });

  // Handle the secure text entry toggle
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  // Handle container press
  const handleContainerPress = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      <Pressable onPress={handleContainerPress}>
        <Animated.View style={[styles.inputContainer, inputContainerAnimatedStyle]}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={20}
              color={error 
                ? theme.colors.error 
                : isFocused 
                  ? theme.colors.primary 
                  : theme.colors.textSecondary || '#9CA3AF'}
              style={styles.leftIcon}
            />
          )}

          <View style={styles.inputWrapper}>
            {label && (
              <Animated.Text style={[styles.label, labelAnimatedStyle]}>
                {label}
              </Animated.Text>
            )}

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: theme.colors.text || '#1F2937',
                  height: multiline ? numberOfLines * 20 : undefined,
                },
              ]}
              placeholder={isFocused ? placeholder : ''}
              placeholderTextColor={theme.colors.textSecondary || '#9CA3AF'}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={multiline ? numberOfLines : undefined}
              editable={editable}
              onFocus={handleFocus}
              onBlur={handleBlur}
              textAlignVertical={multiline ? 'top' : 'center'}
              {...props}
            />
          </View>

          {secureTextEntry && (
            <Pressable onPress={togglePasswordVisibility} style={styles.rightIcon}>
              <Icon
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={20}
                color={theme.colors.textSecondary || '#9CA3AF'}
              />
            </Pressable>
          )}
          
          {rightIcon && !secureTextEntry && (
            <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
              {typeof rightIcon === 'string' ? (
                <Icon
                  name={rightIcon}
                  size={20}
                  color={theme.colors.textSecondary || '#9CA3AF'}
                />
              ) : (
                rightIcon
              )}
            </Pressable>
          )}
        </Animated.View>
      </Pressable>

      {error && (
        <Animated.Text
          entering={Animated.FadeIn.duration(200)}
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '500',
    left: 0,
    top: 16,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AnimatedInput;
