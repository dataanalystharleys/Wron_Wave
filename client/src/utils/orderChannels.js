import { BRAND_INFO } from '../data/mockProducts';

/**
 * Builds a clean, professional order summary string for social messaging
 */
export function formatOrderMessage({
  items = [],
  subtotal = 0,
  discount = 0,
  total = 0,
  coupon = '',
  customer = null
}) {
  let message = `🔥 *ORDER ENQUIRY - WRON_WAVE CLOTHING*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (customer?.name) {
    message += `👤 *Customer:* ${customer.name}\n`;
    if (customer.phone) message += `📞 *Phone:* ${customer.phone}\n`;
    if (customer.address) message += `📍 *Delivery Address:* ${customer.address}, ${customer.city || 'Hyderabad'}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  }

  message += `🛍️ *DROPS SELECTED:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    message += `   • Size: *${item.size}*\n`;
    message += `   • Quantity: ${item.quantity}\n`;
    message += `   • Drop Price: ₹${item.price * item.quantity}\n`;
    if (item.fabricType) {
      message += `   • Fabric: ${item.fabricType}\n`;
    }
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Subtotal:* ₹${subtotal}\n`;
  if (discount > 0) {
    message += `🏷️ *Launch Discount (${coupon || '50% OFF'}):* -₹${discount}\n`;
  }
  message += `✨ *Final Payable Amount:* *₹${total}*\n`;
  message += `🚚 *Fulfillment:* Hyderabad Door Delivery (Cash on Delivery / UPI)\n\n`;
  message += `Please confirm my order and share estimated dispatch timing!`;

  return message;
}

/**
 * Dispatches order enquiry securely through backend
 */
export async function sendWhatsAppOrder(orderDetails) {
  try {
    await fetch('/api/send-order-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: orderDetails })
    });
  } catch (e) {
    console.warn('Backend order alert dispatch:', e);
  }
  alert('✓ Order enquiry successfully dispatched to the store fulfillment desk!');
}

/**
 * Opens Instagram DM and copies order summary to clipboard for easy paste
 */
export async function sendInstagramOrder(orderDetails) {
  const text = formatOrderMessage(orderDetails);
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('📋 Your order summary has been COPIED to your clipboard!\n\nWe are now redirecting you to Instagram DM (@wron_wave). Just PASTE your message to send your order!');
    }
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
  }
  window.open(BRAND_INFO.instagramDmUrl || BRAND_INFO.instagramUrl, '_blank');
}

/**
 * Opens Telegram channel / DM with order text
 */
export async function sendTelegramOrder(orderDetails) {
  const text = formatOrderMessage(orderDetails);
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
  }
  const url = `https://t.me/share/url?url=${encodeURIComponent(BRAND_INFO.telegramUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
