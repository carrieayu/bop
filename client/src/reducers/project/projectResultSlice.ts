import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectResultEntity } from '../../entity/projectResultEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as ProjectResultEntity[],
  totalSales: 0,
  nonOperatingExpenseTotal: 0,
  nonOperatingIncomeTotal: 0,
  salesRevenueTotal: 0,
  operatingIncomeTotal: 0,
  cumulativeOrdinaryIncome: 0,
  salesRevenueResultsMonthly: [],
  nonOperatingIncomeResultsMonthly: [],
  nonOperatingExpenseResultsMonthly: [],
}

export const fetchProjectResult = createAsyncThunk('project-results/fetch', async () => {
  return await fetchWithPolling<ProjectResultEntity[]>('project-sales-results/list/')
})

const projectResult = createSlice({
  name: 'projectResult',
  initialState,
  reducers: {
    getProjectResultTotals: (state) => {
      state.salesRevenueTotal = sumValues(state.list.map((project) => project.sales_revenue))
      state.operatingIncomeTotal = sumValues(state.list.map((project) => project.operating_income))
      state.nonOperatingIncomeTotal = sumValues(state.list.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(
        state.list.map((project) => project.non_operating_expense),
      )
      state.cumulativeOrdinaryIncome =
        state.operatingIncomeTotal + state.nonOperatingIncomeTotal - state.nonOperatingExpenseTotal
    },
    getMonthlyResultValues: (state) => {
      state.salesRevenueResultsMonthly = state.list.map((project) => {
        return {
          year: project.projects.year, // gets year from related project (planning)
          month: project.projects.month, // gets month from related project (planning)
          total: project.sales_revenue,
        }
      })
      state.nonOperatingExpenseResultsMonthly = state.list.map((project) => {
        return {
          year: project.projects.year,
          month: project.projects.month,
          total: project.non_operating_expense,
        }
      })
      state.nonOperatingIncomeResultsMonthly = state.list.map((project) => {
        return {
          year: project.projects.year,
          month: project.projects.month,
          total: project.non_operating_income,
        }
      })   
    },
    reformatProjectList: (state) => {
      state.list = state.list.map((project) => {
        const { year, month, } = project.projects // Extract year, month and the remaining values from nested "projects" object
        const transformedProject = {
          ...project, // Include the outer project fields
          year, // Add the year from the nested "projects" object
          month, // Add the month from the nested "projects" object
        }
        return transformedProject
      })
    }
  },

  extraReducers(builder) {
    builder
      .addCase(fetchProjectResult.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchProjectResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchProjectResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getProjectResultTotals, getMonthlyResultValues } = projectResult.actions

export default projectResult.reducer
