import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Import chart icons
import '../../../assets/images/chart-icons.svg';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WellnessLogChart = ({ logs, title, subtitle }) => {
  // Process logs data for the chart
  const processData = () => {
    if (!logs || logs.length === 0) return null;
    
    // Sort logs by date (oldest first for the chart)
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get the last 7 days of logs or all if less than 7
    const recentLogs = sortedLogs.slice(-7);
    
    // Extract dates for labels
    const labels = recentLogs.map(log => {
      const date = new Date(log.date);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    // Create datasets for water intake, sleep hours, energy level, steps, and image count
    const datasets = [
      {
        label: 'Water Intake (glasses)',
        data: recentLogs.map(log => log.waterIntake || log.water_intake || 0),
        borderColor: '#0000FF', // Blue
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
      },
      {
        label: 'Sleep Hours',
        data: recentLogs.map(log => log.sleepHours || log.sleep_hours || 0),
        borderColor: '#00FF00', // Green
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
      },
      {
        label: 'Energy Level',
        data: recentLogs.map(log => log.energyLevel || log.energy_level || 0),
        borderColor: '#FF0000', // Red
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
      },
      {
        label: 'Steps (thousands)',
        data: recentLogs.map(log => {
          // Handle steps data if available, otherwise return 0
          const steps = log.steps || (log.activities && log.activities.steps && log.activities.steps.count) || 0;
          return steps / 1000; // Convert to thousands for better scale
        }),
        borderColor: '#FFA500', // Orange
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        tension: 0.4,
        pointStyle: 'circle',
      },
      {
        label: 'Images',
        data: recentLogs.map(log => {
          // Handle images data if available, otherwise return 0
          return (log.images && log.images.length) || 0;
        }),
        borderColor: '#800080', // Purple
        backgroundColor: 'rgba(128, 0, 128, 0.2)',
        tension: 0.4,
        pointStyle: 'rect',
      }
    ];
    
    return { labels, datasets };
  };
  
  // Get chart data
  const chartData = processData();
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: !!title,
        text: title || '',
        font: {
          size: 16
        }
      },
      subtitle: {
        display: !!subtitle,
        text: subtitle || '',
        padding: {
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            // Special handling for Images dataset
            if (label === 'Images' && value > 0) {
              return `${label}: ${value} (click for details)`;
            }
            
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          font: {
            size: 12
          },
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
  
  // If no data, show a message
  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No wellness data available</p>
      </div>
    );
  }
  
  // Handle chart click for image data points
  const handleChartClick = (event, elements) => {
    if (!elements || elements.length === 0) return;
    
    const clickedElement = elements[0];
    const datasetIndex = clickedElement.datasetIndex;
    const dataIndex = clickedElement.index;
    
    // Check if clicked on Images dataset
    if (chartData.datasets[datasetIndex].label === 'Images') {
      const imageCount = chartData.datasets[datasetIndex].data[dataIndex];
      if (imageCount > 0) {
        const logDate = chartData.labels[dataIndex];
        alert(`${imageCount} images recorded on ${logDate}. View details in your wellness log.`);
        // In a real implementation, this could open a modal with the images
      }
    }
  };
  
  return (
    <div className="wellness-log-chart">
      <div className="chart-legend flex flex-wrap gap-2 mb-3 justify-center">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-blue-600">
            <use href="#water-icon" />
          </svg>
          <span className="text-xs">Water</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-green-600">
            <use href="#sleep-icon" />
          </svg>
          <span className="text-xs">Sleep</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-red-600">
            <use href="#energy-icon" />
          </svg>
          <span className="text-xs">Energy</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-orange-600">
            <use href="#steps-icon" />
          </svg>
          <span className="text-xs">Steps</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-purple-600">
            <use href="#image-icon" />
          </svg>
          <span className="text-xs">Images</span>
        </div>
      </div>
      <Line 
        data={chartData} 
        options={options} 
        onClick={handleChartClick}
      />
    </div>
  );
};

export default WellnessLogChart;