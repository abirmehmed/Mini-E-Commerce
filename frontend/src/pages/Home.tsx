import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { Link, useSearchParams } from 'react-router-dom';

const Home = () => {
  const [searchParams] = useSearchParams();
  const addItem = useCartStore(state => state.addItem);

  const searchTerm = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const minRating = Number(searchParams.get('minRating')) || 0;
  const sortBy = searchParams.get('sortBy') as 'price-asc' | 'price-desc' | 'rating-desc' | null;

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products', searchTerm, categoryId, minRating, sortBy],
    queryFn: async () => {
      // Fetch products from the backend
      const response = await fetch(
        `http://localhost:5000/api/products?${new URLSearchParams({
          search: searchTerm,
          category: categoryId ? categoryId.toString() : '',
          minRating: minRating.toString(),
          sortBy: sortBy || '',
        })}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      let filteredProducts = await response.json();

      // Apply sorting on the frontend (if needed)
      if (sortBy) {
        filteredProducts.sort((a: Product, b: Product) => {  // 🚨 Explicitly typed!
          switch (sortBy) {
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'rating-desc':
              return b.rating - a.rating;
            default:
              return 0;
          }
        });
      }

      return filteredProducts;
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={`${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="text-lg font-semibold hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Stock: {product.stock}</p>
              <button
                className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => addItem(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;