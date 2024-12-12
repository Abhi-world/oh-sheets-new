import React from 'react';
import GoogleSheetsCredentialsForm from '@/components/GoogleSheetsCredentialsForm';

const ConnectSheets = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <GoogleSheetsCredentialsForm />
    </div>
  );
};

export default ConnectSheets;