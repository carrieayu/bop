import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { PersonnelEntity } from '../../entity/personnelEntity'

const initialState = {
  isLoading: false,
  personnelList: [],
}

export const fetchPersonnel = createAsyncThunk('personnel/fetch', async () => {
  try {
    const response = await api.get<PersonnelEntity[]>(`${getReactActiveEndpoint()}/api/personnelexpenses/get/`)
    return response.data
  } catch (error) {
    console.error('Error fetching personnel:', error)
    throw error
  }
})

const personnelList = createSlice({
  name: 'personnel',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPersonnel.fulfilled, (state, action) => {
        state.personnelList = action.payload
        state.isLoading = false
      })
      .addCase(fetchPersonnel.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchPersonnel.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = personnelList.actions

export default personnelList.reducer
