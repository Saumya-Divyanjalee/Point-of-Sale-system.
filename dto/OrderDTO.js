// dto/OrderDTO.js
// Plain data containers for order-related records.

// Represents a single line item within an order.
export class OrderItemDTO {
    constructor(itemId, quantity, price) {
        this.itemId   = itemId;
        this.quantity = quantity;
        this.price    = price;   // Unit price at time of sale (snapshot)
    }
}

// Represents a complete order record.
export class OrderDTO {
    constructor(id, date, customerId, items, total, status) {
        this.id         = id;
        this.date       = date;
        this.customerId = customerId; // null means walk-in customer
        this.items      = items;      // Array of OrderItemDTO
        this.total      = total;
        this.status     = status;     // "Paid" | "Pending"
    }
}
