import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {

} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

export const projectsList = createSelector([(state: RootState) => state.project.list], (list) => list)

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
    year: project.year,
    month: project.month,
    total: project.sales_revenue,
  })),
)

export const nonOperatingExpenseMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.year,
    month: project.month,
    total: project.non_operating_expense,
  })),
)

export const nonOperatingIncomeMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.year,
    month: project.month,
    total: project.non_operating_income,
  })),
)

// **New Memoized Selector for projectsPlanning**

export const projectsPlanningSelector = createSelector(
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
  }),
)
