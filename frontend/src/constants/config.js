// API Configuration
export const API_BASE_URL = 'http://localhost:3000';
export const SOCKET_URL = 'http://localhost:3000';

// Banking
export const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];
export const MIN_BANKING_AMOUNT = 10000;

// Trading
export const MIN_BUY_QUANTITY = 10;
export const DEFAULT_BUY_QUANTITY = 100;
export const MIN_SELL_QUANTITY = 10;
export const DEFAULT_SELL_QUANTITY = 100;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Colors
export const COLORS = {
  profit: '#3f8600',
  loss: '#cf1322',
  primary: '#1890ff',
  warning: '#faad14',
};

// Order Types
export const ORDER_TYPES = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  MATCHED: 'MATCHED',
  CANCELLED: 'CANCELLED',
};