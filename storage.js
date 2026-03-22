const STORAGE_KEY = "expenseTrackerDataV2";
const LEGACY_STORAGE_KEY = "expenses";

function loadState() {
  const defaults = {
    selectedMonth: getCurrentMonthKey(),
    expensesByMonth: migrateLegacyExpenses(),
    targetsByMonth: {},
    categories: Object.keys(DEFAULT_CATEGORY_TARGETS),
    categoryTargets: { ...DEFAULT_CATEGORY_TARGETS },
    theme: 'light',
    recurringExpenses: [],
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
      theme: typeof parsed.theme === 'string' ? parsed.theme : 'light',
      recurringExpenses: Array.isArray(parsed.recurringExpenses) ? parsed.recurringExpenses : [],
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

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}