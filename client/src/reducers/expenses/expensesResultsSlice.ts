import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'
import { ExpenseResultEntity } from '../../entity/expenseResultEntity'
import { mappingExpensesLabels } from '../../utils/labelConverter'

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
    updateExpensesResultsScreen: (state, action) => {
      state.list = state.list.map((item) => {
        const recordToBeChanged = action.payload.modifiedFields[item.expense_result_id]

        if (recordToBeChanged) {
          const updatedItem = { ...item }

          recordToBeChanged.forEach((record) => {
            const recordLabel = record.label
            const convertedLabel = mappingExpensesLabels(recordLabel)
            updatedItem[convertedLabel] = record.value
          })
          return updatedItem
        }
        return item // Return item as is if no match
      })
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

export const { updateExpensesResultsScreen } = expenseResults.actions

export default expenseResults.reducer
