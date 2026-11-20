/**
 * Parses a USD price string like "$25,000" into a numeric value (25000).
 * Handles formats: "$25,000", "$7,800", "$2,500", "25000", etc.
 */
export function parseUsdPrice(priceStr: string): number {
  // Remove everything except digits and decimal points
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}
