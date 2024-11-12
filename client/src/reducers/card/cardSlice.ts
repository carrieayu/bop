import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import CardEntity from '../../entity/cardEntity'
import api from '../../api/api'
import { OtherPlanningEntity } from '../../entity/otherPlanningEntity'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

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
  totalCumulativeOrdinaryIncome : 0,
}

function getSum(data: number[]) {
  return data?.reduce((accumulator: number, currentValue: number): number => {
    return accumulator + currentValue
  }, 0)
}

const calculateGrossProfit = (card) => Number(card.sales_revenue) - Number(card.cost_of_sale) // Need to update the calculation since cost of sale from projects is removed.
const calculateGrossProfitMargin = (grossProfit, salesRevenue) =>salesRevenue ? (grossProfit / salesRevenue) * 100 : 0
const calculateCumulativeOrdinaryIncome = (card) => Number(card.operating_income) + Number(card.non_operating_income) - Number(card.non_operating_expense)
const calculateOperatingProfitMargin = (operatingProfit, salesRevenue) =>salesRevenue ? (operatingProfit / salesRevenue) * 100 : 0
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
              Number(card.operating_income || 0) +
              Number(card.non_operating_income || 0) -
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
            calculateOperatingProfitMargin(Number(card.operating_income), card.sales_revenue)
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
