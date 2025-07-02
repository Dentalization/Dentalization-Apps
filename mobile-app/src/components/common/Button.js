import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from './ThemeProvider';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: {
        paddingHorizontal: theme.space[4],
        paddingVertical: theme.space[2],
        minHeight: 36,
      },
      text: theme.text.sm,
      iconSize: 16,
    },
    md: {
      container: {
        paddingHorizontal: theme.space[6],
        paddingVertical: theme.space[4],
        minHeight: 48,
      },
      text: theme.text.base,
      iconSize: 20,
    },
    lg: {
      container: {
        paddingHorizontal: theme.space[8],
        paddingVertical: theme.space[6],
        minHeight: 56,
      },
      text: theme.text.lg,
      iconSize: 24,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: disabled 
        ? theme.colors.gray300 
        : theme.colors.roleColors?.primary || theme.colors.primary,
      textColor: theme.colors.white,
    },
    secondary: {
      backgroundColor: theme.scheme.surface,
      borderWidth: 1,
      borderColor: theme.colors.roleColors?.primary || theme.colors.primary,
      textColor: theme.colors.roleColors?.primary || theme.colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.roleColors?.primary || theme.colors.primary,
      textColor: theme.colors.roleColors?.primary || theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.roleColors?.primary || theme.colors.primary,
    },
    danger: {
      backgroundColor: disabled ? theme.colors.gray300 : theme.colors.error,
      textColor: theme.colors.white,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Button container styles
  const containerStyles = {
    ...currentSize.container,
    ...currentVariant,
    borderRadius: theme.rounded.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  // Text styles
  const textStyles = {
    ...currentSize.text,
    color: disabled ? theme.colors.gray500 : currentVariant.textColor,
    fontWeight: theme.font.semibold,
    textAlign: 'center',
    ...textStyle,
  };

  const spinnerColor = variant === 'primary' || variant === 'danger'
    ? theme.colors.white
    : theme.colors.roleColors?.primary || theme.colors.primary;

  // Get icon color based on variant
  const getIconColor = () => {
    if (disabled) return theme.colors.gray500;
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.white;
      case 'outline':
        return theme.colors.roleColors?.primary || theme.colors.primary;
      case 'ghost':
        return theme.colors.roleColors?.primary || theme.colors.primary;
      default:
        return theme.colors.white;
    }
  };

  const iconColor = getIconColor();

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Left Icon */}
          {(leftIcon || icon) && (
            <Icon
              name={leftIcon || icon}
              size={currentSize.iconSize}
              color={iconColor}
              style={{ marginRight: title ? theme.space[2] : 0 }}
            />
          )}
          
          {/* Title */}
          {title && <Text style={textStyles}>{title}</Text>}
          
          {/* Right Icon */}
          {rightIcon && (
            <Icon
              name={rightIcon}
              size={currentSize.iconSize}
              color={iconColor}
              style={{ marginLeft: title ? theme.space[2] : 0 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
