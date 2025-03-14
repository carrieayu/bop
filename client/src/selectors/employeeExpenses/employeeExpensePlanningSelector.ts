import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedEmployeeExpensesFunctionDashboard,
  employeeExpensesTotalsFunction,
  employeeExpenseYearlyTotals,
  mapValue,
  monthlyTotalsEmployeeExpenseFunction,
} from '../../utils/tableAggregationUtil'

//PLANNING

export const employeeExpensesList = createSelector([(state: RootState) => state.employeeExpense.list], (list) => list)

export const employeeExpensesMonthlyTotals = createSelector([employeeExpensesList], (list) => {
  const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunctionDashboard(list)
  return employeeExpensesTotalsFunction(aggregatedEmployeeExpensesData)
})

export const employeeExpensesYearlyTotals = createSelector(
  [employeeExpensesList],
  (list) => {
    const totals = employeeExpenseYearlyTotals(list)
    return totals.combinedTotal
  }
)

export const employeeExpensesSelectMonthlyTotalsByDate = createSelector([employeeExpensesList], (list) =>
  monthlyTotalsEmployeeExpenseFunction(list),
)

export const employeeExpensesSelectMonthlyTotalsByCategory = createSelector([employeeExpensesList], (list) => {
  const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunctionDashboard(list)

  const monthlyTotals = {
    executiveRemuneration: mapValue('totalExecutiveRemuneration', aggregatedEmployeeExpensesData),
    salary: mapValue('totalSalary', aggregatedEmployeeExpensesData),
    bonusAndFuel: mapValue('totalBonusAndFuel', aggregatedEmployeeExpensesData),
    statutoryWelfare: mapValue('totalStatutoryWelfare', aggregatedEmployeeExpensesData),
    welfare: mapValue('totalWelfare', aggregatedEmployeeExpensesData),
    insurancePremium: mapValue('totalInsurancePremium', aggregatedEmployeeExpensesData),
  }
  return monthlyTotals
})

// **New Memoized Selector for employeeExpensesPlanning**
export const employeeExpensesPlanningSelector = createSelector(
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