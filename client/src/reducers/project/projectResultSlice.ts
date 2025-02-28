import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectResultEntity } from '../../entity/projectResultEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  // RESULTS
  projectResultList: [] as ProjectResultEntity[],
  totalSales: 0,
  nonOperatingExpenseTotal: 0,
  nonOperatingIncomeTotal: 0,
  //newly added
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
      state.salesRevenueTotal = sumValues(state.projectResultList.map((project) => project.sales_revenue))
      state.operatingIncomeTotal = sumValues(state.projectResultList.map((project) => project.operating_income))
      state.nonOperatingIncomeTotal = sumValues(state.projectResultList.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(
        state.projectResultList.map((project) => project.non_operating_expense),
      )
      state.cumulativeOrdinaryIncome =
        state.operatingIncomeTotal + state.nonOperatingIncomeTotal - state.nonOperatingExpenseTotal
    },
    getMonthlyResultValues: (state) => {
      state.salesRevenueResultsMonthly = state.projectResultList.map((project) => {
        return {
          year: project.projects.year, // gets year from related project (planning)
          month: project.projects.month, // gets month from related project (planning)
          total: project.sales_revenue,
        }
      })
      state.nonOperatingExpenseResultsMonthly = state.projectResultList.map((project) => {
        return {
          year: project.projects.year,
          month: project.projects.month,
          total: project.non_operating_expense,
        }
      })
      state.nonOperatingIncomeResultsMonthly = state.projectResultList.map((project) => {
        return {
          year: project.projects.year,
          month: project.projects.month,
          total: project.non_operating_income,
        }
      })
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProjectResult.fulfilled, (state, action) => {
        state.projectResultList = action.payload
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
