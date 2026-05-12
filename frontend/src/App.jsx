import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
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
        {location.pathname !== '/' && (
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pt-1">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all group"
            >
              <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all shadow-sm">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 group-hover:-translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}
        <AppRoutes />
      </main>
      {!isProfilePage && <Footer />}
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
