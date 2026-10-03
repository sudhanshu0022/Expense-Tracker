// ==========================================
// STORAGE MODULE (js/storage.js)
// Handles reading and saving data to browser localStorage
// ==========================================

const STORAGE_KEY = "expense_tracker_transactions";

// Default seed data for initial start if user has no saved data
const DEFAULT_TRANSACTIONS = [
  {
    id: 1712000000001,
    title: "Monthly Salary",
    amount: 50000,
    type: "income",
    category: "Salary",
    date: "2026-10-01",
    description: "Credited to bank account"
  },
  {
    id: 1712000000002,
    title: "Grocery Shopping",
    amount: 2500,
    type: "expense",
    category: "Food",
    date: "2026-10-02",
    description: "Supermarket groceries"
  },
  {
    id: 1712000000003,
    title: "Apartment Rent",
    amount: 15000,
    type: "expense",
    category: "Rent",
    date: "2026-10-03",
    description: "Paid via UPI"
  }
];

/**
 * Loads transactions from localStorage
 * Uses try...catch to handle corrupt or invalid JSON gracefully
 * @returns {Array} Array of transaction objects
 */
function loadTransactions() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // If nothing stored yet, save and return default seed data
      saveTransactions(DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse transactions from localStorage:", error);
    return [];
  }
}

/**
 * Saves transactions array to localStorage
 * Uses JSON.stringify() to serialize the JavaScript array
 * @param {Array} transactions
 */
function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions to localStorage:", error);
  }
}

/**
 * Clears all transactions from localStorage
 */
function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
