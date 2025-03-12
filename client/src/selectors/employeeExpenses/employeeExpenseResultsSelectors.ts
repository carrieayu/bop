import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { employeeExpenseYearlyTotals, monthlyTotalsEmployeeExpenseFunction } from '../../utils/tableAggregationUtil'

// RESULTS

export const employeeExpensesList = createSelector([(state: RootState) => state.employeeExpenseResult.list], (list) => list)

export const employeeExpensesYearlyTotals = createSelector([employeeExpensesList], (list) => {
  const totals = employeeExpenseYearlyTotals(list)
  return totals.combinedTotal
})

export const employeeExpensesSelectMonthlyTotalsByDate = createSelector([employeeExpensesList], (list) =>
  monthlyTotalsEmployeeExpenseFunction(list),
)

// **New Memoized Selector for employeeExpensesResults**
export const employeeExpensesResultsSelector = createSelector(
  [employeeExpensesList, employeeExpensesYearlyTotals, employeeExpensesSelectMonthlyTotalsByDate],
  (list, yearlyTotal, monthlyTotalsByDate) => ({
    list,
    yearlyTotal: yearlyTotal,
    monthlyTotalsByDate: monthlyTotalsByDate,
  }),
)
