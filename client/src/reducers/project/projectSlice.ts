import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectEntity } from '../../entity/projectEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  projectList: [] as ProjectEntity[],
  salesRevenueTotal: 0,
  nonOperatingIncomeTotal: 0,
  operatingIncomeTotal: 0,
  nonOperatingExpenseTotal:0,
  cumulativeOrdinaryIncome: 0,
  salesRevenueMonthly: [],
  // working on
  nonOperatingIncomeMonthly: [],
  nonOperatingExpenseMonthly:[],
}

export const fetchProject = createAsyncThunk('project/fetch', async () => {
  return await fetchWithPolling<ProjectEntity[]>('projects/list/')
})

const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    getProjectTotals: (state) => {

      state.salesRevenueTotal = sumValues(state.projectList.map((project)=> project.sales_revenue))
      state.operatingIncomeTotal = sumValues(state.projectList.map((project) => project.operating_income))
      state.nonOperatingIncomeTotal = sumValues(state.projectList.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(state.projectList.map((project) => project.non_operating_expense))
      state.cumulativeOrdinaryIncome =
        (state.operatingIncomeTotal + state.nonOperatingIncomeTotal) - state.nonOperatingExpenseTotal
    },
    getMonthlyValues: (state) => {
      state.salesRevenueMonthly = state.projectList.map((project) => {
        return {
          year: project.year,
          month: project.month,
          total: project.sales_revenue
        }
      })

      state.nonOperatingExpenseMonthly = state.projectList.map((project) => {
        return {
          year: project.year,
          month: project.month,
          total: project.non_operating_expense,
        }
      })
      state.nonOperatingIncomeMonthly = state.projectList.map((project) => {
        
        return {
          year: project.year,
          month: project.month,
          total: project.non_operating_income,
        }
      })
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.projectList = action.payload
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
