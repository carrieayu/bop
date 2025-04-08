import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { aggregatedEmployeeExpensesFunctionDashboard, employeeExpensesTotalsFunction, mapValue, monthlyTotalsEmployeeExpenseFunction } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'
import { fields } from '../../utils/inputFieldConfigurations'

// RESULTS

export const employeeExpensesList = createSelector([(state: RootState) => state.employeeExpenseResult.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const employeeExpensesMonthlyTotals = createSelector([employeeExpensesList], (list) => {
  const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunctionDashboard(list)
  return employeeExpensesTotalsFunction(aggregatedEmployeeExpensesData)
})

export const employeeExpensesYearlyTotals = createSelector([employeeExpensesMonthlyTotals], (totals) => {
  return sumValues(totals)
})

export const employeeExpensesSelectMonthlyTotalsByDate = createSelector([employeeExpensesList], (list) =>
  monthlyTotalsEmployeeExpenseFunction(list),
)

export const employeeExpensesSelectMonthlyTotalsByCategory = createSelector([employeeExpensesList], (list) => {
  const employeeFinancialFields = fields.employees.filter((item) => item.isFinancial === true)

  const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunctionDashboard(list)

  const monthlyTotals = employeeFinancialFields.reduce((acc, item) => {
    acc[item.fieldName] = mapValue(item.fieldName, aggregatedEmployeeExpensesData)
    return acc
  }, {})
  
  return monthlyTotals
})
// **New Memoized Selector for employeeExpensesResults**
export const employeeExpensesResultsSelector = createSelector(
  [
    employeeExpensesList,
    employeeExpensesYearlyTotals,
    employeeExpensesMonthlyTotals,
    employeeExpensesSelectMonthlyTotalsByDate,
    employeeExpensesSelectMonthlyTotalsByCategory,
  ],
  (list, yearlyTotal, monthlyTotals, monthlyTotalsByDate, individualMonthlyTotals) => ({
    list,
    yearlyTotal,
    monthlyTotals,
    monthlyTotalsByDate,
    individualMonthlyTotals,
  }),
)
