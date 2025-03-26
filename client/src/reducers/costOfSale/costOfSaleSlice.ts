import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleEntity } from '../../entity/costOfSaleEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'
import { mappingCostOfSalesLabels } from '../../utils/labelConverter'

const initialState = {
  isLoading: false,
  list: [] as CostOfSaleEntity[],
  totals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
  editableData: [],
}

export const fetchCostOfSale = createAsyncThunk('cost-of-sale/fetch', async () => {
  return await fetchWithPolling<CostOfSaleEntity[]>('cost-of-sales/list/')
})

const costOfSale = createSlice({
  name: 'costOfSale',
  initialState,
  reducers: {
    updateCostOfSalesPlanningScreen: (state, action) => {
      state.list = state.list.map((item) => {
      console.log('inside costOfSale slice', action.payload)

        const recordToBeChanged = action.payload.changedData[item.cost_of_sale_id]

        if (recordToBeChanged) {

          const updatedItem = { ...item }
          
          recordToBeChanged.forEach((record) => {
            const recordLabel = record.label
            const convertedLabel = mappingCostOfSalesLabels(recordLabel)
            updatedItem[convertedLabel] = record.value
          })          
          return updatedItem
        }
        return item // Return item as is if no match
      })
    },
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

export const { updateCostOfSalesPlanningScreen } = costOfSale.actions

export default costOfSale.reducer