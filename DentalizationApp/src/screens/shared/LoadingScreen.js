import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../components/common/ThemeProvider';

const LoadingScreen = ({ message = 'Loading...' }) => {
  const theme = useTheme();

  const containerStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.scheme.background,
  };

  const contentStyle = {
    alignItems: 'center',
  };

  const loaderStyle = {
    ...theme.space.mb4,
  };

  const messageStyle = {
    ...theme.text.base,
    textAlign: 'center',
    color: theme.scheme.text,
  };

  return (
    <View style={containerStyle}>
      <StatusBar
        barStyle={theme.scheme === theme.colors.light ? 'dark-content' : 'light-content'}
        backgroundColor={theme.scheme.background}
      />
      
      <View style={contentStyle}>
        <ActivityIndicator
          size="large"
          color={theme.colors.roleColors?.primary || theme.colors.primary}
          style={loaderStyle}
        />
        
        <Text style={messageStyle}>
          {message}
        </Text>
      </View>
    </View>
  );
};

export default LoadingScreen;
