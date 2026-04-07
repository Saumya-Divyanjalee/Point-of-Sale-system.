// dto/CustomerDTO.js
// Plain data container for a customer record.
// DTOs carry data between layers but contain no business logic.
export class CustomerDTO {
    constructor(id, name, email, phone) {
        this.id    = id;
        this.name  = name;
        this.email = email;
        this.phone = phone;
    }
}
