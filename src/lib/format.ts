/**
 * Formats a monetary amount nicely with Indian numbering system,
 * cleaning up any floating-point arithmetic errors (e.g. 1452.82000000000002 -> "1,452.82")
 * and formatting cleanly without trailing .00 for whole numbers (e.g. 199 -> "199").
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";

  // Clean floating point drift
  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;

  return rounded.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

