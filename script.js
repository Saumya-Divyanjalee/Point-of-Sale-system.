// script.js
// Entry point for Spicy Stop POS System.
// Instantiates controllers, wires up login, navigation, and dashboard.

import { ItemController }     from './controller/ItemController.js';
import { CustomerController } from './controller/CustomerController.js';
import { OrderController }    from './controller/OrderController.js';

// ------------------------------------------------------------------
// Login credentials
// In a real production system credentials would never live in
// client-side JavaScript. For this demo, a hardcoded check is used.
// ------------------------------------------------------------------
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = '123';

// Maximum consecutive failed login attempts before a short lockout.
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS         = 30_000; // 30 seconds

// ------------------------------------------------------------------
// SpicyStopApp
// ------------------------------------------------------------------
class SpicyStopApp {

    constructor() {
        // Instantiate all controllers.
        // Order of instantiation matters: OrderController depends on itemController.
        this.itemController     = new ItemController();
        this.customerController = new CustomerController();
        this.orderController    = new OrderController(this.itemController);

        // Expose controllers globally so inline HTML onclick handlers can reach them.
        // (e.g. onclick="itemController.editMenuItem('I001')")
        window.itemController     = this.itemController;
        window.customerController = this.customerController;
        window.orderController    = this.orderController;
        window.app                = this;

        // Login security state
        this._loginAttempts  = 0;
        this._lockedUntil    = null;

        this._setupLogin();
        this._setupMobileMenu();
    }

    // ------------------------------------------------------------------
    // Login
    // ------------------------------------------------------------------

    _setupLogin() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleLoginSubmit();
        });
    }

    _handleLoginSubmit() {
        // Check lockout
        if (this._lockedUntil && Date.now() < this._lockedUntil) {
            const secondsLeft = Math.ceil((this._lockedUntil - Date.now()) / 1000);
            this._showLoginError(`Too many failed attempts. Try again in ${secondsLeft}s.`);
            return;
        }

        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');

        if (!usernameEl || !passwordEl) return;

        const username = usernameEl.value.trim();
        const password = passwordEl.value;

        // Basic input presence check
        if (!username || !password) {
            this._showLoginError('Please enter both username and password.');
            return;
        }

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            this._loginAttempts = 0;
            this._lockedUntil   = null;
            this._onLoginSuccess();
        } else {
            this._loginAttempts++;
            if (this._loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                this._lockedUntil   = Date.now() + LOCKOUT_MS;
                this._loginAttempts = 0;
                this._showLoginError('Too many failed attempts. Locked for 30 seconds.');
            } else {
                const remaining = MAX_LOGIN_ATTEMPTS - this._loginAttempts;
                this._showLoginError(
                    `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
                );
            }
            // Clear password field after a failed attempt
            passwordEl.value = '';
            passwordEl.focus();
        }
    }

    _onLoginSuccess() {
        document.getElementById('loginScreen').style.display  = 'none';
        document.getElementById('sidebar').style.display      = 'block';
        document.getElementById('mainContent').style.display  = 'block';

        const dashLink = document.querySelector('.nav-link[onclick*="dashboard"]');
        if (dashLink) this.showSection('dashboard', dashLink);
    }

    _showLoginError(message) {
        const el = document.getElementById('loginError');
        if (!el) { alert(message); return; }
        el.textContent   = message;
        el.style.display = 'block';
        // Auto-hide after 5 seconds
        clearTimeout(this._loginErrorTimer);
        this._loginErrorTimer = setTimeout(() => { el.style.display = 'none'; }, 5000);
    }

    logout() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('sidebar').style.display     = 'none';
        document.getElementById('mainContent').style.display = 'none';

        // Clear sensitive fields
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        if (usernameEl) usernameEl.value = '';
        if (passwordEl) passwordEl.value = '';

        // Remove active state from nav links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    }

    // ------------------------------------------------------------------
    // Section navigation
    // ------------------------------------------------------------------

    showSection(sectionId, clickedLink) {
        const ALL_SECTIONS = ['dashboard', 'item-management', 'pos', 'order-history', 'customers'];

        ALL_SECTIONS.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = id === sectionId ? 'block' : 'none';
        });

        // Update active nav link indicator
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        if (clickedLink) clickedLink.classList.add('active');

        // Close sidebar on mobile after navigation
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 1024 && sidebar) {
            sidebar.classList.remove('show');
        }

        // Load data for the section being shown
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
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
        }
    }

    // ------------------------------------------------------------------
    // POS menu grid
    // ------------------------------------------------------------------

    loadPOS() {
        const items = this.itemController.getAllItems();
        const grid  = document.getElementById('menuGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const available = items.filter(item => item.stock > 0);

        if (available.length === 0) {
            grid.innerHTML =
                '<div class="col-12 text-center text-muted py-5"><i class="fas fa-exclamation-circle fa-2x mb-3"></i><p>No items currently in stock.</p></div>';
            return;
        }

        available.forEach(item => {
            const col       = document.createElement('div');
            col.className   = 'col-md-6 col-lg-4';

            // Warn visually when stock is low (but not zero)
            const stockWarning = item.stock < 10
                ? `<span class="low-stock">${item.stock} left</span>`
                : `${item.stock} left`;

            col.innerHTML = `
                <div class="item-card"
                     onclick="orderController.addToCart('${item.id}')"
                     role="button"
                     tabindex="0"
                     aria-label="Add ${this._escape(item.name)} to cart">
                    <div class="item-image">
                        <img src="${item.image}"
                             alt="${this._escape(item.name)}"
                             onerror="this.src='img/placeholder.jpg'">
                        <div class="item-overlay">
                            <div class="item-name">${this._escape(item.name)}</div>
                            <div class="item-price">LKR ${item.price.toFixed(2)}</div>
                            <div class="item-stock">${stockWarning}</div>
                        </div>
                    </div>
                    <div class="item-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="mb-0 text-truncate me-2">${this._escape(item.name)}</h5>
                            <span class="item-price text-nowrap">LKR ${item.price.toFixed(2)}</span>
                        </div>
                        ${item.category
                ? `<small class="text-muted d-block mb-2">${this._escape(item.category)}</small>`
                : ''}
                        <button class="add-to-cart w-100">
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>`;
            grid.appendChild(col);
        });

        // Refresh the cart display and customer dropdown.
        this.orderController.updateCartDisplay();
        this.customerController.loadCustomerSelect();
    }

    // ------------------------------------------------------------------
    // Dashboard statistics
    // ------------------------------------------------------------------

    updateDashboardStats() {
        const allOrders    = this.orderController.getAllOrders();
        const allCustomers = this.customerController.getAllCustomers();
        const allItems     = this.itemController.getAllItems();

        // Compute today's totals
        const todayStr    = new Date().toDateString();
        const todayOrders = allOrders.filter(o => new Date(o.date).toDateString() === todayStr);
        const todaySales  = todayOrders.reduce((sum, o) => sum + o.total, 0);

        this._safeSetText('todaySales',    `LKR ${todaySales.toFixed(2)}`);
        this._safeSetText('todayOrders',   todayOrders.length);
        this._safeSetText('totalCustomers',allCustomers.length);
        this._safeSetText('menuItems',     allItems.length);

        this._renderRecentOrders(allOrders);
        this._renderLowStockAlert(allItems);
    }

    // Convenience setters called by controllers after mutating data.
    updateDashboardCustomersCount(count) { this._safeSetText('totalCustomers', count); }
    updateDashboardItemsCount(count)     { this._safeSetText('menuItems', count);      }
    updateDashboardOrdersCount(count)    { /* derived from today filter - no direct setter needed */ }

    _renderRecentOrders(allOrders) {
        const tbody = document.getElementById('recentOrders');
        if (!tbody) return;

        const recent = [...allOrders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        tbody.innerHTML = '';

        if (recent.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5" class="text-center py-4 text-muted">No orders yet.</td></tr>';
            return;
        }

        recent.forEach(order => {
            const customer = this.customerController.getCustomerById(order.customerId);
            const tr       = document.createElement('tr');
            tr.innerHTML   = `
                <td><strong>#${order.id}</strong></td>
                <td>${customer ? this._escape(customer.name) : 'Walk-in'}</td>
                <td>${order.items.length} item${order.items.length !== 1 ? 's' : ''}</td>
                <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                <td>
                    <span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">
                        ${order.status}
                    </span>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    _renderLowStockAlert(items) {
        const alertEl  = document.getElementById('lowStockAlert');
        if (!alertEl) return;

        const lowStock = items.filter(i => i.stock > 0 && i.stock <= 5);

        if (lowStock.length > 0) {
            const names = lowStock.map(i => `${i.name} (${i.stock})`).join(', ');
            alertEl.innerHTML =
                `<i class="fas fa-exclamation-triangle me-2"></i>
                 <strong>${lowStock.length} item${lowStock.length !== 1 ? 's' : ''} low in stock:</strong> ${this._escape(names)}`;
            alertEl.style.display = 'block';
        } else {
            alertEl.style.display = 'none';
        }
    }

    // ------------------------------------------------------------------
    // Mobile sidebar toggle
    // ------------------------------------------------------------------

    _setupMobileMenu() {
        const toggle  = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (!toggle || !sidebar) return;

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking the overlay area (outside sidebar)
        document.addEventListener('click', (e) => {
            if (
                window.innerWidth < 1024 &&
                sidebar.classList.contains('show') &&
                !sidebar.contains(e.target) &&
                e.target !== toggle
            ) {
                sidebar.classList.remove('show');
            }
        });
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    _safeSetText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

// ------------------------------------------------------------------
// Boot
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    window.spicyStopApp = new SpicyStopApp();
});
