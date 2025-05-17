import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const { items, total, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600">{items.length} items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={`cart-item-${item.product.product_id}`} className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.product_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.product.product_id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.product_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-medium text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block w-full py-3 px-6 text-center text-white font-medium bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/"
              className="mt-4 block w-full py-3 px-6 text-center text-gray-600 font-medium bg-gray-50 rounded-full hover:bg-gray-100 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;