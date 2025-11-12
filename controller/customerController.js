// controller/CustomerController.js
import { CustomerModel } from '../model/CustomerModel.js';
import { CustomerDTO } from '../dto/CustomerDTO.js';

export class CustomerController {
    constructor() {
        this.editingCustomerId = null;
        this.customersTableBody = document.getElementById('customersTable');
        this.updateCustomerBtn = document.getElementById('updateCustomerBtn');
        this.deleteCustomerBtn = document.getElementById('deleteCustomerBtn');

        this.setupFormListeners();
    }

    setupFormListeners() {
        document.querySelector('#customers .btn-add').onclick = () => this.addCustomer();
        this.updateCustomerBtn.onclick = () => this.updateCustomer();
        this.deleteCustomerBtn.onclick = () => this.deleteCustomer();
        document.querySelector('#customers .btn-clear').onclick = () => this.clearCustomerForm();
    }

    loadCustomers() {
        const customers = CustomerModel.getAll();
        this.customersTableBody.innerHTML = '';

        if (customers.length === 0) {
            this.customersTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No customers yet</td></tr>';
            if (window.app) window.app.updateDashboardCustomersCount(0);
            this.loadCustomerSelect();
            return;
        }

        customers.forEach(customer => {
            const customerOrders = window.app.orderController.getOrdersByCustomerId(customer.id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${customer.id}</td>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customerOrders.length}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="customerController.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            this.customersTableBody.appendChild(tr);
        });

        if (window.app) window.app.updateDashboardCustomersCount(customers.length);
        this.loadCustomerSelect();
    }

    addCustomer() {
        const name = document.getElementById('customerName').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        if (!name || !email || !phone) {
            alert('Please fill all fields');
            return;
        }

        CustomerModel.create(name, email, phone);
        this.loadCustomers();
        this.clearCustomerForm();
        alert('Customer added successfully!');
    }

    editCustomer(id) {
        const customer = CustomerModel.getById(id);
        if (customer) {
            this.editingCustomerId = id;
            document.getElementById('customerIdDisplay').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerEmail').value = customer.email;
            document.getElementById('customerPhone').value = customer.phone;

            this.updateCustomerBtn.style.display = 'inline-block';
            this.deleteCustomerBtn.style.display = 'inline-block';
        }
    }

    updateCustomer() {
        if (!this.editingCustomerId) return;

        const updatedCustomer = new CustomerDTO(
            this.editingCustomerId,
            document.getElementById('customerName').value.trim(),
            document.getElementById('customerEmail').value.trim(),
            document.getElementById('customerPhone').value.trim()
        );

        if (CustomerModel.update(updatedCustomer)) {
            this.loadCustomers();
            this.clearCustomerForm();
            alert('Customer updated!');
        }
    }

    deleteCustomer() {
        if (!this.editingCustomerId) return;

        if (confirm('Delete this customer? This cannot be undone.')) {
            CustomerModel.delete(this.editingCustomerId);
            this.loadCustomers();
            this.clearCustomerForm();
            alert('Customer deleted!');
        }
    }

    clearCustomerForm() {
        this.editingCustomerId = null;
        document.getElementById('editCustomerId').value = '';
        document.getElementById('customerIdDisplay').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('customerPhone').value = '';
        this.updateCustomerBtn.style.display = 'none';
        this.deleteCustomerBtn.style.display = 'none';
    }

    loadCustomerSelect() {
        const select = document.getElementById('customerSelect');
        select.innerHTML = '<option value="">Walk-in Customer</option>';

        CustomerModel.getAll().forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.phone})`;
            select.appendChild(option);
        });
    }

    getAllCustomers() {
        return CustomerModel.getAll();
    }
}