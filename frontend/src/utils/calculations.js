/**
 * Tính portfolio data với giá thị trường real-time
 */
export const calculatePortfolioData = (portfolio, stocks) => {
  if (!portfolio || !stocks) return [];

  return portfolio.map((item) => {
    // Tìm giá hiện tại từ stocks
    const currentStock = stocks.find((s) => s.symbol === item.symbol);
    const marketPrice = currentStock ? currentStock.price : Number(item.avgPrice);

    // Tính lãi/lỗ
    const profit = (marketPrice - item.avgPrice) * item.quantity;
    const profitPercent = 
      item.avgPrice > 0 
        ? ((marketPrice - item.avgPrice) / item.avgPrice) * 100 
        : 0;

    return {
      ...item,
      marketPrice,
      profit,
      profitPercent,
    };
  });
};

/**
 * Tính tổng tiền dự kiến cho giao dịch
 */
export const calculateTotal = (price, quantity) => {
  return price * quantity;
};

/**
 * Tính lãi/lỗ dự kiến khi bán
 */
export const calculateExpectedProfit = (marketPrice, avgPrice, quantity) => {
  return (marketPrice - avgPrice) * quantity;
};