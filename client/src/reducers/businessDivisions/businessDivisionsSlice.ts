
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import BusinessDivisionsEntity from '../../entity/businessDivisionsEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const POLLING_INTERVAL = 60000 
const MAX_RETRIES = 12
const initialState = {
  isLoading: false,
  businessDivisionlList: [new BusinessDivisionsEntity({})],
}

async function fetchWithPolling(retries = MAX_RETRIES): Promise<BusinessDivisionsEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<BusinessDivisionsEntity[]>(`${getReactActiveEndpoint()}/api/master-business-divisions/list/`)
      if (response.data && response.data.length > 0) {
        return response.data.map((data) => new BusinessDivisionsEntity(data)) 
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

export const fetchBusinessDivisions = createAsyncThunk('business/fetch', async () => {
  return await fetchWithPolling()
})

const businessDivisions = createSlice({
  name: 'business-divisions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBusinessDivisions.fulfilled, (state, action) => {
        state.businessDivisionlList = action.payload
        state.isLoading = false
      })
      .addCase(fetchBusinessDivisions.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchBusinessDivisions.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = businessDivisions.actions

export default businessDivisions.reducer
