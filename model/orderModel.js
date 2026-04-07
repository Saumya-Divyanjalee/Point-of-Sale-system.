// model/OrderModel.js
// Handles all data operations for the orders collection.
// The create() method performs stock validation and deduction atomically
// so a partial order can never be committed.

import { db }                      from '../db/database.js';
import { OrderDTO, OrderItemDTO }  from '../dto/OrderDTO.js';
import { ItemModel }               from './ItemModel.js';

// ------------------------------------------------------------------
// OrderModel
// ------------------------------------------------------------------
export class OrderModel {

    // Retrieve all orders as OrderDTO instances.
    static getAll() {
        return db.getOrders().map(
            o => new OrderDTO(o.id, o.date, o.customerId, o.items, o.total, o.status)
        );
    }

    // Persist the full orders array to the database.
    static saveAll(orders) {
        db.saveOrders(orders);
    }

    // Find a single order by ID. Returns OrderDTO or null.
    static getById(id) {
        return this.getAll().find(o => o.id === id) ?? null;
    }

    // Retrieve all orders that belong to a specific customer.
    static getByCustomerId(customerId) {
        return this.getAll().filter(o => o.customerId === customerId);
    }

    // Create a new order.
    //
    // Parameters:
    //   customerId - string ID of a registered customer, or null for walk-in
    //   cart       - array of { item: ItemDTO, quantity: number }
    //
    // Returns { success, data, error }.
    // On success, `data` is the saved OrderDTO.
    //
    // This method:
    //  1. Validates the cart is not empty.
    //  2. Confirms sufficient stock for every line item.
    //  3. Deducts stock from ItemModel atomically (all or nothing).
    //  4. Saves the new order and returns it.
    static create(customerId, cart) {
        // Cart must contain at least one item
        if (!Array.isArray(cart) || cart.length === 0) {
            return { success: false, error: 'Cannot place an empty order.' };
        }

        // Load current stock for all items in one read so we avoid
        // calling getById repeatedly inside the loop.
        const liveItems = ItemModel.getAll();
        const itemMap   = new Map(liveItems.map(item => [item.id, item]));

        // Validate stock availability before touching any data.
        for (const entry of cart) {
            const liveItem = itemMap.get(entry.item.id);

            if (!liveItem) {
                return {
                    success: false,
                    error: `Item "${entry.item.name}" no longer exists.`,
                };
            }

            if (entry.quantity <= 0) {
                return {
                    success: false,
                    error: `Invalid quantity for "${liveItem.name}".`,
                };
            }

            if (entry.quantity > liveItem.stock) {
                return {
                    success: false,
                    error: `Not enough stock for "${liveItem.name}". Available: ${liveItem.stock}.`,
                };
            }
        }

        // All checks passed - deduct stock now.
        for (const entry of cart) {
            const liveItem  = itemMap.get(entry.item.id);
            liveItem.stock -= entry.quantity;
        }
        // Write the updated stock array back in one call.
        ItemModel.saveAll([...itemMap.values()]);

        // Build the order record.
        const id    = db.nextOrderId();
        const total = cart.reduce((sum, e) => sum + e.item.price * e.quantity, 0);

        const orderItems = cart.map(
            e => new OrderItemDTO(e.item.id, e.quantity, e.item.price)
        );

        const newOrder = new OrderDTO(
            id,
            new Date().toISOString(),   // ISO-8601 date string for reliable parsing
            customerId || null,
            orderItems,
            total,
            'Paid'
        );

        const orders = this.getAll();
        orders.push(newOrder);
        this.saveAll(orders);

        return { success: true, data: newOrder };
    }
}
