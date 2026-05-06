import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ role = 'customer' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    const success = await googleLogin(response.credential, role);
    if (success) {
      navigate('/');
    }
  };

  const handleError = () => {
    console.error('Google Login Error');
  };

  return (
    <div className="w-full flex justify-center py-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_black"
        shape="pill"
        text="continue_with"
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;
