export default class ItemModel {
    constructor(id,model,price,qty) {
        this._item_id = id;
        this._model = model;
        this._price = price;
        this._qty = qty;
    }


    get item_id() {
        return this._item_id;
    }

    set item_id(value) {
        this._item_id = value;
    }

    get model() {
        return this._model;
    }

    set model(value) {
        this._model = value;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        this._price = value;
    }

    get qty() {
        return this._qty;
    }

    set qty(value) {
        this._qty = value;
    }
}