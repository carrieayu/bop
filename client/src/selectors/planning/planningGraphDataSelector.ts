import { createSelector } from "@reduxjs/toolkit"
import { planningSelector } from "./planningSelector"

// Selector function to prepare graph data
export const planningGraphDataSelector = createSelector([planningSelector], (planning) => {
    
return {
    salesRevenueMonthly: planning.projects.salesRevenueMonthly,
    nonOperatingIncomeMonthly: planning.projects.nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly: planning.projects.nonOperatingExpenseMonthly,
    expensesMonthlyTotalsByDate: planning.expenses.monthlyTotalsByDate,
    costOfSaleMonthlyTotalsByDate: planning.costOfSales.monthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: planning.employeeExpenses.monthlyTotalsByDate,
    }
})

