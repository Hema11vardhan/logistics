import { TimeSeriesDataPoint, MultiSeriesDataPoint, ChartDataPoint } from './types';

// Generate demo chart data for the application
// These would be replaced by real API calls in a production environment

// User registration data
export const getUserRegistrationData = (): TimeSeriesDataPoint[] => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate some sample data with a general upward trend
    const baseValue = 5;
    const randomVariation = Math.random() * 10;
    const trendIncrease = i < 15 ? (15 - i) * 1.2 : 0; // Increasing trend in the last 15 days
    
    data.push({
      date: dateStr,
      value: Math.round(baseValue + randomVariation + trendIncrease)
    });
  }
  
  return data;
};

// Logistics space creation data
export const getSpaceCreationData = (): TimeSeriesDataPoint[] => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate some sample data with occasional spikes
    const baseValue = 3;
    const randomVariation = Math.random() * 5;
    const spike = i % 7 === 0 ? 8 : 0; // Spike every 7 days
    
    data.push({
      date: dateStr,
      value: Math.round(baseValue + randomVariation + spike)
    });
  }
  
  return data;
};

// Transaction volume data
export const getTransactionVolumeData = (): TimeSeriesDataPoint[] => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate some sample data with weekend dips
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const baseValue = 12;
    const randomVariation = Math.random() * 8;
    const weekendDip = isWeekend ? -6 : 0;
    
    data.push({
      date: dateStr,
      value: Math.max(0, Math.round(baseValue + randomVariation + weekendDip))
    });
  }
  
  return data;
};

// User role distribution
export const getUserRoleDistribution = (): ChartDataPoint[] => {
  return [
    { name: 'Users', value: 65 },
    { name: 'Logistics Companies', value: 25 },
    { name: 'Developers', value: 10 }
  ];
};

// Space status distribution
export const getSpaceStatusDistribution = (): ChartDataPoint[] => {
  return [
    { name: 'Available', value: 45 },
    { name: 'Partial', value: 30 },
    { name: 'Booked', value: 25 }
  ];
};

// Popular routes data
export const getPopularRoutesData = (): ChartDataPoint[] => {
  return [
    { name: 'New York → Chicago', value: 125 },
    { name: 'Los Angeles → Phoenix', value: 98 },
    { name: 'Seattle → Portland', value: 76 },
    { name: 'Miami → Atlanta', value: 65 },
    { name: 'Boston → Washington', value: 48 }
  ];
};

// Payment method distribution
export const getPaymentMethodDistribution = (): ChartDataPoint[] => {
  return [
    { name: 'MetaMask', value: 45 },
    { name: 'UPI', value: 30 },
    { name: 'Credit Card', value: 25 }
  ];
};

// Multi-series data for comparing logistics metrics
export const getLogisticsComparisonData = (): MultiSeriesDataPoint[] => {
  return [
    { name: 'Jan', bookings: 30, revenue: 4000, capacity: 65 },
    { name: 'Feb', bookings: 28, revenue: 3800, capacity: 59 },
    { name: 'Mar', bookings: 36, revenue: 5200, capacity: 70 },
    { name: 'Apr', bookings: 40, revenue: 5800, capacity: 76 },
    { name: 'May', bookings: 52, revenue: 6800, capacity: 85 },
    { name: 'Jun', bookings: 58, revenue: 7500, capacity: 90 },
    { name: 'Jul', bookings: 65, revenue: 8200, capacity: 95 },
  ];
};

// System status data
export const getSystemStatusData = (): { [key: string]: number } => {
  return {
    api: 98.7,
    blockchain: 99.5,
    database: 99.9,
    frontend: 99.8,
    tracking: 97.5
  };
};
