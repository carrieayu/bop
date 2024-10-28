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
  totalCumulativeOrdinaryIncome : 0,
}

function getSum(data: number[]) {
  return data?.reduce((accumulator: number, currentValue: number): number => {
    return accumulator + currentValue
  }, 0)
}

const calculateGrossProfit = (card) => Number(card.sales_revenue) - Number(card.cost_of_sale)
const calculateGrossProfitMargin = (grossProfit, salesRevenue) =>salesRevenue ? (grossProfit / salesRevenue) * 100 : 0
const calculateCumulativeOrdinaryIncome = (card) => Number(card.operating_profit) + Number(card.non_operating_profit) - Number(card.non_operating_expense)
const calculateOperatingProfitMargin = (operatingProfit, salesRevenue) =>salesRevenue ? (operatingProfit / salesRevenue) * 100 : 0
const calculateOperatingIncome = (card) => {
  const salesRevenue = Number(card.sales_revenue) || 0
  const costOfSale = Number(card.cost_of_sale) || 0
  const dispatchLaborExpense = Number(card.dispatch_labor_expense) || 0
  const employeeExpense = Number(card.employee_expense) || 0
  const indirectEmployeeExpense = Number(card.indirect_employee_expense) || 0
  const otherExpense = Number(card.expense) || 0

  return salesRevenue - costOfSale - dispatchLaborExpense - employeeExpense - indirectEmployeeExpense - otherExpense
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
        state.totalSales = getSum(action.payload.map((card) => Number(card.sales_revenue)));
        state.totalGrossProfit = getSum(action.payload.map((card) => calculateGrossProfit(card)));
        state.totalOperatingProfit = getSum(action.payload.map((card) => calculateOperatingIncome(card)))
        state.totalNetProfitPeriod = getSum(
          action.payload.map(
            (card) =>
              Number(card.operating_profit || 0) +
              Number(card.non_operating_profit || 0) -
              Number(card.non_operating_expense || 0) -
              Number(card.expense || 0),
          ),
        )

        state.totalGrossProfitMargin = getSum(
          action.payload.map((card) =>
            calculateGrossProfitMargin(calculateGrossProfit(card), card.sales_revenue)
          )
        );
        state.totalOperatingProfitMargin = getSum(
          action.payload.map((card) =>
            calculateOperatingProfitMargin(Number(card.operating_profit), card.sales_revenue)
          )
        );
        state.totalCumulativeOrdinaryIncome = getSum(
          action.payload.map((card) => calculateCumulativeOrdinaryIncome(card))
        );
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
