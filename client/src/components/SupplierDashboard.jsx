import { useState, useEffect } from 'react';

export default function SupplierDashboard() {
  const supplierId = localStorage.getItem('id');
  const supplierName = localStorage.getItem('name');
  
  const [formData, setFormData] = useState({ capacityLiters: '', priceINR: '', area: '' });
  const [message, setMessage] = useState('');
  
  const [myTankers, setMyTankers] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // Fetch data when dashboard loads
  const fetchData = () => {
    fetch(`/api/tankers/supplier/${supplierId}`)
      .then(res => res.json())
      .then(data => setMyTankers(data))
      .catch(err => console.error(err));

    fetch(`/api/bookings/supplier/${supplierId}`)
      .then(res => res.json())
      .then(data => setMyOrders(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddTanker = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tankers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, supplierId, supplierName })
      });
      
      const data = await response.json(); // Read the exact response from backend
      
      if (response.ok) {
        setMessage('Tanker added successfully! Waiting for admin approval.');
        setFormData({ capacityLiters: '', priceINR: '', area: '' });
        fetchData(); // Refresh lists
      } else {
        // This will now print the exact database error on your screen!
        setMessage(`Failed to add tanker: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setMessage(`Server error: ${err.message}`);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`/api/bookings/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData(); // Refresh orders after update
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Supplier Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Tanker Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add a New Tanker</h3>
            
            {message && (
              <div className={`p-3 mb-4 rounded text-sm font-semibold ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleAddTanker} className="flex flex-col gap-4">
              <input required type="text" name="area" value={formData.area} placeholder="Service Area (e.g., Kolar)" onChange={handleChange} className="border p-2 rounded" />
              <input required type="number" name="capacityLiters" value={formData.capacityLiters} placeholder="Capacity (Liters)" onChange={handleChange} className="border p-2 rounded" />
              <input required type="number" name="priceINR" value={formData.priceINR} placeholder="Price (₹)" onChange={handleChange} className="border p-2 rounded" />
              <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-2">
                List Tanker
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Lists */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* My Tankers List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">My Listed Tankers</h3>
            {myTankers.length === 0 ? <p className="text-gray-500">No tankers added yet.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTankers.map(tanker => (
                  <div key={tanker._id} className="border p-4 rounded-lg bg-gray-50">
                    <p className="font-bold">{tanker.capacityLiters} Liters - ₹{tanker.priceINR}</p>
                    <p className="text-sm text-gray-600">📍 {tanker.area}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded mt-2 inline-block ${tanker.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {tanker.isVerified ? 'Verified Active' : 'Pending Approval'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Orders List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Customer Orders</h3>
            {myOrders.length === 0 ? <p className="text-gray-500">No orders yet.</p> : (
              <div className="flex flex-col gap-4">
                {myOrders.map(order => (
                  <div key={order._id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                    <div>
                      <p className="font-bold text-lg">{order.customerName}</p>
                      <p className="text-sm text-gray-600">📞 {order.customerPhone}</p>
                      <p className="text-sm text-gray-600">📍 {order.customerAddress}</p>
                      <p className="text-sm font-semibold text-blue-700 mt-1">{order.requestedCapacity}L for ₹{order.agreedPrice}</p>
                    </div>
                    
                    {/* Status Updater */}
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`border p-2 rounded font-bold outline-none cursor-pointer
                          ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
                        `}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <span className="text-xs text-gray-400">Order ID: {order._id.slice(-6)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}