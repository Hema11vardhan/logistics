// Chart data types
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

// Blockchain types
export interface BlockchainTransaction {
  hash: string;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  gas: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// System monitoring types
export interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
  latency?: number;
}

// Statistics card type
export interface DeveloperStatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
}

// API response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}