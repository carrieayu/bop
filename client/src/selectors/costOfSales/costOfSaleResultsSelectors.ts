import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedCostOfSalesFunction,
  costOfSalesTotalsFunction,
  mapValue,
  monthlyTotalsCostOfSalesFunction,
} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

// RESULTS

export const costOfSalesList = createSelector([(state: RootState) => state.costOfSaleResult.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const costOfSalesTotals = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  return costOfSalesTotalsFunction(aggregatedCostOfSalesData)
})

export const costOfSalesYearlyTotals = createSelector([costOfSalesTotals], (totals) => sumValues(totals))

export const costOfSalesSelectMonthlyTotalsByDate = createSelector([costOfSalesList], (list) =>
  monthlyTotalsCostOfSalesFunction(list),
)

export const costOfSalesCategoryTotals = createSelector([costOfSalesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return costOfSalesTotalsFunction(list, true)
})

export const costOfSalesSelectMonthlyTotalsByCategory = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)

  const monthlyTotals = {
    purchase: mapValue('purchase', aggregatedCostOfSalesData),
    outsourcingExpense: mapValue('outsourcing_expense', aggregatedCostOfSalesData),
    productPurchase: mapValue('product_purchase', aggregatedCostOfSalesData),
    dispatchLaborExpense: mapValue('dispatch_labor_expense', aggregatedCostOfSalesData),
    communicationExpense: mapValue('communication_expense', aggregatedCostOfSalesData),
    workInProgressExpense: mapValue('work_in_progress_expense', aggregatedCostOfSalesData),
    amortizationExpense: mapValue('amortization_expense', aggregatedCostOfSalesData),
  }
  return monthlyTotals
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
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories, individualMonthlyTotals) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
    individualMonthlyTotals,
  }),
)
