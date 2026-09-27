import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';

export default function OrderTrackerModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);

    // Look in localStorage orders first
    try {
      const savedOrders = JSON.parse(localStorage.getItem('wron_wave_orders') || '[]');
      const clean = query.trim().toLowerCase();
      const match = savedOrders.find(
        (o) =>
          o.id.toLowerCase() === clean ||
          (o.customer?.phone && o.customer.phone.replace(/\D/g, '').includes(clean.replace(/\D/g, '')))
      );

      if (match) {
        setFoundOrder(match);
      } else {
        // Mock sample lookup for demo if user typed ORD-1001 or sample phone
        if (clean.includes('1001') || clean.includes('7675')) {
          setFoundOrder({
            id: 'ORD-1001',
            createdAt: new Date().toISOString(),
            status: 'Out for Hyderabad Delivery',
            customer: {
              name: 'Rahul Varma',
              phone: '+91 98480 22334',
              address: 'Plot 55, Road No 36, Jubilee Hills',
              city: 'Hyderabad'
            },
            items: [
              { name: 'Monochrome Acid Wave Graphic Tee', size: 'L', quantity: 1, price: 799 },
              { name: '90s Acid Wash Wide-Leg Skate Denim', size: '32', quantity: 1, price: 1499 }
            ],
            discount: 1149,
            total: 1149,
            paymentMethod: 'Cash on Delivery (Hyderabad)'
          });
        } else {
          setFoundOrder(null);
        }
      }
    } catch {
      setFoundOrder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Track Your Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="mt-5">
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
            Enter your Order ID (e.g. ORD-1001) or 10-digit Phone Number:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. ORD-1001 or 98480xxxxx"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-amber-300 transition"
            >
              Track
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="mt-6">
          {foundOrder ? (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Order ID</span>
                  <span className="text-sm font-bold font-mono text-amber-400">{foundOrder.id}</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {foundOrder.status || 'Confirmed'}
                </span>
              </div>

              {/* Progress step */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono pt-1">
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                  <span>Order Placed</span>
                </div>
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                  <span>Quality Packed</span>
                </div>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-amber-300 animate-pulse">
                  <Truck className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
                  <span>Hyderabad Dispatch</span>
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Items in this Drop:</span>
                {foundOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-zinc-300">
                    <span>{item.name} <span className="text-zinc-500">({item.size}) x{item.quantity}</span></span>
                    <span className="font-mono text-white">₹{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-white">
                  <span>Total Amount Paid / COD:</span>
                  <span className="font-mono text-amber-400">₹{foundOrder.total}</span>
                </div>
              </div>

              {/* Address */}
              {foundOrder.customer?.address && (
                <div className="text-[11px] text-zinc-400 flex items-start gap-2 pt-2 border-t border-zinc-800/80">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span>Delivering to: {foundOrder.customer.address}, {foundOrder.customer.city || 'Hyderabad'}</span>
                </div>
              )}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-6 text-zinc-500 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto stroke-1 text-zinc-600" />
              <p className="text-zinc-300 font-semibold">No order found for "{query}"</p>
              <p>Please check the mobile number entered or DM our Instagram <span className="text-amber-400 font-mono">@wron_wave</span> for live rider updates.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

