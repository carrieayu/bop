import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as ExpenseEntity[],
  monthlyTotals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
  editableData: [],
}

export const fetchExpense = createAsyncThunk('expense/fetch', async () => {
  return await fetchWithPolling<ExpenseEntity[]>('expenses/list/')
})

const expense = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    updateExpenses: (state, action) => {
      return action.payload
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

export const { updateExpenses } = expense.actions

export default expense.reducer
