import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleResultEntity } from '../../entity/costOfSaleResultEntity'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction, monthlyTotalsCostOfSalesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as CostOfSaleResultEntity[],
  monthlyTotals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
}

export const fetchCostOfSaleResult = createAsyncThunk('cost-of-sale-result/fetch', async () => {
  return await fetchWithPolling<CostOfSaleResultEntity[]>('cost-of-sales-results/list/')
})

const costOfSaleResult = createSlice({
  name: 'costOfSaleResult',
  initialState,
  reducers: {
    getCostOfSaleResultsTotals: (state) => {
      const aggregatedCostOfSalesResultsData = aggregatedCostOfSalesFunction(state.list)
      state.monthlyTotals = costOfSalesTotalsFunction(aggregatedCostOfSalesResultsData)
      state.yearlyTotal = sumValues(state.monthlyTotals)
      state.monthlyTotalsByDate = monthlyTotalsCostOfSalesFunction(state.list)

    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCostOfSaleResult.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchCostOfSaleResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCostOfSaleResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {getCostOfSaleResultsTotals} = costOfSaleResult.actions

export default costOfSaleResult.reducer
