import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedExpensesFunction,
  expensesTotalsFunction,
  monthlyTotalsExpensesFunction,
} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

export const expensesList = createSelector([(state: RootState) => state.expenses.list], (list) => list)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return expensesTotalsFunction(aggregatedExpensesData)
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) =>
  monthlyTotalsExpensesFunction(list),
)

export const expensesCategoryTotals = createSelector([expensesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return expensesTotalsFunction(list, true)
})

// **New Memoized Selector for expensesPlanning**
export const expensesPlanningSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesCategoryTotals,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
  }),
)