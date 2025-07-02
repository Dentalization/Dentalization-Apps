import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from './ThemeProvider';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  containerStyle,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const containerStyle = {
    ...theme.space.mb4,
    ...containerStyle,
  };

  const inputContainerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: error
      ? theme.colors.error
      : isFocused
      ? theme.colors.roleColors?.primary || theme.colors.primary
      : theme.colors.gray300,
    backgroundColor: disabled
      ? theme.colors.gray100
      : theme.scheme.surface,
    ...theme.rounded.lg,
    ...theme.space.px3,
    minHeight: 48,
    ...style,
  };

  const inputStyle = {
    flex: 1,
    color: theme.scheme.text,
    ...theme.text.body,
    ...theme.space.py3,
    ...(multiline && { textAlignVertical: 'top' }),
    ...inputStyle,
  };

  const labelStyle = {
    ...theme.text.sm,
    ...theme.font.semibold,
    ...theme.space.mb2,
    color: theme.scheme.text,
  };

  const leftIconStyle = {
    ...theme.space.mr3,
  };

  const rightIconStyle = {
    ...theme.space.ml3,
    ...theme.space.p1,
  };

  const errorTextStyle = {
    ...theme.text.xs,
    ...theme.space.mt1,
    color: theme.colors.error,
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyle}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={leftIconStyle}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={rightIconStyle}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.secondaryText}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={rightIconStyle}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={errorTextStyle}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
