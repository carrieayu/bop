import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { fetchProject } from '../project/projectSlice'
import { activeDatesOnGraph, calculateMonthlyAdminAndGeneralExpense, calculateMonthlyGrossProfit, calculateMonthlyGrossProfitMargin, calculateMonthlyOperatingIncome, calculateMonthlyOperatingProfitMargin, calculateMonthlyOrdinaryIncome, reformattedMonthlyTotalValues, sortByFinancialYear } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  totalSalesByDate: {},
  planningMonthly: {
    projectSalesRevenueMonthlyPlanning: [],
    grossProfitMonthlyPlanning: {},
    costOfSalesMonthlyPlanning: [],
    grossProfitMarginMonthlyPlanning: {},
    dates: [], // Eg. '2024-5'
    expensesMonthlyPlanning: [],
    employeeExpensesMonthlyPlanning: [],
    adminAndGeneralExpensesMonthlyPlanning: {},
    operatingIncomeMonthlyPlanning: {},
    operatingProfitMarginMonthlyPlanning: {},
    ordinaryIncomeMonthlyPlanning: {},
  },
  // NEED TO ADD RESULTS MONTHLY FOR 2nd Set of Graphs
  resultsMonthly:{}
}

export const fetchNewGraphData = createAsyncThunk('newGraph/fetchNewGraphData', async (_, { dispatch, getState }) => {
  await dispatch(fetchProject())

  const state = getState() as RootState

  // Data Variables
  const { salesRevenueMonthly, nonOperatingIncomeMonthly, nonOperatingExpenseMonthly } = state.project
  const { costOfSaleMonthlyTotalsByDate } = state.costOfSale
  const { expensesMonthlyTotalsByDate } = state.expenses
  const { employeeExpensesMonthlyTotalsByDate } = state.employeeExpense

  const reformattedData = {
    salesRevenue: reformattedMonthlyTotalValues(salesRevenueMonthly),
    costOfSales: reformattedMonthlyTotalValues(costOfSaleMonthlyTotalsByDate),
    expenses: reformattedMonthlyTotalValues(expensesMonthlyTotalsByDate),
    employeeExpenses: reformattedMonthlyTotalValues(employeeExpensesMonthlyTotalsByDate),
    nonOperatingIncome: reformattedMonthlyTotalValues(nonOperatingIncomeMonthly),
    nonOperatingExpense: reformattedMonthlyTotalValues(nonOperatingExpenseMonthly),
  }

  const grossProfitMonthlyPlanning = calculateMonthlyGrossProfit(reformattedData.costOfSales, reformattedData.salesRevenue)
  const dates = activeDatesOnGraph(reformattedData.costOfSales, reformattedData.salesRevenue)
  
  const grossProfitMarginMonthlyPlanning = calculateMonthlyGrossProfitMargin(
    reformattedData.salesRevenue,
    grossProfitMonthlyPlanning,
  )

  const reformattedAdminAndGeneralMonthlyTotalsByDate = calculateMonthlyAdminAndGeneralExpense(
    reformattedData.expenses,
    reformattedData.employeeExpenses,
  )
  const reformattedOperatingIncomeMonthlyTotalByDate = calculateMonthlyOperatingIncome(
    grossProfitMonthlyPlanning,
    reformattedAdminAndGeneralMonthlyTotalsByDate,
  )
  const operatingProfitMarginMonthly = calculateMonthlyOperatingProfitMargin(
    reformattedOperatingIncomeMonthlyTotalByDate,
    reformattedData.salesRevenue,
  )

  //ordinary
  const reformattedOrdinaryIncomeMonthly = calculateMonthlyOrdinaryIncome(
    reformattedOperatingIncomeMonthlyTotalByDate,
    reformattedData.nonOperatingIncome,
    reformattedData.nonOperatingExpense,
  )

  const planningMonthly = {
    projectSalesRevenueMonthlyPlanning: reformattedData.salesRevenue,
    costOfSalesMonthlyPlanning: reformattedData.costOfSales,
    grossProfitMonthlyPlanning: grossProfitMonthlyPlanning,
    grossProfitMarginMonthlyPlanning: grossProfitMarginMonthlyPlanning,
    dates: dates,

    expensesMonthlyPlanning: reformattedData.expenses,
    employeeExpensesMonthlyPlanning: reformattedData.employeeExpenses,
    adminAndGeneralExpensesMonthlyPlanning: reformattedAdminAndGeneralMonthlyTotalsByDate,
    operatingIncomeMonthlyPlanning: reformattedOperatingIncomeMonthlyTotalByDate,
    operatingProfitMarginMonthlyPlanning: operatingProfitMarginMonthly,
    ordinaryIncomeMonthlyPlanning: reformattedOrdinaryIncomeMonthly,
  }

  return { planningMonthly }
})

const newGraphSlice = createSlice({
  name: 'newGraph',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
      builder
      .addCase(fetchNewGraphData.pending, (state) => {
        state.isLoading = true
    })
    .addCase(fetchNewGraphData.fulfilled, (state, action) => {
        
      const { planningMonthly } = action.payload
      
      state.isLoading = false
      
      state.planningMonthly = {
        ...state.planningMonthly, // Preserving the existing state properties
        ...planningMonthly,  // Overriding with the new data from the payload
      }
      
      })
      .addCase(fetchNewGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const selectNewGraphValues = (state: RootState) => state.newGraph

export default newGraphSlice.reducer