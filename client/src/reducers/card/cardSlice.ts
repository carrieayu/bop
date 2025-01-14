import { AsyncThunkAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import CardEntity from '../../entity/cardEntity'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { fetchCos } from '../costOfSale/costOfSaleSlice'

const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12
const initialState = {
  isLoading: false,
  cardsList: [new CardEntity({})],
  totalSales: 0,
  totalOperatingProfit: 0,
  totalGrossProfit: 0,
  totalNetProfitPeriod: 0,
  totalGrossProfitMargin: 0,
  totalOperatingProfitMargin: 0,
  totalCumulativeOrdinaryIncome: 0,
  costOfSaleList: [],
  totalCostOfSaleForYear: 0,
}

function getSum(data: number[]) {
  return data?.reduce((accumulator: number, currentValue: number): number => {
    return accumulator + currentValue
  }, 0)
}

const calculateGrossProfit = (card, costOfSaleForYear) => {
  return Number(card.sales_revenue) - costOfSaleForYear
}
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

async function fetchWithPolling(retries = MAX_RETRIES): Promise<CardEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<CardEntity[]>(`${getReactActiveEndpoint()}/api/projects/list/`)

      if (response.data && response.data.length > 0) {
        return response.data.map((data) => new CardEntity(data))
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

export const fetchAllCards = createAsyncThunk('', async () => {
  return await fetchWithPolling()
})

const getCostOfSaleForYear = (cards, year) => {
  return cards
    .filter((card) => new Date(card.year).getFullYear() === year) // Filter by year
    .reduce((total, card) => {
      return (
        total +
        Number(card.outsourcing_expense || 0) +
        Number(card.purchase || 0) +
        Number(card.product_purchase || 0) +
        Number(card.dispatch_labor_expense || 0) +
        Number(card.communication_expense || 0) +
        Number(card.work_in_progress_expense || 0) +
        Number(card.amortization_expense || 0)
      )
    }, 0)
}

function recalculateMetrics(state) {
  const currentYear = new Date().getFullYear() // To be updated when toogle year is implemented.
  const cards = state.cardsList || []
  const costOfSaleList = state.costOfSaleList || []

  const totalCostOfSaleForYear = getCostOfSaleForYear(costOfSaleList, 2024) // To be updated when toogle is implemented.
  //Total Sales
  state.totalSales = getSum(cards.map((card) => Number(card.sales_revenue)))

  //Total Gross Profit
  state.totalGrossProfit = getSum(cards.map((card) => calculateGrossProfit(card, totalCostOfSaleForYear)))

  // Total Gross Profit Margin
  state.totalGrossProfitMargin = getSum(
    cards.map((card) => {
      const grossProfit = calculateGrossProfit(card, totalCostOfSaleForYear)
      return calculateGrossProfitMargin(grossProfit, card.sales_revenue)
    }),
  )

  //Total Operating Profit
  state.totalOperatingProfit = getSum(cards.map((card) => calculateOperatingIncome(card)))

  // Total Operating Profit Margin
  state.totalOperatingProfitMargin = getSum(
    cards.map((card) => calculateOperatingProfitMargin(Number(card.operating_income), card.sales_revenue)),
  )

  // Total Net Profit Period
  state.totalNetProfitPeriod = getSum(
    cards.map(
      (card) =>
        Number(card.operating_income || 0) +
        Number(card.non_operating_income || 0) -
        Number(card.non_operating_expense || 0) -
        Number(card.expense || 0),
    ),
  )

  //Total Cummulative Ordinary Income
  state.totalCumulativeOrdinaryIncome = getSum(cards.map((card) => calculateCumulativeOrdinaryIncome(card)))
}

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
    builder
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        state.cardsList = action.payload
        state.isLoading = false
        recalculateMetrics(state)
      })
      .addCase(fetchAllCards.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAllCards.rejected, (state) => {
        state.isLoading = false
      })
      .addCase(fetchCos.fulfilled, (state, action) => {
        state.costOfSaleList = action.payload
        state.isLoading = false
        recalculateMetrics(state)
      })
      .addCase(fetchCos.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCos.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {} = cardSlice.actions

export default cardSlice.reducer
