import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectResultEntity } from '../../entity/projectResultEntity'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  projectResultList: [] as ProjectResultEntity[],
  totalSales: 0,
  nonOperatingIncomeTotal: 0,
  nonOperatingExpenseTotal: 0,
}

export const fetchProjectResult = createAsyncThunk('project-results/fetch', async () => {
  return await fetchWithPolling<ProjectResultEntity[]>('project-sales-results/list/')
})

const projectResult = createSlice({
  name: 'projectResult',
  initialState,
  reducers: {
    getProjectTotalSales: (state) => {
      state.totalSales = sumValues(state.projectResultList.map((project) => Number(project.sales_revenue)))
      state.nonOperatingIncomeTotal = sumValues(state.projectResultList.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(
        state.projectResultList.map((project) => project.non_operating_expense),
      )
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

export const { getProjectTotalSales } = projectResult.actions

export default projectResult.reducer
