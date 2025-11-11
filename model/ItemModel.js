// Item Model - Manages product/cake items
const ItemModel = {
    items: [],
    nextId: 1,

    // Add a new item
    add(item) {
        // Validate item data
        const codeValidation = Validator.validateItemCode(item.code);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.message);
        }

        const nameValidation = Validator.validateName(item.name);
        if (!nameValidation.valid) {
            throw new Error('Item name: ' + nameValidation.message);
        }

        const priceValidation = Validator.validatePrice(item.price);
        if (!priceValidation.valid) {
            throw new Error(priceValidation.message);
        }

        const qtyValidation = Validator.validateQuantity(item.qty);
        if (!qtyValidation.valid) {
            throw new Error(qtyValidation.message);
        }

        // Check for duplicate code
        const duplicate = this.items.find(i => i.code.toUpperCase() === item.code.toUpperCase());
        if (duplicate) {
            throw new Error('An item with this code already exists');
        }

        item.id = this.nextId++;
        item.code = item.code.toUpperCase();
        item.price = parseFloat(item.price);
        item.qty = parseInt(item.qty);
        item.createdAt = new Date().toISOString();
        this.items.push(item);
        return item;
    },

    // Update an existing item
    update(id, item) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error('Item not found');
        }

        // Validate updated data
        if (item.code) {
            const codeValidation = Validator.validateItemCode(item.code);
            if (!codeValidation.valid) {
                throw new Error(codeValidation.message);
            }

            // Check for duplicate code (excluding current item)
            const duplicate = this.items.find(i =>
                i.code.toUpperCase() === item.code.toUpperCase() && i.id !== id
            );
            if (duplicate) {
                throw new Error('An item with this code already exists');
            }
            item.code = item.code.toUpperCase();
        }

        if (item.name) {
            const nameValidation = Validator.validateName(item.name);
            if (!nameValidation.valid) {
                throw new Error('Item name: ' + nameValidation.message);
            }
        }

        if (item.price !== undefined) {
            const priceValidation = Validator.validatePrice(item.price);
            if (!priceValidation.valid) {
                throw new Error(priceValidation.message);
            }
            item.price = parseFloat(item.price);
        }

        if (item.qty !== undefined) {
            const qtyValidation = Validator.validateQuantity(item.qty);
            if (!qtyValidation.valid) {
                throw new Error(qtyValidation.message);
            }
            item.qty = parseInt(item.qty);
        }

        item.updatedAt = new Date().toISOString();
        this.items[index] = { ...this.items[index], ...item };
        return this.items[index];
    },

    // Delete an item
    delete(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) {
            throw new Error('Item not found');
        }
        this.items.splice(index, 1);
        return true;
    },

    // Get all items
    getAll() {
        return this.items;
    },

    // Get item by ID
    getById(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    },

    // Update stock quantity
    updateStock(id, qtyToDeduct) {
        const item = this.getById(id);

        if (qtyToDeduct < 0) {
            throw new Error('Quantity to deduct must be positive');
        }

        if (item.qty < qtyToDeduct) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${item.qty}`);
        }

        item.qty -= qtyToDeduct;
        item.updatedAt = new Date().toISOString();
        return item;
    },

    // Add stock quantity
    addStock(id, qtyToAdd) {
        const item = this.getById(id);

        if (qtyToAdd <= 0) {
            throw new Error('Quantity to add must be positive');
        }

        item.qty += parseInt(qtyToAdd);
        item.updatedAt = new Date().toISOString();
        return item;
    },

    // Get items in stock
    getInStock() {
        return this.items.filter(item => item.qty > 0);
    },

    // Get low stock items (less than 5)
    getLowStock() {
        return this.items.filter(item => item.qty < 5 && item.qty > 0);
    },

    // Get out of stock items
    getOutOfStock() {
        return this.items.filter(item => item.qty === 0);
    },

    // Search items
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.items.filter(i =>
            i.name.toLowerCase().includes(lowerQuery) ||
            i.code.toLowerCase().includes(lowerQuery)
        );
    },

    // Get item count
    getCount() {
        return this.items.length;
    }
};