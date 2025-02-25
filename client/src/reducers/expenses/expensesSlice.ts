import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { aggregatedExpensesFunction, expensesTotalsFunction, monthlyTotalsExpensesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  expenseList: [] as ExpenseEntity[],
  expenseTotals: [],
  expensesYearTotal: 0 || '0',
  expensesMonthlyTotalsByDate: [],
}

export const fetchExpense = createAsyncThunk('expense/fetch', async () => {
  return await fetchWithPolling<ExpenseEntity[]>('expenses/list/')
})

const expense = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    getExpenseTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.expenseList)
      state.expenseTotals = expensesTotalsFunction(aggregatedExpensesData)
      state.expensesYearTotal = sumValues(state.expenseTotals)
      state.expensesMonthlyTotalsByDate = monthlyTotalsExpensesFunction(state.expenseList)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.expenseList = action.payload
        state.isLoading = false
      })
      .addCase(fetchExpense.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchExpense.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getExpenseTotals } = expense.actions

export default expense.reducer
