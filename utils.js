// Utility functions

// Debug logging that can be disabled in production
function log(message, data = null) {
    if (CONFIG.DEBUG) {
        if (data) console.log(message, data);
        else console.log(message);
    }
}

// Show error message to user
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error-message" style="color: var(--danger); padding: 10px; background: rgba(255,0,0,0.1); border-radius: 4px; margin: 10px 0;">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>`;
        element.classList.add('error');
        setTimeout(() => element.classList.remove('error'), 5000);
    }
}

// Validate numeric input
function validateNumericInput(value, fieldName, min = CONFIG.VALIDATION.MIN_NUMBER, max = CONFIG.VALIDATION.MAX_NUMBER) {
    if (value === '' || value === null || value === undefined) {
        throw new Error(`${fieldName} is required`);
    }
    const num = parseFloat(value);
    if (isNaN(num)) throw new Error(`${fieldName} must be a valid number`);
    if (num < min) throw new Error(`${fieldName} must be at least ${min}`);
    if (num > max) throw new Error(`${fieldName} must be no more than ${max}`);
    return num;
}

// Validate chemical formula
function validateChemicalFormula(formula) {
    if (!formula || formula.trim() === '') {
        throw new Error('Chemical formula is required');
    }

    // Basic validation - must contain only letters, numbers, parentheses
    const validPattern = /^[A-Za-z0-9()\.]+$/;
    if (!validPattern.test(formula)) {
        throw new Error('Invalid chemical formula format');
    }

    return formula.trim();
}