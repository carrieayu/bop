import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedCostOfSalesFunction,
  getCostOfSalesMonthlyTotals,
  mapValue,
  getGraphDataForCostOfSales,
} from '../../utils/tableAggregationUtil'
import { getValueAndId, sumValues } from '../../utils/helperFunctionsUtil'
import { fields } from '../../utils/inputFieldConfigurations'

// RESULTS

export const costOfSalesList = createSelector([(state: RootState) => state.costOfSaleResult.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const costOfSalesTotals = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  return getCostOfSalesMonthlyTotals(aggregatedCostOfSalesData)
})

export const costOfSalesYearlyTotals = createSelector([costOfSalesTotals], (totals) => sumValues(totals))

export const costOfSalesSelectMonthlyTotalsByDate = createSelector([costOfSalesList], (list) =>
  getGraphDataForCostOfSales(list),
)

export const costOfSalesCategoryTotals = createSelector([costOfSalesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return getCostOfSalesMonthlyTotals(list, true)
})

export const costOfSalesSelectMonthlyTotalsByCategory = createSelector([costOfSalesList], (list) => {
  const costOfSalesFinancialFields = fields.costOfSales.filter((item) => item.isFinancial === true)

  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)

  const monthlyTotals = costOfSalesFinancialFields.reduce((acc, item) => {
    acc[item.fieldName] = mapValue(item.field, aggregatedCostOfSalesData)
    return acc
  }, {})

  return monthlyTotals
})

export const costOfSalesEditable = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  const purchasesValues = getValueAndId('purchase', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const outsourcingExpenseValues = getValueAndId('outsourcing_expense', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const productPurchaseValues = getValueAndId('product_purchase', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const dispatchLaborExpenseValues = getValueAndId('dispatch_labor_expense', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const communicationCostValues = getValueAndId('communication_expense', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const workInProgressValues = getValueAndId('work_in_progress_expense', 'cost_of_sale', aggregatedCostOfSalesData, 'results')
  const amortizationValues = getValueAndId('amortization_expense', 'cost_of_sale', aggregatedCostOfSalesData, 'results')

  const ValueAndId = {
    purchasesValues,
    outsourcingExpenseValues,
    productPurchaseValues,
    dispatchLaborExpenseValues,
    communicationCostValues,
    workInProgressValues,
    amortizationValues,
  }

  return ValueAndId
})

// **New Memoized Selector for costOfSalesResults**
export const costOfSalesResultsSelector = createSelector(
  [
    costOfSalesList,
    costOfSalesTotals,
    costOfSalesSelectMonthlyTotalsByDate,
    costOfSalesYearlyTotals,
    costOfSalesCategoryTotals,
    costOfSalesSelectMonthlyTotalsByCategory,
    costOfSalesEditable,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories, individualMonthlyTotals, editable) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
    individualMonthlyTotals,
    editable,
  }),
)
