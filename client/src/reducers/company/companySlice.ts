import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import MasterCompanyEntity from '../../entity/companyEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

const initialState = {
  isLoading: false,
  masterCompanyList: [new MasterCompanyEntity({})],
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<MasterCompanyEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<MasterCompanyEntity[]>(`${getReactActiveEndpoint()}/api/master-companies/list/`)

      if (response.data && response.data.length > 0) {
        return response.data.map((data) => new MasterCompanyEntity(data))
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

export const fetchMasterCompany = createAsyncThunk('master-company/fetch', async () => {
  return await fetchWithPolling()
})


const masterCompany = createSlice({
  name: 'master-company',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMasterCompany.fulfilled, (state, action) => {
        state.masterCompanyList = action.payload
        state.isLoading = false
      })
      .addCase(fetchMasterCompany.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMasterCompany.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = masterCompany.actions

export default masterCompany.reducer
