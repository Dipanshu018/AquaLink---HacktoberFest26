import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SupplierList() {
  const [tankers, setTankers] = useState([]);
  const [allAreas, setAllAreas] = useState([]); // Stores unique areas for the dropdown
  const [loading, setLoading] = useState(true);

  // Search Filters
  const [area, setArea] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // 1. Function to fetch filtered tankers
  const fetchTankers = () => {
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (area) queryParams.append('area', area);
    if (minCapacity) queryParams.append('minCapacity', minCapacity);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);

    fetch(`/api/tankers?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTankers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tankers:", err);
        setLoading(false);
      });
  };

  // 2. Run on initial page load
  useEffect(() => {
    // Load the tankers for the screen
    fetchTankers();

    // Load ALL verified areas purely for the dropdown menu
    fetch('/api/tankers')
      .then((res) => res.json())
      .then((data) => {
        // Extract unique areas and remove any empty ones
        const uniqueAreas = [...new Set(data.map(t => t.area))].filter(Boolean);
        setAllAreas(uniqueAreas);
      });
  }, []); // Empty array means this runs exactly once when the page loads

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTankers();
  };

  const handleClear = () => {
    setArea('');
    setMinCapacity('');
    setMaxPrice('');
    // Fetch all default data again
    fetch('/api/tankers')
      .then(res => res.json())
      .then(data => setTankers(data));
  };

// ... keep your existing return(...) statement exactly the same

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Find a Water Tanker</h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Area Selection Dropdown */}
          <div className="w-full md:w-1/3">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Location / Area</label>
            <select 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              className="border p-2 rounded w-full bg-gray-50 text-gray-700 cursor-pointer"
            >
              <option value="">All Areas</option>
              {allAreas.map((a, index) => (
                <option key={index} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Capacity Dropdown */}
          <div className="w-full md:w-1/4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Minimum Capacity</label>
            <select value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} className="border p-2 rounded w-full bg-gray-50 text-gray-700 cursor-pointer">
              <option value="">Any Size</option>
              <option value="500">500+ Liters</option>
              <option value="1000">1000+ Liters</option>
              <option value="2000">2000+ Liters</option>
              <option value="5000">5000+ Liters</option>
            </select>
          </div>

          {/* Price Dropdown */}
          <div className="w-full md:w-1/4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Maximum Price</label>
            <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border p-2 rounded w-full bg-gray-50 text-gray-700 cursor-pointer">
              <option value="">Any Price</option>
              <option value="400">Under ₹400</option>
              <option value="800">Under ₹800</option>
              <option value="1200">Under ₹1200</option>
              <option value="2000">Under ₹2000</option>
            </select>
          </div>

          <div className="w-full md:w-auto flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition w-full md:w-auto">
              Filter
            </button>
            <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition w-full md:w-auto">
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Tanker Results */}
      {loading ? (
        <div className="text-center p-8 text-gray-500 font-medium animate-pulse">Loading available tankers...</div>
      ) : tankers.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No tankers match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tankers.map((tanker) => (
            <div key={tanker._id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{tanker.supplierName}</h3>
                <p className="text-gray-600 mt-1">📍 {tanker.area}</p>
                <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex justify-between items-center">
                  <span className="font-bold">{tanker.capacityLiters} Liters</span>
                  <span className="font-black text-lg">₹{tanker.priceINR}</span>
                </div>
              </div>
              <Link 
                to={`/book/${tanker.supplierId}`} 
                state={{ supplier: tanker }}
                className="mt-5 block text-center w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}