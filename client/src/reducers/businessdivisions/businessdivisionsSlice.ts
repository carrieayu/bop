
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import BusinessDivisionsEntity from '../../entity/businessDivisionsEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const initialState = {
  isLoading: false,
  businessDivisionlList: [new BusinessDivisionsEntity({})],
}

export const fetchBusinessDivisions = createAsyncThunk('business/fetch', async () => {
  try {
    const response = await api.get<BusinessDivisionsEntity[]>(`${getReactActiveEndpoint()}/api/master-business-divisions/list/`)
    return response.data.map((data) => new BusinessDivisionsEntity(data))
  } catch (error) {
    console.error('Error fetching business division:', error)
    throw error
  }
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
