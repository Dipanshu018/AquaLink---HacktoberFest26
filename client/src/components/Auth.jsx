import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('customer');
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    defaultArea: '', // For customer
    phone: '', area: '', capacityLiters: '', priceINR: '', licenseNumber: '' // For supplier
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Save user session data to the browser
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('name', data.name);
          localStorage.setItem('id', data.id);
          setMessage('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setMessage(data.message || 'Registration successful! You can now log in.');
          setTimeout(() => setIsLogin(true), 2000);
        }
      } else {
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setMessage('Failed to connect to the server.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md mt-12">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${role === 'customer' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setRole('customer')}
          >
            Customer
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 rounded-md text-sm font-bold transition ${role === 'supplier' ? 'bg-blue-600 text-white shadow' : 'text-gray-500'}`}
            onClick={() => setRole('supplier')}
          >
            Supplier
          </button>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded text-sm font-semibold ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input required type="text" name="name" placeholder="Full Name / Business Name" onChange={handleChange} className="border p-2 rounded" />
          )}
          
          <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="border p-2 rounded" />
          <input required type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded" />

          {/* Extra Fields for Customer Signup */}
          {!isLogin && role === 'customer' && (
            <input type="text" name="defaultArea" placeholder="Your Area (e.g., Kolar Road)" onChange={handleChange} className="border p-2 rounded" />
          )}

          {/* Extra Fields for Supplier Signup */}
          {!isLogin && role === 'supplier' && (
            <>
              <input required type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-2 rounded" />
              <input required type="text" name="area" placeholder="Service Area" onChange={handleChange} className="border p-2 rounded" />
              <input required type="text" name="licenseNumber" placeholder="License Number" onChange={handleChange} className="border p-2 rounded" />
              
            </>
          )}

          <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-2">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}