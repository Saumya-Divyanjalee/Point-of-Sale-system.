// controller/CustomerController.js
// Mediates between the Customer form/table in the UI and CustomerModel.

import { CustomerModel } from '../model/CustomerModel.js';
import { CustomerDTO }   from '../dto/CustomerDTO.js';

export class CustomerController {

    constructor() {
        // ID of the customer currently loaded in the edit form, or null.
        this.editingCustomerId = null;

        // Cached DOM references.
        this.customersTableBody  = document.getElementById('customersTable');
        this.updateCustomerBtn   = document.getElementById('updateCustomerBtn');
        this.deleteCustomerBtn   = document.getElementById('deleteCustomerBtn');

        this._bindFormButtons();
    }

    // ------------------------------------------------------------------
    // Button wiring
    // ------------------------------------------------------------------

    _bindFormButtons() {
        document.querySelector('#customers .btn-add').onclick   = () => this.addCustomer();
        document.querySelector('#customers .btn-clear').onclick = () => this.clearCustomerForm();
        this.updateCustomerBtn.onclick = () => this.updateCustomer();
        this.deleteCustomerBtn.onclick = () => this.deleteCustomer();
    }

    // ------------------------------------------------------------------
    // Table rendering
    // ------------------------------------------------------------------

    // Render all customers into the customers table.
    loadCustomers() {
        const customers = CustomerModel.getAll();
        this.customersTableBody.innerHTML = '';

        if (customers.length === 0) {
            this.customersTableBody.innerHTML =
                '<tr><td colspan="6" class="text-center py-4 text-muted">No customers yet. Add one above.</td></tr>';
            if (window.app) window.app.updateDashboardCustomersCount(0);
            this.loadCustomerSelect();
            return;
        }

        customers.forEach(customer => {
            // Count orders for this customer via the order controller.
            const orderCount = window.app
                ? window.app.orderController.getOrdersByCustomerId(customer.id).length
                : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${customer.id}</td>
                <td><strong>${this._escape(customer.name)}</strong></td>
                <td>${this._escape(customer.email)}</td>
                <td>${this._escape(customer.phone)}</td>
                <td>${orderCount}</td>
                <td>
                    <button class="btn btn-sm btn-edit"
                            onclick="customerController.editCustomer('${customer.id}')"
                            title="Edit customer">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            this.customersTableBody.appendChild(tr);
        });

        if (window.app) window.app.updateDashboardCustomersCount(customers.length);
        this.loadCustomerSelect();
    }

    // ------------------------------------------------------------------
    // CRUD operations
    // ------------------------------------------------------------------

    addCustomer() {
        const name  = document.getElementById('customerName').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        const result = CustomerModel.create(name, email, phone);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadCustomers();
        this.clearCustomerForm();
        this._showSuccess('Customer added successfully.');
    }

    // Load a customer's data into the form for editing.
    editCustomer(id) {
        const customer = CustomerModel.getById(id);
        if (!customer) {
            this._showError('Customer not found.');
            return;
        }

        this.editingCustomerId = id;
        document.getElementById('customerIdDisplay').value = customer.id;
        document.getElementById('customerName').value      = customer.name;
        document.getElementById('customerEmail').value     = customer.email;
        document.getElementById('customerPhone').value     = customer.phone;

        this.updateCustomerBtn.style.display = 'inline-block';
        this.deleteCustomerBtn.style.display = 'inline-block';

        document.getElementById('customerIdDisplay').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    updateCustomer() {
        if (!this.editingCustomerId) return;

        const updatedDTO = new CustomerDTO(
            this.editingCustomerId,
            document.getElementById('customerName').value.trim(),
            document.getElementById('customerEmail').value.trim(),
            document.getElementById('customerPhone').value.trim()
        );

        const result = CustomerModel.update(updatedDTO);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadCustomers();
        this.clearCustomerForm();
        this._showSuccess('Customer updated.');
    }

    deleteCustomer() {
        if (!this.editingCustomerId) return;

        const customer = CustomerModel.getById(this.editingCustomerId);
        const name     = customer ? `"${customer.name}"` : 'this customer';

        // Warn if the customer has existing orders
        const orderCount = window.app
            ? window.app.orderController.getOrdersByCustomerId(this.editingCustomerId).length
            : 0;

        const warning = orderCount > 0
            ? `\n\nWarning: This customer has ${orderCount} order(s). Their orders will show as Walk-in after deletion.`
            : '';

        if (!confirm(`Delete ${name}?${warning}\n\nThis cannot be undone.`)) return;

        const result = CustomerModel.delete(this.editingCustomerId);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadCustomers();
        this.clearCustomerForm();
        this._showSuccess('Customer deleted.');
    }

    // ------------------------------------------------------------------
    // Customer select dropdown (used on POS screen)
    // ------------------------------------------------------------------

    loadCustomerSelect() {
        const select = document.getElementById('customerSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Walk-in Customer</option>';

        CustomerModel.getAll().forEach(customer => {
            const option       = document.createElement('option');
            option.value       = customer.id;
            option.textContent = `${customer.name} (${customer.phone})`;
            select.appendChild(option);
        });
    }

    // ------------------------------------------------------------------
    // Form helpers
    // ------------------------------------------------------------------

    clearCustomerForm() {
        this.editingCustomerId = null;
        document.getElementById('customerIdDisplay').value = '';
        document.getElementById('customerName').value      = '';
        document.getElementById('customerEmail').value     = '';
        document.getElementById('customerPhone').value     = '';
        this.updateCustomerBtn.style.display = 'none';
        this.deleteCustomerBtn.style.display = 'none';
        this._clearMessages();
    }

    // Returns all customers - used by other controllers.
    getAllCustomers() {
        return CustomerModel.getAll();
    }

    // Returns a single customer or null - used by dashboard.
    getCustomerById(id) {
        return CustomerModel.getById(id);
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

    _showError(message) {
        this._showBanner('customerFormMsg', message, 'error');
    }

    _showSuccess(message) {
        this._showBanner('customerFormMsg', message, 'success');
    }

    _showBanner(elId, message, type) {
        let el = document.getElementById(elId);
        if (!el) return;
        el.textContent   = message;
        el.className     = `form-msg form-msg-${type}`;
        el.style.display = 'block';
        setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
    }

    _clearMessages() {
        const el = document.getElementById('customerFormMsg');
        if (el) el.style.display = 'none';
    }
}
