
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { BusinessDivisionsEntity } from '../../entity/businessDivisionsEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  businessDivisionlList: [] as BusinessDivisionsEntity [],
}

export const fetchBusinessDivisions = createAsyncThunk('business/fetch', async () => {
  return await fetchWithPolling<BusinessDivisionsEntity[]>('master-business-divisions/list/')
})

const businessDivisions = createSlice({
  name: 'business-divisions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBusinessDivisions.fulfilled, (state, action) => {
        state.businessDivisionlList = action.payload
        state.isLoading = false
      })
      .addCase(fetchBusinessDivisions.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchBusinessDivisions.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = businessDivisions.actions

export default businessDivisions.reducer
