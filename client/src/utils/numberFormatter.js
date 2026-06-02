export const formatCurrency = (num) => {
  if (isNaN(num) || num == null) return null;
  const n = Number(num);
  return `$${n % 1 === 0 ? n.toLocaleString() : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
