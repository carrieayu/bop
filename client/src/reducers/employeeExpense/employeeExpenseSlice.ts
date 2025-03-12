import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseEntity } from '../../entity/employeeExpenseEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import {
  aggregatedEmployeeExpensesFunction,
  employeeExpensesTotalsFunction,
  monthlyTotalsEmployeeExpenseFunction,
  employeeExpenseYearlyTotals,
} from '../../utils/tableAggregationUtil'

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
    getEmployeeExpenseTotals: (state) => { 
      const employeeExpenseTotals = employeeExpenseYearlyTotals(state.list)
      state.yearlyTotal = employeeExpenseTotals.combinedTotal
      state.monthlyTotalsByDate = monthlyTotalsEmployeeExpenseFunction(state.list)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployeeExpense.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
        state.monthlyTotals = action.payload
      })
      .addCase(fetchEmployeeExpense.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchEmployeeExpense.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getEmployeeExpenseTotals } = employeeExpense.actions

export default employeeExpense.reducer
