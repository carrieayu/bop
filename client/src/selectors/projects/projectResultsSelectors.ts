import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { aggregatedProjectsFunction, filterListMonthAndYear, mapValue } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

export const projectsList = createSelector([(state: RootState) => state.projectResult.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const salesRevenueTotal = createSelector([projectsList], (list) =>
  sumValues(list.map((project) => project.sales_revenue)),
)

export const operatingIncomeTotal = createSelector([projectsList], (list) =>
  sumValues(list.map((project) => project.operating_income)),
)

export const nonOperatingIncomeTotal = createSelector([projectsList], (list) =>
  sumValues(list.map((project) => project.non_operating_income)),
)

export const nonOperatingExpenseTotal = createSelector([projectsList], (list) =>
  sumValues(list.map((project) => project.non_operating_expense)),
)

export const cumulativeOrdinaryIncome = createSelector(
  [operatingIncomeTotal, nonOperatingIncomeTotal, nonOperatingExpenseTotal],
  (operatingIncomeTotal, nonOperatingIncomeTotal, nonOperatingExpenseTotal) =>
    operatingIncomeTotal + nonOperatingIncomeTotal - nonOperatingExpenseTotal,
)

export const salesRevenueMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.projects.year, // retrieves year from related planning record
    month: project.projects.month, // retrieves month from related planning record
    total: project.sales_revenue,
  })),
)

export const nonOperatingExpenseMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.projects.year, 
    month: project.projects.month,
    total: project.non_operating_expense,
  })),
)

export const nonOperatingIncomeMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.projects.year,
    month: project.projects.month,
    total: project.non_operating_income,
  })),
)

export const projectsSelectMonthlyTotalsByCategory = createSelector([projectsList], (list) => {
  const aggregatedProjectsData = aggregatedProjectsFunction(filterListMonthAndYear(list))
  
  const monthlyTotals = {
    nonOperatingIncome: mapValue('non_operating_income', aggregatedProjectsData),
    nonOperatingExpense: mapValue('non_operating_expense', aggregatedProjectsData),
    salesRevenue: mapValue('sales_revenue', aggregatedProjectsData),
  }

  return monthlyTotals
})

// **New Memoized Selector for projectsResults**

export const projectsResultsSelector = createSelector(
  [
    projectsList,
    salesRevenueTotal,
    operatingIncomeTotal,
    nonOperatingIncomeTotal,
    nonOperatingExpenseTotal,
    cumulativeOrdinaryIncome,
    salesRevenueMonthly,
    nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly,
    projectsSelectMonthlyTotalsByCategory,
  ],
  (
    list,
    salesRevenueTotal,
    operatingIncomeTotal,
    nonOperatingIncomeTotal,
    nonOperatingExpenseTotal,
    cumulativeOrdinaryIncome,
    salesRevenueMonthly,
    nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly,
    monthlyTotals,
  ) => ({
    list,
    salesRevenueTotal,
    operatingIncomeTotal,
    nonOperatingIncomeTotal,
    nonOperatingExpenseTotal,
    cumulativeOrdinaryIncome,
    salesRevenueMonthly,
    nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly,
    monthlyTotals,
  }),
)
