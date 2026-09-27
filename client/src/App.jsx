import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MarqueeTicker from './components/MarqueeTicker';
import Hero from './components/Hero';
import CollectionTabs from './components/CollectionTabs';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import SizeGuideModal from './components/SizeGuideModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import ChannelOrderModal from './components/ChannelOrderModal';
import LookbookSection from './components/LookbookSection';
import MobileStickyBar from './components/MobileStickyBar';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminPortal from './components/AdminPortal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS, BRAND_INFO } from './data/mockProducts';
import { ShoppingBag, Sparkles, Filter, Ruler, Package } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth state via AuthContext
  const { isAuthenticated, openAuthModal } = useAuth();

  // Cart state via CartContext
  const {
    cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    setAppliedCoupon
  } = useCart();

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeGuideCategory, setSizeGuideCategory] = useState('printed-tees');
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [channelOrderData, setChannelOrderData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Try fetching products from live backend API if running
  useEffect(() => {
    const fetchApiProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          setProducts(data.products);
        }
      } catch {
        // Fallback to INITIAL_PRODUCTS silently
      }
    };
    fetchApiProducts();
  }, []);

  // Cart operations delegate to CartContext
  const handleAddToCart = (product, size) => {
    addToCart(product, size, { openDrawer: true });
  };

  const handleUpdateQuantity = (productId, size, newQty) => {
    updateQuantity(productId, size, newQty);
  };

  const handleRemoveItem = (productId, size) => {
    removeFromCart(productId, size);
  };

  // URL hash routing: Navigating to /#admin directly opens Admin Portal
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdmin(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenSizeGuide = (cat = 'printed-tees') => {
    setSizeGuideCategory(cat);
    setIsSizeGuideOpen(true);
  };

  // Direct E-Commerce Buy Now: adds item to cart, enforces authentication, then opens checkout
  const handleBuyNow = (product, size) => {
    addToCart(product, size, { openDrawer: false });
    if (!isAuthenticated) {
      openAuthModal('signin', () => {
        setIsCheckoutOpen(true);
      });
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Enforce authentication before proceeding to checkout from cart
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      openAuthModal('signin', () => {
        setIsCheckoutOpen(true);
      });
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleOrderSuccess = (newOrder) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('wron_wave_orders') || '[]');
      localStorage.setItem('wron_wave_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch (e) {
      console.error(e);
    }
    clearCart();
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.categoryLabel.toLowerCase().includes(query) ||
      (p.fabricType && p.fabricType.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const cartTotalItems = cartCount;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-white selection:text-black">
      
      {/* Top Infinite Streetwear Marquee */}
      <MarqueeTicker onApplyCoupon={(code) => {
        setAppliedCoupon(code);
        setIsCartOpen(true);
      }} />

      {/* Navigation */}
      <Navbar
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenSizeGuide={handleOpenSizeGuide}
      />

      {/* Main View: Storefront vs Admin Portal */}
      {isAdmin ? (
        <main className="flex-1">
          <AdminPortal
            onBackToStore={() => setIsAdmin(false)}
            onProductAdded={(newP) => setProducts((prev) => [newP, ...prev])}
          />
        </main>
      ) : (
        <main className="flex-1 pb-16 md:pb-0">
          
          {/* Hero Section */}
          <Hero
            onExploreClick={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onApplyCoupon={(code) => {
              setAppliedCoupon(code);
              setIsCartOpen(true);
            }}
          />

          {/* Catalog Section */}
          <section id="catalog-section" className="py-10 bg-zinc-950">
            {/* Category Filter Pills */}
            <CollectionTabs
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            {/* Products Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-zinc-900 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span>Streetwear Drops & Cuts</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Showing {filteredProducts.length} exclusive drops • 240+ GSM heavyweight cotton & 90s rigid denim
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenSizeGuide(activeCategory)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Exact Size Chart</span>
                  </button>

                  {searchTerm && (
                    <div className="text-xs text-zinc-400">
                      Results for: <span className="text-white font-semibold">"{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-amber-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-zinc-600" />
                  <p className="text-base font-bold text-zinc-300">No products found</p>
                  <p className="text-xs text-zinc-500">
                    Try searching for another piece or switch collections above.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onOpenQuickView={(p) => setQuickViewProduct(p)}
                      onOpenSizeGuide={handleOpenSizeGuide}
                    />
                  ))}
                </div>
              )}

            </div>
          </section>

          {/* Community Lookbook Section */}
          <LookbookSection />

        </main>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Product Quick View & Multi-Angle Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onOpenSizeGuide={handleOpenSizeGuide}
      />

      {/* Multi-Channel Fast Order Modal */}
      <ChannelOrderModal
        isOpen={!!channelOrderData}
        onClose={() => setChannelOrderData(null)}
        orderDetails={channelOrderData}
        onSuccess={() => setCart([])}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={sizeGuideCategory}
      />

      {/* Customer Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Free User Authentication Modal (Google OAuth & Email/Password) */}
      <AuthModal />

      {/* Sticky Mobile Bottom Bar */}
      {!isAdmin && (
        <MobileStickyBar
          cartCount={cartTotalItems}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSizeGuide={handleOpenSizeGuide}
        />
      )}

      {/* Footer */}
      <Footer onSelectCategory={(cat) => {
        setActiveCategory(cat);
        const el = document.getElementById('catalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }} />

    </div>
  );
}
