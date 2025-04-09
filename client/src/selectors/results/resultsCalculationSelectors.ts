import { createSelector } from '@reduxjs/toolkit'
import { selectProjects, selectProjectsResults } from '../listSelectors'
import { resultsSelector } from './resultsSelector'
import {
  calculateGrossProfit,

  calculateGrossProfitMargin,
  calculateMonthlyGrossProfit,
  calculateMonthlyGrossProfitMargin,
  calculateMonthlyOperatingProfitMargin,
  calculateMonthlyOrdinaryIncome,
  calculateOperatingIncome,
  calculateOperatingProfitMargin,
  calculateOrdinaryIncome,
  calculateSellingAndGeneralAdmin,
} from '../../utils/financialCalculationsUtil'
import {
  operatingIncomeFunction,
  ordinaryProfitFunction,
  sellingAndGeneralAdminExpenseFunction,
} from '../../utils/tableAggregationUtil'

// Gross Profit Calculation
export const selectGrossProfit = createSelector(
  [resultsSelector],
  (results) => {
    
    // Takes Monthly Values From Object and Puts Them in an Array.
    const monthlyGrossProfitArray = Object.values(
      calculateMonthlyGrossProfit(results.projects.monthlyTotals.salesRevenue, results.costOfSales.monthlyTotals),
    )

    return {
      yearTotal: calculateGrossProfit(results.projects.salesRevenueTotal, results.costOfSales.yearlyTotal),
      monthlyTotals: monthlyGrossProfitArray
    }

  },
)

// Gross Profit Margin Calculation
export const selectGrossProfitMargin = createSelector(
  [selectGrossProfit, resultsSelector],
  (grossProfit, results) => ({
    yearTotal: calculateGrossProfitMargin(grossProfit.yearTotal, results.projects.salesRevenueTotal),
    monthlyTotals: calculateMonthlyGrossProfitMargin(
      results.projects.monthlyTotals.salesRevenue,
      grossProfit.monthlyTotals,
    ),
  }),
)

// Selling and General Admin Expenses Calculation
export const selectSellingAndGeneralAdmin = createSelector([resultsSelector], (results) => ({
  yearTotal: calculateSellingAndGeneralAdmin(results.expenses.yearlyTotal, results.employeeExpenses.yearlyTotal),
  monthlyTotals: sellingAndGeneralAdminExpenseFunction(
    results.employeeExpenses.monthlyTotals,
    results.expenses.monthlyTotals,
  ),
}))

// Operating Income Calculation
export const selectOperatingIncome = createSelector(
  [selectGrossProfit, selectSellingAndGeneralAdmin],
  (grossProfit, sellingAndAdmin) => ({
    yearTotal: calculateOperatingIncome(grossProfit.yearTotal, sellingAndAdmin.yearTotal),
    monthlyTotals: operatingIncomeFunction(grossProfit.monthlyTotals, sellingAndAdmin.monthlyTotals),
  }),
)

// Operating Profit Margin Calculation
export const selectOperatingProfitMargin = createSelector(
  [selectOperatingIncome, resultsSelector],
  (operatingIncome, results) => ({
    yearTotal: calculateOperatingProfitMargin(operatingIncome.yearTotal, results.projects.salesRevenueTotal),
    monthlyTotals: calculateMonthlyOperatingProfitMargin(
      operatingIncome.monthlyTotals,
      results.projects.monthlyTotals.salesRevenue,
    ),
  }),
)

// Ordinary Income Calculation
export const selectOrdinaryIncome = createSelector(
  [selectOperatingIncome, selectProjectsResults, resultsSelector],
  (operatingIncome, projects, results) => ({
    yearTotal: calculateOrdinaryIncome(
      operatingIncome.yearTotal,
      projects.nonOperatingIncomeTotal,
      projects.nonOperatingExpenseTotal,
    ),
    monthlyTotals: ordinaryProfitFunction(
      operatingIncome.monthlyTotals,
      results.projects.monthlyTotals.nonOperatingIncome,
      results.projects.monthlyTotals.nonOperatingExpense,
    ),
  }),
)

// Consolidated Selector for All Calculations
export const resultsCalculationsSelector = createSelector(
  [
    selectGrossProfit,
    selectGrossProfitMargin,
    selectSellingAndGeneralAdmin,
    selectOperatingIncome,
    selectOperatingProfitMargin,
    selectOrdinaryIncome,
  ],
  (grossProfit, grossProfitMargin, sellingAndGeneralAdmin, operatingIncome, operatingProfitMargin, ordinaryIncome) => ({
    grossProfit,
    grossProfitMargin,
    sellingAndGeneralAdmin,
    operatingIncome,
    operatingProfitMargin,
    ordinaryIncome,
  }),
)
