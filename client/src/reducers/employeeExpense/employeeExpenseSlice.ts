import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseEntity } from '../../entity/employeeExpenseEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as EmployeeExpenseEntity[],
  monthlyTotals: [], // doing nothing?
  yearlyTotal: 0,
  monthlyTotalsByDate: []
}

export const fetchEmployeeExpense = createAsyncThunk('employee-expense/fetch', async () => {
  return await fetchWithPolling<EmployeeExpenseEntity[]>('employee-expenses/list/')
})

const employeeExpense = createSlice({
  name: 'employeeExpense',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployeeExpense.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchEmployeeExpense.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchEmployeeExpense.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export default employeeExpense.reducer
