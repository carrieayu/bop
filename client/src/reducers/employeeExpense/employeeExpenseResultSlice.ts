import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseResultEntity } from '../../entity/employeeExpenseResultEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as EmployeeExpenseResultEntity[],
  totals: [], // doing nothing?
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
}

export const fetchEmployeeExpenseResult = createAsyncThunk('employee-expense-result/fetch', async () => {
  return await fetchWithPolling<EmployeeExpenseResultEntity[]>('employee-expenses-results/list/')
})

const employeeExpenseResult = createSlice({
  name: 'employeeExpenseResult',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployeeExpenseResult.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchEmployeeExpenseResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchEmployeeExpenseResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export default employeeExpenseResult.reducer
