const SCRIPT_BASE_URL = 'https://script.google.com/macros/s/AKfycbwEQbN1F1h5kFVlIVmzuOj0ZR2G2D0pnybDAYWqB10JspEvgCJGlJ8yNiqlfiY0_fE/exec';
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : SCRIPT_BASE_URL);

// Retry logic with exponential backoff
const retryFetch = async (url, options = {}, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
      });

      if (!response.ok && response.status !== 0) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

// ============ EXPENSES ============

export const getExpenses = async () => {
  try {
    const response = await retryFetch(`${BASE_URL}?type=getExpenses`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const addExpense = async (expense) => {
  try {
    const formData = new FormData();
    formData.append('type', 'addExpense');
    formData.append('id', expense.id);
    formData.append('amount', expense.amount);
    formData.append('category', expense.category);
    formData.append('description', expense.description);
    formData.append('date', expense.date);
    formData.append('createdAt', expense.createdAt || new Date().toISOString());

    const response = await retryFetch(BASE_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const formData = new FormData();
    formData.append('type', 'deleteExpense');
    formData.append('id', id);

    const response = await retryFetch(BASE_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// ============ CATEGORIES ============

export const getCategories = async () => {
  try {
    const response = await retryFetch(`${BASE_URL}?type=getCategories`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (category) => {
  try {
    const formData = new FormData();
    formData.append('type', 'addCategory');
    formData.append('id', category.id);
    formData.append('name', category.name);
    formData.append('defaultTarget', category.defaultTarget ?? category.budget ?? 0);

    const response = await retryFetch(BASE_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const deleteCategory = async (name) => {
  try {
    const formData = new FormData();
    formData.append('type', 'deleteCategory');
    formData.append('name', name);

    const response = await retryFetch(BASE_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// ============ TARGETS ============

export const getTargets = async () => {
  try {
    const response = await retryFetch(`${BASE_URL}?type=getTargets`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
};

export const addTarget = async (target) => {
  try {
    const formData = new FormData();
    formData.append('type', 'addTarget');
    formData.append('category', target.category);
    formData.append('month', target.month);
    formData.append('targetAmount', target.targetAmount ?? target.targets ?? 0);

    const response = await retryFetch(BASE_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding/updating target:', error);
    throw error;
  }
};

// Backward compatibility alias
export const addOrUpdateTarget = addTarget;
