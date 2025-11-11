// Dashboard Controller - Manages dashboard statistics and display
const dashboardController = {
    // Initialize dashboard
    init() {
        this.update();
    },

    // Update dashboard statistics
    update() {
        try {
            const stats = this.calculateStats();
            this.renderStats(stats);
        } catch (error) {
            console.error('Dashboard update failed:', error);
        }
    },

    // Calculate all statistics
    calculateStats() {
        const customers = CustomerModel.getCount();
        const items = ItemModel.getCount();
        const orders = OrderModel.getCount();
        const revenue = OrderModel.getTotalRevenue();

        const orderStats = OrderModel.getStatistics();
        const lowStockItems = ItemModel.getLowStock();
        const outOfStockItems = ItemModel.getOutOfStock();

        return {
            totalCustomers: customers,
            totalItems: items,
            totalOrders: orders,
            totalRevenue: revenue,
            averageOrderValue: orderStats.averageOrderValue,
            todayOrders: orderStats.todayOrders,
            todayRevenue: orderStats.todayRevenue,
            lowStockCount: lowStockItems.length,
            outOfStockCount: outOfStockItems.length
        };
    },

    // Render statistics to dashboard
    renderStats(stats) {
        // Update stat cards
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) {
            totalCustomersEl.textContent = stats.totalCustomers;
        }

        const totalItemsEl = document.getElementById('totalItems');
        if (totalItemsEl) {
            totalItemsEl.textContent = stats.totalItems;
        }

        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) {
            totalOrdersEl.textContent = stats.totalOrders;
        }

        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `$${stats.totalRevenue.toFixed(2)}`;
        }
    },

    // Get detailed statistics for reports
    getDetailedStats() {
        return {
            ...this.calculateStats(),
            itemsByCategory: this.getItemsByCategory(),
            topSellingItems: this.getTopSellingItems(),
            recentOrders: this.getRecentOrders(5),
            customerStats: this.getCustomerStats()
        };
    },

    // Get items grouped by first letter/category
    getItemsByCategory() {
        const items = ItemModel.getAll();
        const grouped = {};

        items.forEach(item => {
            const category = item.name.charAt(0).toUpperCase();
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });

        return grouped;
    },

    // Get top selling items
    getTopSellingItems(limit = 5) {
        const orders = OrderModel.getAll();
        const itemSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.id]) {
                    itemSales[item.id] = {
                        id: item.id,
                        name: item.name,
                        totalQty: 0,
                        totalRevenue: 0
                    };
                }
                itemSales[item.id].totalQty += item.qty;
                itemSales[item.id].totalRevenue += item.price * item.qty;
            });
        });

        return Object.values(itemSales)
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, limit);
    },

    // Get recent orders
    getRecentOrders(limit = 5) {
        return OrderModel.getAll()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    },

    // Get customer statistics
    getCustomerStats() {
        const customers = CustomerModel.getAll();
        const orders = OrderModel.getAll();

        const customerOrderCounts = {};
        orders.forEach(order => {
            if (!customerOrderCounts[order.customerId]) {
                customerOrderCounts[order.customerId] = 0;
            }
            customerOrderCounts[order.customerId]++;
        });

        const topCustomers = customers
            .map(customer => ({
                ...customer,
                orderCount: customerOrderCounts[customer.id] || 0
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, 5);

        return {
            totalCustomers: customers.length,
            activeCustomers: Object.keys(customerOrderCounts).length,
            topCustomers: topCustomers
        };
    },

    // Refresh dashboard
    refresh() {
        this.update();
        AlertUtil.showInfo('Dashboard refreshed');
    }
};