import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../store/authStore';

// Define TypeScript interfaces
interface UserData {
  fullName: string;
  email: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  state: string;
  phone: string;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const CustomerProfile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    email: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    state: '',
    phone: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        setError(null);
        
        // Fetch user data and orders in parallel
        const [userResponse, ordersResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${user.id}`),
          axios.get(`http://localhost:5000/api/users/${user.id}/orders`)
        ]);
        
        setUserData(userResponse.data);
        setOrders(ordersResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEditProfile = () => {
    // Implement edit functionality
    console.log('Edit profile clicked');
  };

  const handleViewOrderDetails = (orderId: number) => {
    // Implement order details view
    console.log('View order details for:', orderId);
  };

  const handleStartShopping = () => {
    // Implement navigation to shop
    console.log('Start shopping clicked');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>Warning: {error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleEditProfile}
            >
              Edit
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1">{userData.fullName || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1">{userData.phone || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Address</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <p className="mt-1">{userData.streetAddress || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <p className="mt-1">{userData.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <p className="mt-1">{userData.state || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <p className="mt-1">{userData.zipCode || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Order History</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse h-24"></div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Order #{order.id}</span>
                    <span className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      order.status === 'delivered' ? 'text-green-600' :
                      order.status === 'shipped' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      Status: {order.status}
                    </span>
                    <span className="font-medium">
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <button 
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => handleViewOrderDetails(order.id)}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No orders found</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleStartShopping}
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;