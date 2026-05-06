import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = "1096907124325-kh5fuf644i8pjcm3nfdck5k643l5g7g0.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <AppRoutes />
        </div>
      </main>
      <Footer />
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
