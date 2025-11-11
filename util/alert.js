// Alert Utility Functions
const AlertUtil = {
    // Show success message
    showSuccess(message) {
        alert('✓ ' + message);
    },

    // Show error message
    showError(message) {
        alert('✗ Error: ' + message);
    },

    // Show warning message
    showWarning(message) {
        alert('⚠ Warning: ' + message);
    },

    // Show info message
    showInfo(message) {
        alert('ℹ ' + message);
    },

    // Confirm dialog
    confirm(message) {
        return confirm(message);
    },

    // Validation error alert
    showValidationError(field, message) {
        alert(`Validation Error in ${field}: ${message}`);
    },

    // Multiple errors
    showErrors(errors) {
        const errorMsg = errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
        alert('Please fix the following errors:\n\n' + errorMsg);
    }
};