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
      sm: { padding: theme.space[2] },
      md: { padding: theme.space[4] },
      lg: { padding: theme.space[6] },
      xl: { padding: theme.space[8] },
    };
    return paddingMap[padding] || { padding: theme.space[4] };
  };

  const cardStyle = {
    backgroundColor: theme.scheme.surface,
    borderRadius: theme.rounded.lg,
    ...theme.shadow[shadow],
    marginBottom: theme.space[4],
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
