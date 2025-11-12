// model/ItemModel.js
import { db } from '../db/database.js';
import { ItemDTO } from '../dto/ItemDTO.js';

const ITEM_PREFIX = 'I';
const ITEM_KEY = 'spicy-stop_menuItems';

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
            'https://media.gettyimages.com/id/164646124/photo/burning-chili-pepper-fire-flame.jpg?s=612x612&w=0&k=20&c=80CoHWcjAd_u7t4Pzob3_1z2W04X5Poe_dCWX4LcD3M='
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