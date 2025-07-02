import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';

const Card = ({
  children,
  onPress,
  style,
  shadow = 'md',
  padding = 'md',
  ...props
}) => {
  const theme = useTheme();

  const getPaddingStyle = () => {
    const paddingMap = {
      none: {},
      sm: theme.space.p2,
      md: theme.space.p4,
      lg: theme.space.p6,
      xl: theme.space.p8,
    };
    return paddingMap[padding] || theme.space.p4;
  };

  const cardStyle = {
    backgroundColor: theme.scheme.surface,
    ...theme.rounded.lg,
    ...theme.shadows[shadow],
    ...theme.space.mb4,
    ...getPaddingStyle(),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

export default Card;
