// model/OrderModel.js
import { db } from '../db/database.js';
import { OrderDTO } from '../dto/OrderDTO.js';

const ORDER_PREFIX = 'O';
const ORDER_KEY = 'spicy-stop_orders';

export class OrderModel {
    static getAll() {
        // Since we are not using Local Storage, the date will already be a string/ISO string
        return db.getOrders().map(o => new OrderDTO(o.id, o.date, o.customerId, o.items, o.total, o.status));
    }

    static saveAll(orders) {
        db.saveOrders(orders);
    }

    static getById(id) {
        return this.getAll().find(o => o.id === id);
    }

    static create(customerId, cart) {
        const orders = this.getAll();
        const id = db.getNextId(ORDER_KEY, ORDER_PREFIX);
        const total = cart.reduce((sum, e) => sum + e.item.price * e.quantity, 0);

        const newOrder = new OrderDTO(
            id,
            new Date().toISOString(), // Store date as ISO string
            customerId,
            cart.map(e => ({ itemId: e.item.id, quantity: e.quantity, price: e.item.price })),
            total,
            'Paid'
        );

        orders.push(newOrder);
        this.saveAll(orders);
        return newOrder;
    }
}