import { createContext, useState, useEffect } from 'react';
import { getExpenses, addExpense as addExpenseAPI, deleteExpense as deleteExpenseAPI } from '../services/api';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories] = useState(["Food", "Travel", "Shopping", "Medicine", "Housing"]);
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month (YYYY-MM)

  useEffect(() => {
    const loadExpenses = async () => {
      const data = await getExpenses();
      setExpenses(data);
    };
    loadExpenses();
  }, []);

  const addExpense = async (expense) => {
    const updatedExpenses = await addExpenseAPI(expense);
    setExpenses(updatedExpenses);
  };

  const deleteExpense = async (id) => {
    const updatedExpenses = await deleteExpenseAPI(id);
    setExpenses(updatedExpenses);
  };

  return (
    <AppContext.Provider value={{
      expenses,
      categories,
      activeMonth,
      setActiveMonth,
      addExpense,
      deleteExpense
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };