import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'
import { ExpenseResultEntity } from '../../entity/expenseResultEntity'

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

export default expenseResults.reducer
