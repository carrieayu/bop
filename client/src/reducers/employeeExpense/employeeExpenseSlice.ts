import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseEntity } from '../../entity/employeeExpenseEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import { montlyTotalsEmployeeExpenseFunction } from '../../utils/tableAggregationUtil'

const initialState = {
  isLoading: false,
  employeeExpenseList: [] as EmployeeExpenseEntity[],
  employeeExpenseTotals: [],
  employeeExpenseYearTotal: 0,
  employeeExpensesMonthlyTotalsByDate: []
}

export const fetchEmployeeExpense = createAsyncThunk('employee-expense/fetch', async () => {
  return await fetchWithPolling<EmployeeExpenseEntity[]>('employee-expenses/list/')
})

const employeeExpense = createSlice({
  name: 'employeeExpense',
  initialState,
  reducers: {
    getEmployeeExpenseTotals: (state) => {
        
      // Aggregating totals for the specific fields
      const salaryTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.salary) || 0));
      const executiveRemunerationTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.executive_remuneration) || 0));
      const insurancePremiumTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.insurance_premium) || 0));
      const welfareExpenseTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.welfare_expense) || 0));
      const statutoryWelfareTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.statutory_welfare_expense) || 0));
      const bonusAndFuelTotal = sumValues(state.employeeExpenseList.map((emp) => Number(emp.bonus_and_fuel_allowance) || 0));

      const total =
        salaryTotal +
        executiveRemunerationTotal +
        insurancePremiumTotal +
        welfareExpenseTotal +
        statutoryWelfareTotal +
        bonusAndFuelTotal
        
      // Assign total to state
      state.employeeExpenseYearTotal = total
      state.employeeExpensesMonthlyTotalsByDate = montlyTotalsEmployeeExpenseFunction(state.employeeExpenseList)

    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployeeExpense.fulfilled, (state, action) => {
        state.employeeExpenseList = action.payload
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

export const { getEmployeeExpenseTotals } = employeeExpense.actions

export default employeeExpense.reducer
