import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { EmployeeExpenseResultEntity } from '../../entity/employeeExpenseResultEntity'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  employeeExpenseResultList: [] as EmployeeExpenseResultEntity[],
  employeeExpenseResultTotals: [],
  employeeExpenseResultYearTotal: 0,
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<EmployeeExpenseResultEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get(`${getReactActiveEndpoint()}/api/employee-expenses-results/list/`)
      console.log('slice response', response.data)
      if (response.data && response.data.length > 0) {
        console.log('employee expense slice', response.data)
        return response.data
      } else {
        console.log(`Attempt ${attempt}: Data is empty, retrying in 5 minutes...`)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

export const fetchEmployeeExpenseResult = createAsyncThunk('employee-expense-result/fetch', async () => {
  return await fetchWithPolling()
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
