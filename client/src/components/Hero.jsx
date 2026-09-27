import React from 'react';
import { Tag, Truck, MessageCircle, ArrowRight, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import TelegramIcon from './TelegramIcon';
import { BRAND_INFO } from '../data/mockProducts';

export default function Hero({ onExploreClick, onApplyCoupon }) {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950 py-10 sm:py-16">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Hero & Typography */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-700/80 text-white">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Track Bred. Street Ready.
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300">
                Good Clothes Better Days
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                <Truck className="w-3.5 h-3.5" /> Hyderabad Fast Delivery
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tight text-white leading-none">
                STYLE FOR <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-amber-400 underline decoration-zinc-700 decoration-wavy decoration-1">
                  EVERY VIBE.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Official drops of heavyweight graphic tees, Porsche GT3 racing-inspired apparel, imported overseas silhouettes, vintage shirts, and 90s baggy skater denim. Crafted for Hyderabad streetwear culture.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group shadow-xl active:scale-95"
              >
                <span>Explore The Drops</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={BRAND_INFO.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-3.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                  title="Join Telegram Drops"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Join Drops</span>
                </a>

                <a
                  href={BRAND_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-pink-400 rounded-xl transition"
                  title="Follow on Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>

                <a
                  href={BRAND_INFO.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sky-400 rounded-xl transition"
                  title="Join Telegram Channel"
                >
                  <TelegramIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Trust Stats */}
            <div className="pt-4 border-t border-zinc-900 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">50% OFF</p>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">First 10 Orders</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">250+ GSM</p>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">Heavyweight Cotton</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">HYD</p>
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">Doorstep Delivery</p>
              </div>
            </div>

          </div>

          {/* Right Column: Promotional 50% Off Ticket Card with Real Product Visual */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-dashed border-zinc-700 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden group">
              
              {/* Corner badge */}
              <div className="absolute -top-1 -right-1 bg-amber-400 text-black font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-bl-xl shadow">
                LAUNCH SPECIAL
              </div>

              {/* Distressed Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-zinc-800">
                <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-bold font-mono">
                  WRON_WAVE CLOTHING
                </span>
                <div className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1">
                  FIRST 10 CUSTOMERS
                </div>
                <div className="text-[11px] uppercase tracking-widest text-zinc-400">
                  GET A MASSIVE
                </div>
                <div className="inline-block bg-white text-black font-black text-4xl sm:text-5xl px-4 py-1 rounded-xl my-1 transform -rotate-1 shadow-xl">
                  50% OFF
                </div>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                  ON YOUR ENTIRE FIRST ORDER
                </p>
              </div>

              {/* Real drop preview thumbnail */}
              <div className="mt-4 relative rounded-xl overflow-hidden aspect-[16/9] border border-zinc-800">
                <img
                  src="/products/wron_wave_track_bred_model.jpg"
                  alt="WRON_WAVE Signature Drop"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    Signature Drop: Porsche 911 GT3 Edition
                  </span>
                </div>
              </div>

              {/* Coupon Code Strip */}
              <div className="mt-4 p-3 rounded-xl bg-black/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">PROMO CODE</p>
                  <p className="text-base font-mono font-bold tracking-widest text-amber-400">WAVE50</p>
                </div>
                <button
                  onClick={() => onApplyCoupon('WAVE50')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition active:scale-95 flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Claim 50%</span>
                </button>
              </div>

              {/* Hyderabad Express Badge */}
              <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Doorstep Delivery:</span>
                <span className="text-emerald-400 font-bold tracking-wider">Hyderabad 24–48h</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
