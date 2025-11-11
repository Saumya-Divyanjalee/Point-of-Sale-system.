export default class OrderItemModel {
    constructor(itemId,qty) {
        this._itemId = itemId;
        this._qty = qty;
    }

    get itemId() {
        return this._itemId;
    }

    set itemId(value) {
        this._itemId = value;
    }

    get qty() {
        return this._qty;
    }

    set qty(value) {
        this._qty = value;
    }
}