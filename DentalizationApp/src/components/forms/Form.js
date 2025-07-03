import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const Form = ({ 
  children, 
  onSubmit, 
  validationSchema, 
  defaultValues = {},
  mode = 'onChange' 
}) => {
  const methods = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues,
    mode,
  });

  const handleSubmit = (data) => {
    onSubmit(data, methods);
  };

  return (
    <FormProvider {...methods}>
      {typeof children === 'function' 
        ? children(methods) 
        : children
      }
    </FormProvider>
  );
};

export default Form;
