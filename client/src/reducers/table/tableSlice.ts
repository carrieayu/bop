import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import TableEntity from '../../entity/tableEntity'

const initialState = {
  isLoading: false,
  tableList: [new TableEntity({})],
}

export const fetchAllClientData = createAsyncThunk('', async () => {
  // return await api.get<TableEntity[]>(`http://127.0.0.1:8000/api/planningprojects/tablelist/`).then((res) => {
  return await api.get<TableEntity[]>(`http://54.178.202.58:8000/api/planningprojects/tablelist/`).then((res) => {
    return res.data.map((data) => new TableEntity(data))
  })
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
