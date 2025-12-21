/**
 * Format số thành chuỗi tiền tệ VND
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '0';
  return Number(value).toLocaleString('vi-VN');
};

/**
 * Format date thành chuỗi định dạng Việt Nam
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};

/**
 * Format phần trăm
 */
export const formatPercent = (value, decimals = 2) => {
  if (!value && value !== 0) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format giá stock (2 số thập phân)
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00';
  return Number(price).toFixed(2);
};