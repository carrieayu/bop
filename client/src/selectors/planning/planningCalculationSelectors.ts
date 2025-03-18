import { createSelector } from '@reduxjs/toolkit'
import { selectProjects } from '../listSelectors'
import { planningSelector } from './planningSelector'
import {
  calculateGrossProfit,
  calculateMonthlyGrossProfit,
  calculateGrossProfitMargin,
  calculateMonthlyGrossProfitMargin,
  calculateMonthlyOperatingProfitMargin,
  calculateMonthlyOrdinaryIncome,
  calculateOperatingIncome,
  calculateOperatingProfitMargin,
  calculateOrdinaryIncome,
  calculateSellingAndGeneralAdmin,
} from '../../utils/financialCalculationsUtil'
import {
  grossProfitFunction,
  operatingIncomeFunction,
  ordinaryProfitFunction,
  sellingAndGeneralAdminExpenseFunction,
} from '../../utils/tableAggregationUtil'

// Gross Profit Calculation
export const selectGrossProfit = createSelector(
  [planningSelector],
  (planning) => {
    const monthlyTotalsFuncOneCalc = calculateMonthlyGrossProfit(planning.projects.monthlyTotals.salesRevenue, planning.costOfSales.monthlyTotals)
    const monthlyTotalsFuncTwoAgg = grossProfitFunction(planning.projects.monthlyTotals.salesRevenue, planning.costOfSales.monthlyTotals)

 
    return {
      yearTotal: calculateGrossProfit(planning.projects.salesRevenueTotal, planning.costOfSales.yearlyTotal),
      monthlyTotals: grossProfitFunction(planning.projects.monthlyTotals.salesRevenue, planning.costOfSales.monthlyTotals)
      // monthlyTotals: calculateMonthlyGrossProfit(planning.projects.monthlyTotals.salesRevenue, planning.costOfSales.monthlyTotals)

    }

  },
)

// Gross Profit Margin Calculation
export const selectGrossProfitMargin = createSelector(
  [selectGrossProfit, planningSelector],
  (grossProfit, planning) => ({
    
    yearTotal: calculateGrossProfitMargin(grossProfit.yearTotal, planning.projects.salesRevenueTotal),
    monthlyTotals: calculateMonthlyGrossProfitMargin(
      planning.projects.monthlyTotals.salesRevenue,
      grossProfit.monthlyTotals,
    ),
  }),
)

// Selling and General Admin Expenses Calculation
export const selectSellingAndGeneralAdmin = createSelector([planningSelector], (planning) => ({
  yearTotal: calculateSellingAndGeneralAdmin(planning.expenses.yearlyTotal, planning.employeeExpenses.yearlyTotal),
  monthlyTotals: sellingAndGeneralAdminExpenseFunction(
    planning.employeeExpenses.monthlyTotals,
    planning.expenses.monthlyTotals,
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
  [selectOperatingIncome, planningSelector],
  (operatingIncome, planning) => ({
    yearTotal: calculateOperatingProfitMargin(operatingIncome.yearTotal, planning.projects.salesRevenueTotal),
    monthlyTotals: calculateMonthlyOperatingProfitMargin(
      operatingIncome.monthlyTotals,
      planning.projects.monthlyTotals.salesRevenue,
    ),
  }),
)

// Ordinary Income Calculation
export const selectOrdinaryIncome = createSelector(
  [selectOperatingIncome, selectProjects, planningSelector],
  (operatingIncome, projects, planning) => ({
    yearTotal: calculateOrdinaryIncome(
      operatingIncome.yearTotal,
      projects.nonOperatingIncomeTotal,
      projects.nonOperatingExpenseTotal,
    ),
    monthlyTotals: ordinaryProfitFunction(
      operatingIncome.monthlyTotals,
      planning.projects.monthlyTotals.nonOperatingIncome,
      planning.projects.monthlyTotals.nonOperatingExpense,
    ),

    // monthlyTotals: calculateMonthlyOrdinaryIncome(
    //   operatingIncome.monthlyTotals,
    //   planning.projects.monthlyTotals.nonOperatingIncome,
    //   planning.projects.monthlyTotals.nonOperatingExpense,
    // ),
  }),
)

// Consolidated Selector for All Calculations
export const planningCalculationsSelector = createSelector(
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