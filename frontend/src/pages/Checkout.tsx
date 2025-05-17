import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create customer record
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street_address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode
        })
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to create customer record');
      }

      const customer = await customerResponse.json();

      // 2. Create payment method (in real app, use payment processor like Stripe)
      const paymentResponse = await fetch('/api/customer_payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          payment_method: 'credit_card',
          last_four: formData.cardNumber.replace(/\s/g, '').slice(-4),
          card_type: getCardType(formData.cardNumber),
          expiry_date: formData.expiryDate
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      // 3. Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          total_amount: total,
          status: 'pending'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // 4. Create order items
      const orderItemsResponses = await Promise.all(
        items.map(item => 
          fetch('/api/order_items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: order.id,
              product_id: item.product.id,
              quantity: item.quantity,
              price: item.product.price
            })
          })
        )
      );

      const allItemsCreated = orderItemsResponses.every(r => r.ok);
      if (!allItemsCreated) {
        throw new Error('Failed to create some order items');
      }

      // Success - clear cart and redirect
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
      
    } catch (error) {
      console.error("Checkout failed:", error);
      setError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardType = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/')}
          className="text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div className="flex-1 h-px bg-gray-200" />
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-medium">Secure Checkout</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
                    setFormData({ ...formData, cardNumber: formatted });
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formData.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2);
                      }
                      setFormData({ ...formData, expiryDate: value });
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) =>
                      setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.product.id} className="py-4 flex items-center gap-4">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-4">
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

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-8 w-full py-4 px-6 text-white font-medium bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Complete Order
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By placing your order, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">
                  Terms & Conditions
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;