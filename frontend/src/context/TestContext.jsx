import React from 'react';

// Create a simple context
const TestContext = React.createContext(null);

// Custom hook to use the context
export const useTest = () => {
  const context = React.useContext(TestContext);
  if (!context) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

// Provider component
export const TestProvider = ({ children }) => {
  const [value, setValue] = React.useState(0);
  
  const increment = () => setValue(prev => prev + 1);
  const decrement = () => setValue(prev => prev - 1);
  
  return (
    <TestContext.Provider value={{ value, increment, decrement }}>
      {children}
    </TestContext.Provider>
  );
};