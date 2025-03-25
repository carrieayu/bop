export const mappingCostOfSalesLabels = (recordLabel) => {
  const mapping = {
    purchases: 'purchase',
    outsourcingExpenses: 'outsourcing_expense',
    productPurchases: 'product_purchase',
    communicationExpenses: 'communication_expense',
    dispatchLaborExpenses: 'dispatch_labor_expense',
    workInProgressExpenses: 'work_in_progress_expense',
    amortizationExpenses: 'amortization_expense',
  }
  return mapping[recordLabel] || recordLabel
}

// Need to add expenses Later