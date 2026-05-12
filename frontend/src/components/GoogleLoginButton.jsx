import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleLoginButton = ({ role = 'customer' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      // response.credential is the id_token that the backend expects
      const success = await googleLogin(response.credential, role);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error('Google authentication failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    toast.error('Google login failed. Make sure your browser allows popups.');
  };

  return (
    <div className="w-full flex justify-center pt-2">
      <div className="w-full max-w-[400px]">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="outline"
          shape="pill"
          size="large"
          text="continue_with"
          width="100%"
        />
      </div>
    </div>
  );
};

export default GoogleLoginButton;
