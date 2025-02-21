import { createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { stat } from 'fs'

export const fetchTotals = createAsyncThunk('totals/fetchTotals', async (_, { dispatch, getState }) => {
    const state = getState() as RootState

    // Planning
    const planning = {
      projectSalesRevenueYearTotalPlanning: state.project.salesRevenueTotal,
      projectNonOperatingIncomeTotalPlanning: state.project.nonOperatingIncomeTotal,
      projectNonOperatingExpenseTotalPlanning: state.project.nonOperatingExpenseTotal,
      expenseListPlanningArray: state.expenses.expenseList,
      expenseMonthlyTotalsPlanning: state.expenses.expenseTotals,
      expenseYearTotalPlanning: state.expenses.expensesYearTotal,
      cosListPlanningArray: state.costOfSale.costOfSaleList,
      cosMonthlyTotalsPlanning: state.costOfSale.costOfSaleTotals,
      cosYearTotalPlanning: state.costOfSale.costOfSaleYearTotal,
      cosMonthlyTotalsByDate: state.costOfSale.costOfSaleMonthlyTotalsByDate,
      employeeExpenseYearTotalPlanning: state.employeeExpense.employeeExpenseYearTotal,
    }

    // Results
    const results= {
      projectSalesRevenueYearTotalResult : state.projectResult.totalSales,
      projectNonOperatingIncomeTotalResult : state.projectResult.nonOperatingIncomeTotal,
      projectNonOperatingExpenseTotalResult : state.projectResult.nonOperatingExpenseTotal,
      expenseListResultArray : state.expensesResults.expenseResultList,
      expenseMonthlyTotalsResult : state.expensesResults.expenseResultTotals,
      expenseYearTotalResult: state.expensesResults.expenseResultYearTotal,
      cosListResultArray : state.costOfSaleResult.costOfSaleResultList,
      cosYearTotalResult : state.costOfSaleResult.costOfSaleResultYearTotal,
      employeeExpenseYearTotalResult: state.employeeExpenseResult.employeeExpenseResultYearTotal,
    }

    return {
        planning,
        results
    }
  }
)

const initialState = {
  isLoading: false,
  planning: {
    projects: {
      totalSalesRevenue: 0,
        
      nonOperatingIncome: 0,
      nonOperatingExpense: 0,
      cumulativeOrdinaryIncome: 0,
    },
    expenses: {
      yearlyTotal: 0,
      list: [],
      monthly: [],
    },
    costOfSales: {
      yearlyTotal: 0,
      list: [],
      monthly: [],
      monthlyTotalsByDate: [],
    },
    employeeExpenses: {
      yearlyTotal: 0,
    },
    calculations: {
      grossProfit: 0,
      // grossProfitMonthlyByDate: [],
      grossProfitMargin: 0,
      
      sellingAndAdminYearlyTotal: 0,

      operatingIncomeYearlyTotal: 0,
      operatingProfitMargin: 0,

      nonOperatingIncome: 0,
      nonOperatingExpense: 0,

      ordinaryIncome: 0,
    },
  },
  results: {
    projectsResults: {
      totalSalesRevenue: 0,
      nonOperatingIncome: 0,
      nonOperatingExpense: 0,
      cumulativeOrdinaryIncome: 0,
    },
    expensesResults: {
      yearlyTotal: 0,
      list: [],
      monthly: [],
    },
    costOfSalesResults: {
      yearlyTotal: 0,
      list: [],
      monthly: [],
    },
    employeeExpensesResults: {
      yearlyTotal: 0,
    },
    calculationsResults: {
      grossProfit: 0,
      grossProfitMargin: 0,
      sellingAndAdminYearlyTotal: 0,

      operatingIncomeYearlyTotal: 0,
      operatingProfitMargin: 0,

      nonOperatingIncome: 0,
      nonOperatingExpense: 0,

      ordinaryIncome: 0,
    },
  },
}

const calculateFinancials = (
  projects: any,
  expenses: any,
  costOfSales: any,
  employeeExpenses: any,
  calculations: any
) => {
  // Gross Profit
  calculations.grossProfit = projects.totalSalesRevenue - costOfSales.yearlyTotal;
  
  // Gross Profit Monthly 
  // calculations.grossProfitMonthlyByDate = costOfSales.monthlyTotalsByDate
    
  // Gross Profit Margin
  calculations.grossProfitMargin =
    projects.totalSalesRevenue !== 0
      ? (calculations.grossProfit / projects.totalSalesRevenue) * 100
      : 0;

  // Admin and General Expenses
  calculations.sellingAndAdminYearlyTotal = employeeExpenses.yearlyTotal + expenses.yearlyTotal;

  // Operating Income
  calculations.operatingIncomeYearlyTotal = calculations.grossProfit - calculations.sellingAndAdminYearlyTotal;

  // Operating Profit Margin
  calculations.operatingProfitMargin =
    projects.totalSalesRevenue !== 0
      ? (calculations.operatingIncomeYearlyTotal / projects.totalSalesRevenue) * 100
      : 0;

  // Ordinary Income
  calculations.ordinaryIncome =
    calculations.operatingIncomeYearlyTotal + projects.nonOperatingIncome - projects.nonOperatingExpense;
};

const planningAndResultTotalsSlice = createSlice({
  name: 'totals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTotals.fulfilled, (state, action) => {
      const { planning, results } = action.payload

      // Destructure planning state
      const { projects, expenses, costOfSales, employeeExpenses, calculations } = state.planning

      // Update Planning State
      projects.totalSalesRevenue = planning.projectSalesRevenueYearTotalPlanning
      projects.nonOperatingIncome = planning.projectNonOperatingIncomeTotalPlanning
      projects.nonOperatingExpense = planning.projectNonOperatingExpenseTotalPlanning
      expenses.list = planning.expenseListPlanningArray
      expenses.yearlyTotal = parseFloat(planning.expenseYearTotalPlanning)
      expenses.monthly = planning.expenseMonthlyTotalsPlanning
        
      costOfSales.list = planning.cosListPlanningArray
      costOfSales.yearlyTotal = parseFloat(planning.cosYearTotalPlanning)
      costOfSales.monthly = planning.cosMonthlyTotalsPlanning
      costOfSales.monthlyTotalsByDate = planning.cosMonthlyTotalsByDate
        
      employeeExpenses.yearlyTotal = planning.employeeExpenseYearTotalPlanning

      // ** PLANNING Calculations **
      calculateFinancials(projects, expenses, costOfSales, employeeExpenses, calculations)

      // ** RESULTS ** (destructure results state)
      const { projectsResults, expensesResults, costOfSalesResults, employeeExpensesResults, calculationsResults } =
        state.results

      projectsResults.totalSalesRevenue = results.projectSalesRevenueYearTotalResult
      projectsResults.nonOperatingIncome = results.projectNonOperatingIncomeTotalResult
      projectsResults.nonOperatingExpense = results.projectNonOperatingExpenseTotalResult
      expensesResults.yearlyTotal = parseFloat(results.expenseYearTotalResult)
      expensesResults.monthly = results.expenseMonthlyTotalsResult
      expensesResults.list = results.expenseListResultArray
      costOfSalesResults.yearlyTotal = parseFloat(results.cosYearTotalResult)
      costOfSalesResults.monthly = results.cosListResultArray
      employeeExpensesResults.yearlyTotal = results.employeeExpenseYearTotalResult

      // ** RESULTS Calculations **
      calculateFinancials(
        projectsResults,
        expensesResults,
        costOfSalesResults,
        employeeExpensesResults,
        calculationsResults,
      )
    })
  },
})

// Selectors (to access the state in your components)
export const selectTotals = (state: RootState) => state.totals

export default planningAndResultTotalsSlice.reducer