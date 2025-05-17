import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';

const ProductDetails = () => {
  const { id } = useParams();
  const addItem = useCartStore(state => state.addItem);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      // Fetch product details from the backend
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-96 w-full object-cover md:w-96"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-gray-600">{product.rating}</span>
            </div>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <div className="mt-8">
              <span className="text-4xl font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
              <p className="mt-2 text-sm text-gray-500">
                Stock: {product.stock} units
              </p>
            </div>
            <button
              onClick={() => addItem(product)}
              className="mt-8 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;