import React from 'react';
import { Phone, MapPin, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import BrandLogo from './BrandLogo';
import InstagramIcon from './InstagramIcon';
import TelegramIcon from './TelegramIcon';
import { BRAND_INFO } from '../data/mockProducts';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-850 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo />
            <p className="text-zinc-400 text-xs font-light leading-relaxed">
              Streetwear born from raw culture. Drop-shoulder tees, heavy-knit outerwear, and authentic 90s baggy denim.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4 text-pink-400" />
              </a>
              <a
                href={BRAND_INFO.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                title="Telegram"
              >
                <TelegramIcon className="w-4 h-4 text-sky-400" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Collections
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button onClick={() => onSelectCategory('printed-tees')} className="hover:text-white transition">
                  Printed T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('overseas-tees')} className="hover:text-white transition">
                  Overseas T-Shirts
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('vintage-formal')} className="hover:text-white transition">
                  Vintage Formal Shirts
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('baggy-jeans')} className="hover:text-white transition">
                  Baggy Jeans (90s Style)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('youth-outfits')} className="hover:text-white transition">
                  Trendy Gen-Z Outfits
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Ordering */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Direct Orders
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>Door Delivery in Hyderabad Areas</span>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>DM @wron_wave on Instagram</span>
              </li>
              <li className="flex items-center gap-2">
                <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram: @wron_wave</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Cash on Delivery & UPI Accepted</span>
              </li>
            </ul>
          </div>

          {/* Brand Taglines Box */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              WRON_WAVE Vibe
            </p>
            <p className="italic text-zinc-300 font-serif text-xs">
              "Wear your story. Good clothes, better days."
            </p>
            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
              First 10 customers get 50% off with coupon code <span className="text-amber-400 font-mono font-bold">WAVE50</span>.
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} WRON_WAVE CLOTHING. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Built for Streetwear Culture <Heart className="w-3 h-3 text-red-500 inline" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
