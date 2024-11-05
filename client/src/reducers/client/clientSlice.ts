import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import MasterClientsEntity from '../../entity/clientEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const initialState = {
  isLoading: false,
  masterClientsList: [new MasterClientsEntity({})],
}

export const fetchMasterClient = createAsyncThunk('client/fetch', async () => {
  try {
    const response = await api.get<MasterClientsEntity[]>(`${getReactActiveEndpoint()}/api/master-clients/list/`)
    return response.data.map((data) => new MasterClientsEntity(data))
  } catch (error) {
    console.error('Error fetching master clients:', error)
    throw error
  }
})

const masterClients = createSlice({
  name: 'business-divisions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMasterClient.fulfilled, (state, action) => {
        state.masterClientsList = action.payload
        state.isLoading = false
      })
      .addCase(fetchMasterClient.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMasterClient.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = masterClients.actions

export default masterClients.reducer
