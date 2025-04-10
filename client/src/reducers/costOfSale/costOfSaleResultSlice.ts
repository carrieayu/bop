import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { CostOfSaleResultEntity } from '../../entity/costOfSaleResultEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'
import { mappingCostOfSalesLabels } from '../../utils/labelConverter'

const initialState = {
  isLoading: false,
  list: [] as CostOfSaleResultEntity[],
  monthlyTotals: [],
  yearlyTotal: 0,
  monthlyTotalsByDate: [],
  editableData: [],
}

export const fetchCostOfSaleResult = createAsyncThunk('cost-of-sale-result/fetch', async () => {
  return await fetchWithPolling<CostOfSaleResultEntity[]>('cost-of-sales-results/list/')
})

const costOfSaleResult = createSlice({
  name: 'costOfSaleResult',
  initialState,
  reducers: {
    updateCostOfSalesResultsScreen: (state, action) => {
      state.list = state.list.map((item) => {
        const recordToBeChanged = action.payload.modifiedFields[item.cost_of_sale_result_id]

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

export const { updateCostOfSalesResultsScreen } = costOfSaleResult.actions

export default costOfSaleResult.reducer
