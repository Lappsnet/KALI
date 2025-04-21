import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRealEstate } from '../hooks/useRealEstate';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const PropertyCharts: React.FC = () => {
  const { getPropertySales } = useRealEstate();
  const sales = getPropertySales();

  // Prepare data for monthly sales chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Sales Volume',
        data: [4, 6, 8, 5, 7, 9],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Prepare data for property type distribution
  const propertyTypeData = {
    labels: ['Residential', 'Commercial', 'Industrial', 'Land'],
    datasets: [
      {
        label: 'Property Types',
        data: [12, 8, 3, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Monthly Sales Volume</h3>
        <Line
          data={monthlyData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Monthly Property Sales',
              },
            },
          }}
        />
      </div>
      <div className="chart-card">
        <h3>Property Type Distribution</h3>
        <Bar
          data={propertyTypeData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Property Types',
              },
            },
          }}
        />
      </div>
    </div>
  );
}; 