import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import RegistrationWizard from './components/RegistrationWizard';
import SuccessPage from './components/SuccessPage';
import AdminDashboard from './components/AdminDashboard';

interface SuccessData {
  registrationId: string;
  fullName: string;
  trade: string;
  mobile: string;
  skillCategory: string;
}

function App() {
  const [page, setPage] = useState<string>('landing');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Hash-based routing to hide the recruiter panel under a secret URL
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      if (currentHash === '#/recruiter-admin') {
        setPage('admin');
      } else if (currentHash === '#/register') {
        setPage('register');
      } else if (currentHash === '#/success' && successData) {
        setPage('success');
      } else {
        setPage('landing');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [successData]);

  // Dynamic setPage that also manages the hash
  const navigateTo = (targetPage: string) => {
    if (targetPage === 'admin') {
      window.location.hash = '#/recruiter-admin';
    } else if (targetPage === 'register') {
      window.location.hash = '#/register';
    } else if (targetPage === 'landing') {
      window.location.hash = '';
    } else {
      setPage(targetPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900">
      <Navbar currentPage={page} setPage={navigateTo} />
      
      <main className="flex-grow flex flex-col items-center">
        {page === 'landing' && <LandingPage setPage={navigateTo} />}
        
        {page === 'register' && (
          <RegistrationWizard 
            setPage={navigateTo} 
            setSuccessData={setSuccessData} 
          />
        )}
        
        {page === 'success' && (
          <SuccessPage 
            successData={successData} 
            setPage={navigateTo} 
          />
        )}
        
        {page === 'admin' && <AdminDashboard />}
      </main>

      {/* Corporate Footer (hidden during print layouts) */}
      <footer className="print:hidden mt-auto bg-white text-gray-600 py-12 border-t border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-900 font-extrabold text-xl">
            <img 
              src="https://www.divineenterprisesgroup.in/images/icon.webp" 
              alt="Logo" 
              className="w-8 h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png';
              }}
            />
            <span className="tracking-tight leading-none uppercase text-gray-900">Divine Enterprises Group</span>
          </div>
          <p className="text-sm max-w-md mx-auto text-gray-500 font-medium">
            Providing high-quality bulk supplies, logistics cargo carriers, and skilled/unskilled manpower placement solutions.
          </p>
          <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            © {new Date().getFullYear()} Divine Enterprises Group. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
