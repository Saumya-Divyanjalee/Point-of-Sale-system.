export default class CustomerModel {
    constructor(id, name, address,nic,email,tel) {
        this._customer_id  = id;
        this._name = name;
        this._address = address;
        this._email = email;
        this._tel = tel;

    }

    get customer_id() {
        return this._customer_id;
    }
    set customer_id(value) {
        this._customer_id = value;
    }
    get name() {
        return this._name;
    }
    get address() {
        return this._address;
    }
    get email() {
        return this._email;
    }
    get phone() {

    }
}