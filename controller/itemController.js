// Item Controller - Handles item/product operations
const itemController = {
    // Initialize controller
    init() {
        this.loadItems();
    },

    // Load and display items
    loadItems() {
        try {
            const items = ItemModel.getAll();
            this.renderTable(items);
            this.renderGrid(items);

            // Update dashboard if available
            if (typeof dashboardController !== 'undefined') {
                dashboardController.update();
            }
        } catch (error) {
            AlertUtil.showError('Failed to load items: ' + error.message);
        }
    },

    // Render items table
    renderTable(items) {
        const tbody = document.getElementById('itemTableBody');
        if (!tbody) return;

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5"><div class="empty-state"><i class="fas fa-cake"></i><p>No items added yet</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.code}</td>
                <td>${i.name}</td>
                <td>$${parseFloat(i.price).toFixed(2)}</td>
                <td><span class="badge ${i.qty < 5 ? 'bg-danger' : 'bg-info'}">${i.qty}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="itemController.openEditModal(${i.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="itemController.deleteItem(${i.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // Render items grid for order page
    renderGrid(items) {
        const grid = document.getElementById('itemGrid');
        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = '<div class="col-12"><div class="empty-state"><i class="fas fa-cake"></i><p>No items available</p></div></div>';
            return;
        }

        grid.innerHTML = items.map(i => `
            <div class="col-md-4 col-sm-6">
                <div class="card item-card ${i.qty === 0 ? 'opacity-50' : ''}" onclick="itemController.selectItemForOrder(${i.id})">
                    <div class="card-body text-center">
                        <i class="fas fa-birthday-cake fa-3x text-primary mb-3"></i>
                        <h6>${i.name}</h6>
                        <p class="mb-1 text-muted">${i.code}</p>
                        <h5 class="text-primary">$${parseFloat(i.price).toFixed(2)}</h5>
                        <small class="${i.qty < 5 ? 'text-danger' : 'text-muted'}">
                            Stock: ${i.qty} ${i.qty === 0 ? '(Out of Stock)' : ''}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Open modal to add new item
    openAddModal() {
        document.getElementById('itemModalTitle').textContent = 'Add Item';
        document.getElementById('itemId').value = '';
        document.getElementById('itemCode').value = '';
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemQty').value = '';
    },

    // Open modal to edit item
    openEditModal(id) {
        try {
            const item = ItemModel.getById(id);
            document.getElementById('itemModalTitle').textContent = 'Edit Item';
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemCode').value = item.code;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemQty').value = item.qty;

            const modal = new bootstrap.Modal(document.getElementById('itemModal'));
            modal.show();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Save item (add or update)
    saveItem() {
        try {
            const code = document.getElementById('itemCode').value.trim();
            const name = document.getElementById('itemName').value.trim();
            const price = document.getElementById('itemPrice').value;
            const qty = document.getElementById('itemQty').value;
            const id = document.getElementById('itemId').value;

            if (!code || !name || !price || !qty) {
                AlertUtil.showError('Please fill in all required fields');
                return;
            }

            const item = { code, name, price, qty };

            if (id) {
                // Update existing item
                ItemModel.update(parseInt(id), item);
                AlertUtil.showSuccess('Item updated successfully');
            } else {
                // Add new item
                ItemModel.add(item);
                AlertUtil.showSuccess('Item added successfully');
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('itemModal'));
            modal.hide();

            // Reload items
            this.loadItems();
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Delete item
    deleteItem(id) {
        try {
            if (AlertUtil.confirm('Are you sure you want to delete this item?')) {
                ItemModel.delete(id);
                AlertUtil.showSuccess('Item deleted successfully');
                this.loadItems();
            }
        } catch (error) {
            AlertUtil.showError(error.message);
        }
    },

    // Select item for order (delegates to orderController)
    selectItemForOrder(itemId) {
        if (typeof orderController !== 'undefined') {
            orderController.selectItem(itemId);
        }
    },

    // Search items
    searchItems(query) {
        try {
            const items = ItemModel.search(query);
            this.renderTable(items);
        } catch (error) {
            AlertUtil.showError('Search failed: ' + error.message);
        }
    }
};