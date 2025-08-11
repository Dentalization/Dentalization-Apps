import React from 'react';
import { Text } from 'react-native';
import { fontSizes, RFValue } from '../../utils/responsive';

const ResponsiveText = ({ 
  children, 
  style, 
  size = 'md',
  weight = 'normal',
  color = '#333333',
  align = 'left',
  ...props 
}) => {
  const getFontWeight = (weight) => {
    const weights = {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    };
    return weights[weight] || weight;
  };

  const textStyle = {
    fontSize: typeof size === 'string' ? fontSizes[size] : RFValue(size),
    fontWeight: getFontWeight(weight),
    color,
    textAlign: align,
    ...style,
  };

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

export default ResponsiveText;