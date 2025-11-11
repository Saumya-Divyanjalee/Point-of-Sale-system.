// Validation Regex Patterns
const ValidationRegex = {
    // Name validation: allows letters, spaces, and hyphens
    name: /^[a-zA-Z\s-]{2,50}$/,

    // Phone number validation: various formats
    phone: /^[\d\s\-\+\(\)]{7,20}$/,

    // Item code validation: alphanumeric with optional hyphens
    itemCode: /^[A-Z0-9\-]{3,20}$/,

    // Price validation: positive numbers with up to 2 decimal places
    price: /^\d+(\.\d{1,2})?$/,

    // Quantity validation: positive integers
    quantity: /^\d+$/,

    // Address validation: allows letters, numbers, spaces, commas, periods
    address: /^[a-zA-Z0-9\s,.\-]{0,200}$/
};

// Validation Functions
const Validator = {
    validateName(name) {
        if (!name || name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters long' };
        }
        if (!ValidationRegex.name.test(name.trim())) {
            return { valid: false, message: 'Name contains invalid characters' };
        }
        return { valid: true };
    },

    validatePhone(phone) {
        if (!phone || phone.trim().length < 7) {
            return { valid: false, message: 'Phone number must be at least 7 characters' };
        }
        if (!ValidationRegex.phone.test(phone.trim())) {
            return { valid: false, message: 'Invalid phone number format' };
        }
        return { valid: true };
    },

    validateItemCode(code) {
        if (!code || code.trim().length < 3) {
            return { valid: false, message: 'Item code must be at least 3 characters' };
        }
        if (!ValidationRegex.itemCode.test(code.trim().toUpperCase())) {
            return { valid: false, message: 'Item code must contain only uppercase letters, numbers, and hyphens' };
        }
        return { valid: true };
    },

    validatePrice(price) {
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            return { valid: false, message: 'Price must be a positive number' };
        }
        if (!ValidationRegex.price.test(price.toString())) {
            return { valid: false, message: 'Price format is invalid (max 2 decimal places)' };
        }
        return { valid: true };
    },

    validateQuantity(qty) {
        const qtyNum = parseInt(qty);
        if (isNaN(qtyNum) || qtyNum < 0) {
            return { valid: false, message: 'Quantity must be a non-negative integer' };
        }
        if (!ValidationRegex.quantity.test(qty.toString())) {
            return { valid: false, message: 'Quantity must be a whole number' };
        }
        return { valid: true };
    },

    validateAddress(address) {
        if (address && !ValidationRegex.address.test(address)) {
            return { valid: false, message: 'Address contains invalid characters' };
        }
        return { valid: true };
    }
};