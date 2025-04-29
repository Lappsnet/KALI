"use client"

import { useAppKitAccount } from "@reown/appkit/react"
import { useBalance } from "wagmi"
import { Building, DollarSign, TrendingUp, Users } from "lucide-react"
import { DashboardChart } from '../DashboardChart';
import '../../styles/Dashboard.css';
import '../../styles/DashboardChart.css';

export const Dashboard = () => {
  const { address, isConnected } = useAppKitAccount()

  useBalance({
    address: address as `0x${string}`,
  })

  const portfolioMetrics = {
    totalValue: 124567.89,
    dailyChange: 2345.67,
    dailyChangePercent: 5.2,
    totalProfitLoss: 34567.89,
    plPercent: 28.4,
    bestPerformer: "TRUMP",
    bestPerformerPercent: 156.7,
  }



  const activityStats = {
    activeBets: { count: 3, value: 2800 },
    wonBets: { count: 28, total: 42 },
    lostBets: { count: 11, rate: 33.3 },
    launchedTokens: { count: 12 },
    trendingTokens: { count: 3 },
  }

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: `$${portfolioMetrics.totalValue.toLocaleString()}`,
      change: `+${portfolioMetrics.dailyChangePercent}%`,
      icon: <DollarSign size={24} className="stats-icon" />,
      trend: 'up'
    },
    {
      title: 'Properties Owned',
      value: '3',
      change: '+1',
      icon: <Building size={24} className="stats-icon" />,
      trend: 'up'
    },
    {
      title: 'Monthly Rental Income',
      value: `$${activityStats.activeBets.value.toLocaleString()}`,
      change: `+${activityStats.activeBets.value.toLocaleString()}`,
      icon: <TrendingUp size={24} className="stats-icon" />,
      trend: 'up'
    },
    {
      title: 'Active Tenants',
      value: '5',
      change: '+2',
      icon: <Users size={24} className="stats-icon" />,
      trend: 'up'
    }
  ];

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <h2>Connect Your Wallet</h2>
        <p>Please connect your wallet to view your dashboard</p>
        <appkit-button />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1></h1>
        <p>Track your propertiesand earnings</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              {stat.icon}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.trend}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <h2>RWA Performance</h2>
          <DashboardChart className="portfolio-chart" />
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <DollarSign size={16} />
            </div>
            <div className="activity-details">
              <span className="activity-title">Rent Payment Received</span>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-amount">+$2,500</div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Building size={16} />
            </div>
            <div className="activity-details">
              <span className="activity-title">New Property Listed</span>
              <span className="activity-time">1 day ago</span>
            </div>
            <div className="activity-status">Listed</div>
          </div>
        </div>
      </div>
    </div>
  );
} 