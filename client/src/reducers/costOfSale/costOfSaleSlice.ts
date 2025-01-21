import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { CostOfSaleEntity } from '../../entity/cosEntity'

const initialState = {
  isLoading: false,
  costOfSaleList: [],
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<CostOfSaleEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<CostOfSaleEntity[]>(`${getReactActiveEndpoint()}/api/cost-of-sales/list/`)

      if (response.data && response.data.length > 0) {
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

export const fetchCos = createAsyncThunk('cost-of-sale/fetch', async () => {
  return await fetchWithPolling()
})

const costOfSale = createSlice({
  name: 'cos',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCos.fulfilled, (state, action) => {
        state.costOfSaleList = action.payload
        state.isLoading = false
      })
      .addCase(fetchCos.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCos.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = costOfSale.actions

export default costOfSale.reducer
