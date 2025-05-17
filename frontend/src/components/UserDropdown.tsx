//component/UserDropdown.tsx
import React, { useState } from 'react';
import { useAuth } from '../store/authStore'; 
import { useNavigate } from 'react-router-dom';

const UserDropdown: React.FC = () => {
  const { user, signOut } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        aria-label="User menu"
      >
        <span className="font-medium">{user.fullName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
                navigate('/');
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;