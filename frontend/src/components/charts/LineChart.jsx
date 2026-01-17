import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components - wrapped in try/catch to prevent errors
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  console.log('LineChart: ChartJS components registered successfully');
} catch (error) {
  console.error('LineChart: Error registering ChartJS components:', error);
}

const LineChart = ({ data, title, xLabel, yLabel, animation }) => {
  // Log when component renders
  useEffect(() => {
    console.log('LineChart: Component mounted');
    console.log('LineChart: Received data:', data);
    
    return () => {
      console.log('LineChart: Component unmounted');
    };
  }, [data]);
  // Default options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: animation || {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: !!xLabel,
          text: xLabel || '',
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          color: '#666',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: !!yLabel,
          text: yLabel || '',
          color: '#666',
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        },
        ticks: {
          color: '#666',
          font: {
            size: 11
          },
          precision: 0
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true
      }
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curves
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: 'white'
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };

  // Safely render the chart with error handling
  try {
    if (!data || !data.datasets || !data.labels) {
      console.error('LineChart: Invalid data format', data);
      return (
        <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
          <p className="text-red-500">Error: Invalid chart data format</p>
        </div>
      );
    }
    
    console.log('LineChart: Rendering chart with data:', data);
    return (
      <div className="chart-container">
        <Line options={options} data={data} />
      </div>
    );
  } catch (error) {
    console.error('LineChart: Error rendering chart:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-red-100 rounded-lg">
        <p className="text-red-500">Error rendering chart: {error.message}</p>
      </div>
    );
  }
};

export default LineChart;