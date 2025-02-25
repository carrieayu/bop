import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { CardEntity } from '../../entity/cardEntity'
import { token } from '../../constants'
import { RootState } from '../../app/store'

interface GraphDataState {
  isLoading: boolean
  totalSalesByDate: Record<string, number>
  totalOperatingIncomeByDate: Record<string, number>
  totalGrossProfitByDate: Record<string, number>
  totalCumulativeOrdinaryIncome: Record<string, number>
  totalGrossProfitMarginByDate: Record<string, number>
  totalOperatingProfitMarginByDate: Record<string, number>
  month: string[]
  projectSalesRevenueMonthlyPlanning: {}
  ordinaryIncomeMonthlyPlanning: {}
}

const initialState: GraphDataState = {
  isLoading: false,
  totalSalesByDate: {},
  totalOperatingIncomeByDate: {},
  totalGrossProfitByDate: {},
  totalCumulativeOrdinaryIncome: {},
  totalGrossProfitMarginByDate: {},
  totalOperatingProfitMarginByDate: {},
  month: [],
  projectSalesRevenueMonthlyPlanning: {},
  ordinaryIncomeMonthlyPlanning:{}
}

const calculateGrossProfit = (card) => Number(card.sales_revenue) - Number(card.cost_of_sale) // Need to update the calculation since cost of sale from projects is removed.
const calculateGrossProfitMargin = (grossProfit, salesRevenue) =>
  salesRevenue ? (grossProfit / salesRevenue) * 100 : 0
const calculateCumulativeOrdinaryIncome = (card) =>
  Number(card.operating_income) + Number(card.non_operating_income) - Number(card.non_operating_expense)
const calculateOperatingProfitMargin = (operatingProfit, salesRevenue) =>
  salesRevenue ? (operatingProfit / salesRevenue) * 100 : 0
const calculateOperatingIncome = (card) => {
  const salesRevenue = Number(card.sales_revenue) || 0
  const costOfSale = Number(card.cost_of_sale) || 0 // TODO Need to update
  const dispatchLaborExpense = Number(card.dispatch_labor_expense) || 0
  const employeeExpense = Number(card.employee_expense) || 0
  const indirectEmployeeExpense = Number(card.indirect_employee_expense) || 0
  const otherExpense = Number(card.expense) || 0

  return salesRevenue - costOfSale - dispatchLaborExpense - employeeExpense - indirectEmployeeExpense - otherExpense
}
export const fetchGraphDataTest = createAsyncThunk('graphDataTest/fetch', async (_, { getState }) => {
  const state = getState() as RootState

  // NEW CODE
  const planning = {
    projectSalesRevenueMonthlyPlanning : state.project.salesRevenueMonthly
  }

  
  // const reformattedMonthlyValue = (valuesArr) => {
  //   return valuesArr.reduce((acc, item) => {
  //     const label = `${item.year}-${item.month}`;
  //     const monthValue = item.salesRevenue;
  //     acc[label] = monthValue;
  //     return acc;
  //   }, {});
  // };

  // const test = reformattedMonthlyValue(projectSalesRevenueMonthlyPlanning)

  return { planning }
  // END NEW CODE
}
)


export const fetchGraphData = createAsyncThunk('graphData/fetch', async (_, {getState}) => {
  const response = await api.get<CardEntity[]>(`${getReactActiveEndpoint()}/api/projects/list/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  // const state = getState() as RootState
  // const projectSalesRevenueMonthlyPlanning = state.project.salesRevenueTotal

  const cards = response.data



  const aggregatedData: Partial<GraphDataState> = {
    totalSalesByDate: {},
    totalOperatingIncomeByDate: {},
    totalGrossProfitByDate: {},
    totalCumulativeOrdinaryIncome: {},
    totalGrossProfitMarginByDate: {},
    totalOperatingProfitMarginByDate: {},
    month: [],
  }

  cards.forEach((card) => {
    const date = `${card.year}-${card.month}`
    const operatingIncome = calculateOperatingIncome(card)
    const grossProfit = calculateGrossProfit(card)

    const cumulativeOrdinaryIncome = calculateCumulativeOrdinaryIncome(card)
    const grossProfitMargin = calculateGrossProfitMargin(grossProfit, card.sales_revenue)
    const operatingProfitMargin = calculateOperatingProfitMargin(Number(card.operating_income), card.sales_revenue)

    if (!aggregatedData.totalSalesByDate![date]) {
      aggregatedData.totalSalesByDate![date] = 0
      aggregatedData.totalOperatingIncomeByDate![date] = 0
      aggregatedData.totalGrossProfitByDate![date] = 0
      aggregatedData.totalCumulativeOrdinaryIncome![date] = 0
      aggregatedData.totalGrossProfitMarginByDate![date] = 0
      aggregatedData.totalOperatingProfitMarginByDate![date] = 0
    }

    aggregatedData.totalSalesByDate![date] += parseFloat(card.sales_revenue?.toString() || '0')
    aggregatedData.totalOperatingIncomeByDate![date] += parseFloat(operatingIncome?.toString() || '0')
    aggregatedData.totalGrossProfitByDate![date] += parseFloat(grossProfit?.toString() || '0')
    aggregatedData.totalCumulativeOrdinaryIncome![date] += parseFloat(cumulativeOrdinaryIncome?.toString() || '0')
    aggregatedData.totalGrossProfitMarginByDate![date] += parseFloat(grossProfitMargin?.toString() || '0')
    aggregatedData.totalOperatingProfitMarginByDate![date] += parseFloat(operatingProfitMargin?.toString() || '0')
    if (!aggregatedData.month.includes(date)) {
      aggregatedData.month.push(date)
    }
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
        state.totalOperatingIncomeByDate = action.payload.totalOperatingIncomeByDate || {}
        state.totalGrossProfitByDate = action.payload.totalGrossProfitByDate || {}
        state.totalCumulativeOrdinaryIncome = action.payload.totalCumulativeOrdinaryIncome || {}
        state.totalGrossProfitMarginByDate = action.payload.totalGrossProfitMarginByDate || {}
        state.totalOperatingProfitMarginByDate = action.payload.totalOperatingProfitMarginByDate || {}
        state.month = action.payload.month || []
      })
      .addCase(fetchGraphData.rejected, (state) => {
        state.isLoading = false
      }).addCase(fetchGraphDataTest.fulfilled, (state, action) => {
        const { planning } = action.payload
        state.projectSalesRevenueMonthlyPlanning = planning.projectSalesRevenueMonthlyPlanning
      })
  },
})

export default graphSlice.reducer
