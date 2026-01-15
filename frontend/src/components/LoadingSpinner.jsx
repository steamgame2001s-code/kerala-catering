// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ fullPage = false, text = 'Loading...' }) => {
  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;