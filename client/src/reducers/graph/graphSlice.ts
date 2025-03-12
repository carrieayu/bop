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
    grossProfitMarginMonthlyPlanning: {}, // empty entries/months need to be 'null' for graph
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
    grossProfitMarginMonthlyResults: {}, // empty entries/months need to be 'null' for graph
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

  // PLANNING MONTHLY
  const planningData = {
    salesRevenueMonthly: state.project.salesRevenueMonthly,
    nonOperatingIncomeMonthly: state.project.nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly: state.project.nonOperatingExpenseMonthly,
    expensesMonthlyTotalsByDate: state.expenses.monthlyTotalsByDate,
    costOfSaleMonthlyTotalsByDate: state.costOfSale.monthlyTotalsByDate,
    // costOfSaleMonthlyTotalsByDate: costOfSalesSelectMonthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: state.employeeExpense.monthlyTotalsByDate,
  }

  const calculatedDataPlanning = prepareGraphData(planningData, 'planning')
  const planningMonthly = { ...calculatedDataPlanning } 

  // RESULTS MONTHLY
  const resultsData = {
    salesRevenueMonthly: state.projectResult.salesRevenueResultsMonthly,
    nonOperatingIncomeMonthly: state.projectResult.nonOperatingIncomeResultsMonthly,
    nonOperatingExpenseMonthly: state.projectResult.nonOperatingExpenseResultsMonthly,
    expensesMonthlyTotalsByDate: state.expensesResults.monthlyTotalsByDate,
    costOfSaleMonthlyTotalsByDate: state.costOfSaleResult.monthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate: state.employeeExpenseResult.monthlyTotalsByDate,
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
        
      const { planningMonthly, resultsMonthly } = action.payload
      
      state.isLoading = false
      
      state.planningMonthly = {
        ...state.planningMonthly, // existing state values
        ...planningMonthly, // update state with any new data from action payload
      }

      state.resultsMonthly = {
        ...state.resultsMonthly, // existing state values
        ...resultsMonthly, // update state with any new data from action payload
      }
      
      })
      .addCase(fetchGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const selectGraphValues = (state: RootState) => state.graph

export default graphSlice.reducer