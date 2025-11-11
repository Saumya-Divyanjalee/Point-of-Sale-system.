// Main Application Initialization

// Application Configuration
const AppConfig = {
    appName: 'Sweet Delights - Cake Shop POS',
    version: '1.0.0',
    taxRate: 0.10,
    currency: '$',
    dateFormat: 'en-US'
};

// Application State
const AppState = {
    isInitialized: false,
    currentSection: 'dashboard',
    user: {
        name: 'Admin',
        role: 'administrator'
    }
};

// Main Application Object
const App = {
    // Initialize the application
    init() {
        try {
            console.log(`Initializing ${AppConfig.appName} v${AppConfig.version}`);

            // Initialize database with sample data
            Database.initSampleData();

            // Initialize navigation FIRST
            navigationController.init();

            // Initialize controllers
            this.initControllers();

            // Set initial state
            AppState.isInitialized = true;
            AppState.currentSection = 'dashboard';

            // Show initial dashboard
            dashboardController.update();

            console.log('Application initialized successfully');

            // Show welcome message
            this.showWelcomeMessage();

        } catch (error) {
            console.error('Application initialization failed:', error);
            AlertUtil.showError('Failed to initialize application: ' + error.message);
        }
    },

    // Initialize all controllers
    initControllers() {
        if (typeof customerController !== 'undefined') {
            customerController.init();
        }

        if (typeof itemController !== 'undefined') {
            itemController.init();
        }

        if (typeof orderController !== 'undefined') {
            orderController.init();
        }

        if (typeof dashboardController !== 'undefined') {
            dashboardController.init();
        }
    },

    // Show welcome message
    showWelcomeMessage() {
        console.log(`
╔══════════════════════════════════════════════╗
║   Welcome to Sweet Delights Cake Shop POS   ║
║           Version ${AppConfig.version}                 ║
╚══════════════════════════════════════════════╝

Sample data has been loaded. You can now:
- Manage customers
- Add and manage cake items
- Place orders
- View order history
- Monitor dashboard statistics

Press F12 to access browser console for debugging.
        `);
    },

    // Get application info
    getInfo() {
        return {
            ...AppConfig,
            state: AppState,
            stats: Database.getStats()
        };
    },

    // Reset application
    reset() {
        if (confirm('This will clear all data and reload the application. Continue?')) {
            Database.clearAll();
            location.reload();
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Expose App to global scope for console access
window.CakeShopApp = App;

// Add helpful console commands
console.log('%cCake Shop POS System', 'font-size: 20px; font-weight: bold; color: #ff6b9d;');
console.log('%cAvailable Commands:', 'font-size: 14px; font-weight: bold;');
console.log('CakeShopApp.getInfo() - Get app information');
console.log('CakeShopApp.reset() - Reset application');
console.log('Database.exportData() - Export all data');
console.log('Database.clearAll() - Clear all data');

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global Error:', e.error);
});

// Unload warning for unsaved data
window.addEventListener('beforeunload', function(e) {
    if (orderController.currentOrder.items.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have an unsaved order. Are you sure you want to leave?';
        return e.returnValue;
    }
});