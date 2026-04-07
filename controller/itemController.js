// controller/ItemController.js
// Mediates between the Item form/table in the UI and ItemModel.
// Reads user input, delegates to the model, then refreshes the view.

import { ItemModel } from '../model/ItemModel.js';
import { ItemDTO }   from '../dto/ItemDTO.js';

export class ItemController {

    constructor() {
        // ID of the item currently loaded in the edit form, or null.
        this.editingItemId = null;

        // Cached DOM references - avoids repeated getElementById calls.
        this.itemsTableBody = document.getElementById('itemsTable');
        this.updateBtn      = document.getElementById('updateBtn');
        this.deleteBtn      = document.getElementById('deleteBtn');

        this._bindFormButtons();
    }

    // ------------------------------------------------------------------
    // Button wiring
    // ------------------------------------------------------------------

    _bindFormButtons() {
        document.querySelector('#item-management .btn-add').onclick   = () => this.addMenuItem();
        document.querySelector('#item-management .btn-clear').onclick = () => this.clearItemForm();
        this.updateBtn.onclick = () => this.updateMenuItem();
        this.deleteBtn.onclick = () => this.deleteMenuItem();
    }

    // ------------------------------------------------------------------
    // Table rendering
    // ------------------------------------------------------------------

    // Render all menu items into the items table.
    loadMenuItems() {
        const items = ItemModel.getAll();
        this.itemsTableBody.innerHTML = '';

        if (items.length === 0) {
            this.itemsTableBody.innerHTML =
                '<tr><td colspan="7" class="text-center py-4 text-muted">No menu items yet. Add one above.</td></tr>';
            if (window.app) window.app.updateDashboardItemsCount(0);
            return;
        }

        items.forEach(item => {
            const tr          = document.createElement('tr');
            const isLowStock  = item.stock > 0 && item.stock < 10;
            const isOutStock  = item.stock === 0;

            const stockClass  = isLowStock ? 'low-stock' : '';
            const statusBadge = isOutStock
                ? '<span class="badge badge-unpaid">Out of Stock</span>'
                : '<span class="badge badge-paid">Available</span>';

            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${this._escape(item.name)}</strong></td>
                <td>LKR ${item.price.toFixed(2)}</td>
                <td class="${stockClass}">${item.stock}</td>
                <td>${item.category || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-edit"
                            onclick="itemController.editMenuItem('${item.id}')"
                            title="Edit item">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            this.itemsTableBody.appendChild(tr);
        });

        if (window.app) window.app.updateDashboardItemsCount(items.length);
    }

    // ------------------------------------------------------------------
    // CRUD operations
    // ------------------------------------------------------------------

    addMenuItem() {
        const name  = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const stock = parseInt(document.getElementById('itemStock').value, 10);

        const result = ItemModel.create(name, price, stock);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadMenuItems();
        this.clearItemForm();
        this._showSuccess('Menu item added successfully.');
    }

    // Load an item's data into the form for editing.
    editMenuItem(id) {
        const item = ItemModel.getById(id);
        if (!item) {
            this._showError('Item not found.');
            return;
        }

        this.editingItemId = id;
        document.getElementById('itemIdDisplay').value = item.id;
        document.getElementById('itemName').value      = item.name;
        document.getElementById('itemPrice').value     = item.price;
        document.getElementById('itemStock').value     = item.stock;

        // Show Update and Delete buttons; the Add button remains visible
        // but its action is guarded by editingItemId being null.
        this.updateBtn.style.display = 'inline-block';
        this.deleteBtn.style.display = 'inline-block';

        // Scroll form into view on small screens
        document.getElementById('itemIdDisplay').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    updateMenuItem() {
        if (!this.editingItemId) return;

        const currentItem = ItemModel.getById(this.editingItemId);
        if (!currentItem) {
            this._showError('Item no longer exists. Please refresh.');
            this.clearItemForm();
            return;
        }

        const updatedDTO = new ItemDTO(
            this.editingItemId,
            document.getElementById('itemName').value.trim(),
            parseFloat(document.getElementById('itemPrice').value),
            parseInt(document.getElementById('itemStock').value, 10),
            currentItem.image,          // Preserve existing image
            currentItem.category        // Preserve existing category
        );

        const result = ItemModel.update(updatedDTO);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadMenuItems();
        this.clearItemForm();
        this._showSuccess('Menu item updated.');
    }

    deleteMenuItem() {
        if (!this.editingItemId) return;

        const item = ItemModel.getById(this.editingItemId);
        const name = item ? `"${item.name}"` : 'this item';

        if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

        const result = ItemModel.delete(this.editingItemId);

        if (!result.success) {
            this._showError(result.error);
            return;
        }

        this.loadMenuItems();
        this.clearItemForm();
        this._showSuccess('Menu item deleted.');
    }

    // ------------------------------------------------------------------
    // Form helpers
    // ------------------------------------------------------------------

    clearItemForm() {
        this.editingItemId = null;
        document.getElementById('itemIdDisplay').value = '';
        document.getElementById('itemName').value      = '';
        document.getElementById('itemPrice').value     = '';
        document.getElementById('itemStock').value     = '';
        this.updateBtn.style.display = 'none';
        this.deleteBtn.style.display = 'none';
        this._clearMessages();
    }

    // Returns all items - used by OrderController and the POS view.
    getAllItems() {
        return ItemModel.getAll();
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    // Escape HTML special chars to prevent XSS when injecting user data.
    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    _showError(message) {
        this._showBanner('itemFormMsg', message, 'error');
    }

    _showSuccess(message) {
        this._showBanner('itemFormMsg', message, 'success');
    }

    _showBanner(elId, message, type) {
        let el = document.getElementById(elId);
        if (!el) return;
        el.textContent  = message;
        el.className    = `form-msg form-msg-${type}`;
        el.style.display = 'block';
        setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
    }

    _clearMessages() {
        const el = document.getElementById('itemFormMsg');
        if (el) el.style.display = 'none';
    }
}
