// dto/OrderDTO.js
export class OrderItemDTO {
    constructor(itemId, quantity, price) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.price = price;
    }
}

export class OrderDTO {
    constructor(id, date, customerId, items, total, status) {
        this.id = id;
        this.date = date;
        this.customerId = customerId;
        this.items = items; // Array of OrderItemDTO
        this.total = total;
        this.status = status;
    }
}