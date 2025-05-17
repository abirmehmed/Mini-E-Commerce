import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Search, Filter, SortAsc, SortDesc, Star, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { Category } from '../types';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../store/authStore';

const Navbar = () => {
  const navigate = useNavigate();
  const cartItems = useCartStore(state => state.items);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // State for search filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('category') ? Number(searchParams.get('category')) : null
  );
  const [minRating, setMinRating] = useState(Number(searchParams.get('minRating')) || 0);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating-desc' | null>(
    searchParams.get('sortBy') as any || null
  );

  // Fetch categories with proper typing
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    isError: categoriesError,
    error: categoriesErrorData 
  } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', String(selectedCategory));
    if (minRating > 0) params.set('minRating', String(minRating));
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params);
  };

  const handleSortChange = (sortType: 'price-asc' | 'price-desc' | 'rating-desc') => {
    setSortBy(sortType);
    updateFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setMinRating(0);
    setSortBy(null);
    setSearchParams(new URLSearchParams());
  };

  // Loading and error states
  if (categoriesLoading || authLoading) {
    return (
      <div className="h-16 bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="h-16 bg-white flex items-center justify-center text-red-500">
        Error: {categoriesErrorData?.message || 'Failed to load categories'}
      </div>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left side - Logo */}
            <Link to="/" className="flex items-center space-x-2 min-w-32">
              <Home className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-semibold text-gray-800">Mini Shop</span>
            </Link>

            {/* Middle - Search and Filters */}
            <div className="flex-1 flex items-center gap-4 max-w-3xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                />
                <button
                  onClick={updateFilters}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Updated Categories Dropdown */}
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? Number(e.target.value) : null);
                  updateFilters();
                }}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                disabled={!categories?.length}
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={`cat-${category.category_id}`} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Right side - Cart and User */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <div className="ml-2">
                {user ? (
                  <UserDropdown />
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white py-3 px-6 border-t">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Rating Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Min Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`star-${star}`}
                        onClick={() => {
                          setMinRating(star);
                          updateFilters();
                        }}
                        className={`p-1 ${minRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                        aria-label={`${star} star rating`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort By:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSortChange('price-asc')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg ${sortBy === 'price-asc' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                    >
                      <SortAsc className="w-4 h-4" />
                      <span>Lowest</span>
                    </button>
                    <button
                      onClick={() => handleSortChange('price-desc')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg ${sortBy === 'price-desc' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                    >
                      <SortDesc className="w-4 h-4" />
                      <span>Highest</span>
                    </button>
                    <button
                      onClick={() => handleSortChange('rating-desc')}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg ${sortBy === 'rating-desc' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      <span>Top Rated</span>
                    </button>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;