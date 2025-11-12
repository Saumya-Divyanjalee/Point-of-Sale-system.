// database.js

// Keys are no longer strictly needed but kept for structure identification
const LS_KEYS = {
    MENU_ITEMS: 'luxebrew_menuItems',
    CUSTOMERS: 'luxebrew_customers',
    ORDERS: 'luxebrew_orders',
};

// Default initial data
const INITIAL_ITEMS = [
    { id: 'I001', name: 'Cappuccino', price: 450, stock: 50, image:'../images/cappuchino.jpg'},
    { id: 'I002', name: 'Espresso', price: 350, stock: 80, image: '../images/espresso.jpg' },
    { id: 'I003', name: 'Latte Macchiato', price: 480, stock: 40, image: '../images/Latte Macchiato.jpg' },
    { id: 'I004', name: 'Chocolate Cake', price: 380, stock: 25, image: '../images/Chocolate Cake2.png' },
    { id: 'I005', name: 'Croissant', price: 280, stock: 60, image: '../images/Croissant.jpg' },
    { id: 'I006', name: 'Green Tea', price: 320, stock: 70, image: '../images/Green Tea.jpg' }
];

// In-memory data storage (arrays)
let menuItems = [...INITIAL_ITEMS]; // Use spread to create a true copy
let customers = [];
let orders = [];

// Functions to interact with in-memory arrays
function loadData(key) {
    if (key === LS_KEYS.MENU_ITEMS) return menuItems;
    if (key === LS_KEYS.CUSTOMERS) return customers;
    if (key === LS_KEYS.ORDERS) return orders;
    return [];
}

function saveData(key, data) {
    if (key === LS_KEYS.MENU_ITEMS) menuItems = data;
    if (key === LS_KEYS.CUSTOMERS) customers = data;
    if (key === LS_KEYS.ORDERS) orders = data;
}

export const db = {
    // Items CRUD
    getItems: () => loadData(LS_KEYS.MENU_ITEMS),
    saveItems: (items) => saveData(LS_KEYS.MENU_ITEMS, items),

    // Customers CRUD
    getCustomers: () => loadData(LS_KEYS.CUSTOMERS),
    saveCustomers: (customers) => saveData(LS_KEYS.CUSTOMERS, customers),

    // Orders CRUD
    getOrders: () => loadData(LS_KEYS.ORDERS),
    saveOrders: (orders) => saveData(LS_KEYS.ORDERS, orders),

    // Get Next ID Helper
    getNextId: (key, prefix) => {
        const data = loadData(key, []);
        // Find the highest number to generate the next ID
        const lastIdNum = data.reduce((max, item) => {
            const idNumberMatch = item.id ? item.id.match(/\d+$/) : null;
            if (idNumberMatch) {
                const currentNum = parseInt(idNumberMatch[0]);
                return Math.max(max, currentNum);
            }
            return max;
        }, 0);

        return prefix + String(lastIdNum + 1).padStart(3, '0');
    }
};