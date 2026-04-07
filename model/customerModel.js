// model/CustomerModel.js
// Handles all data operations for the customers collection.
// Communicates with the database layer through `db` only.

import { db }          from '../db/database.js';
import { CustomerDTO } from '../dto/CustomerDTO.js';

// ------------------------------------------------------------------
// Validation helpers (private to this module)
// ------------------------------------------------------------------

// Returns true when `value` is a non-empty string after trimming.
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

// Basic email format check.
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Accepts Sri Lankan mobile and landline patterns, as well as
// international numbers starting with +. Minimum 7 digits.
function isValidPhone(phone) {
    return /^[+\d\s\-()]{7,20}$/.test(phone.trim());
}

// ------------------------------------------------------------------
// CustomerModel
// ------------------------------------------------------------------
export class CustomerModel {

    // Retrieve all customers as CustomerDTO instances.
    static getAll() {
        return db.getCustomers().map(
            c => new CustomerDTO(c.id, c.name, c.email, c.phone)
        );
    }

    // Persist the full customers array to the database.
    static saveAll(customers) {
        db.saveCustomers(customers);
    }

    // Find a single customer by ID. Returns CustomerDTO or null.
    static getById(id) {
        return this.getAll().find(c => c.id === id) ?? null;
    }

    // Validate and create a new customer.
    // Returns { success, data, error }.
    static create(name, email, phone) {
        const result = this._validate(name, email, phone);
        if (!result.valid) return { success: false, error: result.error };

        // Check for duplicate email
        const existing = this.getAll().find(
            c => c.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existing) {
            return { success: false, error: 'A customer with this email already exists.' };
        }

        const id          = db.nextCustomerId();
        const newCustomer = new CustomerDTO(id, name.trim(), email.trim(), phone.trim());
        const customers   = this.getAll();
        customers.push(newCustomer);
        this.saveAll(customers);

        return { success: true, data: newCustomer };
    }

    // Validate and update an existing customer.
    // Returns { success, error }.
    static update(updatedDTO) {
        const result = this._validate(updatedDTO.name, updatedDTO.email, updatedDTO.phone);
        if (!result.valid) return { success: false, error: result.error };

        // Duplicate email check - exclude the current record itself
        const duplicate = this.getAll().find(
            c => c.email.toLowerCase() === updatedDTO.email.trim().toLowerCase()
                && c.id !== updatedDTO.id
        );
        if (duplicate) {
            return { success: false, error: 'Another customer already uses this email.' };
        }

        let customers = this.getAll();
        const index   = customers.findIndex(c => c.id === updatedDTO.id);

        if (index === -1) return { success: false, error: 'Customer not found.' };

        customers[index] = new CustomerDTO(
            updatedDTO.id,
            updatedDTO.name.trim(),
            updatedDTO.email.trim(),
            updatedDTO.phone.trim()
        );
        this.saveAll(customers);
        return { success: true };
    }

    // Remove a customer by ID.
    // Returns { success, error }.
    static delete(id) {
        let customers = this.getAll();
        const before  = customers.length;
        customers     = customers.filter(c => c.id !== id);

        if (customers.length === before) {
            return { success: false, error: 'Customer not found.' };
        }

        this.saveAll(customers);
        return { success: true };
    }

    // ------------------------------------------------------------------
    // Private validation
    // ------------------------------------------------------------------
    static _validate(name, email, phone) {
        if (!isNonEmptyString(name))   return { valid: false, error: 'Name is required.'           };
        if (name.trim().length < 2)    return { valid: false, error: 'Name must be at least 2 characters.' };
        if (!isNonEmptyString(email))  return { valid: false, error: 'Email is required.'           };
        if (!isValidEmail(email))      return { valid: false, error: 'Please enter a valid email.'  };
        if (!isNonEmptyString(phone))  return { valid: false, error: 'Phone is required.'           };
        if (!isValidPhone(phone))      return { valid: false, error: 'Please enter a valid phone number.' };
        return { valid: true };
    }
}
