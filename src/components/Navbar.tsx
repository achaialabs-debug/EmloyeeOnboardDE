import { Home, UserPlus } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage }) => {
  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-50 px-6 py-4.5 flex items-center justify-between shadow-sm transition-all">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setPage('landing')} 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img 
            src="https://www.divineenterprisesgroup.in/images/icon.webp" 
            alt="Logo" 
            className="w-8 h-8 drop-shadow-sm"
            onError={(e) => {
              // Fallback if the domain image is not reachable
              (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png';
            }}
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 tracking-tight text-base leading-tight uppercase">
              Divine Enterprises Group
            </span>
            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">
              Employment Placement Registry
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPage('landing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              currentPage === 'landing' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button
            onClick={() => setPage('register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              currentPage === 'register' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Apply Now</span>
          </button>
        </div>
      </nav>
      {/* Spacer to push content below fixed header */}
      <div className="h-[74px]" />
    </>
  );
};

export default Navbar;
