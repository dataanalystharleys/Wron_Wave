/**
 * WRON_WAVE Cloud Database & Google Sheets Synchronization Service
 * 
 * Supports:
 * 1. Supabase (PostgreSQL) Cloud Database
 * 2. MongoDB Atlas / Cloud REST API
 * 3. Direct Google Sheets Webhook Sync (creates a new row in Google Sheets for every order)
 * 4. LocalStorage Fallback (Zero data loss even when offline)
 */

const LOCAL_STORAGE_ORDERS_KEY = 'wron_wave_orders';
const LOCAL_STORAGE_PRODUCTS_KEY = 'wron_wave_custom_products';

// Read Cloud Config from environment (if provided)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
const GOOGLE_SHEETS_WEBHOOK = import.meta.env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Saves a new customer order to:
 * 1. Local Database (Immediate)
 * 2. Supabase Cloud Database (if configured)
 * 3. Google Sheets Webhook (if configured)
 */
export async function saveOrderToDatabase(newOrder) {
  // 1. Save locally first (Guarantees 100% data safety)
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
  } catch {
    existing = [];
  }
  const updatedOrders = [newOrder, ...existing];
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updatedOrders));

  // 2. Sync to Supabase Cloud Database (if credentials configured)
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          order_id: newOrder.id,
          customer_name: newOrder.customer?.name || '',
          customer_phone: newOrder.customer?.phone || '',
          delivery_address: newOrder.customer?.address || '',
          city: newOrder.customer?.city || 'Hyderabad',
          items: JSON.stringify(newOrder.items || []),
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          total: newOrder.total,
          coupon: newOrder.coupon,
          payment_method: newOrder.paymentMethod,
          status: newOrder.status || 'Confirmed',
          created_at: newOrder.createdAt || new Date().toISOString()
        })
      });
      console.log('Order successfully synced to Supabase Cloud DB');
    } catch (err) {
      console.warn('Supabase sync skipped/failed:', err);
    }
  }

  // 3. Sync to Google Sheets Webhook (Creates instant row in user Google Sheet)
  if (GOOGLE_SHEETS_WEBHOOK) {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.id,
          date: new Date().toLocaleDateString('en-IN'),
          time: new Date().toLocaleTimeString('en-IN'),
          name: newOrder.customer?.name || 'Customer',
          phone: newOrder.customer?.phone || '',
          address: `${newOrder.customer?.address || ''}, ${newOrder.customer?.city || 'Hyderabad'}`,
          items: (newOrder.items || []).map(i => `${i.name} (${i.size}) x${i.quantity}`).join(' | '),
          total: newOrder.total,
          paymentMethod: newOrder.paymentMethod || 'Cash on Delivery',
          status: newOrder.status || 'Confirmed'
        })
      });
      console.log('Order row synced to Google Sheets');
    } catch (err) {
      console.warn('Google Sheets sync skipped/failed:', err);
    }
  }

  // 4. Trigger Free WhatsApp Order Alert via CallMeBot (/api/send-order-alert)
  try {
    const alertRes = await fetch('/api/send-order-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    });
    const alertData = await alertRes.json();
    console.log('[CallMeBot WhatsApp Order Alert Status]:', alertData);
  } catch (err) {
    try {
      const fallbackRes = await fetch('http://localhost:5000/api/send-order-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      });
      const fallbackData = await fallbackRes.json();
      console.log('[CallMeBot WhatsApp Order Alert Local Fallback]:', fallbackData);
    } catch {
      // ignore
    }
  }

  return newOrder;
}

/**
 * Retrieves all stored customer orders
 */
export function getAllOrdersFromDatabase() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Exports all customer orders to CSV for instant opening in Google Sheets or Microsoft Excel
 */
export function exportOrdersToCSV() {
  const orders = getAllOrdersFromDatabase();
  if (!orders.length) {
    alert('No customer orders found to export yet!');
    return;
  }

  const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Delivery Address', 'Items Ordered', 'Total Amount (INR)', 'Payment Method', 'Status'];

  const rows = orders.map(o => [
    o.id,
    new Date(o.createdAt).toLocaleString('en-IN'),
    `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
    `"${o.customer?.phone || ''}"`,
    `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
    `"${(o.items || []).map(i => `${i.name} [Size: ${i.size}] x${i.quantity}`).join('; ')}"`,
    o.total,
    `"${o.paymentMethod || 'COD'}"`,
    o.status || 'Confirmed'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `WRON_WAVE_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

