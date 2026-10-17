import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function BookTanker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const supplier = location.state?.supplier;

  const [formData, setFormData] = useState({
    supplierId: id,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    requestedCapacity: supplier?.capacityLiters || '',
    agreedPrice: supplier?.priceINR || ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage('Booking confirmed! The supplier will contact you soon.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage('Failed to create booking.');
      }
    } catch (error) {
      setMessage('Server error.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Complete Your Booking</h2>
      {supplier && <p className="text-gray-600 mb-6">Booking from: <strong>{supplier.name}</strong></p>}
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('confirmed') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
        <input required type="text" name="customerName" placeholder="Your Full Name" onChange={handleChange} className="border p-2 rounded" />
        <input required type="text" name="customerPhone" placeholder="Your Phone Number" onChange={handleChange} className="border p-2 rounded" />
        <textarea required name="customerAddress" placeholder="Delivery Address" onChange={handleChange} className="border p-2 rounded h-24"></textarea>
        
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="text-sm text-gray-500">Capacity (Liters)</label>
            <input required type="number" name="requestedCapacity" value={formData.requestedCapacity} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div className="w-1/2">
            <label className="text-sm text-gray-500">Agreed Price (₹)</label>
            <input required type="number" name="agreedPrice" value={formData.agreedPrice} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
        </div>
        
        <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-2">
          Confirm Order
        </button>
      </form>
    </div>
  );
}