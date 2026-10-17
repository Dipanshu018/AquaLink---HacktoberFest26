import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center max-w-6xl">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tight flex items-center gap-2 hover:scale-105 transition-transform duration-200">
          <span className="text-3xl drop-shadow-md">💧</span> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">AquaLink</span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {userName ? (
            <div className="flex items-center gap-3">
              {role === 'supplier' && (
                <Link 
                  to="/dashboard" 
                  className="bg-blue-800/30 hover:bg-blue-800/60 border border-blue-400/30 px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              )}
              
              {/* Profile & Logout Pill */}
              <div className="flex items-center bg-white/10 border border-white/20 rounded-full px-2 py-1.5 backdrop-blur-sm shadow-inner">
                <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-sm mr-2 shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm pr-3 border-r border-white/30 hidden md:block">
                  {userName} {role === 'supplier' && <span className="text-blue-200 text-xs ml-1">(Supplier)</span>}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-bold text-red-100 hover:text-white pl-3 pr-2 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}