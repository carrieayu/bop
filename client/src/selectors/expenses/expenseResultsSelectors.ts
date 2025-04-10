import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedExpensesFunction,
  getMonthlyExpensesTotals,
  mapValue,
  getGraphDataForExpenses,
} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'
import { fields } from '../../utils/inputFieldConfigurations'

// RESULTS

export const expensesList = createSelector([(state: RootState) => state.expensesResults.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return getMonthlyExpensesTotals(aggregatedExpensesData)
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) => getGraphDataForExpenses(list))

export const expensesCategoryTotals = createSelector([expensesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return getMonthlyExpensesTotals(list, true)
})

export const expensesSelectMonthlyTotalsByCategory = createSelector([expensesList], (list) => {
  const expenseFinancialFields = fields.expenses.filter((item) => item.isFinancial === true)

  const aggregatedExpensesData = aggregatedExpensesFunction(list)

  const monthlyTotals = expenseFinancialFields.reduce((acc, item) => {
    const fieldName = item.fieldName
    acc[fieldName] = mapValue(item.field, aggregatedExpensesData)
    return acc
  }, {})

  return monthlyTotals
})

// **New Memoized Selector for expensesResults**
export const expensesResultsSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesCategoryTotals,
    expensesSelectMonthlyTotalsByCategory,
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
