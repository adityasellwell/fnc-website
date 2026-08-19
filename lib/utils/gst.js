/**
 * Splits an already tax-INCLUSIVE amount (India's Legal Metrology rules
 * require the MRP shown to a customer to already include GST — this app
 * never adds tax on top at checkout) back into its Taxable Value + tax
 * components, for invoice/compliance display only.
 *
 * CGST/SGST (not IGST) since F&C operates from a single state — every
 * order is intra-state. Revisit this split if a store in another state
 * is ever added.
 */
export function splitGst(inclusiveAmount, gstRatePercent) {
  const amount = Number(inclusiveAmount) || 0;
  const rate = Number(gstRatePercent) || 0;

  if (rate <= 0) {
    return { taxableValue: amount, cgst: 0, sgst: 0, totalTax: 0, total: amount, rate: 0 };
  }

  const taxableValue = amount / (1 + rate / 100);
  const totalTax = amount - taxableValue;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  return { taxableValue, cgst, sgst, totalTax, total: amount, rate };
}

/** Same split, summed across every line of an order — the invoice-level total breakdown. */
export function splitOrderGst(items) {
  return items.reduce(
    (acc, item) => {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      const { taxableValue, cgst, sgst, totalTax } = splitGst(lineTotal, item.gstRate);
      return {
        taxableValue: acc.taxableValue + taxableValue,
        cgst: acc.cgst + cgst,
        sgst: acc.sgst + sgst,
        totalTax: acc.totalTax + totalTax,
        total: acc.total + lineTotal,
      };
    },
    { taxableValue: 0, cgst: 0, sgst: 0, totalTax: 0, total: 0 }
  );
}
