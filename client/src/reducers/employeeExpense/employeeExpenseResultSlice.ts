import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { EmployeeExpenseResultEntity } from '../../entity/employeeExpenseResultEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import { monthlyTotalsEmployeeExpenseFunction } from '../../utils/tableAggregationUtil'

const initialState = {
  isLoading: false,
  employeeExpenseResultList: [] as EmployeeExpenseResultEntity[],
  employeeExpenseResultTotals: [],
  employeeExpenseResultYearTotal: 0,
  employeeExpensesResultMonthlyTotalsByDate: [],
}

export const fetchEmployeeExpenseResult = createAsyncThunk('employee-expense-result/fetch', async () => {
  return await fetchWithPolling<EmployeeExpenseResultEntity[]>('employee-expenses-results/list/')
})

const employeeExpenseResult = createSlice({
  name: 'employeeExpenseResult',
  initialState,
  reducers: {
    getEmployeeExpenseResultTotals: (state) => {
      // Aggregating totals for the specific fields
      const salaryTotal = sumValues(state.employeeExpenseResultList.map((emp) => Number(emp.salary) || 0))
      
      const executiveRemunerationTotal = sumValues(
        state.employeeExpenseResultList.map((emp) => Number(emp.executive_remuneration) || 0),
      )
      const insurancePremiumTotal = sumValues(
        state.employeeExpenseResultList.map((emp) => Number(emp.insurance_premium) || 0),
      )
      const welfareExpenseTotal = sumValues(state.employeeExpenseResultList.map((emp) => Number(emp.welfare_expense) || 0))
      const statutoryWelfareTotal = sumValues(
        state.employeeExpenseResultList.map((emp) => Number(emp.statutory_welfare_expense) || 0),
      )
      const bonusAndFuelTotal = sumValues(
        state.employeeExpenseResultList.map((emp) => Number(emp.bonus_and_fuel_allowance) || 0),
      )

      const total =
        salaryTotal +
        executiveRemunerationTotal +
        insurancePremiumTotal +
        welfareExpenseTotal +
        statutoryWelfareTotal +
        bonusAndFuelTotal

      state.employeeExpenseResultYearTotal = total
      state.employeeExpensesResultMonthlyTotalsByDate = monthlyTotalsEmployeeExpenseFunction(state.employeeExpenseResultList)

    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEmployeeExpenseResult.fulfilled, (state, action) => {
        state.employeeExpenseResultList = action.payload
        state.isLoading = false
        console.log('Employee Expense List', state.employeeExpenseResultList)
        console.log('Employee Expense Totals', state.employeeExpenseResultTotals)
        console.log('Employee Expense YearTotal', state.employeeExpenseResultYearTotal)
        console.log('State after update:', state)
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
