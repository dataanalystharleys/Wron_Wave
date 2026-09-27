import React, { useState } from 'react';
import { X, Check, ShoppingBag, Ruler, Truck, ShieldCheck, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { BRAND_INFO } from '../data/mockProducts';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide 
}) {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'care'
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const discountedPrice = Math.round(product.price * 0.5);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, selectedSize);
    } else {
      addToCart(product, selectedSize, { openDrawer: true });
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleDirectBuy = () => {
    if (onBuyNow) {
      onBuyNow(product, selectedSize);
    } else {
      addToCart(product, selectedSize, { openDrawer: false });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full text-white shadow-2xl overflow-hidden flex flex-col md:flex-row my-6 max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 border border-zinc-700 text-zinc-300 hover:text-white transition"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Multi-Angle Photos Gallery */}
        <div className="md:w-1/2 bg-zinc-900 flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-zinc-800">
          {/* Main Selected Image */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} angle ${activeImageIndex + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.tag && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md border border-zinc-700 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                {product.tag}
              </span>
            )}
            <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 text-zinc-400 text-[10px] font-mono rounded">
              Angle {activeImageIndex + 1} of {images.length}
            </span>
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    activeImageIndex === idx 
                      ? 'border-amber-400 ring-2 ring-amber-400/20 scale-102' 
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center text-zinc-300 py-0.5 font-mono">
                    {idx === 0 ? 'Front' : idx === 1 ? 'Back' : 'Texture'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Details & E-Commerce Order Flow */}
        <div className="md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            {/* Category & Stock */}
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="uppercase tracking-wider font-mono font-bold text-zinc-400">{product.categoryLabel}</span>
              {product.stockCount && (
                <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px] font-mono">
                  🔥 {product.stockCount} drops left
                </span>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="mt-3 p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-amber-400 font-mono">₹{discountedPrice}</span>
                <span className="text-sm text-zinc-500 line-through font-mono">₹{product.price}</span>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-400 text-[10px] font-black rounded uppercase">
                  50% Launch OFF
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Discount automatically applied for the first 10 orders with code <span className="text-white font-mono font-bold">WAVE50</span>.
              </p>
            </div>

            {/* Clothing Details Tabs (Specs vs Wash & Care) */}
            <div className="mt-4">
              <div className="flex border-b border-zinc-800 gap-4 text-xs font-bold uppercase tracking-wider mb-3">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-1.5 transition ${activeTab === 'specs' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Clothing Specs & Fabric
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-1.5 transition ${activeTab === 'care' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Wash & Care
                </button>
              </div>

              {activeTab === 'specs' ? (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-zinc-500 block text-[10px] uppercase font-mono">Fabric Type</span>
                      <span className="font-semibold text-zinc-100">{product.fabricType || '100% Combed Cotton'}</span>
                    </div>
                    <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80">
                      <span className="text-zinc-500 block text-[10px] uppercase font-mono">Fabric Weight</span>
                      <span className="font-semibold text-zinc-100">{product.gsm || 'Heavyweight'}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80 text-[11px]">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Fit & Silhouette</span>
                    <span className="font-semibold text-zinc-100">{product.fit || 'Streetwear Boxy Fit'}</span>
                  </div>

                  <p className="text-zinc-400 leading-relaxed pt-1">
                    {product.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-zinc-300 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80">
                  <p>• Machine wash cold (inside-out) on gentle cycle.</p>
                  <p>• Do not iron directly on screen-printed graphic art.</p>
                  <p>• Hang dry in shade to maintain color depth and GSM loft.</p>
                  <p>• Zero bleach, tumble dry low if necessary.</p>
                </div>
              )}
            </div>

            {/* Sizing Selection & Chart link */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                  Select Size:
                </span>
                <button
                  type="button"
                  onClick={() => onOpenSizeGuide && onOpenSizeGuide(product.category)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold font-mono transition ${
                      selectedSize === size
                        ? 'bg-white text-black ring-2 ring-white/50 shadow-md'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Standard E-Commerce Purchase Actions */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAdd}
                className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition active:scale-98"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Buy Now (Cash on Delivery) Button */}
              <button
                type="button"
                onClick={handleDirectBuy}
                className="py-3 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-xl"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Buy Now (COD)</span>
              </button>
            </div>

            {/* Delivery highlights */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-zinc-400" /> Hyderabad Doorstep Delivery
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pay Cash on Delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
