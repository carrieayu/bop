import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { fetchProject } from '../project/projectSlice'
import {
  activeDatesOnGraph,
  calculateMonthlyAdminAndGeneralExpense,
  calculateMonthlyGrossProfit,
  calculateMonthlyGrossProfitMargin, 
  calculateMonthlyOperatingIncome, 
  calculateMonthlyOperatingProfitMargin, 
  calculateMonthlyOrdinaryIncome, 
  reformattedMonthlyTotalValues,
  sortByFinancialYear
} from '../../utils/helperFunctionsUtil'

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
  resultsMonthly: {
    projectSalesRevenueMonthlyResults: [],
    grossProfitMonthlyResults: {},
    costOfSalesMonthlyResults: [],
    grossProfitMarginMonthlyResults: {},
    datesResults: [], // Eg. '2024-5'
    expensesMonthlyResults: [],
    employeeExpensesMonthlyResults: [],
    adminAndGeneralExpensesMonthlyResults: {},
    operatingIncomeMonthlyResults: {},
    operatingProfitMarginMonthlyResults: {},
    ordinaryIncomeMonthlyResults: {},
  },
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

  const grossProfitMonthlyPlanning = calculateMonthlyGrossProfit(
    reformattedData.costOfSales,
    reformattedData.salesRevenue,
  )
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

  // RESULTS

  // Data Variables
  const { salesRevenueResultsMonthly, nonOperatingIncomeResultsMonthly, nonOperatingExpenseResultsMonthly } = state.projectResult
  const { costOfSaleResultMonthlyTotalsByDate } = state.costOfSaleResult
  const { expensesResultMonthlyTotalsByDate } = state.expensesResults
  const { employeeExpensesResultMonthlyTotalsByDate } = state.employeeExpenseResult

   const reformattedResultData = {
     salesRevenue: reformattedMonthlyTotalValues(salesRevenueResultsMonthly),
     costOfSales: reformattedMonthlyTotalValues(costOfSaleResultMonthlyTotalsByDate),
     expenses: reformattedMonthlyTotalValues(expensesResultMonthlyTotalsByDate),
     employeeExpenses: reformattedMonthlyTotalValues(employeeExpensesResultMonthlyTotalsByDate),
     nonOperatingIncome: reformattedMonthlyTotalValues(nonOperatingIncomeResultsMonthly),
     nonOperatingExpense: reformattedMonthlyTotalValues(nonOperatingExpenseResultsMonthly),
   }
  
  
  const grossProfitMonthlyResults = calculateMonthlyGrossProfit(
    reformattedResultData.costOfSales,
    reformattedResultData.salesRevenue,
  )
  const datesResult = activeDatesOnGraph(reformattedResultData.costOfSales, reformattedResultData.salesRevenue)

  const grossProfitMarginResultMonthlyResults = calculateMonthlyGrossProfitMargin(
    reformattedResultData.salesRevenue,
    grossProfitMonthlyResults,
  )

  const reformattedAdminAndGeneralResultMonthlyTotalsByDate = calculateMonthlyAdminAndGeneralExpense(
    reformattedResultData.expenses,
    reformattedResultData.employeeExpenses,
  )
  const reformattedOperatingIncomeResultMonthlyTotalByDate = calculateMonthlyOperatingIncome(
    grossProfitMonthlyResults,
    reformattedAdminAndGeneralResultMonthlyTotalsByDate,
  )
  const operatingProfitMarginResultMonthly = calculateMonthlyOperatingProfitMargin(
    reformattedOperatingIncomeResultMonthlyTotalByDate,
    reformattedResultData.salesRevenue,
  )

  const reformattedOrdinaryIncomeResultMonthly = calculateMonthlyOrdinaryIncome(
    reformattedOperatingIncomeResultMonthlyTotalByDate,
    reformattedResultData.nonOperatingIncome,
    reformattedResultData.nonOperatingExpense,
  )

    const resultsMonthly = {
      projectSalesRevenueMonthlyResults: reformattedResultData.salesRevenue,
      costOfSalesMonthlyResults: reformattedResultData.costOfSales,
      grossProfitMonthlyResults: grossProfitMonthlyResults,
      grossProfitMarginMonthlyResults: grossProfitMarginResultMonthlyResults,
      datesResults: datesResult,

      expensesMonthlyResults: reformattedResultData.expenses,
      employeeExpensesMonthlyResults: reformattedResultData.employeeExpenses,
      adminAndGeneralExpensesMonthlyResults: reformattedAdminAndGeneralResultMonthlyTotalsByDate,
      operatingIncomeMonthlyResults: reformattedOperatingIncomeResultMonthlyTotalByDate,
      operatingProfitMarginMonthlyResults: operatingProfitMarginResultMonthly,
      ordinaryIncomeMonthlyResults: reformattedOrdinaryIncomeResultMonthly,
    }

  return { planningMonthly, resultsMonthly }
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
      const { resultsMonthly } = action.payload
      
      state.isLoading = false
      
      state.planningMonthly = {
        ...state.planningMonthly, // Preserving the existing state properties
        ...planningMonthly,  // Overriding with the new data from the payload
      }

      state.resultsMonthly = {
        ...state.resultsMonthly,
        ...resultsMonthly
      }
      
      })
      .addCase(fetchNewGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const selectNewGraphValues = (state: RootState) => state.newGraph

export default newGraphSlice.reducer