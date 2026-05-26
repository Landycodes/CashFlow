export const formatCurrency = (num) => {
  return isNaN(num) || num === null ? null : `$${Number(num).toLocaleString()}`;
};
