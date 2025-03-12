import { createSelector } from "@reduxjs/toolkit"
import { selectProjects, selectCostOfSales, selectExpenses, selectEmployeeExpenses } from "../listSelectors"
import {
    calculateGrossProfit,
    calculateGrossProfitMargin, 
    calculateOperatingIncome, 
    calculateOperatingProfitMargin, 
    calculateOrdinaryIncome, 
    calculateSellingAndGeneralAdmin
} from "../../utils/financialCalculationsUtil"

// Gross Profit Calculation (based on project and cost of sales)
export const selectGrossProfit = createSelector([selectProjects, selectCostOfSales], (projects, costOfSales) => {
  const revenueTotal = projects.salesRevenueTotal
  const costOfSalesTotal = costOfSales.yearlyTotal
  return calculateGrossProfit(revenueTotal, costOfSalesTotal)
})

// Gross Profit Margin (Gross Profit / Revenue)
export const selectGrossProfitMargin = createSelector([selectGrossProfit, selectProjects], (grossProfit, projects) => {
  const revenueTotal = projects.salesRevenueTotal
  return calculateGrossProfitMargin(grossProfit, revenueTotal)
})

// Selling and Admin Expenses (you can calculate from various sources if needed)
export const selectSellingAndGeneralAdmin = createSelector(
  [selectExpenses, selectEmployeeExpenses],
  (expenses, employeeExpenses) => calculateSellingAndGeneralAdmin(expenses, employeeExpenses)// This can be a sum or similar calculation based on the expense data
)

// Operating Income Calculation (Gross Profit - Operating Expenses)
export const selectOperatingIncome = createSelector(
  [selectGrossProfit, selectSellingAndGeneralAdmin],
  (grossProfit, sellingAndAdmin) => calculateOperatingIncome(grossProfit, sellingAndAdmin),
)

// Operating Profit Margin (Operating Income / Revenue)
export const selectOperatingProfitMargin = createSelector(
  [selectOperatingIncome, selectProjects],
  (operatingIncome, projects) => {
    const revenueTotal = projects.salesRevenueTotal
    return calculateOperatingProfitMargin(revenueTotal, operatingIncome)
  },
)

// Ordinary Income Calculation (Operating Income + Non-Operating Income)
export const selectOrdinaryIncome = createSelector(
  [selectOperatingIncome, selectProjects],
  (operatingIncome, projects) => {
    const nonOperatingIncome = projects.nonOperatingIncomeTotal
    const nonOperatingExpense = projects.nonOperatingExpenseTotal
    return calculateOrdinaryIncome(operatingIncome, nonOperatingIncome, nonOperatingExpense)
  },
)