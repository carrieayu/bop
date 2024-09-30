import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import MasterCompanyEntity from '../../entity/companyEntity'

const initialState = {
  isLoading: false,
  masterCompanyList: [new MasterCompanyEntity({})],
}

export const fetchMasterCompany = createAsyncThunk('master-company/fetch', async () => {
  try {
    const response = await api.get<MasterCompanyEntity[]>('http://127.0.0.1:8000/api/master-companies/')
    // const response = await api.get<MasterCompanyEntity[]>('http://54.178.202.58:8000/api/master-companies/')
    return response.data.map((data) => new MasterCompanyEntity(data))
  } catch (error) {
    console.error('Error fetching master company', error)
    throw error
  }
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
