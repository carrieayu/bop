import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleEntity } from '../../entity/cosEntity'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction, monthlyTotalsCostOfSalesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  costOfSaleList: [] as CostOfSaleEntity[],
  costOfSaleTotals: [],
  costOfSaleYearTotal: 0 || '0',
  costOfSaleMonthlyTotalsByDate: []
}

export const fetchCos = createAsyncThunk('cost-of-sale/fetch', async () => {
  return await fetchWithPolling<CostOfSaleEntity[]>('cost-of-sales/list/')
})

const costOfSale = createSlice({
  name: 'cos',
  initialState,
  reducers: {
    getCostOfSaleTotals : (state) => {
      const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(state.costOfSaleList)
      state.costOfSaleTotals = costOfSalesTotalsFunction(aggregatedCostOfSalesData)
      state.costOfSaleYearTotal = sumValues(state.costOfSaleTotals)
      state.costOfSaleMonthlyTotalsByDate = monthlyTotalsCostOfSalesFunction(state.costOfSaleList)

    }
  },
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

export const {getCostOfSaleTotals} = costOfSale.actions

export default costOfSale.reducer
