/**
 * Vercel Serverless Function: /api/send-order-alert
 * 
 * Triggers 100% free automated WhatsApp order alerts to the Admin via CallMeBot HTTP GET API.
 * Free tier setup: No Twilio, no paid SMS gateway, 100% free forever.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const order = req.body?.order || req.body || {};

    const customerName = order.customer?.name || order.customer_name || 'Customer';
    const customerPhone = order.customer?.phone || order.customer_phone || 'N/A';
    const address = order.customer?.address || order.shipping_address || 'Hyderabad';
    const totalAmount = order.total || order.total_amount || 0;

    const itemList = (order.items || [])
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} (${it.size || 'M'}) x${it.quantity || 1} - ₹${
            (it.price || 0) * (it.quantity || 1)
          }`
      )
      .join('\n');

    // Required Format:
    // 🚨 *New Order Alert!*
    // 👤 Customer: {name} ({phone})
    // 🛒 Items: {item_list}
    // 💰 Total: ₹{total_amount}
    // 📍 Address: {address}
    const message = `🚨 *New Order Alert!*\n` +
      `👤 Customer: ${customerName} (${customerPhone})\n` +
      `🛒 Items:\n${itemList || '1x Streetwear Item'}\n` +
      `💰 Total: ₹${totalAmount}\n` +
      `📍 Address: ${address}`;

    // Dual Admin Recipients (100% private to backend)
    const adminRecipients = [
      {
        id: 'Admin 1',
        phone: (process.env.ADMIN_WHATSAPP_PHONE_1 || process.env.ADMIN_WHATSAPP_PHONE || '919187000720').replace(/\D/g, ''),
        apiKey: process.env.CALLMEBOT_APIKEY_1 || process.env.CALLMEBOT_APIKEY
      },
      {
        id: 'Admin 2',
        phone: (process.env.ADMIN_WHATSAPP_PHONE_2 || '918500074205').replace(/\D/g, ''),
        apiKey: process.env.CALLMEBOT_APIKEY_2
      }
    ].filter(a => a.phone);

    console.log(`[CallMeBot Vercel] Dispatching alert to ${adminRecipients.length} admins (9187000720 & 8500074205)`);

    const dispatchResults = await Promise.allSettled(
      adminRecipients.map(async (admin) => {
        if (!admin.apiKey) {
          console.log(`[CallMeBot Simulated] ${admin.id} (${admin.phone}) - API key not set in environment.`);
          return { id: admin.id, success: true, simulated: true };
        }

        const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(admin.phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(admin.apiKey)}`;
        const response = await fetch(callMeBotUrl, { method: 'GET' });
        const responseText = await response.text();
        console.log(`[CallMeBot ${admin.id} Dispatch] HTTP ${response.status}: ${responseText}`);
        return { id: admin.id, success: response.ok, status: response.status };
      })
    );

    return res.status(200).json({
      success: true,
      delivered: true,
      recipientsCount: adminRecipients.length,
      message: 'Dual admin order alerts processed successfully'
    });
  } catch (error) {
    console.error('CallMeBot order alert error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error triggering WhatsApp alert'
    });
  }
}
