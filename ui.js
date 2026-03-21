// UI related functions

let chartInstance = null;

const expenseForm = document.getElementById("expense-form");
const dateInput = document.getElementById("date");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const monthSelect = document.getElementById("month-select");
const expensesHeading = document.getElementById("expenses-heading");
const expenseList = document.getElementById("expense-list");
const totalAmount = document.getElementById("total-amount");
const emptyState = document.getElementById("empty-state");
const targetOverview = document.getElementById("target-overview");
const categoryChart = document.getElementById("category-chart");
const chartEmptyState = document.getElementById("chart-empty-state");
const targetsMonthLabel = document.getElementById("targets-month-label");
const targetsEditor = document.getElementById("targets-editor");
const saveTargetsBtn = document.getElementById("save-targets-btn");
const resetTargetsBtn = document.getElementById("reset-targets-btn");
const targetsStatus = document.getElementById("targets-status");
const newCategoryNameInput = document.getElementById("new-category-name");
const newCategoryTargetInput = document.getElementById("new-category-target");
const addCategoryBtn = document.getElementById("add-category-btn");
const categoriesList = document.getElementById("categories-list");
const categoriesStatus = document.getElementById("categories-status");
const tileMonthSpend = document.getElementById("tile-month-spend");
const tileMonthTarget = document.getElementById("tile-month-target");
const tileUtilization = document.getElementById("tile-utilization");
const tileMonthCount = document.getElementById("tile-month-count");
const tileTrendSpend = document.getElementById("tile-trend-spend");
const tileTrendTarget = document.getElementById("tile-trend-target");
const tileTrendUtilization = document.getElementById("tile-trend-utilization");
const tileTrendMonths = document.getElementById("tile-trend-months");
const summarySpendTile = document.getElementById("summary-spend-tile");
const summaryTargetTile = document.getElementById("summary-target-tile");
const summaryUtilizationTile = document.getElementById("summary-utilization-tile");
const budgetAlertBanner = document.getElementById("budget-alert-banner");
const expenseSearch = document.getElementById("expense-search");
const exportDataBtn = document.getElementById("export-data-btn");
const importDataBtn = document.getElementById("import-data-btn");
const importDataInput = document.getElementById("import-data-input");
const dataStatus = document.getElementById("data-status");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function renderApp() {
  renderMonthOptions();
  renderCategoryOptions();
  renderCategoryManager();
  const monthExpenses = getSelectedMonthExpenses();
  const searchTerm = expenseSearch.value.toLowerCase();
  const filteredExpenses = monthExpenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm) ||
    expense.category.toLowerCase().includes(searchTerm)
  );
  renderSummaryTiles(monthExpenses);
  renderExpenses(monthExpenses, filteredExpenses);
  renderTargetsEditor();
  renderUtilizationChart(monthExpenses);
}

function setActiveTab(tabKey) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tabKey);
  });
}

function renderMonthOptions() {
  const availableMonths = Object.keys(state.expensesByMonth);
  const currentMonth = getCurrentMonthKey();
  if (!availableMonths.includes(currentMonth)) {
    availableMonths.push(currentMonth);
  }
  const monthKeys = availableMonths.sort().reverse();

  if (!monthKeys.includes(state.selectedMonth)) {
    state.selectedMonth = currentMonth;
  }

  monthSelect.innerHTML = monthKeys
    .map((monthKey) => `<option value="${monthKey}">${formatMonthLabel(monthKey)}</option>`)
    .join("");
  monthSelect.value = state.selectedMonth;
}

function renderCategoryOptions() {
  const selected = categoryInput.value;
  const options = state.categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  categoryInput.innerHTML = `<option value="" selected disabled>Select a category</option>${options}`;
  if (state.categories.includes(selected)) {
    categoryInput.value = selected;
  } else {
    categoryInput.value = "";
  }
}

function renderCategoryManager() {
  categoriesList.innerHTML = state.categories
    .map((category) => `
      <div class="category-item">
        <span class="category-item-name">${escapeHtml(category)}</span>
        <span class="category-item-target">Default: ${formatCurrency(getBaseTarget(category, state.categoryTargets))}</span>
        <button class="remove-category-btn" data-category="${escapeHtml(category)}" type="button">Remove</button>
      </div>
    `)
    .join("");
}

function addCategory() {
  const name = newCategoryNameInput.value.trim();
  const targetRaw = newCategoryTargetInput.value.trim();
  const target = targetRaw === "" ? 0 : Number.parseFloat(targetRaw);

  if (!name) {
    categoriesStatus.textContent = "Category name is required.";
    return;
  }
  const alreadyExists = state.categories.some((category) => category.toLowerCase() === name.toLowerCase());
  if (alreadyExists) {
    categoriesStatus.textContent = "Category already exists.";
    return;
  }
  if (!Number.isFinite(target) || target < 0) {
    categoriesStatus.textContent = "Please enter a valid default target (0 or greater).";
    return;
  }

  state.categories.push(name);
  state.categoryTargets[name] = Math.round(target);
  saveState(state);
  renderApp();
  categoriesStatus.textContent = `Added category "${name}".`;
  newCategoryNameInput.value = "";
  newCategoryTargetInput.value = "";
}

function handleCategoryAction(event) {
  const removeButton = event.target.closest(".remove-category-btn");
  if (!removeButton) {
    return;
  }

  const category = removeButton.dataset.category;
  if (!category) {
    return;
  }
  if (state.categories.length <= 1) {
    categoriesStatus.textContent = "At least one category is required.";
    return;
  }

  state.categories = state.categories.filter((item) => item !== category);
  delete state.categoryTargets[category];
  Object.keys(state.targetsByMonth).forEach((monthKey) => {
    if (state.targetsByMonth[monthKey]) {
      delete state.targetsByMonth[monthKey][category];
    }
  });

  if (categoryInput.value === category) {
    categoryInput.value = "";
  }

  saveState(state);
  renderApp();
  categoriesStatus.textContent = `Removed category "${category}".`;
}

function getSelectedMonthExpenses() {
  return (state.expensesByMonth[state.selectedMonth] || []).slice();
}

function renderExpenses(allExpenses, filteredExpenses) {
  expenseList.innerHTML = "";
  expensesHeading.textContent = `Expenses - ${formatMonthLabel(state.selectedMonth)}`;

  filteredExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((expense) => {
      const li = document.createElement("li");
      li.className = "expense-item";
      li.innerHTML = `
        <div class="expense-main">
          <div class="expense-top">
            <strong>${formatDate(expense.date)}</strong>
            <span class="category-chip">${escapeHtml(expense.category)}</span>
          </div>
          <div class="expense-description">${escapeHtml(expense.description)}</div>
        </div>
        <div class="expense-right">
          <span class="expense-amount">${formatCurrency(expense.amount)}</span>
          <button class="delete-btn" data-month="${state.selectedMonth}" data-id="${expense.id}" type="button">Delete</button>
        </div>
      `;
      expenseList.appendChild(li);
    });

  const total = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
  const showEmpty = allExpenses.length === 0 ? "No expenses yet. Add your first expense." : filteredExpenses.length === 0 ? "No expenses match your search." : "none";
  emptyState.textContent = showEmpty === "none" ? "" : showEmpty;
  emptyState.style.display = showEmpty === "none" ? "none" : "block";
}

function renderSummaryTiles(monthExpenses) {
  const targetsForMonth = getTargetsForMonth(state.selectedMonth, state.categories, state.targetsByMonth, state.categoryTargets);
  const monthSpend = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthTarget = state.categories.reduce((sum, category) => sum + (targetsForMonth[category] || 0), 0);
  const utilization = monthTarget > 0 ? (monthSpend / monthTarget) * 100 : 0;
  const monthCount = Object.keys(state.expensesByMonth).length;
  const overallOverBudget = monthSpend > monthTarget && monthTarget >= 0;
  const previousMonthKey = getPreviousMonthKey(state.selectedMonth);
  const previousExpenses = (state.expensesByMonth[previousMonthKey] || []).slice();
  const previousTargets = getTargetsForMonth(previousMonthKey, state.categories, state.targetsByMonth, state.categoryTargets);
  const previousSpend = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousTarget = state.categories.reduce((sum, category) => sum + (previousTargets[category] || 0), 0);
  const previousUtilization = previousTarget > 0 ? (previousSpend / previousTarget) * 100 : 0;

  tileMonthSpend.textContent = formatCurrency(monthSpend);
  tileMonthTarget.textContent = formatCurrency(monthTarget);
  tileUtilization.textContent = `${utilization.toFixed(1)}%`;
  tileMonthCount.textContent = String(monthCount);
  renderTrend(tileTrendSpend, monthSpend, previousSpend, formatCurrency, "vs previous month");
  renderTrend(tileTrendTarget, monthTarget, previousTarget, formatCurrency, "vs previous month");
  renderTrend(tileTrendUtilization, utilization, previousUtilization, (value) => `${value.toFixed(1)}%`, "vs previous month");
  tileTrendMonths.className = "tile-trend flat";
  tileTrendMonths.textContent = `${monthCount > 0 ? monthCount : 0} month(s) in history`;

  summarySpendTile.classList.toggle("over-budget", overallOverBudget);
  summaryTargetTile.classList.toggle("over-budget", overallOverBudget);
  summaryUtilizationTile.classList.toggle("over-budget", overallOverBudget);
}

function renderUtilizationChart(monthExpenses) {
  const targetsForMonth = getTargetsForMonth(state.selectedMonth, state.categories, state.targetsByMonth, state.categoryTargets);

  const actualByCategory = monthExpenses.reduce((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] || 0) + expense.amount;
    return accumulator;
  }, {});

  const totalTarget = state.categories.reduce((sum, category) => sum + (targetsForMonth[category] || 0), 0);
  const totalActual = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalUtilization = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
  const overBudgetCategories = [];
  targetOverview.textContent = `${formatCurrency(totalActual)} / ${formatCurrency(totalTarget)} (${totalUtilization.toFixed(1)}%)`;
  chartEmptyState.style.display = monthExpenses.length === 0 ? "block" : "none";

  if (monthExpenses.length === 0) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  const categoriesToRender = [...state.categories];
  Object.keys(actualByCategory).forEach((category) => {
    if (!categoriesToRender.includes(category)) {
      categoriesToRender.push(category);
    }
  });

  const labels = categoriesToRender;
  const actualData = categoriesToRender.map(category => actualByCategory[category] || 0);
  const targetData = categoriesToRender.map(category => targetsForMonth[category] || 0);

  categoriesToRender.forEach((category) => {
    const target = targetsForMonth[category] || 0;
    const actual = actualByCategory[category] || 0;
    if (actual > target) {
      overBudgetCategories.push({
        category,
        overBy: actual - target,
      });
    }
  });

  const ctx = categoryChart.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Actual Spend',
        data: actualData,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1
      }, {
        label: 'Target',
        data: targetData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });

  renderBudgetAlerts(totalActual, totalTarget, overBudgetCategories);
}

function renderBudgetAlerts(totalActual, totalTarget, overBudgetCategories) {
  const overallOverBudget = totalActual > totalTarget;
  if (!overallOverBudget && overBudgetCategories.length === 0) {
    budgetAlertBanner.classList.remove("is-visible");
    budgetAlertBanner.textContent = "";
    return;
  }

  const messages = [];
  if (overallOverBudget) {
    messages.push(`Overall monthly budget exceeded by ${formatCurrency(totalActual - totalTarget)}.`);
  }
  if (overBudgetCategories.length > 0) {
    const categoryNames = overBudgetCategories.map((item) => item.category).join(", ");
    messages.push(`Category alerts: ${categoryNames}.`);
  }

  budgetAlertBanner.textContent = messages.join(" ");
  budgetAlertBanner.classList.add("is-visible");
}

function renderTargetsEditor() {
  const targetsForMonth = getTargetsForMonth(state.selectedMonth, state.categories, state.targetsByMonth, state.categoryTargets);
  targetsMonthLabel.textContent = `Targets for ${formatMonthLabel(state.selectedMonth)}`;
  targetsEditor.innerHTML = state.categories
    .map((category) => {
      const value = targetsForMonth[category] || 0;
      return `
      <div class="target-row">
        <label class="target-category" for="target-${slugify(category)}">${escapeHtml(category)}</label>
        <input id="target-${slugify(category)}" class="target-input" type="number" min="0" step="1" value="${Math.round(value)}" data-category="${escapeHtml(category)}">
      </div>
    `;
    })
    .join("");
}

function saveCustomTargets() {
  const targetInputs = targetsEditor.querySelectorAll(".target-input");
  const updatedTargets = {};

  for (const input of targetInputs) {
    const category = input.dataset.category;
    const value = Number.parseFloat(input.value);
    if (!category || !Number.isFinite(value) || value < 0) {
      targetsStatus.textContent = "Please enter valid target amounts (0 or greater).";
      return;
    }
    updatedTargets[category] = Math.round(value);
  }

  state.targetsByMonth[state.selectedMonth] = updatedTargets;
  saveState(state);
  renderApp();
  targetsStatus.textContent = `Targets saved for ${formatMonthLabel(state.selectedMonth)}.`;
}

function resetTargetsToDefault() {
  delete state.targetsByMonth[state.selectedMonth];
  saveState(state);
  renderApp();
  targetsStatus.textContent = `Targets reset to default for ${formatMonthLabel(state.selectedMonth)}.`;
}

function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense-tracker-data.json';
  a.click();
  URL.revokeObjectURL(url);
  dataStatus.textContent = 'Data exported successfully.';
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm('Importing will replace all current data. Are you sure?')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (typeof imported === 'object' && imported.expensesByMonth) {
        Object.assign(state, imported);
        saveState(state);
        renderApp();
        dataStatus.textContent = 'Data imported successfully.';
      } else {
        dataStatus.textContent = 'Invalid file format.';
      }
    } catch {
      dataStatus.textContent = 'Error parsing file.';
    }
  };
  reader.readAsText(file);
}

// Initialization
const state = loadState();
state.selectedMonth = state.selectedMonth || getCurrentMonthKey();

dateInput.valueAsDate = new Date();
document.body.classList.toggle('dark', state.theme === 'dark');
const themeToggle = document.getElementById("theme-toggle");
themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
renderApp();

amountInput.addEventListener("input", () => validateAmountInput(amountInput));
monthSelect.addEventListener("change", () => {
  state.selectedMonth = monthSelect.value;
  renderApp();
});
themeToggle.addEventListener("click", toggleTheme);
expenseSearch.addEventListener("input", renderApp);
saveTargetsBtn.addEventListener("click", saveCustomTargets);
resetTargetsBtn.addEventListener("click", resetTargetsToDefault);
addCategoryBtn.addEventListener("click", addCategory);
categoriesList.addEventListener("click", handleCategoryAction);
exportDataBtn.addEventListener("click", exportData);
importDataBtn.addEventListener("click", () => importDataInput.click());
importDataInput.addEventListener("change", importData);
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab || "entry");
  });
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateAmountInput(amountInput) || !expenseForm.reportValidity()) {
    return;
  }

  const expense = {
    id: crypto.randomUUID(),
    date: dateInput.value,
    amount: Number.parseFloat(amountInput.value),
    category: categoryInput.value.trim(),
    description: descriptionInput.value.trim(),
  };

  if (!expense.date || !Number.isFinite(expense.amount) || expense.amount <= 0 || !expense.category || !expense.description) {
    return;
  }

  const monthKey = getMonthKeyFromDate(expense.date);
  if (!state.expensesByMonth[monthKey]) {
    state.expensesByMonth[monthKey] = [];
  }
  state.expensesByMonth[monthKey].push(expense);
  state.selectedMonth = monthKey;

  saveState(state);
  renderApp();
  expenseForm.reset();
  categoryInput.value = "";
  dateInput.valueAsDate = new Date();
  amountInput.focus();
});

expenseList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-btn");
  if (!deleteButton) {
    return;
  }

  const { id, month } = deleteButton.dataset;
  const monthExpenses = state.expensesByMonth[month] || [];
  state.expensesByMonth[month] = monthExpenses.filter((expense) => expense.id !== id);
  saveState(state);
  renderApp();
});

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('dark', state.theme === 'dark');
  themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  saveState(state);
}