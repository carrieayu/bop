import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { fields } from '../../utils/inputFieldConfigurations'

import {
  aggregatedExpensesFunction,
  getMonthlyExpensesTotals,
  mapValue,
  getGraphDataForExpenses,
} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

export const expensesList = createSelector([(state: RootState) => state.expenses.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return getMonthlyExpensesTotals(aggregatedExpensesData, false, "planning")
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) =>
  getGraphDataForExpenses(list),
)

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

// **New Memoized Selector for expensesPlanning**
export const expensesPlanningSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesSelectMonthlyTotalsByCategory,
  ],
  (list, 
    totals, 
    monthlyTotalsByDate, 
    yearlyTotal, 
    individualMonthlyTotals) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    individualMonthlyTotals,
  }),
)