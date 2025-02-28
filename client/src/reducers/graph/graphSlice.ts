import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { prepareGraphData } from '../../utils/graphDataPreparation'

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

export const fetchGraphData = createAsyncThunk('graph/fetchGraphData', async (_, { dispatch, getState }) => {

  const state = getState() as RootState

  // PLANNING
  const planningData = {
    salesRevenueMonthly: state.project.salesRevenueMonthly,
    costOfSaleMonthlyTotalsByDate: state.costOfSale.costOfSaleMonthlyTotalsByDate,
    expensesMonthlyTotalsByDate: state.expenses.expensesMonthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: state.employeeExpense.employeeExpensesMonthlyTotalsByDate,
    nonOperatingIncomeMonthly: state.project.nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly: state.project.nonOperatingExpenseMonthly,
  }

  const calculatedDataPlanning = prepareGraphData(planningData, 'planning')
  const planningMonthly = { ...calculatedDataPlanning } 

  // RESULTS
  const resultsData = {
    salesRevenueMonthly: state.projectResult.salesRevenueResultsMonthly,
    costOfSaleMonthlyTotalsByDate: state.costOfSaleResult.costOfSaleResultMonthlyTotalsByDate,
    expensesMonthlyTotalsByDate: state.expensesResults.expensesResultMonthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: state.employeeExpenseResult.employeeExpensesResultMonthlyTotalsByDate,
    nonOperatingIncomeMonthly: state.projectResult.nonOperatingIncomeResultsMonthly,
    nonOperatingExpenseMonthly: state.projectResult.nonOperatingExpenseResultsMonthly
  }

  const calculatedDataResults = prepareGraphData(resultsData, 'results')
  const resultsMonthly = { ...calculatedDataResults }

  return { planningMonthly, resultsMonthly }

})

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
      builder
      .addCase(fetchGraphData.pending, (state) => {
        state.isLoading = true
    })
    .addCase(fetchGraphData.fulfilled, (state, action) => {
        
      const { planningMonthly } = action.payload
      const { resultsMonthly } = action.payload
      
      state.isLoading = false
      
      state.planningMonthly = {
        ...state.planningMonthly,
        ...planningMonthly,
      }

      state.resultsMonthly = {
        ...state.resultsMonthly, 
        ...resultsMonthly
      }
      
      })
      .addCase(fetchGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const selectGraphValues = (state: RootState) => state.graph

export default graphSlice.reducer