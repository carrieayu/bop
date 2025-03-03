import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleEntity } from '../../entity/costOfSaleEntity'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction, monthlyTotalsCostOfSalesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  list: [] as CostOfSaleEntity[],
  totals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
}

export const fetchCostOfSale = createAsyncThunk('cost-of-sale/fetch', async () => {
  return await fetchWithPolling<CostOfSaleEntity[]>('cost-of-sales/list/')
})

const costOfSale = createSlice({
  name: 'costOfSale',
  initialState,
  reducers: {
    getCostOfSaleTotals : (state) => {
      const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(state.list)
      state.totals = costOfSalesTotalsFunction(aggregatedCostOfSalesData)
      state.yearlyTotal = sumValues(state.totals)
      state.monthlyTotalsByDate = monthlyTotalsCostOfSalesFunction(state.list)

    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCostOfSale.fulfilled, (state, action) => {
        state.list = action.payload
        state.isLoading = false
      })
      .addCase(fetchCostOfSale.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCostOfSale.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {getCostOfSaleTotals} = costOfSale.actions

export default costOfSale.reducer
