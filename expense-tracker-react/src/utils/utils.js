// Utility functions for expense calculations
// All functions are pure and reusable

export const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Grocery', defaultTarget: 15000 },
  { id: 2, name: 'Entertainment', defaultTarget: 10000 },
  { id: 3, name: 'Misc', defaultTarget: 6000 },
  { id: 4, name: 'Housing', defaultTarget: 45000 },
  { id: 5, name: 'Medicine', defaultTarget: 2000 },
  { id: 6, name: 'Shopping', defaultTarget: 6000 },
  { id: 7, name: 'Transportation', defaultTarget: 8000 },
  { id: 8, name: 'Maid', defaultTarget: 5000 },
  { id: 9, name: 'Investments', defaultTarget: 150000 },
];

export const DEFAULT_CATEGORY_TARGETS = {
  Grocery: 15000,
  Entertainment: 10000,
  Misc: 6000,
  Housing: 45000,
  Medicine: 2000,
  Shopping: 6000,
  Transportation: 8000,
  Maid: 5000,
  Investments: 150000,
};

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

export function getMonthlyExpenses(expenses, monthKey) {
  if (!expenses || !monthKey) return [];
  return expenses.filter(exp => getMonthKeyFromDate(exp.date) === monthKey);
}

export function getTotalExpenses(expenses) {
  if (!expenses || !Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}

export function getUtilization(actual, target) {
  if (!target || target === 0) return 0;
  return (actual / target) * 100;
}

export function getExpensesByCategory(expenses) {
  if (!expenses || !Array.isArray(expenses)) return {};
  return expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
    return acc;
  }, {});
}

export function getOverBudgetCategories(expenses, targets, categories, monthKey) {
  if (!monthKey) return [];
  const monthExpenses = getMonthlyExpenses(expenses, monthKey);
  const categorySpends = getExpensesByCategory(monthExpenses);
  const overBudget = [];
  
  categories.forEach(cat => {
    const catName = cat.name || cat.id;
    const spent = categorySpends[catName] || 0;
    const target = targets.find(t => t.category === catName && t.month === monthKey);
    const targetAmount = target ? Number(target.targets) : (cat.defaultTarget || 0);
    
    if (spent > targetAmount) {
      overBudget.push({
        category: catName,
        spent,
        target: targetAmount,
        overBy: spent - targetAmount
      });
    }
  });
  return overBudget;
}

export function getPreviousMonthExpenses(expenses, monthKey) {
  const prevMonth = getPreviousMonthKey(monthKey);
  return getMonthlyExpenses(expenses, prevMonth);
}

export function getMonthsTracked(expenses) {
  if (!expenses || !Array.isArray(expenses)) return 0;
  const months = new Set(expenses.map(exp => getMonthKeyFromDate(exp.date)));
  return months.size;
}

export function validateAmountInput(amountInput) {
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

export function formatDate(dateString) {
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

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function getCurrentMonthKey() {
  return getMonthKeyFromDate(new Date().toISOString().slice(0, 10));
}

export function getMonthKeyFromDate(dateString) {
  return dateString.slice(0, 7);
}

export function getPreviousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  const previousYear = date.getFullYear();
  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${previousYear}-${previousMonth}`;
}

export function getFirstDayOfMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toISOString().slice(0, 10);
}

export function calculateTrend(currentValue, previousValue) {
  if (!Number.isFinite(previousValue) || previousValue === 0) {
    return { arrow: '●', percent: 0, status: 'flat' };
  }

  const delta = currentValue - previousValue;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const percent = Math.abs((delta / previousValue) * 100);
  const arrow = isUp ? "▲" : isDown ? "▼" : "●";
  const status = isUp ? 'up' : isDown ? 'down' : 'flat';

  return { arrow, percent, status };
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

function getBaseTarget(category, categoryTargets) {
  const configured = categoryTargets[category];
  if (Number.isFinite(configured)) {
    return configured;
  }
  if (Number.isFinite(DEFAULT_CATEGORY_TARGETS[category])) {
    return DEFAULT_CATEGORY_TARGETS[category];
  }
  return 0;
}

function getTargetsForMonth(monthKey, categories, targetsByMonth, categoryTargets) {
  const customTargets = targetsByMonth[monthKey] || {};
  return categories.reduce((accumulator, category) => {
    const customValue = customTargets[category];
    accumulator[category] = Number.isFinite(customValue) ? customValue : getBaseTarget(category, categoryTargets);
    return accumulator;
  }, {});
}

export const getCategoryTotals = (expenses) => {
  return expenses.reduce((totals, expense) => {
    const category = expense.category || 'Uncategorized';
    totals[category] = (totals[category] || 0) + (Number(expense.amount) || 0);
    return totals;
  }, {});
};