// database.js - Spicy Stop (Sri Lanka) - Spicy Food & Snacks POS

// LocalStorage Keys (prefixed with shop name)
const LS_KEYS = {
    MENU_ITEMS: 'spicystop_menuItems',
    CUSTOMERS: 'spicystop_customers',
    ORDERS: 'spicystop_orders',
};

// Default Spicy Sri Lankan Menu Items
const INITIAL_ITEMS = [
    {
        id: 'I001',
        name: 'Kottu Roti (Chicken)',
        price: 850,
        stock: 30,
        image: 'img/spicy-kottu.jpg',
        category: 'Mains'
    },
    {
        id: 'I002',
        name: 'Spicy Egg Hopper',
        price: 250,
        stock: 50,
        image: 'img/spycy-egg-hoppers.jpg',
        category: 'Breakfast'
    },
    {
        id: 'I003',
        name: 'Beef Kottu',
        price: 950,
        stock: 25,
        image: 'img/beef-kottu.jpg',
        category: 'Mains'
    },
    {
        id: 'I004',
        name: 'Chili Cheese Kottu',
        price: 1050,
        stock: 20,
        image: 'img/cheele-chees-kottu.jpg',
        category: 'Mains'
    },
    {
        id: 'I005',
        name: 'Isso Wade (Prawn)',
        price: 400,
        stock: 40,
        image: 'img/isso-wade.jpg',
        category: 'Snacks'
    },
    {
        id: 'I006',
        name: 'Hot Butter Cuttlefish',
        price: 1200,
        stock: 15,
        image: 'img/hot-butter.jpg',
        category: 'Seafood'
    },
    {
        id: 'I007',
        name: 'Plain Hopper (3pcs)',
        price: 180,
        stock: 60,
        image: 'img/hoppers.jpg',
        category: 'Breakfast'
    },
    {
        id: 'I008',
        name: 'Pol Sambol',
        price: 150,
        stock: 100,
        image: 'img/pol-sambol.jpg',
        category: 'Sides'
    },
    {
        id: 'I009',
        name: 'Ginger Beer (Homemade)',
        price: 280,
        stock: 45,
        image: 'img/soft-drinks.jpg',
        category: 'Drinks'
    },
    {
        id: 'I010',
        name: 'Faluda',
        price: 450,
        stock: 35,
        image: 'img/faluda.jpg',
        category: 'Desserts'
    }
];

// In-memory data storage
let menuItems = [...INITIAL_ITEMS];
let customers = [];
let orders = [];

// Load data from in-memory store
function loadData(key) {
    switch (key) {
        case LS_KEYS.MENU_ITEMS: return menuItems;
        case LS_KEYS.CUSTOMERS: return customers;
        case LS_KEYS.ORDERS: return orders;
        default: return [];
    }
}

// Save data to in-memory store
function saveData(key, data) {
    switch (key) {
        case LS_KEYS.MENU_ITEMS: menuItems = Array.isArray(data) ? data : []; break;
        case LS_KEYS.CUSTOMERS: customers = Array.isArray(data) ? data : []; break;
        case LS_KEYS.ORDERS: orders = Array.isArray(data) ? data : []; break;
    }
}

// Exported DB Object
export const db = {
    // Menu Items CRUD
    getItems: () => loadData(LS_KEYS.MENU_ITEMS),
    saveItems: (items) => saveData(LS_KEYS.MENU_ITEMS, items),

    // Customers CRUD
    getCustomers: () => loadData(LS_KEYS.CUSTOMERS),
    saveCustomers: (custs) => saveData(LS_KEYS.CUSTOMERS, custs),

    // Orders CRUD
    getOrders: () => loadData(LS_KEYS.ORDERS),
    saveOrders: (ords) => saveData(LS_KEYS.ORDERS, ords),

    // Generate next ID (e.g., I011, C001, O001)
    getNextId: (key, prefix = 'I') => {
        const data = loadData(key);
        if (!Array.isArray(data) || data.length === 0) {
            return `${prefix}001`;
        }

        const numbers = data
            .map(item => {
                const match = item.id?.match(new RegExp(`^${prefix}(\\d+)$`));
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => !isNaN(num));

        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
    },

    // Reset to initial spicy menu (useful for demo/reset)
    resetMenu: () => {
        menuItems = [...INITIAL_ITEMS];
    }
};