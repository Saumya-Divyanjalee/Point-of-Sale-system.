// db/database.js
// Central in-memory data store for Spicy Stop POS System.
// All data lives here and is accessed through the exported `db` object.
// No localStorage is used - data resets on page reload (demo/kiosk mode).

// ------------------------------------------------------------------
// Storage key constants
// ------------------------------------------------------------------
const KEYS = {
    ITEMS:     'spicystop_items',
    CUSTOMERS: 'spicystop_customers',
    ORDERS:    'spicystop_orders',
};

// ------------------------------------------------------------------
// Seed data - default Sri Lankan spicy menu
// ------------------------------------------------------------------
const SEED_ITEMS = [
    { id: 'I001', name: 'Kottu Roti (Chicken)', price: 850,  stock: 30, image: 'img/spicy-kottu.jpg',          category: 'Mains'     },
    { id: 'I002', name: 'Spicy Egg Hopper',     price: 250,  stock: 50, image: 'img/spycy-egg-hoppers.jpg',    category: 'Breakfast' },
    { id: 'I003', name: 'Beef Kottu',           price: 950,  stock: 25, image: 'img/beef-kottu.jpg',           category: 'Mains'     },
    { id: 'I004', name: 'Chili Cheese Kottu',   price: 1050, stock: 20, image: 'img/cheele-chees-kottu.jpg',   category: 'Mains'     },
    { id: 'I005', name: 'Isso Wade (Prawn)',     price: 400,  stock: 40, image: 'img/isso-wade.jpg',            category: 'Snacks'    },
    { id: 'I006', name: 'Hot Butter Cuttlefish',price: 1200, stock: 15, image: 'img/hot-butter.jpg',           category: 'Seafood'   },
    { id: 'I007', name: 'Plain Hopper (3pcs)',   price: 180,  stock: 60, image: 'img/hoppers.jpg',              category: 'Breakfast' },
    { id: 'I008', name: 'Pol Sambol',            price: 150,  stock: 100,image: 'img/pol-sambol.jpg',           category: 'Sides'     },
    { id: 'I009', name: 'Ginger Beer (Homemade)',price: 280, stock: 45, image: 'img/soft-drinks.jpg',          category: 'Drinks'    },
    { id: 'I010', name: 'Faluda',               price: 450,  stock: 35, image: 'img/faluda.jpg',               category: 'Desserts'  },
];

// ------------------------------------------------------------------
// In-memory store - arrays that hold live data during a session
// ------------------------------------------------------------------
let store = {
    [KEYS.ITEMS]:     [...SEED_ITEMS],
    [KEYS.CUSTOMERS]: [],
    [KEYS.ORDERS]:    [],
};

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

// Returns the live array for a given key, or empty array as fallback.
function read(key) {
    return Array.isArray(store[key]) ? store[key] : [];
}

// Replaces the live array for a given key.
// Validates that `data` is an array before writing.
function write(key, data) {
    if (!Array.isArray(data)) {
        console.error(`[DB] write() expected an array for key "${key}", got ${typeof data}`);
        return;
    }
    store[key] = data;
}

// ------------------------------------------------------------------
// ID generation
// Scans the existing records for the given key, finds the highest
// numeric suffix, increments it, and zero-pads to 3 digits.
// Example: prefix "I", existing ["I001","I009"] -> returns "I010"
// ------------------------------------------------------------------
function generateNextId(key, prefix) {
    const records = read(key);

    if (records.length === 0) {
        return `${prefix}001`;
    }

    // Build a regex that matches exactly "PREFIX" followed by digits
    const pattern = new RegExp(`^${prefix}(\\d+)$`);

    const maxNum = records.reduce((max, record) => {
        const match = record.id?.match(pattern);
        if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
        }
        return max;
    }, 0);

    // Pad to at least 3 digits (e.g. 11 -> "011")
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

// ------------------------------------------------------------------
// Exported database interface
// All model classes interact with data through this object only.
// ------------------------------------------------------------------
export const db = {

    // Item operations
    getItems:   ()      => read(KEYS.ITEMS),
    saveItems:  (items) => write(KEYS.ITEMS, items),
    nextItemId: ()      => generateNextId(KEYS.ITEMS, 'I'),

    // Customer operations
    getCustomers:   ()     => read(KEYS.CUSTOMERS),
    saveCustomers:  (data) => write(KEYS.CUSTOMERS, data),
    nextCustomerId: ()     => generateNextId(KEYS.CUSTOMERS, 'C'),

    // Order operations
    getOrders:   ()     => read(KEYS.ORDERS),
    saveOrders:  (data) => write(KEYS.ORDERS, data),
    nextOrderId: ()     => generateNextId(KEYS.ORDERS, 'O'),

    // Reset menu items to seed data (useful for demo reset)
    resetMenu: () => {
        store[KEYS.ITEMS] = [...SEED_ITEMS];
    },
};
