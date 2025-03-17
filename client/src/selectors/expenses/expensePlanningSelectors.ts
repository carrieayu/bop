import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedExpensesFunction,
  expensesTotalsFunction,
  mapValue,
  monthlyTotalsExpensesFunction,
} from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

export const expensesList = createSelector([(state: RootState) => state.expenses.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return expensesTotalsFunction(aggregatedExpensesData)
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) =>
  monthlyTotalsExpensesFunction(list),
)

export const expensesCategoryTotals = createSelector([expensesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return expensesTotalsFunction(list, true)
})

export const expensesSelectMonthlyTotalsByCategory = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)

  const monthlyTotals = {
    consumable: mapValue('consumable_expense', aggregatedExpensesData),
    rent: mapValue('rent_expense', aggregatedExpensesData),
    taxesPublicCharges: mapValue('tax_and_public_charge', aggregatedExpensesData),
    depreciationExpense: mapValue('depreciation_expense', aggregatedExpensesData),
    travelExpense: mapValue('travel_expense', aggregatedExpensesData),
    communicationExpense: mapValue('communication_expense', aggregatedExpensesData),
    utilities: mapValue('utilities_expense', aggregatedExpensesData),
    transactionFee: mapValue('transaction_fee', aggregatedExpensesData),
    advertisingExpense: mapValue('advertising_expense', aggregatedExpensesData),
    entertainmentExpense: mapValue('entertainment_expense', aggregatedExpensesData),
    professionalServiceFee: mapValue('professional_service_fee', aggregatedExpensesData)
  }
  return monthlyTotals
})

// **New Memoized Selector for expensesPlanning**
export const expensesPlanningSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesCategoryTotals,
    expensesSelectMonthlyTotalsByCategory,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories, individualMonthlyTotals) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
    individualMonthlyTotals,
  }),
)