import React from 'react';
import { View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { wp, hp, spacing, responsiveDimensions } from '../../utils/responsive';

const ResponsiveContainer = ({ 
  children, 
  style, 
  safeArea = true, 
  padding = 'md',
  backgroundColor = '#F2F1F8',
  statusBarStyle = 'dark-content',
  ...props 
}) => {
  const Container = safeArea ? SafeAreaView : View;
  
  const containerStyle = {
    flex: 1,
    backgroundColor,
    paddingHorizontal: typeof padding === 'string' ? spacing[padding] : padding,
    ...style,
  };

  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <Container style={containerStyle} {...props}>
        {children}
      </Container>
    </>
  );
};

export default ResponsiveContainer;