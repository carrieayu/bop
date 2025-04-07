import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ProjectEntity } from '../../entity/projectEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

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

export default project.reducer
