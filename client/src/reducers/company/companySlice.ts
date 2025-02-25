import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { MasterCompanyEntity } from '../../entity/companyEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  masterCompanyList: [] as MasterCompanyEntity[],
}

export const fetchMasterCompany = createAsyncThunk('master-company/fetch', async () => {
  return await fetchWithPolling<MasterCompanyEntity[]>('master-companies/list/')
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
