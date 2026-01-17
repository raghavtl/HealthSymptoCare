import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components - wrapped in try/catch to prevent errors
try {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
  );
  console.log('PieChart: ChartJS components registered successfully');
} catch (error) {
  console.error('PieChart: Error registering ChartJS components:', error);
}

const PieChart = ({ data, title, animation }) => {
  // Log when component renders
  useEffect(() => {
    console.log('PieChart: Component mounted');
    console.log('PieChart: Received data:', data);
    
    return () => {
      console.log('PieChart: Component unmounted');
    };
  }, [data]);
  // Default options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animation || {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: 'easeOutCirc'
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#333333',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: !!title,
        text: title || '',
        color: '#333333',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '0%', // Makes it a pie chart (0%) instead of doughnut
    radius: '90%'
  };

  // Safely render the chart with error handling
  try {
    if (!data || !data.datasets || !data.labels) {
      console.error('PieChart: Invalid data format', data);
      return (
        <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
          <p className="text-red-500">Error: Invalid chart data format</p>
        </div>
      );
    }
    
    console.log('PieChart: Rendering chart with data:', data);
    return (
      <div className="chart-container">
        <Pie options={options} data={data} />
      </div>
    );
  } catch (error) {
    console.error('PieChart: Error rendering chart:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
        <p className="text-red-500">Error rendering chart: {error.message}</p>
      </div>
    );
  }
};

export default PieChart;