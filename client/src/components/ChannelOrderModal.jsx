import React, { useState } from 'react';
import { X, MessageCircle, ArrowRight, ShieldCheck, Check, Copy } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import TelegramIcon from './TelegramIcon';
import { BRAND_INFO } from '../data/mockProducts';
import { sendWhatsAppOrder, sendInstagramOrder, sendTelegramOrder, formatOrderMessage } from '../utils/orderChannels';

export default function ChannelOrderModal({ 
  isOpen, 
  onClose, 
  orderDetails, 
  onSuccess 
}) {
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  if (!isOpen || !orderDetails) return null;

  const currentDetails = {
    ...orderDetails,
    customer: {
      name: customerName,
      address: customerAddress,
      city: 'Hyderabad'
    }
  };

  const handleCopy = async () => {
    const text = formatOrderMessage(currentDetails);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsApp = () => {
    sendWhatsAppOrder(currentDetails);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleInstagram = () => {
    sendInstagramOrder(currentDetails);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleTelegram = () => {
    sendTelegramOrder(currentDetails);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-widest block">
              1-CLICK DIRECT PURCHASE
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5">
              Choose Your Order Channel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Preview Strip */}
        <div className="mt-4 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 font-mono block">Order Total:</span>
            <span className="text-lg font-black text-amber-400 font-mono">₹{orderDetails.total}</span>
            <span className="text-[10px] text-zinc-500 ml-2">({orderDetails.items?.length || 1} drops selected)</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
            title="Copy formatted order message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>

        {/* Optional Customer info for instant address pre-fill */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              placeholder="Hyderabad Area (e.g. Madhapur)"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Channel Selection Buttons */}
        <div className="mt-5 space-y-3">
          
          {/* 1. WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-emerald-900/60 to-zinc-900 border border-emerald-600/50 hover:border-emerald-500 text-white font-bold flex items-center justify-between group transition-all shadow-lg active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span>Order via WhatsApp</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] uppercase font-mono">
                    Fastest
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-normal">
                  Instant automated order dispatch
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. Instagram DM Button */}
          <button
            type="button"
            onClick={handleInstagram}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-950 via-pink-950/60 to-zinc-900 border border-pink-500/40 hover:border-pink-400 text-white font-bold flex items-center justify-between group transition-all shadow-lg active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span>Order via Instagram DM</span>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[9px] uppercase font-mono">
                    {BRAND_INFO.instagram}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-normal">
                  Copies order summary & redirects directly to our Instagram DMs
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. Telegram Channel & Chat Button */}
          <button
            type="button"
            onClick={handleTelegram}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-sky-950 via-sky-900/60 to-zinc-900 border border-sky-500/40 hover:border-sky-400 text-white font-bold flex items-center justify-between group transition-all shadow-lg active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md">
                <TelegramIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <span>Order via Telegram</span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] uppercase font-mono">
                    {BRAND_INFO.telegram}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-normal">
                  Connects to our official Telegram channel & order desk
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Trust Note */}
        <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pay on Delivery in Hyderabad</span>
          </span>
          <span className="font-mono text-zinc-500">100% Streetwear Guarantee</span>
        </div>

      </div>
    </div>
  );
}
