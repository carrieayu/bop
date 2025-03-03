import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { aggregatedExpensesFunction, expensesTotalsFunction, monthlyTotalsExpensesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import { ExpenseResultEntity } from '../../entity/expenseResultEntity'
import { RootState } from '../../app/store'

const initialState = {
  isLoading: false,
  list: [] as ExpenseResultEntity[],
  monthlyTotals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: []
}

export const fetchExpenseResult = createAsyncThunk('expense-results/fetch', async () => {
  return await fetchWithPolling<ExpenseResultEntity[]>('expenses-results/list/')
})

const expenseResults = createSlice({
  name: 'expenseResults',
  initialState,
  reducers: {
    getExpenseResultsTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.list)
      state.monthlyTotals= expensesTotalsFunction(aggregatedExpensesData)
      state.yearlyTotal = sumValues(state.monthlyTotals)
      state.monthlyTotalsByDate = monthlyTotalsExpensesFunction(state.list)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpenseResult.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchExpenseResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchExpenseResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getExpenseResultsTotals } = expenseResults.actions

export default expenseResults.reducer
