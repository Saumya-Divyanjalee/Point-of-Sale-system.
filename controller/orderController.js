// controller/OrderController.js
import { OrderModel } from '../model/OrderModel.js';
import { ItemModel } from '../model/ItemModel.js';

export class OrderController {
    constructor(itemController) {
        this.itemController = itemController;
        this.cart = [];
        this.historyTableBody = document.getElementById('historyTable');

        this.cartItemsContainer = document.getElementById('cartItems');
        this.orderTotalEl = document.getElementById('orderTotal');
        this.cartBadge = document.getElementById('cartBadge');
        this.placeOrderBtn = document.getElementById('placeOrderBtn');

        this.setupListeners();
        this.updateCartDisplay();
    }

    setupListeners() {
        document.querySelector('.order-card .btn-clear').onclick = () => this.clearCart();
    }

    // Cart / POS Logic
    addToCart(itemId) {
        const item = ItemModel.getById(itemId);
        if (!item || item.stock <= 0) {
            alert('Item is out of stock.');
            return;
        }

        const existing = this.cart.find(c => c.item.id === itemId);
        if (existing) {
            if (existing.quantity >= item.stock) {
                alert('Not enough stock!');
                return;
            }
            existing.quantity++;
        } else {
            // Push a reference to the item data structure (ItemDTO)
            this.cart.push({ item, quantity: 1 });
        }

        this.updateCartDisplay();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    }

    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No items in cart</p>
                </div>
            `;
            this.orderTotalEl.textContent = 'LKR 0.00';
            this.cartBadge.textContent = '0';
            this.placeOrderBtn.disabled = true;
            return;
        }

        let total = 0;
        this.cartItemsContainer.innerHTML = '';

        this.cart.forEach((entry, index) => {
            const itemTotal = entry.item.price * entry.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <div class="cart-item-name">${entry.item.name}</div>
                    <div class="cart-item-qty">x${entry.quantity}</div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="cart-item-price">LKR ${itemTotal.toFixed(2)}</span>
                    <button class="cart-item-remove ms-2" onclick="orderController.removeFromCart(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            this.cartItemsContainer.appendChild(div);
        });

        this.orderTotalEl.textContent = `LKR ${total.toFixed(2)}`;
        this.cartBadge.textContent = this.cart.reduce((sum, c) => sum + c.quantity, 0);
        this.placeOrderBtn.disabled = false;
    }

    placeOrder() {
        if (this.cart.length === 0) return;

        // 1. Deduct stock and update ItemModel
        let items = ItemModel.getAll();

        // Final stock check and deduction
        for (let entry of this.cart) {
            const itemIndex = items.findIndex(i => i.id === entry.item.id);
            if (itemIndex !== -1) {
                if (entry.quantity > items[itemIndex].stock) {
                    alert(`Not enough stock for ${entry.item.name}. Available: ${items[itemIndex].stock}`);
                    return;
                }
                items[itemIndex].stock -= entry.quantity;
            }
        }
        ItemModel.saveAll(items); // Save updated stock

        // 2. Create and save order
        const customerId = document.getElementById('customerSelect').value || null;
        const newOrder = OrderModel.create(customerId, this.cart);

        alert(`Order ${newOrder.id} placed successfully! Total: LKR ${newOrder.total.toFixed(2)}`);

        // 3. Reset POS and refresh affected views
        this.cart = [];
        this.updateCartDisplay();
        window.app.loadPOS(); // Reload POS menu to reflect new stock
        window.app.updateDashboardStats(); // Refresh dashboard stats and recent orders
    }

    // History Logic
    loadOrderHistory() {
        const orders = OrderModel.getAll();
        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.historyTableBody.innerHTML = '';

        if (orders.length === 0) {
            this.historyTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No orders found</td></tr>';
            return;
        }

        orders.forEach(order => {
            const customer = window.app.customerController.getAllCustomers().find(c => c.id === order.customerId);
            const date = new Date(order.date);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${date.toLocaleString()}</td>
                <td>${customer ? customer.name : 'Walk-in'}</td>
                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                <td><strong>LKR ${order.total.toFixed(2)}</strong></td>
                <td><span class="badge ${order.status === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm" style="background: var(--secondary); color: white;" onclick="orderController.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            this.historyTableBody.appendChild(tr);
        });
        window.app.updateDashboardOrdersCount(orders.length);
    }

    viewOrder(orderId) {
        const order = OrderModel.getById(orderId);
        if (!order) return;

        let items = '';
        order.items.forEach(item => {
            const menuItem = this.itemController.getAllItems().find(m => m.id === item.itemId);
            items += `${menuItem ? menuItem.name : 'Unknown'} x${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        const customer = window.app.customerController.getAllCustomers().find(c => c.id === order.customerId);
        alert(`
Order Details - ${order.id}
Date: ${new Date(order.date).toLocaleString()}
Customer: ${customer ? customer.name : 'Walk-in'}

Items:
${items}
Total: LKR ${order.total.toFixed(2)}
Status: ${order.status}
        `.trim());
    }

    getAllOrders() {
        return OrderModel.getAll();
    }

    getOrdersByCustomerId(customerId) {
        return OrderModel.getAll().filter(o => o.customerId === customerId);
    }
}