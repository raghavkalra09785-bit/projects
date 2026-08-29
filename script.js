// Expense Tracker Application

const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const totalAmount = document.getElementById('totalAmount');
const expenseCount = document.getElementById('expenseCount');
const averageAmount = document.getElementById('averageAmount');
const categoryFilter = document.getElementById('categoryFilter');
const monthFilter = document.getElementById('monthFilter');
const dateInput = document.getElementById('date');

// Set today's date as default
dateInput.valueAsDate = new Date();

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Event Listeners
expenseForm.addEventListener('submit', addExpense);
categoryFilter.addEventListener('change', filterExpenses);
monthFilter.addEventListener('change', filterExpenses);

// Initialize
displayExpenses();
updateSummary();

// Add Expense Function
function addExpense(e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !category || !date) {
        alert('Please fill in all fields');
        return;
    }

    const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date,
        timestamp: new Date().toLocaleString()
    };

    expenses.push(expense);
    saveExpenses();
    expenseForm.reset();
    dateInput.valueAsDate = new Date();
    displayExpenses();
    updateSummary();
    showNotification('Expense added successfully!');
}

// Display Expenses
function displayExpenses() {
    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = '<p class="no-expenses">No expenses found. Add one to get started!</p>';
        return;
    }

    expensesList.innerHTML = filteredExpenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="expense-details">
                    <div class="expense-description">${escapeHtml(expense.description)}</div>
                    <div class="expense-meta">
                        <span class="expense-category">${expense.category}</span>
                        <span class="expense-date">${formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        `)
        .join('');
}

// Filter Expenses
function getFilteredExpenses() {
    let filtered = expenses;

    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    const selectedMonth = monthFilter.value;
    if (selectedMonth) {
        filtered = filtered.filter(exp => exp.date.startsWith(selectedMonth));
    }

    return filtered;
}

function filterExpenses() {
    displayExpenses();
    updateSummary();
}

function resetFilters() {
    categoryFilter.value = '';
    monthFilter.value = '';
    filterExpenses();
    showNotification('Filters reset!');
}

// Update Summary
function updateSummary() {
    const filteredExpenses = getFilteredExpenses();
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    totalAmount.textContent = `$${total.toFixed(2)}`;
    expenseCount.textContent = count;
    averageAmount.textContent = `$${average.toFixed(2)}`;
}

// Delete Expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        displayExpenses();
        updateSummary();
        showNotification('Expense deleted!');
    }
}

// Clear All Expenses
function clearAllExpenses() {
    if (confirm('Are you sure? This will delete ALL expenses and cannot be undone!')) {
        expenses = [];
        localStorage.clear();
        displayExpenses();
        updateSummary();
        showNotification('All expenses cleared!');
    }
}

// Export to CSV
function exportToCSV() {
    const filteredExpenses = getFilteredExpenses();
    
    if (filteredExpenses.length === 0) {
        alert('No expenses to export!');
        return;
    }

    let csv = 'Date,Description,Category,Amount\n';
    
    filteredExpenses.forEach(expense => {
        csv += `"${expense.date}","${expense.description}","${expense.category}",${expense.amount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('Expenses exported to CSV!');
}

// Save to Local Storage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-in;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);