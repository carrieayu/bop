import { cumulativeSum, organiseTotals } from './helperFunctionsUtil'

interface LabelAndValues {
  label: string
  values: any[]
  id?: string // Make `id` optional
}

export const tableEditingLabelAndValues = (data: any, calculations: any) => {
  // --- TABLE DATA ---
  const cumulativeOrdinaryIncomeValues = cumulativeSum(calculations.ordinaryIncome.monthlyTotals)

  const labelsAndValues = [
    // Sales revenue section
    { label: 'salesRevenue', values: data.projects.monthlyTotals.salesRevenue, table: 'costOfSale' },
    { label: 'sales', values: data.projects.monthlyTotals.salesRevenue, table: 'costOfSale' },
    // Cost of sales section
    { label: 'costOfSales', values: data.costOfSales.monthlyTotals, table: 'costOfSale' },

    {
      label: 'purchases',
      values: data.costOfSales.individualMonthlyTotals.purchase,
      id: data.costOfSales.editable.purchasesValues.map((purchase) => purchase.id), 
      table: 'costOfSale',
    },
    {
      label: 'outsourcingExpenses',
      values: data.costOfSales.individualMonthlyTotals.outsourcingExpense,
      id: data.costOfSales.editable.outsourcingExpenseValues.map((outsourcing) => outsourcing.id),
      table: 'costOfSale',
    },
    {
      label: 'productPurchases',
      values: data.costOfSales.individualMonthlyTotals.productPurchase,
      id: data.costOfSales.editable.productPurchaseValues.map((productPurchase) => productPurchase.id),
      table: 'costOfSale',
    },
    {
      label: 'dispatchLaborExpenses',
      values: data.costOfSales.individualMonthlyTotals.dispatchLaborExpense,
      id: data.costOfSales.editable.dispatchLaborExpenseValues.map((dispatchLabor) => dispatchLabor.id),
      table: 'costOfSale',
    },
    {
      label: 'communicationExpenses',
      values: data.costOfSales.individualMonthlyTotals.communicationExpense,
      id: data.costOfSales.editable.communicationCostValues.map((communicationCost) => communicationCost.id),
      table: 'costOfSale',
    },
    {
      label: 'workInProgressExpenses',
      values: data.costOfSales.individualMonthlyTotals.workInProgressExpense,
      id: data.costOfSales.editable.workInProgressValues.map((workInProgress) => workInProgress.id),
      table: 'costOfSale',
    },
    {
      label: 'amortizationExpenses',
      values: data.costOfSales.individualMonthlyTotals.amortizationExpense,
      id: data.costOfSales.editable.amortizationValues.map((amortization) => amortization.id),
      table: 'costOfSale',
    },
    // Gross profit
    { label: 'grossProfit', values: calculations.grossProfit.monthlyTotals },
    // Employee expense section
    { label: 'employeeExpenses', values: data.employeeExpenses.monthlyTotals },
    {
      label: 'executiveRemuneration',
      values: data.employeeExpenses.individualMonthlyTotals.executiveRemuneration,
    },
    { label: 'salary', values: data.employeeExpenses.individualMonthlyTotals.salary },
    { label: 'bonusAndFuelAllowance', values: data.employeeExpenses.individualMonthlyTotals.bonusAndFuelAllowance },
    {
      label: 'statutoryWelfareExpenses',
      values: data.employeeExpenses.individualMonthlyTotals.statutoryWelfareExpense,
    },
    { label: 'welfareExpenses', values: data.employeeExpenses.individualMonthlyTotals.welfareExpense },
    { label: 'insurancePremiums', values: data.employeeExpenses.individualMonthlyTotals.insurancePremium },
    // Expenses section
    {
      label: 'expenses',
      values: data.expenses.monthlyTotals,
    },
    {
      label: 'consumableExpenses',
      values: data.expenses.individualMonthlyTotals.consumableExpense,
      id: data.expenses.editable.consumableValues.map((consumable) => consumable.id),
      table: 'expense',
    },
    {
      label: 'rentExpenses',
      values: data.expenses.individualMonthlyTotals.rentExpense,
      id: data.expenses.editable.rentValues.map((rent) => rent.id),
      table: 'expense',
    },
    {
      label: 'taxesAndPublicCharges',
      values: data.expenses.individualMonthlyTotals.taxAndPublicCharge,
      id: data.expenses.editable.taxesPublicChargesValues.map((taxAndPublicCharge) => taxAndPublicCharge.id),
      table: 'expense',
    },
    {
      label: 'depreciationExpenses',
      values: data.expenses.individualMonthlyTotals.depreciationExpense,
      id: data.expenses.editable.depreciationExpensesValues.map((depreciation) => depreciation.id),
      table: 'expense',
    },
    {
      label: 'travelExpenses',
      values: data.expenses.individualMonthlyTotals.travelExpense,
      id: data.expenses.editable.travelExpenseValues.map((travel) => travel.id),
      table: 'expense',
    },
    {
      label: 'communicationExpenses',
      values: data.expenses.individualMonthlyTotals.communicationExpense,
      id: data.expenses.editable.communicationExpenseValues.map((communication) => communication.id),
      table: 'expense',
    },
    {
      label: 'utilitiesExpenses',
      values: data.expenses.individualMonthlyTotals.utilitiesExpense,
      id: data.expenses.editable.utilitiesValues.map((utility) => utility.id),
      table: 'expense',
    },
    {
      label: 'transactionFees',
      values: data.expenses.individualMonthlyTotals.transactionFee,
      id: data.expenses.editable.transactionFeeValues.map((transactionFee) => transactionFee.id),
      table: 'expense',
    },
    {
      label: 'advertisingExpenses',
      values: data.expenses.individualMonthlyTotals.advertisingExpense,
      id: data.expenses.editable.advertisingExpenseValues.map((advertising) => advertising.id),
      table: 'expense',
    },
    {
      label: 'entertainmentExpenses',
      values: data.expenses.individualMonthlyTotals.entertainmentExpense,
      id: data.expenses.editable.entertainmentExpenseValues.map((entertainment) => entertainment.id),
      table: 'expense',
    },
    {
      label: 'professionalServicesFees',
      values: data.expenses.individualMonthlyTotals.professionalServicesFee,
      id: data.expenses.editable.professionalServiceFeeValues.map(
        (professionalServicesFee) => professionalServicesFee.id,
      ),
      table: 'expense',
    },
    // Selling and general admin expenses
    {
      label: 'sellingAndGeneralAdminExpensesShort',
      values: calculations.sellingAndGeneralAdmin.monthlyTotals,
    },
    // Operating income section
    { label: 'operatingIncome', values: calculations.operatingIncome.monthlyTotals },
    { label: 'nonOperatingIncome', values: data.projects.monthlyTotals.nonOperatingIncome },
    { label: 'nonOperatingExpenses', values: data.projects.monthlyTotals.nonOperatingExpense },
    // Ordinary Income Section
    { label: 'ordinaryIncome', values: calculations.ordinaryIncome.monthlyTotals },
    { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
  ]

  return labelsAndValues.map((item) => ({
    label: item.label,
    values: organiseTotals(item.values, item.label),
    id: item.id,
    table: item.table,
  }))
}
