import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const LOCAL_USERS_KEY = 'wron_wave_users';
const LOCAL_ORDERS_KEY = 'wron_wave_orders';
const LOCAL_AUTH_SESSION_KEY = 'wron_wave_auth_session';

/**
 * Helper to get local demo users or session
 */
export function getLocalSession() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(session) {
  try {
    if (session) {
      localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    }
  } catch (err) {
    console.error('Error saving local auth session:', err);
  }
}

/**
 * 1. Sign In With Google (100% Free Tier OAuth)
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  // Free Tier Demo Fallback when Supabase credentials are pending
  const demoGoogleUser = {
    id: `google-user-${Date.now().toString(36)}`,
    email: 'tester.wave@gmail.com',
    name: 'Google Customer',
    phone: '',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    provider: 'google',
    created_at: new Date().toISOString()
  };
  const demoSession = { user: demoGoogleUser, access_token: 'demo-token' };
  setLocalSession(demoSession);
  await saveUserToDatabase(demoGoogleUser);
  return { user: demoGoogleUser, session: demoSession };
}

/**
 * 2. Sign In with Email & Password
 */
export async function signInWithEmail(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // Free Tier Demo Fallback
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    users = [];
  }
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const user = existing || {
    id: `usr-${Date.now().toString(36)}`,
    email,
    name: email.split('@')[0],
    phone: '',
    created_at: new Date().toISOString()
  };

  const session = { user, access_token: 'demo-token' };
  setLocalSession(session);
  return { user, session };
}

/**
 * 3. Sign Up with Email & Password + Optional Phone & Name
 */
export async function signUpWithEmail(email, password, { name, phone = '' }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          phone: phone || '',
        },
      },
    });
    if (error) throw error;

    if (data.user) {
      await saveUserToDatabase({
        id: data.user.id,
        name: name || email.split('@')[0],
        email: data.user.email,
        phone: phone || '',
        created_at: new Date().toISOString()
      });
    }

    return data;
  }

  // Free Tier Demo Fallback
  const newUser = {
    id: `usr-${Date.now().toString(36)}`,
    email,
    name: name || email.split('@')[0],
    phone: phone || '',
    created_at: new Date().toISOString()
  };

  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    users = [];
  }
  users.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  const session = { user: newUser, access_token: 'demo-token' };
  setLocalSession(session);
  return { user: newUser, session };
}

/**
 * 4. Sign Out
 */
export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
  }
  setLocalSession(null);
}

/**
 * 4b. Send 100% Free Password Reset Email / Link
 */
export async function resetPasswordForEmail(email) {
  if (!email) throw new Error('Please enter your email address');

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return { success: true, data };
  }

  // Free Tier Demo / Local Fallback Simulation
  console.log(`[Supabase Auth] 100% Free password reset link dispatched to: ${email}`);
  return {
    success: true,
    message: `Password reset link sent to ${email} (100% Free Tier)`
  };
}

/**
 * 5. Save Customer Record to Supabase 'users' table
 */
export async function saveUserToDatabase(user) {
  if (!user || !user.email) return;

  const userRecord = {
    id: user.id || `usr-${Date.now().toString(36)}`,
    name: user.name || user.email.split('@')[0],
    email: user.email,
    phone: user.phone || null,
    created_at: user.created_at || new Date().toISOString()
  };

  // 1. Local storage persistence
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const index = existing.findIndex(u => u.email === userRecord.email || u.id === userRecord.id);
    if (index > -1) {
      existing[index] = { ...existing[index], ...userRecord };
    } else {
      existing.unshift(userRecord);
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving user locally:', e);
  }

  // 2. Supabase Cloud Database persistence (PostgreSQL free tier)
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('users').upsert(userRecord, { onConflict: 'id' });
      if (error) console.warn('Supabase users table upsert warning:', error.message);
    } catch (err) {
      console.warn('Supabase users save skipped:', err);
    }
  }
}

/**
 * 6. Save Order Record to Supabase 'orders' table
 */
export async function saveOrderToDatabase(newOrder) {
  if (!newOrder) return;

  // 1. Save locally first (guarantees zero data loss)
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  } catch {
    existing = [];
  }
  const updatedOrders = [newOrder, ...existing.filter(o => o.id !== newOrder.id)];
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updatedOrders));

  // 2. Supabase Cloud Database persistence (PostgreSQL free tier)
  if (isSupabaseConfigured && supabase) {
    try {
      const orderPayload = {
        order_id: newOrder.id,
        user_id: newOrder.userId || 'guest',
        items: newOrder.items || [],
        total_amount: Number(newOrder.total) || 0,
        shipping_address: typeof newOrder.customer?.address === 'string'
          ? newOrder.customer.address
          : JSON.stringify(newOrder.customer?.address || {}),
        status: newOrder.status || 'Confirmed',
        timestamp: newOrder.createdAt || new Date().toISOString()
      };

      const { error } = await supabase.from('orders').insert([orderPayload]);
      if (error) {
        console.warn('Supabase orders table insert warning:', error.message);
      } else {
        console.log('✓ Order record successfully saved to Supabase PostgreSQL orders table');
      }
    } catch (err) {
      console.warn('Supabase orders insert skipped/failed:', err);
    }
  }

  // 3. Sync to Node.js backend if reachable
  try {
    await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    });
  } catch {
    // Optional local dev server
  }

  // 4. Trigger Free WhatsApp Order Alert via CallMeBot (/api/send-order-alert)
  try {
    const alertRes = await fetch('/api/send-order-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder })
    });
    const alertData = await alertRes.json();
    console.log('[WhatsApp Order Alert Status]:', alertData);
  } catch (err) {
    // Fallback to direct backend URL if proxy isn't configured in development
    try {
      const fallbackRes = await fetch('http://localhost:5000/api/send-order-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      });
      const fallbackData = await fallbackRes.json();
      console.log('[WhatsApp Order Alert Fallback]:', fallbackData);
    } catch {
      console.warn('Could not contact /api/send-order-alert endpoint');
    }
  }

  return newOrder;
}

/**
 * Retrieve all orders
 */
export function getAllOrdersFromDatabase() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}
