import { createSelector } from '@reduxjs/toolkit'
import { resultsSelector } from './resultsSelector'

// Selector function to prepare graph data
export const resultsGraphDataSelector = createSelector([resultsSelector], (results) => {
  return {
    salesRevenueMonthly: results.projects.salesRevenueMonthly,
    nonOperatingIncomeMonthly: results.projects.nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly: results.projects.nonOperatingExpenseMonthly,
    expensesMonthlyTotalsByDate: results.expenses.monthlyTotalsByDate,
    costOfSaleMonthlyTotalsByDate: results.costOfSales.monthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: results.employeeExpenses.monthlyTotalsByDate,
  }
})