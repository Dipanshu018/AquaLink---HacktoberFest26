import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    capacityLiters: '',
    priceINR: '',
    licenseNumber: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Registration successful! Pending admin approval.');
        setTimeout(() => navigate('/'), 3000); // Redirect to home after 3 seconds
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to connect to the server.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register a Water Tanker</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
        <input required type="text" name="name" placeholder="Supplier / Business Name" onChange={handleChange} className="border p-2 rounded" />
        <input required type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="border p-2 rounded" />
        <input required type="text" name="area" placeholder="Service Area (e.g., Kolar Road)" onChange={handleChange} className="border p-2 rounded" />
        <input required type="text" name="licenseNumber" placeholder="Commercial License Number" onChange={handleChange} className="border p-2 rounded" />
        
        <div className="flex gap-4">
          <input required type="number" name="capacityLiters" placeholder="Capacity (Liters)" onChange={handleChange} className="border p-2 rounded w-1/2" />
          <input required type="number" name="priceINR" placeholder="Price (₹)" onChange={handleChange} className="border p-2 rounded w-1/2" />
        </div>
        
        <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-2">
          Submit Registration
        </button>
      </form>
    </div>
  );
}