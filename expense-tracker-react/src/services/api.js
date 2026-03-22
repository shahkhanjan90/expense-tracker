const BASE_URL = 'https://sheetdb.io/api/v1/e88t2j8do634o';
const EXPENSES_SHEET = '?sheet=Expenses';
const CATEGORIES_SHEET = '?sheet=Categories';
const TARGETS_SHEET = '?sheet=Targets';

// API functions using fetch for REST API (SheetDB)

export const getExpenses = async () => {
  try {
    const response = await fetch(BASE_URL + EXPENSES_SHEET);
    if (!response.ok) {
      throw new Error(`GET failed: ${response.status}`);
    }
    const data = await response.json();
    // Sort by createdAt descending
    return data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const addExpense = async (expense) => {
  try {
    const response = await fetch(BASE_URL + EXPENSES_SHEET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    if (!response.ok) {
      throw new Error(`POST failed: ${response.status}`);
    }
    // After adding, fetch the updated list
    return await getExpenses();
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}${EXPENSES_SHEET}/id/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`DELETE failed: ${response.status}`);
    }
    // After deleting, fetch the updated list
    return await getExpenses();
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const response = await fetch(BASE_URL + CATEGORIES_SHEET);
    if (!response.ok) {
      throw new Error(`GET failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (category) => {
  try {
    const cats = await getCategories();
    const maxId = cats.length > 0 ? Math.max(...cats.map(c => Number(c.id) || 0)) : 0;
    const newCategoryObj = { id: maxId + 1, name: category };
    const response = await fetch(BASE_URL + CATEGORIES_SHEET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCategoryObj),
    });
    if (!response.ok) {
      throw new Error(`POST failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Targets
export const getTargets = async () => {
  try {
    const response = await fetch(BASE_URL + TARGETS_SHEET);
    if (!response.ok) {
      throw new Error(`GET failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
};

export const addOrUpdateTarget = async (target) => {
  try {
    // For simplicity, use POST; for update, you may need to check if exists and use PUT
    const response = await fetch(BASE_URL + TARGETS_SHEET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(target),
    });
    if (!response.ok) {
      throw new Error(`POST failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding/updating target:', error);
    throw error;
  }
};