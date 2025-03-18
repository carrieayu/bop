import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { MasterClientsEntity } from '../../entity/clientEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  masterClientsList: [] as MasterClientsEntity[],
}

export const fetchMasterClient = createAsyncThunk('client/fetch', async () => {
  return await fetchWithPolling<MasterClientsEntity[]>('master-clients/list/')
})

const masterClients = createSlice({
  name: 'master-clients',
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
