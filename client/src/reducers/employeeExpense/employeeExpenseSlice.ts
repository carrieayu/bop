import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { EmployeeExpenseEntity } from '../../entity/employeeExpenseEntity'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  employeeExpenseList: [] as EmployeeExpenseEntity[],
  employeeExpenseTotals: [],
  employeeExpenseYearTotal: 0,
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<EmployeeExpenseEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get(`${getReactActiveEndpoint()}/api/employee-expenses/list/`)
      if (response.data && response.data.length > 0) {
        return response.data
      } else {
        console.error(`Attempt ${attempt}: Data is empty, retrying in 5 minutes...`)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

export const fetchEmployeeExpense = createAsyncThunk('employee-expense/fetch', async () => {
  return await fetchWithPolling()
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
