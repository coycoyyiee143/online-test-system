import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="spinner-border text-primary mb-3" role="status" />
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default Loading;