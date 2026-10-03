// ==========================================
// UTILITY FUNCTIONS (js/utils.js)
// Pure helper functions with single responsibilities
// ==========================================

/**
 * Format a number as Indian Rupee currency (e.g., 50000 -> ₹50,000.00)
 * Uses the built-in browser Intl.NumberFormat API
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a date string (YYYY-MM-DD) into user-friendly format (DD MMM YYYY)
 * e.g., "2026-10-01" -> "01 Oct 2026"
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00'); // Enforce local midnight
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Generate a unique ID for a new transaction using timestamp + random integer
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Escapes HTML characters to prevent XSS (Cross-Site Scripting)
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
