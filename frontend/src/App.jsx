import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { isDarkMode } = useTheme();
  const clientId = "1096907124325-kh5fuf644i8pjcm3nfdck5k643l5g7g0.apps.googleusercontent.com";

  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile') || location.pathname.startsWith('/vendor');

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <Toaster 
          position="top-right" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              color: isDarkMode ? '#fff' : '#0f172a',
              backdropFilter: 'blur(12px)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              padding: '16px 24px',
              borderRadius: '24px',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
            },
          }}
        />
      <Navbar />
      <main className="flex-grow">
        <AppRoutes />
      </main>
      {!isProfilePage && <Footer />}
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
