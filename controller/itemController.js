// controller/ItemController.js
import { ItemModel } from '../model/ItemModel.js';
import { ItemDTO } from '../dto/ItemDTO.js';

export class ItemController {
    constructor() {
        this.editingItemId = null;
        this.itemsTableBody = document.getElementById('itemsTable');
        this.updateBtn = document.getElementById('updateBtn');
        this.deleteBtn = document.getElementById('deleteBtn');

        this.setupFormListeners();
    }

    setupFormListeners() {
        document.querySelector('#item-management .btn-add').onclick = () => this.addMenuItem();
        this.updateBtn.onclick = () => this.updateMenuItem();
        this.deleteBtn.onclick = () => this.deleteMenuItem();
        document.querySelector('#item-management .btn-clear').onclick = () => this.clearItemForm();
    }

    loadMenuItems() {
        const items = ItemModel.getAll();
        this.itemsTableBody.innerHTML = '';

        items.forEach(item => {
            const tr = document.createElement('tr');
            const statusClass = item.stock < 10 ? 'low-stock' : '';
            const statusText = item.stock > 0
                ? '<span class="badge" style="background: rgba(74, 124, 89, 0.2); color: var(--success);">Available</span>'
                : '<span class="badge badge-unpaid">Out of Stock</span>';

            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.name}</strong></td>
                <td>LKR ${item.price.toFixed(2)}</td>
                <td class="${statusClass}">${item.stock}</td>
                <td>${statusText}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="itemController.editMenuItem('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            this.itemsTableBody.appendChild(tr);
        });
        if (window.app) window.app.updateDashboardItemsCount(items.length);
    }

    addMenuItem() {
        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const stock = parseInt(document.getElementById('itemStock').value);

        if (!name || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
            alert('Please ensure all fields are filled and valid.');
            return;
        }

        ItemModel.create(name, price, stock);
        this.loadMenuItems();
        this.clearItemForm();
        alert('Menu item added successfully!');
    }

    editMenuItem(id) {
        const item = ItemModel.getById(id);
        if (item) {
            this.editingItemId = id;
            document.getElementById('itemIdDisplay').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemStock').value = item.stock;

            this.updateBtn.style.display = 'inline-block';
            this.deleteBtn.style.display = 'inline-block';
        }
    }

    updateMenuItem() {
        if (!this.editingItemId) return;

        const currentItem = ItemModel.getById(this.editingItemId);
        const updatedItem = new ItemDTO(
            this.editingItemId,
            document.getElementById('itemName').value.trim(),
            parseFloat(document.getElementById('itemPrice').value),
            parseInt(document.getElementById('itemStock').value),
            currentItem.image
        );

        if (ItemModel.update(updatedItem)) {
            this.loadMenuItems();
            this.clearItemForm();
            alert('Menu item updated!');
        }
    }

    deleteMenuItem() {
        if (!this.editingItemId) return;

        if (confirm('Are you sure you want to delete this item?')) {
            ItemModel.delete(this.editingItemId);
            this.loadMenuItems();
            this.clearItemForm();
            alert('Menu item deleted!');
        }
    }

    clearItemForm() {
        this.editingItemId = null;
        document.getElementById('editItemId').value = '';
        document.getElementById('itemIdDisplay').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemStock').value = '';
        this.updateBtn.style.display = 'none';
        this.deleteBtn.style.display = 'none';
    }

    getAllItems() {
        return ItemModel.getAll();
    }
}