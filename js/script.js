// Navigation and UI Control Scripts

// Sidebar Toggle Function
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Close sidebar on mobile when clicking outside
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.sidebar-toggle');

    if (window.innerWidth <= 768 &&
        sidebar &&
        !sidebar.contains(e.target) &&
        toggle &&
        !toggle.contains(e.target) &&
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Navigation Controller
const navigationController = {
    init() {
        console.log('Navigation controller initializing...');
        const navLinks = document.querySelectorAll('#sidebarNav a');
        console.log('Found nav links:', navLinks.length);

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                console.log('Navigating to:', section);
                this.navigateToSection(section);

                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });

        console.log('Navigation controller initialized');
    },

    navigateToSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');

        // Page titles
        const titles = {
            dashboard: 'Dashboard',
            customers: 'Customer Management',
            items: 'Cakes & Items Management',
            orders: 'Place Order',
            history: 'Order History'
        };

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[section] || 'Dashboard';
        }

        // Show selected section and load data
        switch(section) {
            case 'dashboard':
                const dashboardSection = document.getElementById('dashboardSection');
                if (dashboardSection) {
                    dashboardSection.style.display = 'block';
                }
                if (typeof dashboardController !== 'undefined') {
                    dashboardController.update();
                }
                break;

            case 'customers':
                const customerSection = document.getElementById('customerSection');
                if (customerSection) {
                    customerSection.style.display = 'block';
                }
                if (typeof customerController !== 'undefined') {
                    customerController.loadCustomers();
                }
                break;

            case 'items':
                const itemSection = document.getElementById('itemSection');
                if (itemSection) {
                    itemSection.style.display = 'block';
                }
                if (typeof itemController !== 'undefined') {
                    itemController.loadItems();
                }
                break;

            case 'orders':
                const orderSection = document.getElementById('orderSection');
                if (orderSection) {
                    orderSection.style.display = 'block';
                }
                if (typeof customerController !== 'undefined') {
                    customerController.loadCustomers();
                }
                if (typeof itemController !== 'undefined') {
                    itemController.loadItems();
                }
                break;

            case 'history':
                const historySection = document.getElementById('historySection');
                if (historySection) {
                    historySection.style.display = 'block';
                }
                if (typeof orderController !== 'undefined') {
                    orderController.loadOrders();
                }
                break;

            default:
                const defaultSection = document.getElementById('dashboardSection');
                if (defaultSection) {
                    defaultSection.style.display = 'block';
                }
                if (typeof dashboardController !== 'undefined') {
                    dashboardController.update();
                }
        }
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSidebar();
    }
});

// Responsive handling
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});