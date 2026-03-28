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

export function getCategoryName(category) {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  return category.name || category.category || category.title || 'Uncategorized';
}

export function getCategoryDefaultTarget(category) {
  if (!category || typeof category === 'string') return 0;
  return Number(
    category.defaultTarget ??
    category.budget ??
    category.targetAmount ??
    category.targets ??
    0
  ) || 0;
}

export function getTargetMonth(target) {
  const value = target?.month || target?.label || '';
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 7);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTargetAmount(target) {
  return Number(
    target?.targets ??
    target?.targetAmount ??
    target?.amount ??
    0
  ) || 0;
}

export function findTargetForCategoryMonth(targets, categoryName, monthKey) {
  if (!Array.isArray(targets) || !categoryName || !monthKey) {
    return null;
  }

  for (let index = targets.length - 1; index >= 0; index -= 1) {
    const target = targets[index];
    if (target?.category === categoryName && getTargetMonth(target) === monthKey) {
      return target;
    }
  }

  return null;
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
    const catName = getCategoryName(cat);
    const spent = categorySpends[catName] || 0;
    const target = findTargetForCategoryMonth(targets, catName, monthKey);
    const targetAmount = target ? getTargetAmount(target) : getCategoryDefaultTarget(cat);
    
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

export const getCategoryTotals = (expenses) => {
  return expenses.reduce((totals, expense) => {
    const category = expense.category || 'Uncategorized';
    totals[category] = (totals[category] || 0) + (Number(expense.amount) || 0);
    return totals;
  }, {});
};
