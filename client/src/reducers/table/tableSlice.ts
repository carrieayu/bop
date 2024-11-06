import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import TableEntity from '../../entity/tableEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const initialState = {
  isLoading: false,
  tableList: [new TableEntity({})],
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<TableEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<TableEntity[]>(`${getReactActiveEndpoint()}/api/projects/list/`)
      if (response.data && response.data.length > 0) {
        return response.data.map((data) => new TableEntity(data))
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

export const fetchAllClientData = createAsyncThunk('', async () => {
  return await fetchWithPolling()
})


const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllClientData.fulfilled, (state, action) => {
        state.tableList = action.payload
        state.isLoading = false
      })
      .addCase(fetchAllClientData.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllClientData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = tableSlice.actions

export default tableSlice.reducer
