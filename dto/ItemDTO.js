// dto/ItemDTO.js
// Plain data container for a menu item record.
export class ItemDTO {
    constructor(id, name, price, stock, image, category = '') {
        this.id       = id;
        this.name     = name;
        this.price    = price;
        this.stock    = stock;
        this.image    = image;
        this.category = category;
    }
}
