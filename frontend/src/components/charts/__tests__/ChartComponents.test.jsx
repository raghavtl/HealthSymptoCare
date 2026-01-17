import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Chart.js before importing components that use it
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
}));

// Import components after mocking dependencies
import LineChart from '../LineChart';
import BarChart from '../BarChart';
import AreaChart from '../AreaChart';
import PieChart from '../PieChart';

// Mock react-chartjs-2 components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart Component</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart Component</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart Component</div>,
}));

// Sample data for testing
const sampleData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Test Dataset',
      data: [10, 20, 30],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
    },
  ],
};

describe.skip('Chart Components (legacy)', () => {
  test('LineChart renders correctly', () => {
    render(
      <LineChart 
        data={sampleData} 
        title="Test Line Chart" 
        xLabel="Month" 
        yLabel="Value"
        animation={{ duration: 1000 }}
      />
    );
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('BarChart renders correctly', () => {
    render(
      <BarChart 
        data={sampleData} 
        title="Test Bar Chart" 
        xLabel="Month" 
        yLabel="Value"
        animation={{ duration: 1000 }}
      />
    );
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('AreaChart renders correctly', () => {
    render(
      <AreaChart 
        data={sampleData} 
        title="Test Area Chart" 
        xLabel="Month" 
        yLabel="Value"
        animation={{ duration: 1000 }}
      />
    );
    
    // AreaChart uses Line component from react-chartjs-2
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('PieChart renders correctly', () => {
    render(
      <PieChart 
        data={sampleData} 
        title="Test Pie Chart"
        animation={{ duration: 1000 }}
      />
    );
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});