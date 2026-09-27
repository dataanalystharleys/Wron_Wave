/**
 * WRON_WAVE Deliverable Locations & Pincode Management System
 * 
 * Allows the Web Administrator to configure:
 * - Specific deliverable cities (e.g. Hyderabad, Secunderabad, Cyberabad)
 * - Specific deliverable pincodes (e.g. 500001 - 500099)
 * - Global delivery toggle (All India vs Selected Locations)
 * - Cash on Delivery (COD) availability
 * - Delivery turnaround times & shipping charges
 */

const STORAGE_KEY = 'wron_wave_delivery_config';

// Default configuration: Hyderabad Urban Agglomeration
export const DEFAULT_DELIVERY_CONFIG = {
  allIndiaDelivery: false,
  cities: [
    { id: 'hyd', name: 'Hyderabad', active: true, estimatedDays: '1-2 Days (Same-Day Express Available)' },
    { id: 'sec', name: 'Secunderabad', active: true, estimatedDays: '1-2 Days' },
    { id: 'cyb', name: 'Cyberabad', active: true, estimatedDays: '1-2 Days (Hitec City / Gachibowli / Madhapur)' }
  ],
  // Common Hyderabad metropolitan pincode prefixes & sample key areas
  pincodePrefixes: ['500'], // All 500xxx pincodes (500001 to 500099)
  customPincodes: [
    '500001', '500002', '500003', '500004', '500016', '500018', '500028',
    '500032', '500033', '500034', '500038', '500072', '500081', '500082', '500084', '500090'
  ],
  cashOnDeliveryEnabled: true,
  deliveryFee: 0, // Free Delivery by default
  freeDeliveryThreshold: 0
};

/**
 * Loads current delivery settings from localStorage or defaults
 */
export function getDeliveryConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_DELIVERY_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Error reading delivery config:', err);
  }
  return DEFAULT_DELIVERY_CONFIG;
}

/**
 * Saves updated delivery settings (Admin Action)
 */
export function saveDeliveryConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Optional: Sync to backend server if running
    fetch('http://localhost:5000/api/delivery-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).catch(() => {});
    return true;
  } catch (err) {
    console.error('Error saving delivery config:', err);
    return false;
  }
}

/**
 * Validates whether a customer's address (city & pincode) is deliverable
 * 
 * @param {Object} params
 * @param {string} params.city - Customer city input
 * @param {string} params.pincode - Customer 6-digit pincode
 * @returns {Object} { isDeliverable: boolean, message: string, estimatedDays: string }
 */
export function checkDeliverability({ city = '', pincode = '' }) {
  const config = getDeliveryConfig();

  // If All-India delivery is turned on by admin
  if (config.allIndiaDelivery) {
    return {
      isDeliverable: true,
      message: 'Deliverable across India! Standard dispatch in 2-4 days.',
      estimatedDays: '2-4 Days (All-India Express)'
    };
  }

  const cleanPin = String(pincode || '').trim();
  const cleanCity = String(city || '').trim().toLowerCase();

  // 1. Check Pincode Match (if 6 digits provided)
  if (cleanPin.length === 6) {
    // Check prefix (e.g. 500 for Hyderabad)
    const matchesPrefix = config.pincodePrefixes.some(prefix => cleanPin.startsWith(prefix));
    const matchesCustom = config.customPincodes.includes(cleanPin);

    if (matchesPrefix || matchesCustom) {
      return {
        isDeliverable: true,
        message: '✓ Verified Deliverable! Doorstep Cash on Delivery available.',
        estimatedDays: '1-2 Days (Hyderabad Express Delivery)'
      };
    }
  }

  // 2. Check City Name Match
  if (cleanCity) {
    const activeCity = config.cities.find(
      c => c.active && (cleanCity.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cleanCity))
    );

    if (activeCity) {
      return {
        isDeliverable: true,
        message: `✓ Deliverable to ${activeCity.name}! Doorstep Cash on Delivery available.`,
        estimatedDays: activeCity.estimatedDays || '1-2 Days'
      };
    }
  }

  // If neither matches and pincode is 6 digits or city entered
  const activeCityNames = config.cities.filter(c => c.active).map(c => c.name).join(', ');
  
  return {
    isDeliverable: false,
    message: `Currently not deliverable to ${cleanCity || cleanPin || 'this location'}. We currently deliver exclusively to: ${activeCityNames} (Pincodes 500xxx).`,
    estimatedDays: 'Not Deliverable'
  };
}

