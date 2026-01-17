import React from 'react';
import { useTest, TestProvider } from './context/TestContext';

const Counter = () => {
  const { value, increment, decrement } = useTest();
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {value}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

const TestComponent = () => {
  return (
    <TestProvider>
      <Counter />
    </TestProvider>
  );
};

export default TestComponent;