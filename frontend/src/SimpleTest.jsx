import React, { useState } from 'react';

const SimpleTest = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>Simple Test Component</h1>
      <p>Count: {count}</p>
      <button 
        style={{ 
          padding: '8px 16px', 
          margin: '5px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }} 
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
      <button 
        style={{ 
          padding: '8px 16px', 
          margin: '5px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }} 
        onClick={() => setCount(count - 1)}
      >
        Decrement
      </button>
    </div>
  );
};

export default SimpleTest;