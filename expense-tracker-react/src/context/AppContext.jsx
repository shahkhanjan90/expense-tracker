import { createContext, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories] = useState(["Food", "Travel", "Shopping", "Medicine", "Housing"]);
  const [activeMonth, setActiveMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month (YYYY-MM)

  const addExpense = (expense) => {
    setExpenses([expense, ...expenses]); // Add new expense at the top
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id)); // Remove expense by id
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