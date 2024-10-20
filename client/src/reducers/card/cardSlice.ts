import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import CardEntity from '../../entity/cardEntity'
import api from '../../api/api'
import { OtherPlanningEntity } from '../../entity/otherPlanningEntity'

const initialState = {
  isLoading: false,
  cardsList: [new CardEntity({})],
  totalSales: 0,
  totalOperatingProfit: 0,
  totalGrossProfit: 0,
  totalNetProfitPeriod: 0,
  totalGrossProfitMargin: 0,
  totalOperatingProfitMargin: 0,
}

function getSum(data: number[]) {
  return data?.reduce((accumulator: number, currentValue: number): number => {
    return accumulator + currentValue
  }, 0)
}


export const fetchAllCards = createAsyncThunk('', async () => {
  return await api.get<CardEntity[]>(`http://127.0.0.1:8000/api/projects/`).then((res) => {
  // return await api.get<CardEntity[]>(`http://54.178.202.58:8000/api/projects/`).then((res) => {
    return res.data.map((data) => new CardEntity(data))
  })
})

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        state.cardsList = action.payload
        state.isLoading = false
        state.totalSales = getSum(action?.payload?.map((card) => Number(card.sales_revenue)))
        state.totalOperatingProfit = getSum(action?.payload?.map((card) => Number(card.operating_profit)))
        state.totalGrossProfit = getSum(action?.payload?.map((card) => Number(card.ordinary_profit)))
        state.totalNetProfitPeriod = getSum(action?.payload?.map((card) => Number(card.non_operating_profit)))
        state.totalGrossProfitMargin = getSum(action?.payload?.map((card) => Number(card.ordinary_profit_margin)))
        state.totalOperatingProfitMargin = getSum(action?.payload?.map((card) => Number(card.non_operating_expense)))
      })
      .addCase(fetchAllCards.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllCards.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = cardSlice.actions

export default cardSlice.reducer
