/**
 * Generate a unique order number
 * Format: PED-YYMMDD-XXXX
 * Example: PED-250105-0001
 */
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Generate random 4-digit number
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `PED-${year}${month}${day}-${random}`;
};
