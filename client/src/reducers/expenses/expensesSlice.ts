import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'
import { mappingExpensesLabels } from '../../utils/labelConverter'

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
    updateExpensesPlanningScreen: (state, action) => {
      console.log("inside expense",action.payload)
      state.list = state.list.map((item) => {
        const recordToBeChanged = action.payload.changedData[item.expense_id]

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

export const { updateExpensesPlanningScreen } = expense.actions

export default expense.reducer
