import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleResultEntity } from '../../entity/costOfSaleResultEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

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

export default costOfSaleResult.reducer
