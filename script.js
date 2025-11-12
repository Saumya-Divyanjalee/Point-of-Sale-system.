// script.js
import { ItemController } from './controller/ItemController.js';
import { CustomerController } from './controller/CustomerController.js';
import { OrderController } from './controller/OrderController.js';

class LuxeBrewApp {
    constructor() {
        // Instantiate Controllers
        this.itemController = new ItemController();
        this.customerController = new CustomerController();
        this.orderController = new OrderController(this.itemController);

        // Make controllers globally accessible for use in inline HTML event handlers
        window.itemController = this.itemController;
        window.customerController = this.customerController;
        window.orderController = this.orderController;
        window.app = this;

        this.setupNavigation();
        this.setupLogin();

        // Initial setup (run once DOM is ready)
        document.addEventListener('DOMContentLoaded', () => {
            // If the main content is already visible (e.g., if we were using LS and session state), update dashboard
            if (document.getElementById('mainContent').style.display === 'block') {
                this.updateDashboardStats();
            } else {
                // Initialize the item and customer data structures for use on first login
                this.itemController.loadMenuItems();
                this.customerController.loadCustomers();
            }
        });
    }

    setupNavigation() {
        // Handled by inline onclick
    }

    setupLogin() {
        // FIX: Login logic added back to the form submit event
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'luxe123') {
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('sidebar').style.display = 'block';
                document.getElementById('mainContent').style.display = 'block';

                // Show dashboard and set active link
                const dashboardLink = document.querySelector('.nav-link[onclick*="dashboard"]');
                if (dashboardLink) {
                    this.showSection('dashboard', dashboardLink);
                }
            } else {
                alert('Invalid credentials! Use: admin / luxe123');
            }
        });
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

        // Load section data via Controllers
        if (section === 'item-management') this.itemController.loadMenuItems();
        if (section === 'pos') this.loadPOS();
        if (section === 'order-history') this.orderController.loadOrderHistory();
        if (section === 'customers') this.customerController.loadCustomers();
        if (section === 'dashboard') this.updateDashboardStats();
    }

    logout() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        // Reset active nav
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector('.nav-link[onclick*="dashboard"]').classList.add('active');
    }

    // POS View Logic
    loadPOS() {
        const items = this.itemController.getAllItems();
        const grid = document.getElementById('menuGrid');
        grid.innerHTML = '';

        items.forEach(item => {
            if (item.stock > 0) {
                const col = document.createElement('div');
                col.className = 'col-md-6';
                col.innerHTML = `
                    <div class="item-card" onclick="orderController.addToCart('${item.id}')">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-overlay">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">LKR ${item.price.toFixed(2)}</div>
                                <div class="item-stock">${item.stock} in stock</div>
                            </div>
                        </div>
                        <div class="item-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">${item.name}</h5>
                                <span class="item-price">LKR ${item.price.toFixed(2)}</span>
                            </div>
                            <button class="add-to-cart">
                                <i class="fas fa-cart-plus me-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(col);
            }
        });

        this.orderController.updateCartDisplay();
        this.customerController.loadCustomerSelect();
    }

    // Dashboard Logic
    updateDashboardStats() {
        const allOrders = this.orderController.getAllOrders();
        const allCustomers = this.customerController.getAllCustomers();
        const allItems = this.itemController.getAllItems();

        const today = new Date().toDateString();
        const todayOrders = allOrders.filter(o => new Date(o.date).toDateString() === today);
        const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

        document.getElementById('todaySales').textContent = `LKR ${todaySales.toFixed(2)}`;
        document.getElementById('todayOrders').textContent = todayOrders.length;
        document.getElementById('totalCustomers').textContent = allCustomers.length;
        document.getElementById('menuItems').textContent = allItems.length;

        this.updateRecentOrders(allOrders);
    }

    updateDashboardItemsCount(count) {
        document.getElementById('menuItems').textContent = count;
    }

    updateDashboardCustomersCount(count) {
        document.getElementById('totalCustomers').textContent = count;
    }

    updateDashboardOrdersCount(count) {
        // Not used for dashboard total, but kept for future expansion if needed
    }

    updateRecentOrders(allOrders) {
        // Sort orders by date descending to get the latest 5
        const recent = allOrders.slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        const tbody = document.getElementById('recentOrders');
        tbody.innerHTML = '';

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No orders yet</td></tr>';
        } else {
            recent.forEach(order => {
                const customer = this.customerController.getAllCustomers().find(c => c.id === order.customerId);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${customer ? customer.name : 'Walk-in'}</td>
                    <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                    <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                    <td><span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LuxeBrewApp();
});