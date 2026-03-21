const state = loadState();
state.selectedMonth = state.selectedMonth || getCurrentMonthKey();

dateInput.valueAsDate = new Date();
document.body.classList.toggle('dark', state.theme === 'dark');
themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
renderApp();

const themeToggle = document.getElementById("theme-toggle");

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

function renderApp() {
  renderMonthOptions();
  renderCategoryOptions();
  renderCategoryManager();
  const monthExpenses = getSelectedMonthExpenses();
  renderSummaryTiles(monthExpenses);
  renderExpenses(monthExpenses);
  renderTargetsEditor();
  renderUtilizationChart(monthExpenses);
}

function setActiveTab(tabKey) {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabKey);
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
        <span class="category-item-target">Default: ${formatCurrency(getBaseTarget(category))}</span>
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
  saveState();
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

  saveState();
  renderApp();
  categoriesStatus.textContent = `Removed category "${category}".`;
}

function getSelectedMonthExpenses() {
  return (state.expensesByMonth[state.selectedMonth] || []).slice();
}

function renderExpenses(monthExpenses) {
  expenseList.innerHTML = "";
  expensesHeading.textContent = `Expenses - ${formatMonthLabel(state.selectedMonth)}`;

  monthExpenses
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

  const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmount.textContent = formatCurrency(total);
  emptyState.style.display = monthExpenses.length === 0 ? "block" : "none";
}

function renderSummaryTiles(monthExpenses) {
  const targetsForMonth = getTargetsForMonth(state.selectedMonth);
  const monthSpend = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthTarget = state.categories.reduce((sum, category) => sum + (targetsForMonth[category] || 0), 0);
  const utilization = monthTarget > 0 ? (monthSpend / monthTarget) * 100 : 0;
  const monthCount = Object.keys(state.expensesByMonth).length;
  const overallOverBudget = monthSpend > monthTarget && monthTarget >= 0;
  const previousMonthKey = getPreviousMonthKey(state.selectedMonth);
  const previousExpenses = (state.expensesByMonth[previousMonthKey] || []).slice();
  const previousTargets = getTargetsForMonth(previousMonthKey);
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
  categoryChart.innerHTML = "";
  const targetsForMonth = getTargetsForMonth(state.selectedMonth);

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

  const categoriesToRender = [...state.categories];
  Object.keys(actualByCategory).forEach((category) => {
    if (!categoriesToRender.includes(category)) {
      categoriesToRender.push(category);
    }
  });

  categoriesToRender.forEach((category) => {
    const target = targetsForMonth[category] || 0;
    const actual = actualByCategory[category] || 0;
    const utilization = target > 0 ? (actual / target) * 100 : actual > 0 ? 100 : 0;
    const displayWidth = Math.min(utilization, 100);
    const isOverTarget = actual > target;
    if (isOverTarget) {
      overBudgetCategories.push({
        category,
        overBy: actual - target,
      });
    }
    const row = document.createElement("div");
    row.className = `chart-row ${isOverTarget ? "over-budget-row" : ""}`;
    row.innerHTML = `
      <div class="chart-row-header">
        <span class="chart-category">${escapeHtml(category)}</span>
        <span class="chart-value">${formatCurrency(actual)} / ${formatCurrency(target)} (${utilization.toFixed(1)}%)</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill ${utilization > 100 ? "over-target" : ""}" style="width: ${displayWidth.toFixed(2)}%;"></div>
      </div>
      ${isOverTarget ? `<div class="chart-warning">Over budget by ${formatCurrency(actual - target)}</div>` : ""}
    `;
    categoryChart.appendChild(row);
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

function loadState() {
  const defaults = {
    selectedMonth: getCurrentMonthKey(),
    expensesByMonth: migrateLegacyExpenses(),
    targetsByMonth: {},
    categories: Object.keys(DEFAULT_CATEGORY_TARGETS),
    categoryTargets: { ...DEFAULT_CATEGORY_TARGETS },
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.expensesByMonth || typeof parsed.expensesByMonth !== "object") {
      return defaults;
    }

    const merged = {
      selectedMonth: parsed.selectedMonth || defaults.selectedMonth,
      expensesByMonth: parsed.expensesByMonth,
      targetsByMonth: parsed.targetsByMonth && typeof parsed.targetsByMonth === "object" ? parsed.targetsByMonth : {},
      categories: Array.isArray(parsed.categories) ? parsed.categories : Object.keys(DEFAULT_CATEGORY_TARGETS),
      categoryTargets: parsed.categoryTargets && typeof parsed.categoryTargets === "object"
        ? parsed.categoryTargets
        : { ...DEFAULT_CATEGORY_TARGETS },
    };

    const categorySet = new Set(merged.categories);
    Object.keys(merged.expensesByMonth).forEach((monthKey) => {
      (merged.expensesByMonth[monthKey] || []).forEach((expense) => {
        if (expense && expense.category) {
          categorySet.add(expense.category);
        }
      });
    });
    Object.keys(merged.categoryTargets).forEach((category) => categorySet.add(category));
    merged.categories = Array.from(categorySet);
    merged.categories.forEach((category) => {
      if (!Number.isFinite(merged.categoryTargets[category])) {
        merged.categoryTargets[category] = Number.isFinite(DEFAULT_CATEGORY_TARGETS[category]) ? DEFAULT_CATEGORY_TARGETS[category] : 0;
      }
    });

    return merged;
  } catch (error) {
    return defaults;
  }
}

function migrateLegacyExpenses() {
  const byMonth = {};
  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const legacyExpenses = legacyRaw ? JSON.parse(legacyRaw) : [];
    if (!Array.isArray(legacyExpenses)) {
      return byMonth;
    }

    legacyExpenses.forEach((expense) => {
      if (!expense || !expense.date) {
        return;
      }
      const monthKey = getMonthKeyFromDate(expense.date);
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = [];
      }
      byMonth[monthKey].push(expense);
    });
  } catch (error) {
    return {};
  }

  return byMonth;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderTargetsEditor() {
  const targetsForMonth = getTargetsForMonth(state.selectedMonth);
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
  saveState();
  renderApp();
  targetsStatus.textContent = `Targets saved for ${formatMonthLabel(state.selectedMonth)}.`;
}

function resetTargetsToDefault() {
  delete state.targetsByMonth[state.selectedMonth];
  saveState();
  renderApp();
  targetsStatus.textContent = `Targets reset to default for ${formatMonthLabel(state.selectedMonth)}.`;
}

function getTargetsForMonth(monthKey) {
  const customTargets = state.targetsByMonth[monthKey] || {};
  return state.categories.reduce((accumulator, category) => {
    const customValue = customTargets[category];
    accumulator[category] = Number.isFinite(customValue) ? customValue : getBaseTarget(category);
    return accumulator;
  }, {});
}

function getBaseTarget(category) {
  const configured = state.categoryTargets[category];
  if (Number.isFinite(configured)) {
    return configured;
  }
  if (Number.isFinite(DEFAULT_CATEGORY_TARGETS[category])) {
    return DEFAULT_CATEGORY_TARGETS[category];
  }
  return 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function validateAmountInput() {
  if (amountInput.value === "") {
    amountInput.setCustomValidity("Amount is required.");
    return false;
  }

  const parsedAmount = Number.parseFloat(amountInput.value);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    amountInput.setCustomValidity("Amount must be greater than 0.");
    return false;
  }

  amountInput.setCustomValidity("");
  return true;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function getCurrentMonthKey() {
  return getMonthKeyFromDate(new Date().toISOString().slice(0, 10));
}

function getMonthKeyFromDate(dateString) {
  return dateString.slice(0, 7);
}

function getPreviousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  const previousYear = date.getFullYear();
  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${previousYear}-${previousMonth}`;
}

function renderTrend(element, currentValue, previousValue, formatter, suffixText) {
  if (!element) {
    return;
  }

  if (!Number.isFinite(previousValue) || previousValue === 0) {
    element.className = "tile-trend flat";
    element.textContent = "No baseline from previous month";
    return;
  }

  const delta = currentValue - previousValue;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const percent = Math.abs((delta / previousValue) * 100);
  const arrow = isUp ? "▲" : isDown ? "▼" : "●";

  element.className = `tile-trend ${isUp ? "up" : isDown ? "down" : "flat"}`;
  element.textContent = `${arrow} ${percent.toFixed(1)}% (${formatter(Math.abs(delta))}) ${suffixText}`;
}

function slugify(value) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
