// dto/ItemDTO.js
export class ItemDTO {
    constructor(id, name, price, stock, image) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.image = image;
    }
}