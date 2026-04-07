// model/ItemModel.js
// Handles all data operations for the menu items collection.

import { db }      from '../db/database.js';
import { ItemDTO } from '../dto/ItemDTO.js';

// Placeholder image used when a new item has no uploaded image.
const DEFAULT_IMAGE = 'img/placeholder.jpg';

// ------------------------------------------------------------------
// Validation helpers (private to this module)
// ------------------------------------------------------------------

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

// Price must be a finite number >= 0.
function isValidPrice(price) {
    return typeof price === 'number' && isFinite(price) && price >= 0;
}

// Stock must be a whole number >= 0.
function isValidStock(stock) {
    return Number.isInteger(stock) && stock >= 0;
}

// ------------------------------------------------------------------
// ItemModel
// ------------------------------------------------------------------
export class ItemModel {

    // Retrieve all menu items as ItemDTO instances.
    static getAll() {
        return db.getItems().map(
            item => new ItemDTO(item.id, item.name, item.price, item.stock, item.image, item.category)
        );
    }

    // Persist the full items array to the database.
    static saveAll(items) {
        db.saveItems(items);
    }

    // Find a single item by ID. Returns ItemDTO or null.
    static getById(id) {
        return this.getAll().find(item => item.id === id) ?? null;
    }

    // Validate and create a new menu item.
    // Returns { success, data, error }.
    static create(name, price, stock, image = DEFAULT_IMAGE, category = '') {
        const result = this._validate(name, price, stock);
        if (!result.valid) return { success: false, error: result.error };

        const id      = db.nextItemId();
        const newItem = new ItemDTO(id, name.trim(), price, stock, image, category.trim());
        const items   = this.getAll();
        items.push(newItem);
        this.saveAll(items);

        return { success: true, data: newItem };
    }

    // Validate and update an existing menu item.
    // Returns { success, error }.
    static update(updatedDTO) {
        const result = this._validate(updatedDTO.name, updatedDTO.price, updatedDTO.stock);
        if (!result.valid) return { success: false, error: result.error };

        let items   = this.getAll();
        const index = items.findIndex(item => item.id === updatedDTO.id);

        if (index === -1) return { success: false, error: 'Item not found.' };

        // Preserve the existing image if none supplied on the DTO
        const image = updatedDTO.image || items[index].image || DEFAULT_IMAGE;

        items[index] = new ItemDTO(
            updatedDTO.id,
            updatedDTO.name.trim(),
            updatedDTO.price,
            updatedDTO.stock,
            image,
            (updatedDTO.category || '').trim()
        );
        this.saveAll(items);
        return { success: true };
    }

    // Remove an item by ID.
    // Returns { success, error }.
    static delete(id) {
        let items    = this.getAll();
        const before = items.length;
        items        = items.filter(item => item.id !== id);

        if (items.length === before) {
            return { success: false, error: 'Item not found.' };
        }

        this.saveAll(items);
        return { success: true };
    }

    // ------------------------------------------------------------------
    // Private validation
    // ------------------------------------------------------------------
    static _validate(name, price, stock) {
        if (!isNonEmptyString(name))  return { valid: false, error: 'Item name is required.'              };
        if (name.trim().length < 2)   return { valid: false, error: 'Item name must be at least 2 characters.' };
        if (!isValidPrice(price))     return { valid: false, error: 'Price must be a number of 0 or more.' };
        if (price > 100000)           return { valid: false, error: 'Price seems unreasonably high. Please check.' };
        if (!isValidStock(stock))     return { valid: false, error: 'Stock must be a whole number of 0 or more.' };
        if (stock > 99999)            return { valid: false, error: 'Stock quantity seems unreasonably high.' };
        return { valid: true };
    }
}
