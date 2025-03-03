import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseResultEntity } from '../../entity/employeeExpenseResultEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import { employeeExpenseYearlyTotals, monthlyTotalsEmployeeExpenseFunction } from '../../utils/tableAggregationUtil'

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
    getEmployeeExpenseResultTotals: (state) => {
      const employeeExpenseResultTotals = employeeExpenseYearlyTotals(state)
      state.yearlyTotal = employeeExpenseResultTotals.combinedTotal
      state.monthlyTotalsByDate = monthlyTotalsEmployeeExpenseFunction(state.list)
    },
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

export const { getEmployeeExpenseResultTotals } = employeeExpenseResult.actions

export default employeeExpenseResult.reducer
