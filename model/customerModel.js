// Customer Model - Manages customer data
const CustomerModel = {
    customers: [],
    nextId: 1,

    // Add a new customer
    add(customer) {
        // Validate customer data
        const nameValidation = Validator.validateName(customer.name);
        if (!nameValidation.valid) {
            throw new Error(nameValidation.message);
        }

        const phoneValidation = Validator.validatePhone(customer.contact);
        if (!phoneValidation.valid) {
            throw new Error(phoneValidation.message);
        }

        if (customer.address) {
            const addressValidation = Validator.validateAddress(customer.address);
            if (!addressValidation.valid) {
                throw new Error(addressValidation.message);
            }
        }

        // Check for duplicate contact
        const duplicate = this.customers.find(c => c.contact === customer.contact);
        if (duplicate) {
            throw new Error('A customer with this contact number already exists');
        }

        customer.id = this.nextId++;
        customer.createdAt = new Date().toISOString();
        this.customers.push(customer);
        return customer;
    },

    // Update an existing customer
    update(id, customer) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Customer not found');
        }

        // Validate updated data
        if (customer.name) {
            const nameValidation = Validator.validateName(customer.name);
            if (!nameValidation.valid) {
                throw new Error(nameValidation.message);
            }
        }

        if (customer.contact) {
            const phoneValidation = Validator.validatePhone(customer.contact);
            if (!phoneValidation.valid) {
                throw new Error(phoneValidation.message);
            }

            // Check for duplicate contact (excluding current customer)
            const duplicate = this.customers.find(c => c.contact === customer.contact && c.id !== id);
            if (duplicate) {
                throw new Error('A customer with this contact number already exists');
            }
        }

        if (customer.address) {
            const addressValidation = Validator.validateAddress(customer.address);
            if (!addressValidation.valid) {
                throw new Error(addressValidation.message);
            }
        }

        customer.updatedAt = new Date().toISOString();
        this.customers[index] = { ...this.customers[index], ...customer };
        return this.customers[index];
    },

    // Delete a customer
    delete(id) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Customer not found');
        }

        // Check if customer has orders
        const hasOrders = OrderModel.getAll().some(order => order.customerId === id);
        if (hasOrders) {
            throw new Error('Cannot delete customer with existing orders');
        }

        this.customers.splice(index, 1);
        return true;
    },

    // Get all customers
    getAll() {
        return this.customers;
    },

    // Get customer by ID
    getById(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    },

    // Search customers
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.customers.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.contact.includes(query) ||
            (c.address && c.address.toLowerCase().includes(lowerQuery))
        );
    },

    // Get customer count
    getCount() {
        return this.customers.length;
    }
};