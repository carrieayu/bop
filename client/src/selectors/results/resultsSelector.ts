import { createSelector } from "@reduxjs/toolkit";

// Selectors
import { costOfSalesResultsSelector } from '../costOfSales/costOfSaleResultsSelectors'
import { expensesResultsSelector } from '../expenses/expenseResultsSelectors'
import { employeeExpensesResultsSelector } from '../employeeExpenses/employeeExpenseResultsSelectors'
import { projectsResultsSelector } from '../projects/projectResultsSelectors'
// Calcualtion Functions
import { calculateFinancials } from "../../utils/financialCalculationsUtil"; 
import { prepareGraphData } from "../../utils/graphDataPreparation";

export const resultsSelector = createSelector(
  [costOfSalesResultsSelector, expensesResultsSelector, employeeExpensesResultsSelector, projectsResultsSelector],
  (costOfSales, expenses, employeeExpenses, projects) => {
    // Calculate financials
    const calculations = calculateFinancials(projects, expenses, costOfSales, employeeExpenses)

    return {
      costOfSales,
      expenses,
      employeeExpenses,
      projects,
      calculations
    }
  },
)

export const resultsGraphDataPreparedSelector = createSelector([resultsSelector], (results) =>
  prepareGraphData(
    {
      salesRevenueMonthly: results.projects.salesRevenueMonthly,
      nonOperatingIncomeMonthly: results.projects.nonOperatingIncomeMonthly,
      nonOperatingExpenseMonthly: results.projects.nonOperatingExpenseMonthly,
      expensesMonthlyTotalsByDate: results.expenses.monthlyTotalsByDate,
      costOfSaleMonthlyTotalsByDate: results.costOfSales.monthlyTotalsByDate,
      employeeExpensesMonthlyTotalsByDate: results.employeeExpenses.monthlyTotalsByDate,
    },
    'results',
  ),
)