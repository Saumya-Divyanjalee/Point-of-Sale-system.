import { Database } from 'db/database.js';
import { AuthController } from 'controller/AuthController.js';
import { ItemController } from 'controller/itemController.js';
import { CustomerController } from 'controller/customerController.js';
import { OrderController } from 'controller/orderController.js';

import { LoginView } from './view/LoginView.js';
import { DashboardView } from './view/DashboardView.js';
import { ItemView } from './view/ItemView.js';
import { POSView } from './view/POSView.js';
import { OrderHistoryView } from './view/OrderHistoryView.js';
import { CustomerView } from './view/CustomerView.js';

const db = new Database();
const authController = new AuthController();
const itemController = new ItemController(db);
const customerController = new CustomerController(db);
const orderController = new OrderController(db);

const loginView = new LoginView(authController);
const dashboardView = new DashboardView(orderController, customerController, itemController);
const itemView = new ItemView(itemController);
const posView = new POSView(itemController, orderController, customerController);
const orderHistoryView = new OrderHistoryView(orderController);
const customerView = new CustomerView(customerController);

let currentView = null;

function showSection(section) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');

    const container = document.getElementById('mainContent');
    container.innerHTML = '';

    switch (section) {
        case 'dashboard': currentView = dashboardView; break;
        case 'item-management': currentView = itemView; break;
        case 'pos': currentView = posView; break;
        case 'order-history': currentView = orderHistoryView; break;
        case 'customers': currentView = customerView; break;
    }
    currentView.render();
}

// Bind navigation
document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// Update cart badge
setInterval(() => {
    const badge = document.getElementById('cartBadge');
    if (posView && posView.cart) {
        const total = posView.cart.reduce((s, c) => s + c.quantity, 0);
        badge.textContent = total;
    }
}, 500);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loginView.render();
});