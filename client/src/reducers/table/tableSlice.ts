import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { ACCESS_TOKEN } from '../../constants'
import { TableEntity } from '../../entity/tableEntity'

interface TableState {
  tableList: TableEntity[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
const initialState: TableState = {
  tableList: [],
  status: 'idle',
  error: null,
};

const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12
const token = localStorage.getItem(ACCESS_TOKEN)

async function fetchWithPolling(retries = MAX_RETRIES): Promise<TableEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${getReactActiveEndpoint()}/api/projects/list/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
      
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

export const fetchAllClientData = createAsyncThunk<TableEntity[], void>('client/fetchAll', async () => {
  const data = await fetchWithPolling()
  return data
})


const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllClientData.fulfilled, (state, action) => {
        state.tableList = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchAllClientData.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllClientData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const {} = tableSlice.actions

export default tableSlice.reducer
