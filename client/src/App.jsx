import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import SupplierList from './components/SupplierList';
import BookTanker from './components/BookTanker';
import Auth from './components/Auth';
import SupplierDashboard from './components/SupplierDashboard';

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center max-w-5xl">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          💧 AquaLink
        </Link>
        <div className="flex gap-4 items-center">
          {userName ? (
            <>
              <span className="font-semibold border-r border-blue-400 pr-4">
                Hello, {userName} {role === 'supplier' && '(Supplier)'}
              </span>
              {role === 'supplier' && (
                <Link to="/dashboard" className="text-blue-100 hover:text-white font-semibold mr-4">
                  My Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="text-blue-100 hover:text-white font-semibold">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<SupplierList />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/book/:id" element={<BookTanker />} />
          <Route path="/dashboard" element={<SupplierDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}