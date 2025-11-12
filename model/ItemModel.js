// model/ItemModel.js
import { db } from '../db/database.js';
import { ItemDTO } from '../dto/ItemDTO.js';

const ITEM_PREFIX = 'I';
const ITEM_KEY = 'luxebrew_menuItems';

export class ItemModel {
    static getAll() {
        return db.getItems().map(item => new ItemDTO(item.id, item.name, item.price, item.stock, item.image));
    }

    static saveAll(items) {
        db.saveItems(items);
    }

    static getById(id) {
        return this.getAll().find(item => item.id === id);
    }

    static create(name, price, stock) {
        const items = this.getAll();
        const id = db.getNextId(ITEM_KEY, ITEM_PREFIX);
        const newItem = new ItemDTO(
            id,
            name,
            price,
            stock,
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        );
        items.push(newItem);
        this.saveAll(items);
        return newItem;
    }

    static update(updatedItemDTO) {
        let items = this.getAll();
        const index = items.findIndex(item => item.id === updatedItemDTO.id);
        if (index !== -1) {
            // Since arrays are mutable, we manually update the item in the array returned by db.getItems()
            items[index] = updatedItemDTO;
            this.saveAll(items);
            return true;
        }
        return false;
    }

    static delete(id) {
        let items = this.getAll();
        const initialLength = items.length;
        items = items.filter(item => item.id !== id);
        this.saveAll(items);
        return items.length !== initialLength;
    }
}