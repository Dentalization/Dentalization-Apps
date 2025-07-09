import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  inputStyle: customInputStyle,
  containerStyle: customContainerStyle,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Rendered component styles
  const containerStyles = [
    { marginBottom: 16 }, // Default bottom margin
    customContainerStyle,
  ];

  const inputContainerStyles = [
    {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error
        ? theme.colors.error || '#EF4444'
        : isFocused
        ? theme.colors.primary
        : theme.colors.gray300 || '#E5E7EB',
      backgroundColor: disabled
        ? theme.colors.gray100 || '#F3F4F6'
        : theme.colors.white || '#FFFFFF', // Ensuring white background for all inputs
      borderRadius: 8,
      paddingHorizontal: 12,
      minHeight: 48,
    },
    style,
  ];

  const inputStyles = [
    {
      flex: 1,
      color: theme.colors.text || '#1F2937',
      fontSize: 16,
      paddingVertical: 12,
      ...(multiline && { textAlignVertical: 'top' }),
    },
    customInputStyle,
  ];

  const labelStyles = {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text || '#1F2937',
  };

  const leftIconStyles = {
    marginRight: 12,
  };

  const rightIconStyles = {
    marginLeft: 12,
    padding: 4,
  };

  const errorTextStyles = {
    fontSize: 12,
    marginTop: 4,
    color: theme.colors.error || '#EF4444',
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={labelStyles}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && typeof leftIcon === 'string' ? (
          <Icon
            name={leftIcon}
            size={20}
            color={theme.colors.textSecondary || '#6B7280'}
            style={leftIconStyles}
          />
        ) : leftIcon && (
          <View style={leftIconStyles}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputStyles}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary || '#9CA3AF'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textContentType={secureTextEntry ? 'none' : undefined} // Prevents autofill styling
          autoComplete={secureTextEntry ? 'off' : undefined} // Prevents autofill styling
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={rightIconStyles}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.textSecondary || '#6B7280'}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={rightIconStyles}
            onPress={onRightIconPress}
          >
            {typeof rightIcon === 'string' ? (
              <Icon
                name={rightIcon}
                size={20}
                color={theme.colors.textSecondary || '#6B7280'}
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={errorTextStyles}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
