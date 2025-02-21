import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { ProjectEntity } from '../../entity/projectEntity'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  projectList: [] as ProjectEntity[],
  nonOperatingIncomeTotal: 0,
  operatingIncomeTotal: 0,
  nonOperatingExpenseTotal:0,
  cumulativeOrdinaryIncome: 0,
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<ProjectEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<ProjectEntity[]>(`${getReactActiveEndpoint()}/api/projects/list/`)

      if (response.data && response.data.length > 0) {
        console.log('project slice', response.data)
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

export const fetchProject = createAsyncThunk('project/fetch', async () => {
  return await fetchWithPolling()
})

const project = createSlice({
  name: 'project',
  initialState,
  reducers: {
    getProjectTotals: (state) => {

      state.operatingIncomeTotal = sumValues(state.projectList.map((project) => project.operating_income))
      state.nonOperatingIncomeTotal = sumValues(state.projectList.map((project) => project.non_operating_income))
      state.nonOperatingExpenseTotal = sumValues(state.projectList.map((project) => project.non_operating_expense))
      state.cumulativeOrdinaryIncome =
        (state.operatingIncomeTotal + state.nonOperatingIncomeTotal) - state.nonOperatingExpenseTotal
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

export const { getProjectTotals } = project.actions

export default project.reducer
