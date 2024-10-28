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

const calculateGrossProfit = (card) => Number(card.sales_revenue) - Number(card.cost_of_sale)
const calculateGrossProfitMargin = (grossProfit, salesRevenue) =>
  salesRevenue ? (grossProfit / salesRevenue) * 100 : 0
const calculateCumulativeOrdinaryIncome = (card) =>
  Number(card.operating_profit) + Number(card.non_operating_profit) - Number(card.non_operating_expense)
const calculateOperatingProfitMargin = (operatingProfit, salesRevenue) =>
  salesRevenue ? (operatingProfit / salesRevenue) * 100 : 0
const calculateOperatingIncome = (card) => {
  const salesRevenue = Number(card.sales_revenue) || 0
  const costOfSale = Number(card.cost_of_sale) || 0
  const dispatchLaborExpense = Number(card.dispatch_labor_expense) || 0
  const employeeExpense = Number(card.employee_expense) || 0
  const indirectEmployeeExpense = Number(card.indirect_employee_expense) || 0
  const otherExpense = Number(card.expense) || 0

  return salesRevenue - costOfSale - dispatchLaborExpense - employeeExpense - indirectEmployeeExpense - otherExpense
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
    const operatingIncome = calculateOperatingIncome(card)
    const grossProfit = calculateGrossProfit(card)

    const cumulataiveOridinaryIncome = calculateCumulativeOrdinaryIncome(card)
    const grossProfitMargin = calculateGrossProfitMargin(calculateGrossProfit(card), card.sales_revenue)
    const operatingProfitMargin = calculateOperatingProfitMargin(Number(card.operating_profit), card.sales_revenue)

    if (!aggregatedData.totalSalesByDate![date]) {
      aggregatedData.totalSalesByDate![date] = 0
      aggregatedData.totalOperatingProfitByDate![date] = 0
      aggregatedData.totalGrossProfitByDate![date] = 0
      aggregatedData.totalNetProfitPeriodByDate![date] = 0
      aggregatedData.totalGrossProfitMarginByDate![date] = 0
      aggregatedData.totalOperatingProfitMarginByDate![date] = 0
    }

    aggregatedData.totalSalesByDate![date] += parseFloat(card.sales_revenue?.toString() || '0')
    aggregatedData.totalOperatingProfitByDate![date] += parseFloat(operatingIncome?.toString() || '0')
    aggregatedData.totalGrossProfitByDate![date] += parseFloat(grossProfit?.toString() || '0')

    aggregatedData.totalNetProfitPeriodByDate![date] += parseFloat(cumulataiveOridinaryIncome?.toString() || '0')
    aggregatedData.totalGrossProfitMarginByDate![date] += parseFloat(grossProfitMargin?.toString() || '0')
    aggregatedData.totalOperatingProfitMarginByDate![date] += parseFloat(operatingProfitMargin?.toString() || '0')
    aggregatedData.month.push(date)
  })
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
