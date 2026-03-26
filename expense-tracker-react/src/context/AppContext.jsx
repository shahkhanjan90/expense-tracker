import { createContext, useState, useEffect } from 'react';
import { getExpenses, getCategories, getTargets, addOrUpdateTarget, addExpense as addExpenseAPI, deleteExpense as deleteExpenseAPI } from '../services/api';
import { DEFAULT_CATEGORIES, getCurrentMonthKey } from '../utils/utils';

export const AppContext = createContext();

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
      setCategories((prevCategories) => [...prevCategories, category]);
      // Optionally persist to API
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const removeCategory = (categoryId) => {
    setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
  };

  const addExpense = async (expense) => {
    try {
      // Add to local state immediately
      setExpenses((prevExpenses) => [...prevExpenses, expense]);
      // Persist to API
      await addExpenseAPI(expense);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
      // Persist deletion to API
      await deleteExpenseAPI(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const addOrUpdateTarget = async (target) => {
    try {
      const result = await addOrUpdateTarget(target);
      setTargets(result || []);
      return result;
    } catch (error) {
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