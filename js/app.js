// ==========================================
// EXPENSE TRACKER - MAIN CONTROLLER (js/app.js)
// Connects UI, State, Calculations, and Storage
// ==========================================

// 1. APPLICATION STATE
let transactions = loadTransactions(); // Loaded from localStorage (js/storage.js)
let currentEditId = null;              // Tracks whether form is in 'Add' or 'Edit' mode

// 2. DOM CACHE
// Dashboard Elements
const totalBalanceEl = document.querySelector("#total-balance");
const totalIncomeEl = document.querySelector("#total-income");
const totalExpenseEl = document.querySelector("#total-expense");
const transactionCountEl = document.querySelector("#transaction-count");

// Form Elements
const formEl = document.querySelector("#transaction-form");
const formHeadingEl = document.querySelector("#form-heading");
const titleInput = document.querySelector("#title");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const dateInput = document.querySelector("#date");
const descriptionInput = document.querySelector("#description");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-btn");

// Form Error Message Spans
const titleError = document.querySelector("#title-error");
const amountError = document.querySelector("#amount-error");
const dateError = document.querySelector("#date-error");

// Controls / Filters
const searchInput = document.querySelector("#search-input");
const filterType = document.querySelector("#filter-type");
const filterCategory = document.querySelector("#filter-category");
const filterDate = document.querySelector("#filter-date");
const resetFiltersBtn = document.querySelector("#reset-filters-btn");

// Transaction List & Empty State
const transactionListEl = document.querySelector("#transaction-list");
const emptyStateEl = document.querySelector("#empty-state");

// ==========================================
// 3. CORE CALCULATION LOGIC
// ==========================================

/**
 * Calculates total income, total expense, and balance using Array.prototype.reduce()
 * @param {Array} list - Array of transaction objects
 * @returns {Object} { balance, income, expense }
 */
function calculateTotals(list) {
  return list.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "income") {
        acc.income += amount;
        acc.balance += amount;
      } else if (transaction.type === "expense") {
        acc.expense += amount;
        acc.balance -= amount;
      }
      return acc;
    },
    { balance: 0, income: 0, expense: 0 }
  );
}

// ==========================================
// 4. RENDERING & UI UPDATES
// ==========================================

/**
 * Updates the dashboard cards with latest numbers
 */
function updateDashboard() {
  const { balance, income, expense } = calculateTotals(transactions);

  totalBalanceEl.textContent = formatCurrency(balance);
  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
  transactionCountEl.textContent = transactions.length;

  // Change balance text color if negative
  if (balance < 0) {
    totalBalanceEl.style.color = "var(--expense-color)";
  } else {
    totalBalanceEl.style.color = "var(--primary)";
  }
}

/**
 * Renders the transaction list based on current filters and search
 * @param {Array} list - Filtered list of transactions to display
 */
function renderTransactions(list) {
  if (list.length === 0) {
    transactionListEl.innerHTML = "";
    emptyStateEl.classList.remove("hidden");
    return;
  }

  emptyStateEl.classList.add("hidden");

  // Generate dynamic HTML cards using map() and join()
  transactionListEl.innerHTML = list
    .map((item) => {
      const isIncome = item.type === "income";
      const sign = isIncome ? "+" : "-";
      const typeClass = isIncome ? "income" : "expense";
      const formattedAmount = `${sign} ${formatCurrency(item.amount)}`;
      const formattedDate = formatDate(item.date);
      const safeTitle = escapeHtml(item.title);
      const safeDesc = escapeHtml(item.description);

      return `
        <li class="transaction-item ${typeClass}" data-id="${item.id}">
          <div class="item-info">
            <span class="item-title">${safeTitle}</span>
            <div class="item-meta">
              <span class="item-badge">${item.category}</span>
              <span>${formattedDate}</span>
              ${safeDesc ? `<span class="item-desc" title="${safeDesc}">• ${safeDesc}</span>` : ""}
            </div>
          </div>
          <div class="item-right">
            <span class="item-amount">${formattedAmount}</span>
            <div class="item-actions">
              <button class="btn-icon btn-edit" title="Edit transaction" aria-label="Edit">✏️</button>
              <button class="btn-icon btn-delete" title="Delete transaction" aria-label="Delete">🗑️</button>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
}

/**
 * Central update function that synchronizes state, storage, and UI
 */
function updateApp() {
  saveTransactions(transactions);
  updateDashboard();
  renderFilteredList();
}

// ==========================================
// 5. FILTERING & SEARCH LOGIC
// ==========================================

/**
 * Applies search term, type, category, and date filters to transactions
 * Uses Array.prototype.filter()
 * @returns {Array} Filtered transactions
 */
function getFilteredTransactions() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedType = filterType.value;
  const selectedCategory = filterCategory.value;
  const selectedDate = filterDate.value;

  return transactions.filter((transaction) => {
    // 1. Search by title
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm);

    // 2. Filter by type (income/expense/all)
    const matchesType = selectedType === "all" || transaction.type === selectedType;

    // 3. Filter by category
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;

    // 4. Filter by date
    const matchesDate = !selectedDate || transaction.date === selectedDate;

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });
}

function renderFilteredList() {
  const filtered = getFilteredTransactions();
  renderTransactions(filtered);
}

function resetFilters() {
  searchInput.value = "";
  filterType.value = "all";
  filterCategory.value = "all";
  filterDate.value = "";
  renderFilteredList();
}

// ==========================================
// 6. FORM VALIDATION & HANDLING
// ==========================================

/**
 * Clear error messages under inputs
 */
function clearErrors() {
  titleError.textContent = "";
  amountError.textContent = "";
  dateError.textContent = "";
}

/**
 * Validates form inputs
 * @returns {boolean} true if all fields are valid, false otherwise
 */
function validateForm(title, amount, date) {
  clearErrors();
  let isValid = true;

  if (!title || title.trim() === "") {
    titleError.textContent = "Title is required.";
    isValid = false;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    amountError.textContent = "Please enter a valid amount greater than 0.";
    isValid = false;
  }

  if (!date) {
    dateError.textContent = "Please select a valid date.";
    isValid = false;
  }

  return isValid;
}

/**
 * Resets form and switches out of Edit mode back to Add mode
 */
function resetForm() {
  formEl.reset();
  clearErrors();
  currentEditId = null;
  formHeadingEl.textContent = "Add New Transaction";
  submitBtn.textContent = "Add Transaction";
  cancelBtn.classList.add("hidden");
  setDefaultDate();
}

/**
 * Sets the date input to today's date by default
 */
function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

/**
 * Handles Form Submit (Both Add and Edit operations)
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = amountInput.value.trim();
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;
  const description = descriptionInput.value.trim();

  // Validate inputs
  if (!validateForm(title, amount, date)) {
    return;
  }

  const parsedAmount = parseFloat(amount);

  if (currentEditId !== null) {
    // EDIT MODE: Update existing transaction
    const index = transactions.findIndex((t) => t.id === currentEditId);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        title,
        amount: parsedAmount,
        type,
        category,
        date,
        description
      };
    }
  } else {
    // ADD MODE: Create new transaction
    const newTransaction = {
      id: generateId(),
      title,
      amount: parsedAmount,
      type,
      category,
      date,
      description
    };
    // Add to the beginning of the list
    transactions.unshift(newTransaction);
  }

  resetForm();
  updateApp();
}

/**
 * Pre-populates the form when user clicks "Edit"
 * @param {number} id
 */
function startEditTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;

  currentEditId = transaction.id;

  // Populate inputs
  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  categoryInput.value = transaction.category;
  dateInput.value = transaction.date;
  descriptionInput.value = transaction.description || "";

  // Update UI for Edit Mode
  formHeadingEl.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
  cancelBtn.classList.remove("hidden");

  // Scroll smoothly to the form
  formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus();
}

/**
 * Deletes a transaction by ID after confirmation
 * @param {number} id
 */
function deleteTransaction(id) {
  const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
  if (!confirmDelete) return;

  // Filter out the transaction
  transactions = transactions.filter((t) => t.id !== id);

  // If user was editing this item, reset form
  if (currentEditId === id) {
    resetForm();
  }

  updateApp();
}

// ==========================================
// 7. EVENT DELEGATION & EVENT LISTENERS
// ==========================================

// Form Submit & Cancel
formEl.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", resetForm);

// Search & Filter Listeners (Real-time updates)
searchInput.addEventListener("input", renderFilteredList);
filterType.addEventListener("change", renderFilteredList);
filterCategory.addEventListener("change", renderFilteredList);
filterDate.addEventListener("change", renderFilteredList);
resetFiltersBtn.addEventListener("click", resetFilters);

// Event Delegation for Edit & Delete buttons on dynamic items
transactionListEl.addEventListener("click", (e) => {
  const itemEl = e.target.closest(".transaction-item");
  if (!itemEl) return;

  const id = Number(itemEl.dataset.id);

  // Check if delete button was clicked
  if (e.target.closest(".btn-delete")) {
    deleteTransaction(id);
  }

  // Check if edit button was clicked
  if (e.target.closest(".btn-edit")) {
    startEditTransaction(id);
  }
});

// ==========================================
// 8. INITIALIZE APPLICATION
// ==========================================
setDefaultDate();
updateApp();
