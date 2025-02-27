import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleResultEntity } from '../../entity/cosResultEntity'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction, monthlyTotalsCostOfSalesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  costOfSaleResultList: [] as CostOfSaleResultEntity[],
  costOfSaleResultTotals: [],
  costOfSaleResultYearTotal: 0 || '0',
  costOfSaleResultMonthlyTotalsByDate: [],
}

export const fetchCosResult = createAsyncThunk('cost-of-sale-result/fetch', async () => {
  return await fetchWithPolling<CostOfSaleResultEntity[]>('cost-of-sales-results/list/')
})

const costOfSaleResult = createSlice({
  name: 'costOfSaleResult',
  initialState,
  reducers: {
    getCostOfSaleResultsTotals: (state) => {
      const aggregatedCostOfSalesResultsData = aggregatedCostOfSalesFunction(state.costOfSaleResultList)
      state.costOfSaleResultTotals = costOfSalesTotalsFunction(aggregatedCostOfSalesResultsData)
      state.costOfSaleResultYearTotal = sumValues(state.costOfSaleResultTotals)
      state.costOfSaleResultMonthlyTotalsByDate = monthlyTotalsCostOfSalesFunction(state.costOfSaleResultList)

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
