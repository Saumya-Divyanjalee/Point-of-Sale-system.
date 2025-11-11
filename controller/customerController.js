// Customer Controller - Handles customer operations
const customerController = {
    // Initialize controller
    init() {
        this.loadCustomers();
    },

    // Load and display customers
    loadCustomers() {
        try {
            const customers = CustomerModel.getAll();
            this.renderTable(customers);
            this.renderDropdown(customers);

            // Update dashboard if available
            if (typeof dashboardController !== 'undefined') {
                dashboardController.update();
            }
        } catch (error) {
            AlertUtil.showError('Failed to load customers: ' + error.message);
        }
    },

    // Render customer table
    renderTable(customers) {
        const tbody = document.getElementById('customerTableBody');
        if (!tbody) return;

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5"><div class="empty-state"><i class="fas fa-users"></i><p>No customers added yet</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.contact}</td>
                <td>${c.address || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="customerController.openEditModal(${c.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="customerController.deleteCustomer(${c.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Render customer dropdown for orders
    renderDropdown(customers) {
        const select = document.getElementById('orderCustomerSelect');
        if (!select) return;

        select.innerHTML = '<option value="">-- Select Customer --</option>' +
            customers.map(c => `<option value="${c.id}">${c.name} - ${c.contact}</option>`).join('');
    },

    // Open modal to add new customer
    openAddModal() {
        document.getElementById('customerModalTitle').textContent = 'Add Customer';
        document.getElementById('customerId').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('customerAddress').value = '';
    },

    // Open modal to edit customer
    openEditModal(id) {
        try {
            const customer = CustomerModel.getById(id);
            document.getElementById('customerModalTitle').textContent = 'Edit Customer';
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerContact').value = customer.contact;
            document.getElementById('customerAddress').value = customer.address || '';

            const modal = new bootstrap.Modal(document.getElementById('customerModal'));
            modal.show();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Save customer (add or update)
    saveCustomer() {
        try {
            const name = document.getElementById('customerName').value.trim();
            const contact = document.getElementById('customerContact').value.trim();
            const address = document.getElementById('customerAddress').value.trim();
            const id = document.getElementById('customerId').value;

            if (!name || !contact) {
                AlertUtil.showError('Please fill in all required fields');
                return;
            }

            const customer = { name, contact, address };

            if (id) {
                // Update existing customer
                CustomerModel.update(parseInt(id), customer);
                AlertUtil.showSuccess('Customer updated successfully');
            } else {
                // Add new customer
                CustomerModel.add(customer);
                AlertUtil.showSuccess('Customer added successfully');
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
            modal.hide();

            // Reload customers
            this.loadCustomers();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Delete customer
    deleteCustomer(id) {
        try {
            if (AlertUtil.confirm('Are you sure you want to delete this customer?')) {
                CustomerModel.delete(id);
                AlertUtil.showSuccess('Customer deleted successfully');
                this.loadCustomers();
            }
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Search customers
    searchCustomers(query) {
        try {
            const customers = CustomerModel.search(query);
            this.renderTable(customers);
        } catch (error) {
            AlertUtil.showError('Search failed: ' + error.message);
        }
    }
};