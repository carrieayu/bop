import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchCos } from '../costOfSale/costOfSaleSlice'
import { CardEntity } from '../../entity/cardEntity'
import { CostOfSaleEntity } from '../../entity/cosEntity'
import { fetchWithPolling } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  cardsList: [] as CardEntity[],
  totalSales: 0,
  totalOperatingProfit: 0,
  totalGrossProfit: 0,
  totalNetProfitPeriod: 0,
  totalGrossProfitMargin: 0,
  totalOperatingProfitMargin: 0,
  totalCumulativeOrdinaryIncome: 0,
  costOfSaleList: [] as CostOfSaleEntity[],
  totalCostOfSaleForYear: 0,
  status: 'idle',
  error: null,
  test:0
}

function getSum(data: number[]) {
  return data?.reduce((accumulator: number, currentValue: number): number => {
    return accumulator + currentValue
  }, 0)
}

const calculateGrossProfit = (totalSales, costOfSaleForYear) => {
  return totalSales - costOfSaleForYear
}

const calculateGrossProfitMargin = (grossProfit, salesRevenue) =>
  salesRevenue ? (grossProfit / salesRevenue) * 100 : 0
const calculateOperatingProfitMargin = (operatingIncome, salesRevenue) => {
  if (!salesRevenue || salesRevenue === 0) return 0 // Avoid division by zero
  return (operatingIncome / salesRevenue) * 100 // Return margin as a percentage
}

const calculateOperatingIncome = (card, totalCostOfSale) => {
  const salesRevenue = Number(card.sales_revenue) || 0
  const costOfSale = totalCostOfSale || 0
  const dispatchLaborExpense = Number(card.dispatch_labor_expense) || 0
  const employeeExpense = Number(card.employee_expense) || 0
  const indirectEmployeeExpense = Number(card.indirect_employee_expense) || 0
  const otherExpense = Number(card.expense) || 0

  return salesRevenue - costOfSale - dispatchLaborExpense - employeeExpense - indirectEmployeeExpense - otherExpense
}

const calculateCumulativeOrdinaryIncome = (operatingIncome, nonOperatingIncome, nonOperatingExpense) => {
  return operatingIncome + nonOperatingIncome - nonOperatingExpense
}

export const fetchAllCards = createAsyncThunk('', async () => {
  return await fetchWithPolling<CardEntity[]>('projects/list/')
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

function cardCalculations(state) {

  const currentYear = new Date().getFullYear() // To be updated when toogle year is implemented.
  const cards = state.cardsList || []
  const costOfSaleList = state.costOfSaleList || []
  
  //test
  state.test = getSum(cards.map((card)=> parseFloat(card.non_operating_expense)))
  //end test
  
  const totalCostOfSaleForYear = getCostOfSaleForYear(costOfSaleList, 2024) // To be updated when toggle is implemented.
  //Total Sales
  state.totalSales = getSum(cards.map((card) => Number(card.sales_revenue)))

  //Total Gross Profit
  const totalSales = getSum(cards.map((card) => Number(card.sales_revenue)))
  state.totalGrossProfit = calculateGrossProfit(totalSales, totalCostOfSaleForYear)
  
  // Total Gross Profit Margin
  const totalCostOfSale = totalCostOfSaleForYear // Assuming it's already calculated
  const grossProfit = totalSales - totalCostOfSale
  state.totalGrossProfitMargin = calculateGrossProfitMargin(grossProfit, totalSales)

  //Total Operating Profit
  state.totalOperatingProfit = getSum(
    cards.map((card) => {
      const totalCostOfSaleForCard = card.totalCostOfSaleForYear || 0
      return calculateOperatingIncome(card, totalCostOfSaleForCard)
    }),
  )

  // Total Operating Profit Margin
  state.totalOperatingProfitMargin = getSum(
    cards.map((card) => {
      const {
        sales_revenue = 0,
        cost_of_sale = totalCostOfSaleForYear,
        dispatch_labor_expense = 0,
        employee_expense = 0,
        indirect_employee_expense = 0,
        expense = 0,
      } = card

      const operatingIncome =
        Number(sales_revenue) -
        Number(cost_of_sale) -
        Number(dispatch_labor_expense) -
        Number(employee_expense) -
        Number(indirect_employee_expense) -
        Number(expense)

      return calculateOperatingProfitMargin(operatingIncome, sales_revenue)
    }),
  )

  // Total Net Profit Period
  state.totalNetProfitPeriod = getSum(
    cards
      .filter((card) => card.month === '4')
      .map(
      (card) =>
        Number(card.operating_income || 0) +
      Number(card.non_operating_income || 0) -
      Number(card.non_operating_expense || 0) -
      Number(card.expense || 0),
    ),
  )
  
  const getCumulativeOrdinaryIncome = (cards) => {
    const nonOperatingIncome = getSum(cards.map((card) => parseFloat(card.non_operating_income)))
    const nonOperatingExpense = getSum(cards.map((card) => parseFloat(card.non_operating_expense)))
    
  } 
  //Total Cummulative Ordinary Income
  state.totalCumulativeOrdinaryIncome = getSum(
    cards.map((card) => {
      const nonOperatingIncome = Number(card.non_operating_income) || 0
      const nonOperatingExpense = Number(card.non_operating_expense) || 0
      const operatingIncome = calculateOperatingIncome(card, totalCostOfSaleForYear || 0)
      return calculateCumulativeOrdinaryIncome(operatingIncome, nonOperatingIncome, nonOperatingExpense)
    }),
  )
}

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllCards.fulfilled, (state, action) => {
        state.cardsList = action.payload
        state.status = 'succeeded'
        cardCalculations(state)
      })
      .addCase(fetchAllCards.pending, (state) => {
        state.isLoading = true
        state.status = 'loading'
      })
      .addCase(fetchAllCards.rejected, (state) => {
        state.status = 'failed'
        state.isLoading = false
      })
      .addCase(fetchCos.fulfilled, (state, action) => {
        state.costOfSaleList = action.payload
        state.status = 'succeeded'
        cardCalculations(state)
      })
      .addCase(fetchCos.pending, (state) => {
        state.isLoading = true
        state.status = 'loading'
      })
      .addCase(fetchCos.rejected, (state) => {
        state.status = 'failed';
        state.isLoading = false
      })
  },
})

export const {} = cardSlice.actions

export default cardSlice.reducer
