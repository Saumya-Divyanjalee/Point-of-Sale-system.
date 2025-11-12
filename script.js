// script.js - Spicy Stop POS System (Sri Lanka)

import { ItemController } from './controller/ItemController.js';
import { CustomerController } from './controller/CustomerController.js';
import { OrderController } from './controller/OrderController.js';

class SpicyStopApp {
    constructor() {
        // Instantiate Controllers
        this.itemController = new ItemController();
        this.customerController = new CustomerController();
        this.orderController = new OrderController(this.itemController);

        // Global access for inline event handlers
        window.itemController = this.itemController;
        window.customerController = this.customerController;
        window.orderController = this.orderController;
        window.app = this;

        this.setupNavigation();
        this.setupLogin();

        // DOM Ready
        document.addEventListener('DOMContentLoaded', () => {
            const mainContent = document.getElementById('mainContent');
            if (mainContent && mainContent.style.display === 'block') {
                this.updateDashboardStats();
            } else {
                this.itemController.loadMenuItems();
                this.customerController.loadCustomers();
            }
        });
    }

    setupNavigation() {
        // Navigation handled via inline onclick in HTML
    }

    setupLogin() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Spicy Stop Admin Credentials
            if (username === 'admin' && password === 'spicy123') {
                this.showLoginSuccess();
            } else {
                this.showLoginError();
            }
        });
    }

    showLoginSuccess() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('mainContent').style.display = 'block';

        const dashboardLink = document.querySelector('.nav-link[onclick*="dashboard"]');
        if (dashboardLink) {
            this.showSection('dashboard', dashboardLink);
        }
    }

    showLoginError() {
        const errorMsg = document.getElementById('loginError');
        if (errorMsg) {
            errorMsg.style.display = 'block';
            setTimeout(() => errorMsg.style.display = 'none', 3000);
        } else {
            alert('Invalid credentials! Try: admin / spicy123');
        }
    }

    showSection(section, element) {
        const sections = ['dashboard', 'item-management', 'pos', 'order-history', 'customers'];
        sections.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.style.display = s === section ? 'block' : 'none';
        });

        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        element.classList.add('active');

        // Load section-specific data
        switch (section) {
            case 'item-management':
                this.itemController.loadMenuItems();
                break;
            case 'pos':
                this.loadPOS();
                break;
            case 'order-history':
                this.orderController.loadOrderHistory();
                break;
            case 'customers':
                this.customerController.loadCustomers();
                break;
            case 'dashboard':
                this.updateDashboardStats();
                break;
        }
    }

    logout() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('mainContent').style.display = 'none';

        // Clear form
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        if (username) username.value = '';
        if (password) password.value = '';

        // Reset active nav
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    }

    // === POS View ===
    loadPOS() {
        const items = this.itemController.getAllItems();
        const grid = document.getElementById('menuGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const availableItems = items.filter(item => item.stock > 0);
        if (availableItems.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No items in stock</div>';
            return;
        }

        availableItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="item-card spicy-card" onclick="orderController.addToCart('${item.id}')">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='../images/placeholder.jpg'">
                        <div class="item-overlay">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">LKR ${item.price.toFixed(2)}</div>
                            <div class="item-stock">${item.stock} left</div>
                            ${item.category ? `<div class="item-category">${item.category}</div>` : ''}
                        </div>
                    </div>
                    <div class="item-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="mb-0 text-truncate">${item.name}</h5>
                            <span class="item-price">LKR ${item.price.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart btn-spicy w-100">
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });

        this.orderController.updateCartDisplay();
        this.customerController.loadCustomerSelect();
    }

    // === Dashboard Stats ===
    updateDashboardStats() {
        const allOrders = this.orderController.getAllOrders();
        const allCustomers = this.customerController.getAllCustomers();
        const allItems = this.itemController.getAllItems();

        const today = new Date();
        const todayStr = today.toDateString();

        const todayOrders = allOrders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate.toDateString() === todayStr;
        });

        const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

        // Update DOM
        this.safeSetText('todaySales', `LKR ${todaySales.toFixed(2)}`);
        this.safeSetText('todayOrders', todayOrders.length);
        this.safeSetText('totalCustomers', allCustomers.length);
        this.safeSetText('menuItems', allItems.length);

        this.updateRecentOrders(allOrders);
        this.updateLowStockAlert(allItems);
    }

    safeSetText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    updateLowStockAlert(items) {
        const lowStock = items.filter(i => i.stock > 0 && i.stock <= 5);
        const alert = document.getElementById('lowStockAlert');
        if (!alert) return;

        if (lowStock.length > 0) {
            alert.innerHTML = `
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>${lowStock.length}</strong> item${lowStock.length > 1 ? 's' : ''} low in stock!
            `;
            alert.style.display = 'block';
        } else {
            alert.style.display = 'none';
        }
    }

    updateRecentOrders(allOrders) {
        const tbody = document.getElementById('recentOrders');
        if (!tbody) return;

        const recent = allOrders
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        tbody.innerHTML = '';

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No orders yet</td></tr>';
            return;
        }

        recent.forEach(order => {
            const customer = this.customerController.getCustomerById(order.customerId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${customer ? customer.name : 'Walk-in'}</td>
                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                <td>
                    <span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">
                        ${order.status}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.spicyStopApp = new SpicyStopApp();
});