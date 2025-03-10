import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectEntity } from '../../entity/projectEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as ProjectEntity[],
  salesRevenueTotal: 0,
  operatingIncomeTotal: 0,
  nonOperatingIncomeTotal: 0,
  nonOperatingExpenseTotal: 0,
  cumulativeOrdinaryIncome: 0,
  salesRevenueMonthly: [],
  nonOperatingIncomeMonthly: [],
  nonOperatingExpenseMonthly: []
}

export const fetchProject = createAsyncThunk('project/fetch', async () => {
  return await fetchWithPolling<ProjectEntity[]>('projects/list/')
})

const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    getProjectTotals: (state) => {
      state.salesRevenueTotal = sumValues(state.list.map((project)=> project.sales_revenue))
      state.operatingIncomeTotal = sumValues(state.list.map((project) => project.operating_income))
      state.nonOperatingIncomeTotal = sumValues(state.list.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(state.list.map((project) => project.non_operating_expense))
      state.cumulativeOrdinaryIncome =
        (state.operatingIncomeTotal + state.nonOperatingIncomeTotal) - state.nonOperatingExpenseTotal
    },
    getMonthlyValues: (state) => {
      state.salesRevenueMonthly = state.list.map((project) => {
        return {
          year: project.year,
          month: project.month,
          total: project.sales_revenue
        }
      })
      state.nonOperatingExpenseMonthly = state.list.map((project) => {
        return {
          year: project.year,
          month: project.month,
          total: project.non_operating_expense,
        }
      })
      state.nonOperatingIncomeMonthly = state.list.map((project) => {
        
        return {
          year: project.year,
          month: project.month,
          total: project.non_operating_income,
        }
      })
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchProject.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchProject.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getProjectTotals, getMonthlyValues } = project.actions

export default project.reducer
