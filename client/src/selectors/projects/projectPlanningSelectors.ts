import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { aggregatedProjectsFunction, mapValue } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'
import { fields } from '../../utils/inputFieldConfigurations'

export const projectsList = createSelector([(state: RootState) => state.project.list], (list) =>
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
// FOR GRAPH
export const salesRevenueMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.year,
    month: project.month,
    total: project.sales_revenue,
  })),
)
// FOR GRAPH
export const nonOperatingExpenseMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.year,
    month: project.month,
    total: project.non_operating_expense,
  })),
)
// FOR GRAPH
export const nonOperatingIncomeMonthly = createSelector([projectsList], (list) =>
  list.map((project) => ({
    year: project.year,
    month: project.month,
    total: project.non_operating_income,
  })),
)

export const projectsSelectMonthlyTotalsByCategory = createSelector([projectsList], (list) => {
  const projectsFinancialFields = fields.projects.filter((item) => item.isFinancial === true)

  const filteredProjectsFinancialFields = projectsFinancialFields.filter((item) =>
    item.field === 'non_operating_income' ||
    item.field === 'non_operating_expense' ||
    item.field === 'sales_revenue' 
  )
  const aggregatedProjectsData = aggregatedProjectsFunction(list)
  const monthlyTotals = filteredProjectsFinancialFields.reduce((acc, item) => {
    acc[item.fieldName] = mapValue(item.field, aggregatedProjectsData)
    return acc
  }, {})

  return monthlyTotals
})

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
