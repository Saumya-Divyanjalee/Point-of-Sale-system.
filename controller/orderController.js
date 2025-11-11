// Order Controller - Handles order operations
const orderController = {
    currentOrder: {
        customerId: null,
        items: []
    },

    // Initialize controller
    init() {
        this.loadOrders();
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        const customerSelect = document.getElementById('orderCustomerSelect');
        if (customerSelect) {
            customerSelect.addEventListener('change', (e) => {
                this.currentOrder.customerId = e.target.value ? parseInt(e.target.value) : null;
            });
        }
    },

    // Select item to add to order
    selectItem(itemId) {
        try {
            const item = ItemModel.getById(itemId);

            if (item.qty === 0) {
                AlertUtil.showWarning('Item is out of stock');
                return;
            }

            const existingItem = this.currentOrder.items.find(i => i.id === itemId);

            if (existingItem) {
                if (existingItem.orderQty < item.qty) {
                    existingItem.orderQty++;
                } else {
                    AlertUtil.showWarning('Cannot add more than available stock');
                    return;
                }
            } else {
                this.currentOrder.items.push({
                    id: item.id,
                    code: item.code,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    orderQty: 1
                });
            }

            this.updateOrderSummary();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Update quantity of item in order
    updateQty(itemId, newQty) {
        try {
            const orderItem = this.currentOrder.items.find(i => i.id === itemId);
            if (!orderItem) return;

            newQty = parseInt(newQty);

            if (newQty < 1) {
                this.removeItem(itemId);
                return;
            }

            if (newQty > orderItem.qty) {
                AlertUtil.showWarning('Cannot exceed available stock');
                return;
            }

            orderItem.orderQty = newQty;
            this.updateOrderSummary();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Remove item from order
    removeItem(itemId) {
        this.currentOrder.items = this.currentOrder.items.filter(i => i.id !== itemId);
        this.updateOrderSummary();
    },

    // Update order summary display
    updateOrderSummary() {
        const list = document.getElementById('orderItemsList');
        if (!list) return;

        if (this.currentOrder.items.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No items selected</p></div>';
        } else {
            list.innerHTML = this.currentOrder.items.map(i => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="flex-grow-1">
                        <strong>${i.name}</strong>
                        <div class="input-group input-group-sm mt-1">
                            <button class="btn btn-outline-secondary" onclick="orderController.updateQty(${i.id}, ${i.orderQty - 1})">-</button>
                            <input type="number" class="form-control text-center" value="${i.orderQty}" min="1" max="${i.qty}" onchange="orderController.updateQty(${i.id}, this.value)">
                            <button class="btn btn-outline-secondary" onclick="orderController.updateQty(${i.id}, ${i.orderQty + 1})">+</button>
                        </div>
                    </div>
                    <div class="text-end ms-2">
                        <div>$${(i.price * i.orderQty).toFixed(2)}</div>
                        <button class="btn btn-sm btn-danger mt-1" onclick="orderController.removeItem(${i.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Calculate totals
        const subtotal = this.currentOrder.items.reduce((sum, item) => sum + (item.price * item.orderQty), 0);
        const tax = OrderModel.calculateTax(subtotal);
        const total = OrderModel.calculateTotal(subtotal, tax);

        document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    },

    // Place order
    placeOrder() {
        try {
            if (!this.currentOrder.customerId) {
                AlertUtil.showError('Please select a customer');
                return;
            }

            if (this.currentOrder.items.length === 0) {
                AlertUtil.showError('Please add items to the order');
                return;
            }

            const customer = CustomerModel.getById(this.currentOrder.customerId);

            const subtotal = this.currentOrder.items.reduce((sum, item) => sum + (item.price * item.orderQty), 0);
            const tax = OrderModel.calculateTax(subtotal);
            const total = OrderModel.calculateTotal(subtotal, tax);

            const order = {
                customerId: this.currentOrder.customerId,
                customerName: customer.name,
                customerContact: customer.contact,
                items: this.currentOrder.items.map(i => ({
                    id: i.id,
                    code: i.code,
                    name: i.name,
                    price: i.price,
                    qty: i.orderQty
                })),
                subtotal,
                tax,
                total
            };

            // Update stock for each item
            this.currentOrder.items.forEach(item => {
                ItemModel.updateStock(item.id, item.orderQty);
            });

            // Add order
            const savedOrder = OrderModel.add(order);

            AlertUtil.showSuccess(`Order placed successfully! Order ID: #${savedOrder.id}`);

            // Clear and refresh
            this.clearOrder();
            this.loadOrders();

            if (typeof itemController !== 'undefined') {
                itemController.loadItems();
            }
            if (typeof dashboardController !== 'undefined') {
                dashboardController.update();
            }
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Clear current order
    clearOrder() {
        this.currentOrder = {
            customerId: null,
            items: []
        };

        const customerSelect = document.getElementById('orderCustomerSelect');
        if (customerSelect) {
            customerSelect.value = '';
        }

        this.updateOrderSummary();
    },

    // Load order history
    loadOrders() {
        try {
            const orders = OrderModel.getAll();
            this.renderHistory(orders);
        } catch (error) {
            AlertUtil.showError('Failed to load orders: ' + error.message);
        }
    },

    // Render order history
    renderHistory(orders) {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5"><div class="empty-state"><i class="fas fa-history"></i><p>No orders placed yet</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customerName}</td>
                <td>${new Date(o.date).toLocaleString()}</td>
                <td>${o.items.length} items</td>
                <td><strong>$${o.total.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="orderController.viewDetails(${o.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // View order details
    viewDetails(orderId) {
        try {
            const order = OrderModel.getById(orderId);

            const content = `
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Order ID:</strong> #${order.id}
                    </div>
                    <div class="col-6">
                        <strong>Date:</strong> ${new Date(order.date).toLocaleString()}
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-6">
                        <strong>Customer:</strong> ${order.customerName}
                    </div>
                    <div class="col-6">
                        <strong>Contact:</strong> ${order.customerContact}
                    </div>
                </div>
                <hr>
                <h6>Order Items:</h6>
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Code</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(i => `
                            <tr>
                                <td>${i.name}</td>
                                <td>${i.code}</td>
                                <td>$${i.price.toFixed(2)}</td>
                                <td>${i.qty}</td>
                                <td>$${(i.price * i.qty).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <hr>
                <div class="row">
                    <div class="col-6 text-end"><strong>Subtotal:</strong></div>
                    <div class="col-6 text-end">$${order.subtotal.toFixed(2)}</div>
                </div>
                <div class="row">
                    <div class="col-6 text-end"><strong>Tax (10%):</strong></div>
                    <div class="col-6 text-end">$${order.tax.toFixed(2)}</div>
                </div>
                <div class="row mt-2">
                    <div class="col-6 text-end"><h5>Total:</h5></div>
                    <div class="col-6 text-end"><h5 class="text-primary">$${order.total.toFixed(2)}</h5></div>
                </div>
            `;

            document.getElementById('orderDetailsContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
            modal.show();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    }
};