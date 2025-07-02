import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from './ThemeProvider';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
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
    },
    md: {
      container: {
        paddingHorizontal: theme.space[6],
        paddingVertical: theme.space[4],
        minHeight: 48,
      },
      text: theme.text.base,
    },
    lg: {
      container: {
        paddingHorizontal: theme.space[8],
        paddingVertical: theme.space[6],
        minHeight: 56,
      },
      text: theme.text.lg,
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
        }}>
          {icon && (
            <View style={{ marginRight: theme.space[2] }}>
              {icon}
            </View>
          )}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
