import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  className?: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ className }) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  // Portfolio Distribution Data
  const portfolioData = {
    labels: [
      'Luxury Residential',
      'Multi-Family Units',
      'Commercial Office',
      'Retail Space',
      'Industrial Property',
      'Vacation Homes'
    ],
    datasets: [
      {
        data: [30, 25, 15, 12, 10, 8],
        backgroundColor: activeSegment !== null ? 
          Array(6).fill('rgba(148, 163, 184, 0.2)').map((color, index) => 
            index === activeSegment ? [
              '#6366f1',
              '#8b5cf6',
              '#ec4899',
              '#06b6d4',
              '#10b981',
              '#f59e0b'
            ][index] : color
          ) : [
            '#6366f1',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
            '#10b981',
            '#f59e0b'
          ],
        borderColor: 'var(--bg-secondary)',
        borderWidth: 2,
        hoverBackgroundColor: [
          '#4f46e5',
          '#7c3aed',
          '#db2777',
          '#0891b2',
          '#059669',
          '#d97706'
        ],
        hoverBorderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  // Projected Income Data
  const years = ['2024', '2025', '2026', '2027', '2028'];
  const projectedData = {
    labels: years,
    datasets: [
      {
        label: 'Rental Income',
        data: [420000, 441000, 463050, 486202, 510512],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Property Yield',
        data: [175000, 183750, 192937, 202584, 212713],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const portfolioOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeInOutQuart' as const
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          color: '#ffffff',
          padding: 15,
          font: {
            size: 11,
            weight: 'normal' as const
          },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label: string, index: number) => ({
              text: label,
              fillStyle: activeSegment === null ? datasets[0].backgroundColor[index] : 
                (index === activeSegment ? datasets[0].backgroundColor[index] : 'rgba(148, 163, 184, 0.2)'),
              hidden: false,
              lineCap: 'round',
              lineDash: [],
              lineDashOffset: 0,
              lineJoin: 'round',
              lineWidth: 1,
              strokeStyle: datasets[0].borderColor,
              pointStyle: 'circle',
              index
            }));
          }
        },
        onHover: (event: any, item: any) => {
          if (item) {
            setActiveSegment(item.index);
          }
        },
        onLeave: () => {
          setActiveSegment(null);
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const valueInMillions = ((value / 100) * 3.5).toFixed(2);
            return `${context.label}: $${valueInMillions}M (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        borderColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 1
      }
    }
  };

  const projectedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    },
    plugins: {
      title: {
        display: true,
        text: 'Projected Income (5 Years)',
        color: '#ffffff',
        font: {
          size: 14,
          weight: 'normal' as const
        },
        padding: { bottom: 15 }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          padding: 15,
          font: {
            size: 11,
            weight: 'normal' as const
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0;
            return `${context.dataset.label}: $${value.toLocaleString()}`;
          }
        },
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        borderColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          }
        }
      },
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 11
          },
          callback: function(tickValue: number | string) {
            const value = Number(tickValue);
            return value ? `$${(value/1000).toFixed(0)}K` : '';
          }
        }
      }
    }
  };

  const centerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '150px',
    padding: '15px',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  };

  return (
    <div 
      className={`dashboard-charts ${className || ''}`} 
      style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        width: '100%',
        height: '400px'
      }}
      role="group"
      aria-label="Portfolio Analytics Dashboard"
    >
      <div style={{ position: 'relative' }} role="region" aria-label="Portfolio Distribution">
        <Doughnut 
          data={portfolioData} 
          options={portfolioOptions}
          aria-label="Portfolio distribution donut chart"
        />
        <div style={centerStyles} role="complementary" aria-label="Total portfolio value">
          <div style={{ 
            color: '#ffffff', 
            fontSize: '13px',
            fontWeight: '500',
            opacity: 0.9,
            letterSpacing: '0.02em'
          }}>
            Portfolio Value
          </div>
          <div style={{ 
            color: '#ffffff', 
            fontSize: '26px', 
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
            textShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}>
            $3.5M
          </div>
          <div style={{ 
            color: '#ffffff', 
            fontSize: '11px',
            opacity: 0.8,
            letterSpacing: '0.02em'
          }}>
            6 Properties
          </div>
        </div>
      </div>
      <div role="region" aria-label="Projected Income">
        <Line 
          data={projectedData} 
          options={projectedOptions}
          aria-label="Projected income line chart"
        />
      </div>
    </div>
  );
};