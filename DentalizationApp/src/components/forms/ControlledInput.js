import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '../common/Input';

const ControlledInput = ({ 
  name, 
  rules = {}, 
  defaultValue = '',
  ...inputProps 
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
};

export default ControlledInput;
