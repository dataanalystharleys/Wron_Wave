import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, Truck, ShieldCheck, MapPin, 
  Phone, User, Home, Briefcase, AlertCircle, 
  Check, Printer, ArrowRight, ShoppingBag, Sparkles, MessageCircle
} from 'lucide-react';
import { BRAND_INFO } from '../data/mockProducts';
import { saveOrderToDatabase } from '../services/cloudDb';
import { checkDeliverability, getDeliveryConfig } from '../data/deliveryZones';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onOrderSuccess
}) {
  const { user } = useAuth();
  const { clearCart, cart: contextCart } = useCart();
  const effectiveCart = (cartItems && cartItems.length > 0) ? cartItems : contextCart;

  // Structured Address State (Standard Indian E-Commerce Format)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    altPhone: '',
    flatBuilding: '',
    streetArea: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    addressType: 'Home',
    paymentMethod: 'Cash on Delivery (COD)'
  });

  // Pre-fill user profile if authenticated
  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || (user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '')
      }));
    }
  }, [user, isOpen]);

  const [deliveryStatus, setDeliveryStatus] = useState({
    isDeliverable: true,
    message: '✓ Verified Deliverable! Hyderabad Doorstep Delivery available.',
    estimatedDays: '1-2 Days'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [formError, setFormError] = useState('');

  // Validate deliverability whenever City or Pincode changes
  useEffect(() => {
    if (formData.pincode || formData.city) {
      const result = checkDeliverability({
        city: formData.city,
        pincode: formData.pincode
      });
      setDeliveryStatus(result);
    }
  }, [formData.city, formData.pincode]);

  if (!isOpen) return null;

  // Price Calculations
  const subtotal = effectiveCart.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const isDiscounted = appliedCoupon === 'WAVE50' || !appliedCoupon;
  const discountAmount = isDiscounted ? Math.round(subtotal * 0.5) : 0;
  const finalTotal = subtotal - discountAmount;
  const deliveryFee = 0; // Free delivery

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handlePincodeChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: rawVal }));
    setFormError('');
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: rawVal }));
    setFormError('');
  };

  // Form submission & Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.fullName.trim()) {
      setFormError('Please enter recipient full name');
      return;
    }
    if (formData.phone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!formData.flatBuilding.trim()) {
      setFormError('Please enter Flat / House No. / Building Name');
      return;
    }
    if (!formData.streetArea.trim()) {
      setFormError('Please enter Street / Area / Landmark');
      return;
    }
    if (formData.pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Pincode');
      return;
    }

    // 2. Deliverability Guard
    if (!deliveryStatus.isDeliverable) {
      setFormError('Sorry, this location is currently outside our delivery coverage. Please check deliverable cities.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const formattedAddress = `${formData.flatBuilding}, ${formData.streetArea}${formData.landmark ? `, Landmark: ${formData.landmark}` : ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    const orderPayload = {
      id: `WW-ORD-${Date.now().toString().slice(-4)}`,
      user_id: user?.id || 'guest',
      userId: user?.id || 'guest',
      customer: {
        name: formData.fullName,
        email: user?.email || '',
        phone: `+91 ${formData.phone}`,
        altPhone: formData.altPhone ? `+91 ${formData.altPhone}` : null,
        address: formattedAddress,
        flatBuilding: formData.flatBuilding,
        streetArea: formData.streetArea,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        addressType: formData.addressType
      },
      items: effectiveCart.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size || 'M',
        price: Number(item.price) || 0,
        quantity: item.quantity || 1,
        fabricType: item.fabricType || '240 GSM Heavy Cotton',
        image: (item.images && item.images[0]) || item.image
      })),
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total: finalTotal,
      coupon: appliedCoupon || 'WAVE50',
      paymentMethod: 'Cash on Delivery (COD)',
      estimatedDelivery: 'Within 1-2 Days (Hyderabad Doorstep Delivery)',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      // Save order to LocalStorage, Supabase Cloud Database, and Google Sheets
      await saveOrderToDatabase(orderPayload);
      
      // Also notify backend API server if running
      try {
        await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
      } catch {
        // server optional
      }

      setCompletedOrder(orderPayload);
      clearCart();
      if (onOrderSuccess) {
        onOrderSuccess(orderPayload);
      }
    } catch (err) {
      console.warn('Order save error:', err);
      setCompletedOrder(orderPayload);
      clearCart();
      if (onOrderSuccess) {
        onOrderSuccess(orderPayload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print / Save Order Invoice
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                {completedOrder ? 'Order Confirmation' : 'Doorstep Checkout'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                {completedOrder ? 'Thank you for your order!' : 'Secure Cash on Delivery • Hyderabad Fast Shipping'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedOrder ? (
          /* ================= ORDER PLACED SCREEN ================= */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            {/* Success Badge */}
            <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-2xl animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                ✓ Order Placed Successfully!
              </span>
              <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-mono">
                {completedOrder.id}
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto pt-1 leading-relaxed">
                Thank you, <strong className="text-white">{completedOrder.customer.name}</strong>! Your streetwear drop has been booked. You will pay <strong className="text-amber-400">₹{completedOrder.total}</strong> in cash or UPI upon delivery.
              </p>
            </div>

            {/* Delivery Timeline Card */}
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Estimated Delivery
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Within 24–48 Hours
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-zinc-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Deliver to:</span>
                </p>
                <p className="text-zinc-400 pl-5 leading-relaxed">
                  {completedOrder.customer.address}
                </p>
                <p className="text-zinc-400 pl-5">
                  Contact Phone: <span className="text-zinc-200 font-mono">{completedOrder.customer.phone}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Payment Mode:</span>
                <span className="font-bold text-emerald-400 uppercase font-mono">
                  Cash on Delivery (₹{completedOrder.total})
                </span>
              </div>
            </div>

            {/* Items Summary in Receipt */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-left space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Items In This Drop ({completedOrder.items.length})
              </p>
              <div className="divide-y divide-zinc-800/60 max-h-40 overflow-y-auto pr-1">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-9 h-10 object-cover rounded-md border border-zinc-800" />
                      )}
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">Size: {item.size} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white whitespace-nowrap">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Confirmation Badge */}
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-left flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">Order Recorded:</strong> Our Hyderabad delivery rider will call your phone (<span className="text-white font-mono">{completedOrder.customer.phone}</span>) prior to arriving with your package.
              </p>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4 text-zinc-400" />
                <span>Print Order Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* ================= STANDARD E-COMMERCE CHECKOUT FORM ================= */
          <form onSubmit={handlePlaceOrder} className="p-5 sm:p-6 space-y-5">
            
            {/* Deliverability Badge Banner */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              deliveryStatus.isDeliverable 
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-red-950/40 border-red-800/80 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0" />
                <span className="font-medium">{deliveryStatus.message}</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10 shrink-0">
                {deliveryStatus.estimatedDays}
              </span>
            </div>

            {/* Form Error Alert */}
            {formError && (
              <div className="p-3 bg-red-950/70 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Recipient Information */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Contact & Customer Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Varma"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="9848012345"
                      maxLength={10}
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Structured Delivery Address */}
            <div className="space-y-3 pt-2 border-t border-zinc-850">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Delivery Address</span>
              </h4>

              <div className="space-y-3">
                {/* Flat / Building */}
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                    Flat, House No., Building, Apartment *
                  </label>
                  <input
                    type="text"
                    name="flatBuilding"
                    value={formData.flatBuilding}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 402, Signature Towers"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>

                {/* Street / Area / Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                      Street, Sector, Area *
                    </label>
                    <input
                      type="text"
                      name="streetArea"
                      value={formData.streetArea}
                      onChange={handleInputChange}
                      placeholder="e.g. Road No 36, Jubilee Hills"
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Near Metro Station / D-Mart"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                    >
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Secunderabad">Secunderabad</option>
                      <option value="Cyberabad">Cyberabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-1 font-semibold">
                      Pincode (6 Digits) *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      placeholder="500081"
                      maxLength={6}
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {/* Address Type Selector */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                    Address Type:
                  </span>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, addressType: type }))}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          formData.addressType === type
                            ? 'bg-white text-black'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Payment Option (Cash on Delivery) */}
            <div className="space-y-3 pt-2 border-t border-zinc-850">
              <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Payment Method</span>
              </h4>

              <div className="p-3.5 bg-zinc-900/90 border-2 border-amber-500/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-amber-400 bg-black flex items-center justify-center"></div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Pay in cash or scan delivery rider's UPI QR when drop arrives.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  Zero Advance
                </span>
              </div>
            </div>

            {/* Order Price Summary */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Items Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span className="font-mono text-zinc-200">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Launch Discount (50% OFF - WAVE50)</span>
                  <span className="font-mono font-bold">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Express Doorstep Shipping</span>
                <span className="font-mono text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm sm:text-base font-black text-white">
                <span>Total Amount to Pay on Delivery:</span>
                <span className="font-mono text-amber-400">₹{finalTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || !deliveryStatus.isDeliverable}
              className={`w-full py-3.5 px-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                !deliveryStatus.isDeliverable
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-xl hover:shadow-white/10 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Booking Drop...</span>
                </>
              ) : !deliveryStatus.isDeliverable ? (
                <span>Location Not Deliverable</span>
              ) : (
                <>
                  <span>Place Order (Cash on Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-500 text-center font-mono">
              🔒 100% Verified Order • No payment required today • Hyderabad Fast Delivery
            </p>

          </form>
        )}

      </div>
    </div>
  );
}
