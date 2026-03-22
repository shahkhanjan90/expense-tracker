import { createContext, useState, useEffect } from 'react';
import { getExpenses, addExpense as addExpenseAPI, deleteExpense as deleteExpenseAPI, getCategories, addCategory as addCategoryAPI, deleteCategory as deleteCategoryAPI, getTargets, addOrUpdateTarget as addOrUpdateTargetAPI } from '../services/api';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [targets, setTargets] = useState([]);
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month (YYYY-MM)

  useEffect(() => {
    const loadData = async () => {
      const exps = await getExpenses();
      setExpenses(exps);
      const cats = await getCategories();
      setCategories(cats); // Keep as array of objects
      const targs = await getTargets();
      setTargets(targs);
    };
    loadData();
  }, []);

  const addExpense = async (expense) => {
    const updatedExpenses = await addExpenseAPI(expense);
    setExpenses(updatedExpenses);
  };

  const deleteExpense = async (id) => {
    const updatedExpenses = await deleteExpenseAPI(id);
    setExpenses(updatedExpenses);
  };

  const addCategory = async (name) => {
    await addCategoryAPI(name);
    const updated = await getCategories();
    setCategories(updated);
  };

  const removeCategory = async (id) => {
    await deleteCategoryAPI(id);
    const updated = await getCategories();
    setCategories(updated);
  };

  const addOrUpdateTarget = async (target) => {
    const updated = await addOrUpdateTargetAPI(target);
    setTargets(updated);
  };

  return (
    <AppContext.Provider value={{
      expenses,
      categories,
      targets,
      activeMonth,
      setActiveMonth,
      addExpense,
      deleteExpense,
      addCategory,
      removeCategory,
      addOrUpdateTarget
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };