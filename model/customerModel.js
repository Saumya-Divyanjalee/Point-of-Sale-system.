// model/CustomerModel.js
import { db } from '../db/database.js';
import { CustomerDTO } from '../dto/CustomerDTO.js';

const CUSTOMER_PREFIX = 'SC';
const CUSTOMER_KEY = 'spicy-stop_customer';

export class CustomerModel {
    static getAll() {
        return db.getCustomers().map(c => new CustomerDTO(c.id, c.name, c.email, c.phone));
    }

    static saveAll(customers) {
        db.saveCustomers(customers);
    }

    static getById(id) {
        return this.getAll().find(c => c.id === id);
    }

    static create(name, email, phone) {
        const customers = this.getAll();
        const id = db.getNextId(CUSTOMER_KEY, CUSTOMER_PREFIX);
        const newCustomer = new CustomerDTO(id, name, email, phone);
        customers.push(newCustomer);
        this.saveAll(customers);
        return newCustomer;
    }

    static update(updatedCustomerDTO) {
        let customers = this.getAll();
        const index = customers.findIndex(c => c.id === updatedCustomerDTO.id);
        if (index !== -1) {
            customers[index] = updatedCustomerDTO;
            this.saveAll(customers);
            return true;
        }
        return false;
    }

    static delete(id) {
        let customers = this.getAll();
        const initialLength = customers.length;
        customers = customers.filter(c => c.id !== id);
        this.saveAll(customers);
        return customers.length !== initialLength;
    }
}