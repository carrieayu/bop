import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import {
  aggregatedExpensesFunction,
  getMonthlyExpensesTotals,
  mapValue,
  getGraphDataForExpenses,
} from '../../utils/tableAggregationUtil'
import { getValueAndId, sumValues } from '../../utils/helperFunctionsUtil'
import { fields } from '../../utils/inputFieldConfigurations'

// RESULTS

export const expensesList = createSelector([(state: RootState) => state.expensesResults.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return getMonthlyExpensesTotals(aggregatedExpensesData)
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) => getGraphDataForExpenses(list))

export const expensesCategoryTotals = createSelector([expensesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return getMonthlyExpensesTotals(list, true)
})

export const expensesSelectMonthlyTotalsByCategory = createSelector([expensesList], (list) => {
  const expenseFinancialFields = fields.expenses.filter((item) => item.isFinancial === true)

  const aggregatedExpensesData = aggregatedExpensesFunction(list)

  const monthlyTotals = expenseFinancialFields.reduce((acc, item) => {
    const fieldName = item.fieldName
    acc[fieldName] = mapValue(item.field, aggregatedExpensesData)
    return acc
  }, {})

  return monthlyTotals
})

export const expensesEditable = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  const consumableValues = getValueAndId('purchase', 'expense', aggregatedExpensesData, 'results')
  const rentValues = getValueAndId('rent_expense', 'expense', aggregatedExpensesData, 'results')
  const taxesPublicChargesValues = getValueAndId('tax_and_public_charge', 'expense', aggregatedExpensesData, 'results')
  const depreciationExpensesValues = getValueAndId('depreciation_expense', 'expense', aggregatedExpensesData, 'results')
  const travelExpenseValues = getValueAndId('travel_expense', 'expense', aggregatedExpensesData, 'results')
  const communicationExpenseValues = getValueAndId('communication_expense', 'expense', aggregatedExpensesData, 'results')
  const utilitiesValues = getValueAndId('utilities_expense', 'expense', aggregatedExpensesData, 'results')
  const transactionFeeValues = getValueAndId('transaction_fee', 'expense', aggregatedExpensesData, 'results')
  const advertisingExpenseValues = getValueAndId('advertising_expense', 'expense', aggregatedExpensesData, 'results')
  const entertainmentExpenseValues = getValueAndId('entertainment_expense', 'expense', aggregatedExpensesData, 'results')
  const professionalServiceFeeValues = getValueAndId('professional_service_fee', 'expense', aggregatedExpensesData, 'results')

  const ValueAndId = {
    consumableValues,
    rentValues,
    taxesPublicChargesValues,
    depreciationExpensesValues,
    travelExpenseValues,
    communicationExpenseValues,
    utilitiesValues,
    transactionFeeValues,
    advertisingExpenseValues,
    entertainmentExpenseValues,
    professionalServiceFeeValues,
  }

  return ValueAndId
})

// **New Memoized Selector for expensesResults**
export const expensesResultsSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesCategoryTotals,
    expensesSelectMonthlyTotalsByCategory,
    expensesEditable,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories, individualMonthlyTotals, editable) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
    individualMonthlyTotals,
    editable,
  }),
)
