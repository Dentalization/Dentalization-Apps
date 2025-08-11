import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { wp, hp, spacing, borderRadius, getResponsiveCardWidth } from '../../utils/responsive';

const ResponsiveCard = ({ 
  children, 
  style, 
  onPress,
  padding = 'lg',
  margin = 'sm',
  borderRadius: radius = 'lg',
  backgroundColor = '#FFFFFF',
  shadowColor = '#000000',
  shadowOpacity = 0.1,
  shadowRadius = 8,
  elevation = 4,
  width,
  ...props 
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  const cardStyle = {
    backgroundColor,
    borderRadius: typeof radius === 'string' ? borderRadius[radius] : radius,
    padding: typeof padding === 'string' ? spacing[padding] : padding,
    margin: typeof margin === 'string' ? spacing[margin] : margin,
    width: width || getResponsiveCardWidth(),
    shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity,
    shadowRadius,
    elevation,
    ...style,
  };

  return (
    <Container style={cardStyle} onPress={onPress} {...props}>
      {children}
    </Container>
  );
};

export default ResponsiveCard;