import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
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

  // Helper function to wrap text children in Text components if needed
  const wrapTextChildren = (children) => {
    if (typeof children === 'string' || typeof children === 'number') {
      // If the child is a string or number, wrap it in a Text component
      return <Text>{children}</Text>;
    } else if (Array.isArray(children)) {
      // If it's an array, map over each child and wrap text children
      return React.Children.map(children, child => {
        if (typeof child === 'string' || typeof child === 'number') {
          return <Text>{child}</Text>;
        }
        return child;
      });
    }
    // For React elements or null/undefined, return as is
    return children;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {wrapTextChildren(children)}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {wrapTextChildren(children)}
    </View>
  );
};

export default Card;
