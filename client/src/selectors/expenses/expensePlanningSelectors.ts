import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { fields } from '../../utils/inputFieldConfigurations'

import {
  aggregatedExpensesFunction,
  getMonthlyExpensesTotals,
  mapValue,
  getGraphDataForExpenses,
} from '../../utils/tableAggregationUtil'
import { getValueAndId, sumValues } from '../../utils/helperFunctionsUtil'

export const expensesList = createSelector([(state: RootState) => state.expenses.list], (list) =>
  list.map((item) => ({ ...item })),
)

export const expensesTotals = createSelector([expensesList], (list) => {
  const aggregatedExpensesData = aggregatedExpensesFunction(list)
  return getMonthlyExpensesTotals(aggregatedExpensesData, false, "planning")
})

export const expensesYearlyTotals = createSelector([expensesTotals], (totals) => sumValues(totals))

export const expensesSelectMonthlyTotalsByDate = createSelector([expensesList], (list) =>
  getGraphDataForExpenses(list),
)

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
  const consumableValues = getValueAndId('purchase', 'expense', aggregatedExpensesData, 'planning')
  const rentValues = getValueAndId('rent_expense', 'expense', aggregatedExpensesData, 'planning')
  const taxesPublicChargesValues = getValueAndId('tax_and_public_charge', 'expense', aggregatedExpensesData, 'planning')
  const depreciationExpensesValues = getValueAndId('depreciation_expense', 'expense', aggregatedExpensesData, 'planning')
  const travelExpenseValues = getValueAndId('travel_expense', 'expense', aggregatedExpensesData, 'planning')
  const communicationExpenseValues = getValueAndId('communication_expense', 'expense', aggregatedExpensesData, 'planning')
  const utilitiesValues = getValueAndId('utilities_expense', 'expense', aggregatedExpensesData, 'planning')
  const transactionFeeValues = getValueAndId('transaction_fee', 'expense', aggregatedExpensesData, 'planning')
  const advertisingExpenseValues = getValueAndId('advertising_expense', 'expense', aggregatedExpensesData, 'planning')
  const entertainmentExpenseValues = getValueAndId('entertainment_expense', 'expense', aggregatedExpensesData, 'planning')
  const professionalServiceFeeValues = getValueAndId('professional_service_fee', 'expense', aggregatedExpensesData, 'planning')

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
    professionalServiceFeeValues
  }

  return ValueAndId
})

// **New Memoized Selector for expensesPlanning**
export const expensesPlanningSelector = createSelector(
  [
    expensesList,
    expensesTotals,
    expensesSelectMonthlyTotalsByDate,
    expensesYearlyTotals,
    expensesSelectMonthlyTotalsByCategory,
    expensesEditable,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, individualMonthlyTotals, editable) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    individualMonthlyTotals,
    editable,
  }),
)