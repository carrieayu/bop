import { cumulativeSum, organiseTotals } from './helperFunctionsUtil'

interface LabelAndValues {
  label: string
  values: any[]
  id?: string // Make `id` optional
}

export const editingTableALabelsAndValues = (planning, planningCalculations) => {
  // --- PLANNING TABLE DATA ---
  const cumulativeOrdinaryIncomeValues = cumulativeSum(planningCalculations.ordinaryIncome.monthlyTotals)

  const labelsAndValues = [
    // Sales revenue section
    { label: 'salesRevenue', values: planning.projects.monthlyTotals.salesRevenue },
    { label: 'sales', values: planning.projects.monthlyTotals.salesRevenue },
    // Cost of sales section
    { label: 'costOfSales', values: planning.costOfSales.monthlyTotals },

    {
      label: 'purchases',
      values: planning.costOfSales.individualMonthlyTotals.purchase,
      id: planning.costOfSales.editable.purchasesValues.map((purchase) => purchase.id),
    },
    {
      label: 'outsourcingExpenses',
      values: planning.costOfSales.individualMonthlyTotals.outsourcingExpense,
      id: planning.costOfSales.editable.outsourcingExpenseValues.map((outsourcing) => outsourcing.id),
    },
    {
      label: 'productPurchases',
      values: planning.costOfSales.individualMonthlyTotals.productPurchase,
      id: planning.costOfSales.editable.productPurchaseValues.map((productPurchase) => productPurchase.id),
    },
    {
      label: 'dispatchLaborExpenses',
      values: planning.costOfSales.individualMonthlyTotals.dispatchLaborExpense,
      id: planning.costOfSales.editable.dispatchLaborExpenseValues.map((dispatchLabor) => dispatchLabor.id),
    },
    {
      label: 'communicationExpenses',
      values: planning.costOfSales.individualMonthlyTotals.communicationExpense,
      id: planning.costOfSales.editable.communicationCostValues.map((communicationCost) => communicationCost.id),
    },
    {
      label: 'workInProgressExpenses',
      values: planning.costOfSales.individualMonthlyTotals.workInProgressExpense,
      id: planning.costOfSales.editable.workInProgressValues.map((workInProgress) => workInProgress.id),
    },
    {
      label: 'amortizationExpenses',
      values: planning.costOfSales.individualMonthlyTotals.amortizationExpense,
      id: planning.costOfSales.editable.amortizationValues.map((amortization) => amortization.id),
    },
    // Gross profit
    { label: 'grossProfit', values: planningCalculations.grossProfit.monthlyTotals },
    // Employee expense section
    { label: 'employeeExpenses', values: planning.employeeExpenses.monthlyTotals },
    {
      label: 'executiveRemuneration',
      values: planning.employeeExpenses.individualMonthlyTotals.executiveRemuneration,
    },
    { label: 'salary', values: planning.employeeExpenses.individualMonthlyTotals.salary },
    { label: 'bonusAndFuelAllowance', values: planning.employeeExpenses.individualMonthlyTotals.bonusAndFuelAllowance },
    {
      label: 'statutoryWelfareExpenses',
      values: planning.employeeExpenses.individualMonthlyTotals.statutoryWelfareExpense,
    },
    { label: 'welfareExpenses', values: planning.employeeExpenses.individualMonthlyTotals.welfareExpense },
    { label: 'insurancePremiums', values: planning.employeeExpenses.individualMonthlyTotals.insurancePremium },
    // Expenses section
    {
      label: 'expenses',
      values: planning.expenses.monthlyTotals,
    },
    {
      label: 'consumableExpenses',
      values: planning.expenses.individualMonthlyTotals.consumableExpense,
      id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
    },
    { label: 'rentExpenses', values: planning.expenses.individualMonthlyTotals.rentExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'taxesAndPublicCharges', values: planning.expenses.individualMonthlyTotals.taxAndPublicCharge,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'depreciationExpenses', values: planning.expenses.individualMonthlyTotals.depreciationExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'travelExpenses', values: planning.expenses.individualMonthlyTotals.travelExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'communicationExpenses', values: planning.expenses.individualMonthlyTotals.communicationExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'utilitiesExpenses', values: planning.expenses.individualMonthlyTotals.utilitiesExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'transactionFees', values: planning.expenses.individualMonthlyTotals.transactionFee,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'advertisingExpenses', values: planning.expenses.individualMonthlyTotals.advertisingExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    { label: 'entertainmentExpenses', values: planning.expenses.individualMonthlyTotals.entertainmentExpense,      
        id: planning.expenses.editable.consumableValues.map((consumable) => consumable.id),
 },
    {
      label: 'professionalServicesFees',
      values: planning.expenses.individualMonthlyTotals.professionalServicesFee,
    },
    // Selling and general admin expenses
    {
      label: 'sellingAndGeneralAdminExpensesShort',
      values: planningCalculations.sellingAndGeneralAdmin.monthlyTotals,
    },
    // Operating income section
    { label: 'operatingIncome', values: planningCalculations.operatingIncome.monthlyTotals },
    { label: 'nonOperatingIncome', values: planning.projects.monthlyTotals.nonOperatingIncome },
    { label: 'nonOperatingExpenses', values: planning.projects.monthlyTotals.nonOperatingExpense },
    // Ordinary Income Section
    { label: 'ordinaryIncome', values: planningCalculations.ordinaryIncome.monthlyTotals },
    { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
  ]

  return labelsAndValues.map((item) => ({
    label: item.label,
      values: organiseTotals(item.values, item.label),
      id: item.id
  }))
}
