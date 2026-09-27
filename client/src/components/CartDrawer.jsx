import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({
  isOpen: propIsOpen,
  onClose: propOnClose,
  cartItems: propCartItems,
  onUpdateQuantity: propOnUpdateQuantity,
  onRemoveItem: propOnRemoveItem,
  onProceedToCheckout: propOnProceedToCheckout,
  appliedCoupon: propAppliedCoupon,
  setAppliedCoupon: propSetAppliedCoupon
}) {
  const cartContext = useCart();
  const { isAuthenticated } = useAuth();

  const isOpen = propIsOpen !== undefined ? propIsOpen : cartContext.isCartOpen;
  const onClose = propOnClose || cartContext.closeCart;
  const cartItems = propCartItems !== undefined ? propCartItems : cartContext.cart;
  const onUpdateQuantity = propOnUpdateQuantity || cartContext.updateQuantity;
  const onRemoveItem = propOnRemoveItem || cartContext.removeFromCart;
  const appliedCoupon = propAppliedCoupon !== undefined ? propAppliedCoupon : cartContext.appliedCoupon;
  const setAppliedCoupon = propSetAppliedCoupon || cartContext.setAppliedCoupon;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const isDiscounted = appliedCoupon === 'WAVE50' || !appliedCoupon;
  const discountAmount = isDiscounted ? Math.round(subtotal * 0.5) : 0;
  const finalTotal = subtotal - discountAmount;
  const totalItemsCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = (couponInput || '').trim().toUpperCase();
    if (code === 'WAVE50') {
      setAppliedCoupon('WAVE50');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Use WAVE50 for 50% off');
    }
  };

  const handleCheckoutClick = () => {
    if (propOnProceedToCheckout) {
      propOnProceedToCheckout();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider font-mono">
                Your Bag ({totalItemsCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              aria-label="Close Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-500 py-16">
                <ShoppingBag className="w-16 h-16 stroke-[1.2] text-zinc-700" />
                <div>
                  <p className="text-base font-bold text-zinc-300">Your bag is empty</p>
                  <p className="text-xs text-zinc-500 mt-1">Grab fresh streetwear drops from our collection</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.size || 'M'}`}
                  className="flex gap-4 p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-zinc-950 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
                    <img
                      src={(item.images && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id, item.size)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
                        <span className="bg-zinc-800 px-2 py-0.5 rounded text-white font-bold">
                          Size: {item.size || 'M'}
                        </span>
                        {item.fabricType && (
                          <span className="truncate max-w-[120px] text-zinc-500">
                            {item.fabricType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Qty & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                      <div className="flex items-center gap-2 border border-zinc-800 rounded-lg p-0.5 bg-zinc-950">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.size, (item.quantity || 1) - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.size, (item.quantity || 1) + 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950 space-y-3">
              
              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Promo Code (WAVE50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 uppercase tracking-wider font-mono focus:outline-none focus:border-amber-400"
                  />
                  {isDiscounted && (
                    <span className="absolute right-2.5 top-2 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" /> 50% OFF
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl uppercase transition font-mono"
                >
                  Apply
                </button>
              </form>
              {couponError && <p className="text-[10px] text-red-400">{couponError}</p>}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">₹{subtotal}</span>
                </div>
                {isDiscounted && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>First 10 Orders Launch Promo (WAVE50)</span>
                    <span className="font-mono">-₹{discountAmount} (50% OFF)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Hyderabad Express Delivery</span>
                  <span className="text-emerald-400 font-mono font-bold uppercase text-[10px]">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                  <span>Pay on Delivery:</span>
                  <span className="font-mono text-amber-400">₹{finalTotal}</span>
                </div>
              </div>

              {/* Standard E-Commerce Checkout Button */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-98 shadow-xl mt-2"
              >
                <span>{isAuthenticated ? 'Proceed to Checkout (Cash on Delivery)' : 'Sign In & Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-400" /> Fast Doorstep Delivery
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Pay When Package Arrives
                </span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
