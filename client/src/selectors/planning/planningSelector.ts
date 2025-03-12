import { createSelector } from "@reduxjs/toolkit";

// Selectors
import { costOfSalesPlanningSelector } from '../costOfSales/costOfSalePlanningSelectors'
import { expensesPlanningSelector } from '../expenses/expensePlanningSelectors'
import { employeeExpensesPlanningSelector } from '../employeeExpenses/employeeExpensePlanningSelector'
import { projectsPlanningSelector } from '../projects/projectPlanningSelectors'
// Calcualtion Functions
import { calculateFinancials } from "../../utils/financialCalculationsUtil"; 

export const planningSelector = createSelector(
  [costOfSalesPlanningSelector, expensesPlanningSelector, employeeExpensesPlanningSelector, projectsPlanningSelector],
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