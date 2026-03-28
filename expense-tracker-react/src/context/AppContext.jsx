import { useState, useEffect } from 'react';
import {
  getExpenses,
  getCategories,
  getTargets,
  addOrUpdateTarget as addOrUpdateTargetAPI,
  addCategory as addCategoryAPI,
  addExpense as addExpenseAPI,
  deleteExpense as deleteExpenseAPI,
  deleteCategory as deleteCategoryAPI,
} from '../services/api';
import {
  DEFAULT_CATEGORIES,
  findTargetForCategoryMonth,
  getCategoryName,
  getCurrentMonthKey,
  getTargetAmount,
} from '../utils/utils';
import { AppContext } from './AppContextBase';

export const AppProvider = ({ children }) => {
  const [activeMonth, setActiveMonth] = useState(getCurrentMonthKey());
  const [theme, setTheme] = useState('light');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [expenses, setExpenses] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedExpenses, fetchedCategories, fetchedTargets] = await Promise.all([
          getExpenses(),
          getCategories(),
          getTargets(),
        ]);
        
        // Use fetched categories if available, otherwise use defaults
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        
        setExpenses(fetchedExpenses || []);
        setTargets(fetchedTargets || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use default values on error
        setCategories(DEFAULT_CATEGORIES);
        setExpenses([]);
        setTargets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const addCategory = async (category) => {
    try {
      await addCategoryAPI(category);
      const fetchedCategories = await getCategories();
      const savedCategory = fetchedCategories.find(
        (item) => getCategoryName(item) === category.name
      );
      if (!savedCategory) {
        throw new Error('Category was not persisted with the expected schema.');
      }
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error adding category:', error);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORIES);
      throw error;
    }
  };

  const removeCategory = async (categoryName) => {
    try {
      await deleteCategoryAPI(categoryName);
      const fetchedCategories = await getCategories();
      const categoryStillExists = fetchedCategories.some(
        (category) => getCategoryName(category) === categoryName
      );
      if (categoryStillExists) {
        throw new Error('Category still exists after delete.');
      }
      setCategories(fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORIES);
    } catch (error) {
      console.error('Error removing category:', error);
      // Re-fetch categories on error to restore state
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories || DEFAULT_CATEGORIES);
      throw error;
    }
  };

  const addExpense = async (expense) => {
    const previousExpenses = expenses;
    try {
      setExpenses((prevExpenses) => [...prevExpenses, expense]);
      await addExpenseAPI(expense);
      const fetchedExpenses = await getExpenses();
      const savedExpense = fetchedExpenses.some((item) => String(item.id) === String(expense.id));
      if (!savedExpense) {
        throw new Error('Expense was not persisted.');
      }
      setExpenses(fetchedExpenses);
    } catch (error) {
      setExpenses(previousExpenses);
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    const previousExpenses = expenses;
    try {
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
      await deleteExpenseAPI(id);
      const fetchedExpenses = await getExpenses();
      const expenseStillExists = fetchedExpenses.some((item) => String(item.id) === String(id));
      if (expenseStillExists) {
        throw new Error('Expense still exists after delete.');
      }
      setExpenses(fetchedExpenses);
    } catch (error) {
      setExpenses(previousExpenses);
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const addOrUpdateTarget = async (target) => {
    const previousTargets = targets;
    try {
      await addOrUpdateTargetAPI(target);
      const fetchedTargets = await getTargets();
      const savedTarget = findTargetForCategoryMonth(fetchedTargets, target.category, target.month);
      if (!savedTarget || getTargetAmount(savedTarget) !== Number(target.targets ?? target.targetAmount ?? 0)) {
        throw new Error('Target was not persisted.');
      }
      setTargets(fetchedTargets || []);
      return fetchedTargets;
    } catch (error) {
      setTargets(previousTargets);
      console.error('Error updating target:', error);
      throw error;
    }
  };

  const resetTargetsToDefault = () => {
    // Remove all targets for the active month
    setTargets((prevTargets) =>
      prevTargets.filter((target) => target.month !== activeMonth)
    );
  };

  const importData = (data) => {
    setCategories(data.categories || DEFAULT_CATEGORIES);
    setExpenses(data.expenses || []);
    setTargets(data.targets || []);
  };

  const exportData = () => {
    const data = { categories, expenses, targets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        activeMonth,
        setActiveMonth,
        theme,
        toggleTheme,
        categories,
        addCategory,
        removeCategory,
        expenses,
        addExpense,
        deleteExpense,
        targets,
        setTargets,
        addOrUpdateTarget,
        resetTargetsToDefault,
        importData,
        exportData,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
