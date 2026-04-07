// controller/OrderController.js
// Manages the shopping cart (POS), order placement, and order history table.

import { OrderModel } from '../model/OrderModel.js';
import { ItemModel }  from '../model/ItemModel.js';

export class OrderController {

    constructor(itemController) {
        this.itemController = itemController;

        // Cart is an array of { item: ItemDTO, quantity: number }.
        this.cart = [];

        // Cached DOM references.
        this.historyTableBody   = document.getElementById('historyTable');
        this.cartItemsContainer = document.getElementById('cartItems');
        this.orderTotalEl       = document.getElementById('orderTotal');
        this.cartBadge          = document.getElementById('cartBadge');
        this.placeOrderBtn      = document.getElementById('placeOrderBtn');

        this._bindButtons();
        this.updateCartDisplay();
    }

    // ------------------------------------------------------------------
    // Button wiring
    // ------------------------------------------------------------------

    _bindButtons() {
        // The "Clear" button on the cart panel
        const clearBtn = document.querySelector('.order-card .btn-clear');
        if (clearBtn) clearBtn.onclick = () => this.clearCart();
    }

    // ------------------------------------------------------------------
    // Cart management
    // ------------------------------------------------------------------

    // Add one unit of an item to the cart.
    // Reads live stock from ItemModel so we always reflect current reality.
    addToCart(itemId) {
        const item = ItemModel.getById(itemId);

        if (!item) {
            this._showCartError('This item no longer exists.');
            return;
        }

        if (item.stock <= 0) {
            this._showCartError(`"${item.name}" is out of stock.`);
            return;
        }

        const existing = this.cart.find(c => c.item.id === itemId);

        if (existing) {
            // Make sure we do not exceed available stock before incrementing.
            if (existing.quantity >= item.stock) {
                this._showCartError(`Only ${item.stock} of "${item.name}" available.`);
                return;
            }
            existing.quantity++;
        } else {
            this.cart.push({ item, quantity: 1 });
        }

        this.updateCartDisplay();
    }

    // Remove a cart line by its index in the cart array.
    removeFromCart(index) {
        if (index < 0 || index >= this.cart.length) return;
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    }

    // Empty the cart.
    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
    }

    // ------------------------------------------------------------------
    // Cart display
    // ------------------------------------------------------------------

    updateCartDisplay() {
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No items in cart</p>
                </div>`;
            this.orderTotalEl.textContent = 'LKR 0.00';
            this.cartBadge.textContent    = '0';
            this.placeOrderBtn.disabled   = true;
            return;
        }

        let total = 0;
        this.cartItemsContainer.innerHTML = '';

        this.cart.forEach((entry, index) => {
            const lineTotal = entry.item.price * entry.quantity;
            total += lineTotal;

            const div       = document.createElement('div');
            div.className   = 'cart-item';
            div.innerHTML   = `
                <div>
                    <div class="cart-item-name">${this._escape(entry.item.name)}</div>
                    <div class="cart-item-qty">x${entry.quantity}</div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="cart-item-price">LKR ${lineTotal.toFixed(2)}</span>
                    <button class="cart-item-remove ms-2"
                            onclick="orderController.removeFromCart(${index})"
                            title="Remove item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            this.cartItemsContainer.appendChild(div);
        });

        this.orderTotalEl.textContent = `LKR ${total.toFixed(2)}`;
        this.cartBadge.textContent    = this.cart.reduce((sum, c) => sum + c.quantity, 0);
        this.placeOrderBtn.disabled   = false;
    }

    // ------------------------------------------------------------------
    // Order placement
    // ------------------------------------------------------------------

    placeOrder() {
        if (this.cart.length === 0) {
            this._showCartError('Your cart is empty.');
            return;
        }

        const customerId = document.getElementById('customerSelect').value || null;

        // Delegate to OrderModel which handles stock validation and deduction.
        const result = OrderModel.create(customerId, this.cart);

        if (!result.success) {
            // Model returns a human-readable error (e.g. insufficient stock).
            this._showCartError(result.error);
            return;
        }

        const order = result.data;
        alert(`Order ${order.id} placed.\nTotal: LKR ${order.total.toFixed(2)}`);

        // Reset cart and refresh all affected views.
        this.cart = [];
        this.updateCartDisplay();
        window.app.loadPOS();               // Refresh item cards (updated stock)
        window.app.updateDashboardStats();  // Refresh dashboard numbers
    }

    // ------------------------------------------------------------------
    // Order history
    // ------------------------------------------------------------------

    loadOrderHistory() {
        const orders = OrderModel.getAll()
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        this.historyTableBody.innerHTML = '';

        if (orders.length === 0) {
            this.historyTableBody.innerHTML =
                '<tr><td colspan="7" class="text-center py-4 text-muted">No orders yet.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const customer = window.app.customerController.getCustomerById(order.customerId);
            const date     = new Date(order.date);
            const tr       = document.createElement('tr');

            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${date.toLocaleString()}</td>
                <td>${customer ? this._escape(customer.name) : 'Walk-in'}</td>
                <td>${order.items.length} item${order.items.length !== 1 ? 's' : ''}</td>
                <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                <td>
                    <span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-view"
                            onclick="orderController.viewOrder('${order.id}')"
                            title="View order details"
                            style="background: var(--secondary); color: white;">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>`;
            this.historyTableBody.appendChild(tr);
        });

        if (window.app) window.app.updateDashboardOrdersCount(orders.length);
    }

    // Show a simple alert with full order details.
    viewOrder(orderId) {
        const order = OrderModel.getById(orderId);
        if (!order) {
            alert('Order not found.');
            return;
        }

        const customer = window.app.customerController.getCustomerById(order.customerId);

        // Build the item lines, looking up each item name from the item controller.
        const allItems = this.itemController.getAllItems();
        const lines    = order.items.map(entry => {
            const menuItem = allItems.find(m => m.id === entry.itemId);
            const name     = menuItem ? menuItem.name : `Unknown (${entry.itemId})`;
            return `  ${name} x${entry.quantity}  -  LKR ${(entry.price * entry.quantity).toFixed(2)}`;
        }).join('\n');

        alert(
            `Order: ${order.id}\n` +
            `Date: ${new Date(order.date).toLocaleString()}\n` +
            `Customer: ${customer ? customer.name : 'Walk-in'}\n\n` +
            `Items:\n${lines}\n\n` +
            `Total: LKR ${order.total.toFixed(2)}\n` +
            `Status: ${order.status}`
        );
    }

    // ------------------------------------------------------------------
    // Data access helpers used by other controllers
    // ------------------------------------------------------------------

    getAllOrders() {
        return OrderModel.getAll();
    }

    getOrdersByCustomerId(customerId) {
        return OrderModel.getByCustomerId(customerId);
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Display a brief error message near the cart.
    _showCartError(message) {
        const el = document.getElementById('cartMsg');
        if (!el) { alert(message); return; }
        el.textContent   = message;
        el.className     = 'form-msg form-msg-error';
        el.style.display = 'block';
        setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
    }
}
