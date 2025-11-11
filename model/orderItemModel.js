// Order Item Model - Represents individual items in an order
const OrderItemModel = {
    // Create an order item from an item and quantity
    create(item, quantity) {
        if (!item) {
            throw new Error('Item is required');
        }

        const qtyValidation = Validator.validateQuantity(quantity);
        if (!qtyValidation.valid) {
            throw new Error(qtyValidation.message);
        }

        const qty = parseInt(quantity);

        if (qty > item.qty) {
            throw new Error(`Cannot order ${qty} of ${item.name}. Only ${item.qty} available.`);
        }

        if (qty <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        return {
            id: item.id,
            code: item.code,
            name: item.name,
            price: parseFloat(item.price),
            qty: qty,
            subtotal: parseFloat(item.price) * qty
        };
    },

    // Update quantity of an order item
    updateQuantity(orderItem, newQuantity, availableStock) {
        const qtyValidation = Validator.validateQuantity(newQuantity);
        if (!qtyValidation.valid) {
            throw new Error(qtyValidation.message);
        }

        const qty = parseInt(newQuantity);

        if (qty <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        if (qty > availableStock) {
            throw new Error(`Cannot order ${qty}. Only ${availableStock} available.`);
        }

        orderItem.qty = qty;
        orderItem.subtotal = orderItem.price * qty;

        return orderItem;
    },

    // Calculate subtotal for order item
    calculateSubtotal(orderItem) {
        return parseFloat(orderItem.price) * parseInt(orderItem.qty);
    },

    // Validate order item
    validate(orderItem) {
        const errors = [];

        if (!orderItem.id) {
            errors.push('Item ID is required');
        }

        if (!orderItem.code) {
            errors.push('Item code is required');
        }

        if (!orderItem.name) {
            errors.push('Item name is required');
        }

        const priceValidation = Validator.validatePrice(orderItem.price);
        if (!priceValidation.valid) {
            errors.push(priceValidation.message);
        }

        const qtyValidation = Validator.validateQuantity(orderItem.qty);
        if (!qtyValidation.valid) {
            errors.push(qtyValidation.message);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
};