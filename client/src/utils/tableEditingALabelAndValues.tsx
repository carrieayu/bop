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
    { label: 'salesRevenue', values: planning.projects.monthlyTotals.salesRevenue, table: 'costOfSale' },
    { label: 'sales', values: planning.projects.monthlyTotals.salesRevenue, table: 'costOfSale' },
    // Cost of sales section
    { label: 'costOfSales', values: planning.costOfSales.monthlyTotals, table: 'costOfSale' },

    {
      label: 'purchases',
      values: planning.costOfSales.individualMonthlyTotals.purchase,
      id: planning.costOfSales.editable.purchasesValues.map((purchase) => purchase.id),
      table: 'costOfSale',
    },
    {
      label: 'outsourcingExpenses',
      values: planning.costOfSales.individualMonthlyTotals.outsourcingExpense,
      id: planning.costOfSales.editable.outsourcingExpenseValues.map((outsourcing) => outsourcing.id),
      table: 'costOfSale'
    },
    {
      label: 'productPurchases',
      values: planning.costOfSales.individualMonthlyTotals.productPurchase,
      id: planning.costOfSales.editable.productPurchaseValues.map((productPurchase) => productPurchase.id),
      table: 'costOfSale'
    },
    {
      label: 'dispatchLaborExpenses',
      values: planning.costOfSales.individualMonthlyTotals.dispatchLaborExpense,
      id: planning.costOfSales.editable.dispatchLaborExpenseValues.map((dispatchLabor) => dispatchLabor.id),
      table: 'costOfSale'
    },
    {
      label: 'communicationExpenses',
      values: planning.costOfSales.individualMonthlyTotals.communicationExpense,
      id: planning.costOfSales.editable.communicationCostValues.map((communicationCost) => communicationCost.id),
      table: 'costOfSale'
    },
    {
      label: 'workInProgressExpenses',
      values: planning.costOfSales.individualMonthlyTotals.workInProgressExpense,
      id: planning.costOfSales.editable.workInProgressValues.map((workInProgress) => workInProgress.id),
      table: 'costOfSale'
    },
    {
      label: 'amortizationExpenses',
      values: planning.costOfSales.individualMonthlyTotals.amortizationExpense,
      id: planning.costOfSales.editable.amortizationValues.map((amortization) => amortization.id),
      table: 'costOfSale'
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
      table: 'expense',
    },
    {
      label: 'rentExpenses',
      values: planning.expenses.individualMonthlyTotals.rentExpense,
      id: planning.expenses.editable.rentValues.map((rent) => rent.id),
      table: 'expense',
    },
    {
      label: 'taxesAndPublicCharges',
      values: planning.expenses.individualMonthlyTotals.taxAndPublicCharge,
      id: planning.expenses.editable.taxesPublicChargesValues.map((taxAndPublicCharge) => taxAndPublicCharge.id),
      table: 'expense',
    },
    {
      label: 'depreciationExpenses',
      values: planning.expenses.individualMonthlyTotals.depreciationExpense,
      id: planning.expenses.editable.depreciationExpensesValues.map((depreciation) => depreciation.id),
      table: 'expense',
    },
    {
      label: 'travelExpenses',
      values: planning.expenses.individualMonthlyTotals.travelExpense,
      id: planning.expenses.editable.travelExpenseValues.map((travel) => travel.id),
      table: 'expense',
    },
    {
      label: 'communicationExpenses',
      values: planning.expenses.individualMonthlyTotals.communicationExpense,
      id: planning.expenses.editable.communicationExpenseValues.map((communication) => communication.id),
      table: 'expense',
    },
    {
      label: 'utilitiesExpenses',
      values: planning.expenses.individualMonthlyTotals.utilitiesExpense,
      id: planning.expenses.editable.utilitiesValues.map((utility) => utility.id),
      table: 'expense',
    },
    {
      label: 'transactionFees',
      values: planning.expenses.individualMonthlyTotals.transactionFee,
      id: planning.expenses.editable.transactionFeeValues.map((transactionFee) => transactionFee.id),
      table: 'expense',
    },
    {
      label: 'advertisingExpenses',
      values: planning.expenses.individualMonthlyTotals.advertisingExpense,
      id: planning.expenses.editable.advertisingExpenseValues.map((advertising) => advertising.id),
      table: 'expense',
    },
    {
      label: 'entertainmentExpenses',
      values: planning.expenses.individualMonthlyTotals.entertainmentExpense,
      id: planning.expenses.editable.entertainmentExpenseValues.map((entertainment) => entertainment.id),
      table: 'expense',
    },
    {
      label: 'professionalServicesFees',
      values: planning.expenses.individualMonthlyTotals.professionalServicesFee,
      id: planning.expenses.editable.professionalServiceFeeValues.map(
        (professionalServicesFee) => professionalServicesFee.id,
      ),
      table: 'expense',
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
    id: item.id,
    table: item.table
  }))
}
