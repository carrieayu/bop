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

export const mappingExpensesLabels = (recordLabel) => {
  const mapping = {
    travelExpenses: 'travel_expense',
    consumableExpenses: 'consumable_expense',
    rentExpenses: 'rent_expense',
    taxesAndPublicCharges: 'tax_and_public_charge',
    depreciationExpenses: 'depreciation_expense',
    communicationExpenses: 'communication_expense',
    utilitiesExpenses: 'utilities_expense',
    transactionFees: 'transaction_fee',
    advertisingExpenses: 'advertising_expense',
    entertainmentExpenses: 'entertainment_expense',
    professionalServicesFees: 'professional_services_fee',
  }

  return mapping[recordLabel] || recordLabel
}
