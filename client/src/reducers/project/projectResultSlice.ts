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

export default projectResult.reducer
