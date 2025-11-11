// Order Model - Manages orders
const OrderModel = {
    orders: [],
    nextId: 1,
    TAX_RATE: 0.10, // 10% tax

    // Add a new order
    add(order) {
        if (!order.customerId) {
            throw new Error('Customer is required for order');
        }

        if (!order.items || order.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        // Validate customer exists
        try {
            CustomerModel.getById(order.customerId);
        } catch (error) {
            throw new Error('Invalid customer');
        }

        // Validate all order items
        order.items.forEach(item => {
            const validation = OrderItemModel.validate(item);
            if (!validation.valid) {
                throw new Error(`Invalid order item: ${validation.errors.join(', ')}`);
            }
        });

        order.id = this.nextId++;
        order.date = new Date().toISOString();
        order.status = 'completed';

        // Calculate totals if not provided
        if (!order.subtotal) {
            order.subtotal = this.calculateSubtotal(order.items);
        }
        if (!order.tax) {
            order.tax = this.calculateTax(order.subtotal);
        }
        if (!order.total) {
            order.total = order.subtotal + order.tax;
        }

        this.orders.push(order);
        return order;
    },

    // Calculate subtotal from items
    calculateSubtotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    // Calculate tax
    calculateTax(subtotal) {
        return subtotal * this.TAX_RATE;
    },

    // Calculate total
    calculateTotal(subtotal, tax) {
        return subtotal + tax;
    },

    // Get all orders
    getAll() {
        return this.orders;
    },

    // Get order by ID
    getById(id) {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    },

    // Get orders by customer ID
    getByCustomerId(customerId) {
        return this.orders.filter(o => o.customerId === customerId);
    },

    // Get orders by date range
    getByDateRange(startDate, endDate) {
        return this.orders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate >= startDate && orderDate <= endDate;
        });
    },

    // Get today's orders
    getTodayOrders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.getByDateRange(today, tomorrow);
    },

    // Calculate total revenue
    getTotalRevenue() {
        return this.orders.reduce((sum, order) => sum + order.total, 0);
    },

    // Calculate revenue for date range
    getRevenueByDateRange(startDate, endDate) {
        const orders = this.getByDateRange(startDate, endDate);
        return orders.reduce((sum, order) => sum + order.total, 0);
    },

    // Get order count
    getCount() {
        return this.orders.length;
    },

    // Get order statistics
    getStatistics() {
        const orders = this.getAll();
        const totalRevenue = this.getTotalRevenue();
        const todayOrders = this.getTodayOrders();
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

        return {
            totalOrders: orders.length,
            totalRevenue: totalRevenue,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            todayOrders: todayOrders.length,
            todayRevenue: todayRevenue
        };
    },

    // Delete an order (optional - for admin purposes)
    delete(id) {
        const index = this.orders.findIndex(o => o.id === id);
        if (index === -1) {
            throw new Error('Order not found');
        }
        this.orders.splice(index, 1);
        return true;
    }
};