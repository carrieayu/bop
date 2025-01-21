import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { MasterClientsEntity } from '../../entity/clientEntity'

const initialState = {
  isLoading: false,
  masterClientsList: [] as MasterClientsEntity[],
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<MasterClientsEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<MasterClientsEntity[]>(`${getReactActiveEndpoint()}/api/master-clients/list/`)

      if (response.data && response.data.length > 0) {
        return response.data
      } else {
        console.log(`Attempt ${attempt}: Data is empty, retrying in 5 minutes...`)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

export const fetchMasterClient = createAsyncThunk('client/fetch', async () => {
  return await fetchWithPolling()
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
