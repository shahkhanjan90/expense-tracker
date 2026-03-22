const DEFAULT_CATEGORY_TARGETS = {
  Grocery: 15000,
  Entertainment: 10000,
  Misc: 6000,
  "Housing (Rent and Maintenance)": 45000,
  Medicine: 2000,
  Shopping: 6000,
  Transportation: 8000,
  Investments: 150000,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function validateAmountInput(amountInput) {
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

function getFirstDayOfMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toISOString().slice(0, 10);
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