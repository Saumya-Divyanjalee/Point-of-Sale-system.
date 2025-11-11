// In-Memory Database
const Database = {
    // Initialize sample data
    initSampleData() {
        // Sample Customers
        const sampleCustomers = [
            { name: 'John Smith', contact: '555-0101', address: '123 Main St, City' },
            { name: 'Sarah Johnson', contact: '555-0102', address: '456 Oak Ave, Town' },
            { name: 'Mike Wilson', contact: '555-0103', address: '789 Pine Rd, Village' }
        ];

        sampleCustomers.forEach(customer => CustomerModel.add(customer));

        // Sample Items
        const sampleItems = [
            { code: 'CHOC001', name: 'Chocolate Cake', price: 25.99, qty: 15 },
            { code: 'VAN001', name: 'Vanilla Cake', price: 22.99, qty: 20 },
            { code: 'STRAW001', name: 'Strawberry Cake', price: 28.99, qty: 12 },
            { code: 'RED001', name: 'Red Velvet Cake', price: 32.99, qty: 10 },
            { code: 'CARA001', name: 'Caramel Cake', price: 29.99, qty: 8 },
            { code: 'CUP001', name: 'Cupcakes (6 pack)', price: 15.99, qty: 25 },
            { code: 'BROW001', name: 'Brownies (4 pack)', price: 12.99, qty: 30 },
            { code: 'COOK001', name: 'Cookies (12 pack)', price: 9.99, qty: 40 }
        ];

        sampleItems.forEach(item => ItemModel.add(item));

        console.log('Sample data initialized successfully');
    },

    // Clear all data
    clearAll() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            CustomerModel.customers = [];
            ItemModel.items = [];
            OrderModel.orders = [];
            CustomerModel.nextId = 1;
            ItemModel.nextId = 1;
            OrderModel.nextId = 1;

            AlertUtil.showSuccess('All data cleared successfully');

            // Refresh all views
            if (typeof customerController !== 'undefined') customerController.loadCustomers();
            if (typeof itemController !== 'undefined') itemController.loadItems();
            if (typeof orderController !== 'undefined') orderController.loadOrders();
            if (typeof dashboardController !== 'undefined') dashboardController.update();
        }
    },

    // Export data (as JSON string for copying)
    exportData() {
        const data = {
            customers: CustomerModel.getAll(),
            items: ItemModel.getAll(),
            orders: OrderModel.getAll()
        };

        const jsonData = JSON.stringify(data, null, 2);
        console.log('Exported Data:', jsonData);

        AlertUtil.showInfo('Data exported to console. Press F12 to view.');
        return jsonData;
    },

    // Import data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            if (data.customers) {
                CustomerModel.customers = data.customers;
                CustomerModel.nextId = Math.max(...data.customers.map(c => c.id), 0) + 1;
            }

            if (data.items) {
                ItemModel.items = data.items;
                ItemModel.nextId = Math.max(...data.items.map(i => i.id), 0) + 1;
            }

            if (data.orders) {
                OrderModel.orders = data.orders;
                OrderModel.nextId = Math.max(...data.orders.map(o => o.id), 0) + 1;
            }

            AlertUtil.showSuccess('Data imported successfully');

            // Refresh all views
            if (typeof customerController !== 'undefined') customerController.loadCustomers();
            if (typeof itemController !== 'undefined') itemController.loadItems();
            if (typeof orderController !== 'undefined') orderController.loadOrders();
            if (typeof dashboardController !== 'undefined') dashboardController.update();

            return true;
        } catch (error) {
            AlertUtil.showError('Failed to import data: ' + error.message);
            return false;
        }
    },

    // Get statistics
    getStats() {
        return {
            totalCustomers: CustomerModel.getAll().length,
            totalItems: ItemModel.getAll().length,
            totalOrders: OrderModel.getAll().length,
            totalRevenue: OrderModel.getAll().reduce((sum, order) => sum + order.total, 0),
            lowStockItems: ItemModel.getAll().filter(item => item.qty < 5).length
        };
    }
};