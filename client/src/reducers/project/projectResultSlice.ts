import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { ProjectResultEntity } from '../../entity/projectResultEntity'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  projectResultList: [] as ProjectResultEntity[],
  totalSales: 0,
  nonOperatingIncomeTotal: 0,
  nonOperatingExpenseTotal: 0,
  test: []
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<ProjectResultEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<ProjectResultEntity[]>(
        `${getReactActiveEndpoint()}/api/project-sales-results/list/`,
      )

      if (response.data && response.data.length > 0) {
        console.log('project result slice', response.data)
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

export const fetchProjectResult = createAsyncThunk('project-results/fetch', async () => {
  return await fetchWithPolling()
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
      console.log ( 'state.totalSales',state.totalSales)
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
