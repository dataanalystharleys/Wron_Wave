import React from 'react';
import { ShoppingBag, Phone, Sparkles } from 'lucide-react';
import { BRAND_INFO } from '../data/mockProducts';

export default function MobileStickyBar({ cartCount, onOpenCart, onOpenSizeGuide }) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 p-2.5 px-4 flex items-center justify-between gap-3 shadow-2xl">
      {/* Catalog Button */}
      <button
        onClick={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 font-mono"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="uppercase tracking-wider">Explore Drops</span>
      </button>

      {/* Cart Drawer Trigger */}
      <button
        onClick={onOpenCart}
        className="relative py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Cart</span>
        {cartCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[10px] rounded-full">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

