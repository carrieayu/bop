import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { CostOfSaleResultEntity } from '../../entity/cosResultEntity'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  costOfSaleResultList: [] as CostOfSaleResultEntity[],
  costOfSaleResultTotals: [],
  costOfSaleResultYearTotal: 0 || '0',
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<CostOfSaleResultEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<CostOfSaleResultEntity[]>(`${getReactActiveEndpoint()}/api/cost-of-sales-results/list/`)

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

export const fetchCosResult = createAsyncThunk('cost-of-sale-result/fetch', async () => {
  return await fetchWithPolling()
})

const costOfSaleResult = createSlice({
  name: 'costOfSaleResult',
  initialState,
  reducers: {
    getCostOfSaleResultsTotals: (state) => {
      const aggregatedCostOfSalesResultsData = aggregatedCostOfSalesFunction(state.costOfSaleResultList)
      state.costOfSaleResultTotals = costOfSalesTotalsFunction(aggregatedCostOfSalesResultsData)
      state.costOfSaleResultYearTotal = sumValues(state.costOfSaleResultTotals)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCosResult.fulfilled, (state, action) => {
        state.costOfSaleResultList = action.payload
        state.isLoading = false
      })
      .addCase(fetchCosResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCosResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {getCostOfSaleResultsTotals} = costOfSaleResult.actions

export default costOfSaleResult.reducer
