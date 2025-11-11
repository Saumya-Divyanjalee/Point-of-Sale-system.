export default class CustomerModel{
    constructor(id,name,address,nic,email,tel){
        this._customer_id = id;
        this._name = name;
        this._address = address;
        this._nic = nic;
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

    set name(value) {
        this._name = value;
    }

    get address() {
        return this._address;
    }

    set address(value) {
        this._address = value;
    }

    get nic() {
        return this._nic;
    }

    set nic(value) {
        this._nic = value;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get tel() {
        return this._tel;
    }

    set tel(value) {
        this._tel = value;
    }
}