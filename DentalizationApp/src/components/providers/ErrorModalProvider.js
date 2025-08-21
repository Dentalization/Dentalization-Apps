import React, { useState, useImperativeHandle, forwardRef } from 'react';
import ErrorModal from '../modals/ErrorModal';

const ErrorModalProvider = forwardRef((props, ref) => {
  const [modalState, setModalState] = useState({
    visible: false,
    errorType: 'general',
    title: '',
    message: '',
    subMessage: '',
    showRetry: false,
    onRetry: null,
    onClose: null
  });

  useImperativeHandle(ref, () => ({
    showError: ({
      errorType = 'general',
      title,
      message,
      subMessage,
      showRetry = false,
      onRetry,
      onClose
    }) => {
      setModalState({
        visible: true,
        errorType,
        title,
        message,
        subMessage,
        showRetry,
        onRetry,
        onClose
      });
    },
    hideError: () => {
      setModalState(prev => ({ ...prev, visible: false }));
    }
  }));

  const handleClose = () => {
    setModalState(prev => ({ ...prev, visible: false }));
    if (modalState.onClose) {
      modalState.onClose();
    }
  };

  const handleRetry = () => {
    if (modalState.onRetry) {
      modalState.onRetry();
    }
    // Don't automatically close modal on retry - let the retry handler decide
  };

  return (
    <ErrorModal
      visible={modalState.visible}
      errorType={modalState.errorType}
      title={modalState.title}
      message={modalState.message}
      subMessage={modalState.subMessage}
      showRetry={modalState.showRetry}
      onRetry={modalState.showRetry ? handleRetry : undefined}
      onClose={handleClose}
    />
  );
});

ErrorModalProvider.displayName = 'ErrorModalProvider';

export default ErrorModalProvider;