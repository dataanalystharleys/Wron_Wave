import React from 'react';
import { ShoppingBag, Phone, ShieldCheck, Search, Sparkles, Package, Ruler, User } from 'lucide-react';
import BrandLogo from './BrandLogo';
import InstagramIcon from './InstagramIcon';
import TelegramIcon from './TelegramIcon';
import { BRAND_INFO } from '../data/mockProducts';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  searchTerm, 
  setSearchTerm, 
  isAdmin, 
  setIsAdmin,
  activeCategory,
  setActiveCategory,
  onOpenTracker,
  onOpenSizeGuide
}) {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/90">
      
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <div 
          onClick={() => {
            setActiveCategory('all');
            setSearchTerm('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className="flex-shrink-0 cursor-pointer"
        >
          <BrandLogo />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search oversized tees, 90s baggy jeans, vintage shirts..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all font-sans"
          />
        </div>

        {/* Center/Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Track Order Button */}
          <button
            onClick={onOpenTracker}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-zinc-600 transition font-mono"
            title="Track your order delivery"
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Track</span>
          </button>

          {/* Size Guide Button */}
          <button
            onClick={() => onOpenSizeGuide && onOpenSizeGuide('printed-tees')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-zinc-600 transition font-mono"
            title="View Streetwear Size Chart"
          >
            <Ruler className="w-3.5 h-3.5 text-zinc-400" />
            <span>Size Chart</span>
          </button>

          {/* Telegram Channel Button */}
          <a
            href={BRAND_INFO.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Join @wron_wave on Telegram"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-sky-900/50 bg-sky-950/30 text-sky-400 hover:bg-sky-900/40 hover:border-sky-500/50 transition font-mono"
          >
            <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram</span>
          </a>

          {/* Instagram Button */}
          <a
            href={BRAND_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Follow @wron_wave on Instagram"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-pink-500/50 transition font-mono"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>@wron_wave</span>
          </a>


          {/* User Authentication (100% Free Tier) */}
          {isAuthenticated ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:text-white transition font-mono"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline max-w-[90px] truncate font-semibold">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-3 py-2 border-b border-zinc-800 text-[11px] text-zinc-400 truncate">
                  <span className="text-white font-semibold block truncate">{user.name || 'Customer'}</span>
                  <span className="text-[10px] text-zinc-500 truncate block">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-zinc-800 rounded-xl transition mt-1 font-mono font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:text-white hover:border-zinc-600 transition font-mono"
              title="Sign in to your account"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Admin Exit Button - ONLY shown when admin portal is active, NEVER to public visitors */}
          {isAdmin && (
            <button
              onClick={() => setIsAdmin(false)}
              className="px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition bg-amber-500/20 text-amber-300 border-amber-500/50 font-mono font-bold"
              title="Return to Storefront"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Back to Store</span>
            </button>
          )}

          {/* Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95 shadow-md shadow-white/5"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[10px] sm:text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Sub-Header: Search & Quick Links */}
      <div className="md:hidden px-4 pb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drops..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
        
        <button
          onClick={onOpenTracker}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-mono flex items-center gap-1"
        >
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span>Track</span>
        </button>

        <a
          href={BRAND_INFO.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-sky-950 border border-sky-800 text-sky-400 rounded-xl text-xs flex items-center justify-center"
          title="Telegram"
        >
          <TelegramIcon className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
