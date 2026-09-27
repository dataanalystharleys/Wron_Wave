import React, { useState, useEffect } from 'react';
import { 
  Package, ShoppingBag, PlusCircle, RefreshCw, User, Phone, 
  MapPin, CheckCircle, Clock, Download, FileSpreadsheet, 
  MessageCircle, Truck, Map, ShieldCheck, Trash2, Plus, Check, AlertCircle, Save
} from 'lucide-react';
import { getAllOrdersFromDatabase, exportOrdersToCSV } from '../services/cloudDb';
import { BRAND_INFO } from '../data/mockProducts';
import { getDeliveryConfig, saveDeliveryConfig } from '../data/deliveryZones';

export default function AdminPortal({ onBackToStore, onProductAdded }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('wron_admin_unlocked') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'delivery-zones', 'new-product'

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === 'WRON2026' || passcode.trim().toUpperCase() === 'WRON99') {
      sessionStorage.setItem('wron_admin_unlocked', 'true');
      setIsUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid Admin Passcode. Access restricted to store staff.');
    }
  };

  // Delivery Configuration State
  const [deliveryConfig, setDeliveryConfig] = useState(() => getDeliveryConfig());
  const [newCityName, setNewCityName] = useState('');
  const [newCityDays, setNewCityDays] = useState('1-2 Days');
  const [newPincode, setNewPincode] = useState('');
  const [deliverySaveMsg, setDeliverySaveMsg] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'printed-tees',
    categoryLabel: 'Unique Collection of Printed T-Shirts',
    price: '',
    originalPrice: '',
    tag: 'New Drop',
    sizes: 'S, M, L, XL',
    description: '',
    image: '',
    fabricType: '100% Combed Cotton',
    gsm: '240 GSM'
  });

  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // 1. Check local / cloud DB
      const localOrders = getAllOrdersFromDatabase();

      // 2. Try fetching from server API if active
      let serverOrders = [];
      try {
        const res = await fetch('http://localhost:5000/api/orders');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          serverOrders = data.orders;
        }
      } catch {
        // silent
      }

      // Merge unique orders by id
      const combined = [...localOrders];
      serverOrders.forEach(so => {
        if (!combined.some(co => co.id === so.id)) {
          combined.push(so);
        }
      });

      // Default sample if empty
      if (!combined.length) {
        combined.push({
          id: 'WW-ORD-1001',
          customer: {
            name: 'Rahul Varma',
            phone: '+91 98480 22334',
            address: 'Flat 402, Signature Towers, Road No 36, Jubilee Hills, Hyderabad, Telangana - 500033',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033'
          },
          items: [
            { id: 'ww-pt-01', name: "WRON_WAVE GT3 'Track Bred' Heavy Tee", size: 'L', quantity: 1, price: 899, fabricType: '240 GSM Heavy Cotton' }
          ],
          subtotal: 1799,
          discount: 900,
          total: 899,
          paymentMethod: 'Cash on Delivery (COD)',
          status: 'Confirmed',
          createdAt: new Date().toISOString()
        });
      }

      setOrders(combined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Delivery Configuration Actions
  const handleToggleAllIndia = () => {
    const updated = { ...deliveryConfig, allIndiaDelivery: !deliveryConfig.allIndiaDelivery };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
    setDeliverySaveMsg('Updated: Delivery coverage settings saved!');
    setTimeout(() => setDeliverySaveMsg(''), 3000);
  };

  const handleToggleCity = (cityId) => {
    const updatedCities = deliveryConfig.cities.map(c => 
      c.id === cityId ? { ...c, active: !c.active } : c
    );
    const updated = { ...deliveryConfig, cities: updatedCities };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const newCity = {
      id: `city-${Date.now().toString(36)}`,
      name: newCityName.trim(),
      active: true,
      estimatedDays: newCityDays || '1-2 Days'
    };
    const updated = {
      ...deliveryConfig,
      cities: [...deliveryConfig.cities, newCity]
    };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
    setNewCityName('');
    setDeliverySaveMsg(`Added "${newCity.name}" to deliverable cities!`);
    setTimeout(() => setDeliverySaveMsg(''), 3000);
  };

  const handleRemoveCity = (cityId) => {
    const updatedCities = deliveryConfig.cities.filter(c => c.id !== cityId);
    const updated = { ...deliveryConfig, cities: updatedCities };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
  };

  const handleAddPincode = (e) => {
    e.preventDefault();
    const pin = newPincode.trim();
    if (pin.length !== 6 || deliveryConfig.customPincodes.includes(pin)) return;
    const updated = {
      ...deliveryConfig,
      customPincodes: [...deliveryConfig.customPincodes, pin]
    };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
    setNewPincode('');
    setDeliverySaveMsg(`Pincode ${pin} added!`);
    setTimeout(() => setDeliverySaveMsg(''), 3000);
  };

  const handleRemovePincode = (pin) => {
    const updated = {
      ...deliveryConfig,
      customPincodes: deliveryConfig.customPincodes.filter(p => p !== pin)
    };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
  };

  const handleToggleCOD = () => {
    const updated = { ...deliveryConfig, cashOnDeliveryEnabled: !deliveryConfig.cashOnDeliveryEnabled };
    setDeliveryConfig(updated);
    saveDeliveryConfig(updated);
  };

  // Product Creation Action
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    try {
      const payload = {
        ...newProduct,
        id: `ww-custom-${Date.now().toString(36)}`,
        sizes: newProduct.sizes.split(',').map(s => s.trim()),
        price: Number(newProduct.price),
        originalPrice: Number(newProduct.originalPrice || newProduct.price * 2),
        inStock: true,
        images: [newProduct.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80']
      };

      try {
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {
        // save locally
      }

      if (onProductAdded) {
        onProductAdded(payload);
      }

      setSuccessMsg(`Drop "${newProduct.name}" created successfully!`);
      setNewProduct({
        name: '',
        category: 'printed-tees',
        categoryLabel: 'Unique Collection of Printed T-Shirts',
        price: '',
        originalPrice: '',
        tag: 'New Drop',
        sizes: 'S, M, L, XL',
        description: '',
        image: '',
        fabricType: '100% Combed Cotton',
        gsm: '240 GSM'
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Store Owner Access
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Restricted area. Please enter your store manager passcode to access order management.
            </p>
          </div>

          {passcodeError && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-3">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter Store Passcode"
              required
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center text-sm text-white placeholder-zinc-500 tracking-widest font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl transition shadow-lg active:scale-98 font-mono"
            >
              Unlock Admin Portal
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition"
          >
            ← Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold font-mono">
              WRON_WAVE STORE CONTROL & DATABASE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
            Store Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export to Google Sheets Button */}
          <button
            onClick={exportOrdersToCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
            title="Export all orders to Google Sheets / Excel CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export to Google Sheets</span>
          </button>

          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onBackToStore}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow"
          >
            Back to Storefront
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Total Orders Stored</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">{orders.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Gross Order Volume</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">₹{totalRevenue}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Deliverable Locations</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">
            {deliveryConfig.allIndiaDelivery ? 'All India Active' : `${deliveryConfig.cities.filter(c => c.active).length} Cities Active`}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Payment Mode</p>
          <p className="text-sm font-bold text-zinc-200 mt-2 font-mono">
            {deliveryConfig.cashOnDeliveryEnabled ? 'Cash on Delivery Active' : 'Online Only'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('delivery-zones')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'delivery-zones'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Deliverable Locations & Pincodes
        </button>
        <button
          onClick={() => setActiveTab('new-product')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'new-product'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Add New Apparel Drop
        </button>
      </div>

      {/* ================= TAB 1: CUSTOMER ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-zinc-800 text-zinc-500">
              <Package className="w-12 h-12 mx-auto stroke-1 text-zinc-600 mb-2" />
              <p className="text-base font-bold text-zinc-300">No orders placed yet</p>
              <p className="text-xs mt-1">Incoming customer orders will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-4 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black font-mono text-white">
                        {order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono">
                        {order.status || 'Confirmed'}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Quick Link to Customer */}
                      {order.customer?.phone && (
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${order.customer.name}, this is WRON_WAVE CLOTHING confirming your order ${order.id} for ₹${order.total}. Our delivery rider will deliver your drop soon!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Customer & Address */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                        Customer & Delivery Address
                      </p>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{order.customer?.name || 'Customer'}</span>
                      </p>
                      <p className="text-zinc-300 font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{order.customer?.phone || 'No phone'}</span>
                      </p>
                      <p className="text-zinc-400 flex items-start gap-1.5 leading-relaxed pt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{order.customer?.address || 'Hyderabad'}</span>
                      </p>
                    </div>

                    {/* Ordered Items */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                        Items Ordered ({(order.items || []).length})
                      </p>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-300 py-0.5">
                            <span className="truncate pr-2">
                              • {it.name} <strong className="text-white font-mono">({it.size})</strong> x{it.quantity}
                            </span>
                            <span className="font-mono text-zinc-400 shrink-0">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment & Totals */}
                    <div className="space-y-1.5 md:border-l md:border-zinc-800 md:pl-4">
                      <p className="text-[11px] uppercase font-mono tracking-wider text-zinc-400 font-bold">
                        Payment & Total
                      </p>
                      <div className="flex justify-between text-zinc-400">
                        <span>Payment Mode:</span>
                        <span className="font-bold text-emerald-400 uppercase font-mono">
                          {order.paymentMethod || 'Cash on Delivery'}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Items Subtotal:</span>
                        <span className="font-mono text-zinc-300">₹{order.subtotal || order.total}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Discount (WAVE50):</span>
                          <span className="font-mono font-bold">-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-white pt-1 border-t border-zinc-800">
                        <span>Total Due:</span>
                        <span className="font-mono text-amber-400">₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DELIVERABLE LOCATIONS MANAGER ================= */}
      {activeTab === 'delivery-zones' && (
        <div className="space-y-6">
          
          {deliverySaveMsg && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{deliverySaveMsg}</span>
            </div>
          )}

          {/* Global All India Delivery Switch */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>All-India Delivery Toggle</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                When enabled, customers anywhere across India can order. When disabled, only addresses in your selected cities/pincodes below can order.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleAllIndia}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition ${
                deliveryConfig.allIndiaDelivery
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              {deliveryConfig.allIndiaDelivery ? '✓ All-India Enabled' : 'Restricted to Selected Locations'}
            </button>
          </div>

          {/* Deliverable Cities Control */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Map className="w-4 h-4 text-amber-400" />
                  <span>Deliverable Cities ({deliveryConfig.cities.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Customers entering these cities will be permitted to place orders.
                </p>
              </div>

              {/* Add City Form */}
              <form onSubmit={handleAddCity} className="flex gap-2">
                <input
                  type="text"
                  placeholder="City Name (e.g. Bangalore)"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 transition"
                >
                  Add City
                </button>
              </form>
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {deliveryConfig.cities.map((city) => (
                <div
                  key={city.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    city.active 
                      ? 'bg-zinc-950 border-emerald-800/80 text-white' 
                      : 'bg-zinc-900/30 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">{city.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{city.estimatedDays}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCity(city.id)}
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-md border transition ${
                        city.active
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {city.active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(city.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                      title="Remove city"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverable Pincodes Control */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Covered Pincodes ({deliveryConfig.customPincodes.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  All Hyderabad 500xxx prefixes and custom added pincodes are validated here.
                </p>
              </div>

              {/* Add Pincode Form */}
              <form onSubmit={handleAddPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit Pincode"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-32 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-zinc-200 transition"
                >
                  Add Pin
                </button>
              </form>
            </div>

            {/* Pincode Chips */}
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-700/80 text-amber-300 text-xs font-mono rounded-lg">
                500xxx (All Hyderabad Ranges)
              </span>
              {deliveryConfig.customPincodes.map((pin) => (
                <span
                  key={pin}
                  className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-lg flex items-center gap-1.5"
                >
                  <span>{pin}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePincode(pin)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cash on Delivery (COD) Control */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cash on Delivery (COD) Availability</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Allows customers to pay in cash or via UPI at doorstep when the package is delivered.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleCOD}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition ${
                deliveryConfig.cashOnDeliveryEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {deliveryConfig.cashOnDeliveryEnabled ? '✓ COD Active' : 'COD Disabled'}
            </button>
          </div>

        </div>
      )}

      {/* ================= TAB 3: ADD NEW PRODUCT ================= */}
      {activeTab === 'new-product' && (
        <div className="max-w-2xl bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-base font-black uppercase text-white mb-4">
            Create Exclusive Apparel Drop
          </h2>

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs mb-4">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                Product / Drop Name *
              </label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. WRON_WAVE GT3 'Track Bred' Heavy Tee"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  Collection Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    const map = {
                      'printed-tees': 'Unique Collection of Printed T-Shirts',
                      'overseas-tees': 'Overseas T-Shirts',
                      'vintage-shirts': 'Vintage Classic Formal Shirts',
                      'baggy-jeans': 'Baggy Jeans with 90s Style',
                      'genz-styles': 'Trendy Gen-Z Styles & Youth Outfits'
                    };
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value,
                      categoryLabel: map[e.target.value] || e.target.value
                    });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="printed-tees">Printed T-Shirts</option>
                  <option value="overseas-tees">Overseas T-Shirts</option>
                  <option value="vintage-shirts">Vintage Shirts</option>
                  <option value="baggy-jeans">Baggy Jeans (90s)</option>
                  <option value="genz-styles">Gen-Z Outfits</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  value={newProduct.tag}
                  onChange={(e) => setNewProduct({ ...newProduct, tag: e.target.value })}
                  placeholder="e.g. Official Drop, Limited Edition"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  Drop Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="899"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  Original MRP Price (₹)
                </label>
                <input
                  type="number"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                  placeholder="1799"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  Fabric Type
                </label>
                <input
                  type="text"
                  value={newProduct.fabricType}
                  onChange={(e) => setNewProduct({ ...newProduct, fabricType: e.target.value })}
                  placeholder="100% Super Combed Cotton"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                  GSM Weight
                </label>
                <input
                  type="text"
                  value={newProduct.gsm}
                  onChange={(e) => setNewProduct({ ...newProduct, gsm: e.target.value })}
                  placeholder="240 GSM"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                Image URL or Path *
              </label>
              <input
                type="text"
                required
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="/products/your_image.jpg or https://..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                value={newProduct.sizes}
                onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase font-mono font-bold mb-1">
                Description & Styling Specs
              </label>
              <textarea
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Heavyweight cotton, oversized drop shoulder, high-density screenprint..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingProduct}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-wider text-xs rounded-xl transition active:scale-98 disabled:opacity-50 shadow-lg"
            >
              {submittingProduct ? 'Adding Drop...' : 'Publish Drop to Catalog'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
