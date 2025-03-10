import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { aggregatedExpensesFunction, expensesTotalsFunction, monthlyTotalsExpensesFunction, testNewMapValue } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as ExpenseEntity[],
  monthlyTotals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
}

export const fetchExpense = createAsyncThunk('expense/fetch', async () => {
  return await fetchWithPolling<ExpenseEntity[]>('expenses/list/')
})

const expense = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    getExpenseTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.list)
      state.monthlyTotals = expensesTotalsFunction(aggregatedExpensesData)
      state.yearlyTotal = sumValues(state.monthlyTotals)
      state.monthlyTotalsByDate = monthlyTotalsExpensesFunction(state.list)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.list = action.payload
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
