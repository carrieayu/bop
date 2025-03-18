import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleEntity } from '../../entity/costOfSaleEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

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

export default costOfSale.reducer