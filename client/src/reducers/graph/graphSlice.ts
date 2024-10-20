import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import CardEntity from '../../entity/cardEntity'

interface GraphDataState {
  isLoading: boolean
  totalSalesByDate: Record<string, number>
  totalOperatingProfitByDate: Record<string, number>
  totalGrossProfitByDate: Record<string, number>
  totalNetProfitPeriodByDate: Record<string, number>
  totalGrossProfitMarginByDate: Record<string, number>
  totalOperatingProfitMarginByDate: Record<string, number>
  month: string[]
}


const initialState: GraphDataState = {
  isLoading: false,
  totalSalesByDate: {},
  totalOperatingProfitByDate: {},
  totalGrossProfitByDate: {},
  totalNetProfitPeriodByDate: {},
  totalGrossProfitMarginByDate: {},
  totalOperatingProfitMarginByDate: {},
  month: [],
}

export const fetchGraphData = createAsyncThunk('graphData/fetch', async () => {
  const response = await api.get<CardEntity[]>(`http://127.0.0.1:8000/api/projects/`)
  // const response = await api.get<CardEntity[]>(`http://54.178.202.58:8000/api/projects/`)
  const cards = response.data.map((data) => new CardEntity(data))
  
  const aggregatedData: Partial<GraphDataState> = {
    totalSalesByDate: {},
    totalOperatingProfitByDate: {},
    totalGrossProfitByDate: {},
    totalNetProfitPeriodByDate: {},
    totalGrossProfitMarginByDate: {},
    totalOperatingProfitMarginByDate: {},
    month: [],
  }

  cards.forEach((card) => {
    const date = `${card.year}-${card.month}`

    if (!aggregatedData.totalSalesByDate![date]) {
      aggregatedData.totalSalesByDate![date] = 0
      aggregatedData.totalOperatingProfitByDate![date] = 0
      aggregatedData.totalGrossProfitByDate![date] = 0
      aggregatedData.totalNetProfitPeriodByDate![date] = 0
      aggregatedData.totalGrossProfitMarginByDate![date] = 0
      aggregatedData.totalOperatingProfitMarginByDate![date] = 0
    }

    aggregatedData.totalSalesByDate![date] += parseFloat(card.sales_revenue?.toString() || '0')
    aggregatedData.totalOperatingProfitByDate![date] += parseFloat(card.operating_profit?.toString() || '0')
    aggregatedData.totalGrossProfitByDate![date] += parseFloat(card.ordinary_profit?.toString() || '0')
    aggregatedData.totalNetProfitPeriodByDate![date] += parseFloat(card.non_operating_profit?.toString() || '0')
    aggregatedData.totalGrossProfitMarginByDate![date] += parseFloat(card.ordinary_profit_margin?.toString() || '0')
    aggregatedData.totalOperatingProfitMarginByDate![date] += parseFloat(card.non_operating_expense?.toString() || '0',)
    aggregatedData.month.push(date)
  })
  console.log(aggregatedData)
  return aggregatedData
})

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchGraphData.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchGraphData.fulfilled, (state, action) => {
        state.isLoading = false
        state.totalSalesByDate = action.payload.totalSalesByDate || {}
        state.totalOperatingProfitByDate = action.payload.totalOperatingProfitByDate || {}
        state.totalGrossProfitByDate = action.payload.totalGrossProfitByDate || {}
        state.totalNetProfitPeriodByDate = action.payload.totalNetProfitPeriodByDate || {}
        state.totalGrossProfitMarginByDate = action.payload.totalGrossProfitMarginByDate || {}
        state.totalOperatingProfitMarginByDate = action.payload.totalOperatingProfitMarginByDate || {}
        state.month = action.payload.month || []
      })
      .addCase(fetchGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export default graphSlice.reducer
