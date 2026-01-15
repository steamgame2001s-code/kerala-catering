// frontend/src/components/DebugTest.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';

const DebugTest = () => {
  const [publicResult, setPublicResult] = useState('');
  const [adminResult, setAdminResult] = useState('');
  const [tokenInfo, setTokenInfo] = useState('');

  useEffect(() => {
    // Check what tokens are in localStorage
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    
    setTokenInfo(`
      adminToken: ${adminToken ? '✅ Found (' + adminToken.substring(0, 20) + '...)' : '❌ Not found'}
      userToken: ${userToken ? '✅ Found (' + userToken.substring(0, 20) + '...)' : '❌ Not found'}
    `);
  }, []);

  const testPublicFestivals = async () => {
    try {
      const response = await axiosInstance.get('/festivals');
      setPublicResult(`✅ Public festivals: ${response.data.festivals?.length || 0} found`);
    } catch (error) {
      setPublicResult(`❌ Error: ${error.message} - Status: ${error.response?.status}`);
    }
  };

  const testAdminFestivals = async () => {
    try {
      const response = await axiosInstance.get('/admin/festivals');
      setAdminResult(`✅ Admin festivals: ${response.data.festivals?.length || 0} found`);
    } catch (error) {
      setAdminResult(`❌ Error: ${error.message} - Status: ${error.response?.status} - ${error.response?.data?.error}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Debug Connection Test</h2>
      
      <div style={{ marginBottom: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        <h3>Token Info</h3>
        <pre>{tokenInfo}</pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testPublicFestivals} style={{ marginRight: '10px', padding: '10px' }}>
          Test Public Festivals
        </button>
        <button onClick={testAdminFestivals} style={{ padding: '10px' }}>
          Test Admin Festivals
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Public Route Result:</h3>
        <p>{publicResult}</p>
      </div>
      
      <div>
        <h3>Admin Route Result:</h3>
        <p>{adminResult}</p>
      </div>
    </div>
  );
};

export default DebugTest;