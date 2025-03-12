// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// import { RootState } from '../../app/store'
// import {
//   calculateGrossProfit, 
//   calculateGrossProfitMargin, 
//   calculateOperatingIncome, 
//   calculateOperatingProfitMargin, 
//   calculateOrdinaryIncome, 
//   calculateSellingAndGeneralAdmin
// } from '../../utils/financialCalculationsUtil'
// import { ProjectDataEntity } from '../../entity/projectEntity'
// import { ExpenseDataEntity } from '../../entity/expenseEntity'
// import { CostOfSaleDataEntity } from '../../entity/costOfSaleEntity'
// import { EmployeeExpenseDataEntity } from '../../entity/employeeExpenseEntity'
// import { CalculationDataEntity } from '../../entity/calculationEntity'

// export const fetchTotals = createAsyncThunk('totals/fetchTotals', async (_, { dispatch, getState }) => {

//   const state = getState() as RootState
//   const {project, projectResult, expenses, expensesResults, costOfSale, costOfSaleResult, employeeExpense, employeeExpenseResult} = state

//   // Planning
//   const planning = {
//     projects: {
//       list: project.list,
//       salesRevenueTotal: project.salesRevenueTotal, // total for year
//       nonOperatingIncomeTotal: project.nonOperatingIncomeTotal,
//       nonOperatingExpenseTotal: project.nonOperatingExpenseTotal,
//     },
//     expenses: {
//       list: expenses.list,
//       monthlyTotals: expenses.monthlyTotals,
//       yearlyTotal: expenses.yearlyTotal,
//       monthlyTotalsByDate: expenses.monthlyTotalsByDate,
//     },
//     costOfSales: {
//       list: costOfSale.list,
//       monthlyTotals: costOfSale.totals, // just values in array []
//       yearlyTotal: costOfSale.yearlyTotal, // value
//       monthlyTotalsByDate: costOfSale.monthlyTotalsByDate, // values and month in arrau [{},{}]
//     },
//     employeeExpenses: {
//       list: employeeExpense.list,
//       yearlyTotal: employeeExpense.yearlyTotal,
//     },
//   }

//     // Results
//   const results = {
//     projects: {
//       list: projectResult.list,
//       salesRevenueTotal: projectResult.salesRevenueTotal,
//       nonOperatingIncomeTotal: projectResult.nonOperatingIncomeTotal,
//       nonOperatingExpenseTotal: projectResult.nonOperatingExpenseTotal,
//     },
//     expenses: {
//       list: expensesResults.list,
//       monthlyTotals: expensesResults.monthlyTotals,
//       yearlyTotal: expensesResults.yearlyTotal,
//     },
//     costOfSales: {
//       list: costOfSaleResult.list,
//       monthlyTotals: costOfSaleResult.monthlyTotals,
//       yearlyTotal: costOfSaleResult.yearlyTotal,
//     },
//     employeeExpenses: {
//       list: employeeExpenseResult.list,
//       yearlyTotal: employeeExpenseResult.yearlyTotal,
//     },
//   }

//     return {
//         planning,
//         results
//     }
//   }
// )

// const initialState = {
//   isLoading: false,
//   planning: {
//     projects: {
//       list: [],
//       salesRevenueTotal: 0,
//       nonOperatingIncomeTotal: 0,
//       nonOperatingExpenseTotal: 0,
//       cumulativeOrdinaryIncomeTotal: 0,
//     }, // year totals
//     expenses: {
//       list: [],
//       yearlyTotal: 0,
//       monthlyTotals: [],
//       monthlyTotalsByDate: [],
      
//     },
//     costOfSales: {
//       yearlyTotal: 0,
//       list: [],
//       monthlyTotals: [],
//       monthlyTotalsByDate: [],
//     },
//     employeeExpenses: { list: [], yearlyTotal: 0 },
//     calculations: {
//       grossProfit: 0,
//       grossProfitMargin: 0,
//       sellingAndAdminYearlyTotal: 0,
//       operatingIncomeYearlyTotal: 0,
//       operatingProfitMargin: 0,
//       nonOperatingIncome: 0,
//       nonOperatingExpense: 0,
//       ordinaryIncome: 0,
//     },
//   },
//   results: {
//     projects: {
//       list: [],
//       salesRevenueTotal: 0,
//       nonOperatingIncomeTotal: 0,
//       nonOperatingExpenseTotal: 0,
//       cumulativeOrdinaryIncomeTotal: 0,
//     }, // year totals
//     expenses: { list: [], yearlyTotal: 0, monthlyTotals: [] },
//     costOfSales: { yearlyTotal: 0, list: [], monthlyTotals: [] },
//     employeeExpenses: { list: [], yearlyTotal: 0 },
//     calculations: {
//       grossProfit: 0,
//       grossProfitMargin: 0,
//       sellingAndAdminYearlyTotal: 0,
//       operatingIncomeYearlyTotal: 0,
//       operatingProfitMargin: 0,
//       nonOperatingIncome: 0,
//       nonOperatingExpense: 0,
//       ordinaryIncome: 0,
//     },
//   },
// }

// const calculateFinancials = (
//   projects: ProjectDataEntity,
//   expenses: ExpenseDataEntity,
//   costOfSales: CostOfSaleDataEntity,
//   employeeExpenses: EmployeeExpenseDataEntity,
//   calculations: CalculationDataEntity,
// ) => {
//   // Gross Profit
//   calculations.grossProfit = calculateGrossProfit(projects.salesRevenueTotal, costOfSales.yearlyTotal)
//   // Gross Profit Margin
//   calculations.grossProfitMargin = calculateGrossProfitMargin(calculations.grossProfit, projects.salesRevenueTotal)
//   // Admin and General Expenses
//   calculations.sellingAndAdminYearlyTotal = calculateSellingAndGeneralAdmin(
//     employeeExpenses.yearlyTotal,
//     expenses.yearlyTotal,
//   )
//   // Operating Income
//   calculations.operatingIncomeYearlyTotal = calculateOperatingIncome(
//     calculations.grossProfit,
//     calculations.sellingAndAdminYearlyTotal,
//   )
//   // Operating Profit Margin
//   calculations.operatingProfitMargin = calculateOperatingProfitMargin(
//     projects.salesRevenueTotal,
//     calculations.operatingIncomeYearlyTotal,
//   )
//   // Ordinary Income
//   calculations.ordinaryIncome = calculateOrdinaryIncome(
//     calculations.operatingIncomeYearlyTotal,
//     projects.nonOperatingIncomeTotal,
//     projects.nonOperatingExpenseTotal,
//   )
// }

// const planningAndResultTotalsSlice = createSlice({
//   name: 'totals',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchTotals.fulfilled, (state, action) => {

//       // --PLANNING--
//       const { planning } = action.payload
//       // Destructure planning state ('PL' = Planning)
//       const { projects: projectsPL, expenses: expensesPL, costOfSales: costOfSalesPL, employeeExpenses: employeeExpensesPL } = planning
//       // Update planning state with action
//       state.planning.projects = { ...state.planning.projects, ...projectsPL }
//       state.planning.expenses = { ...state.planning.expenses, ...expensesPL }
//       state.planning.costOfSales = { ...state.planning.costOfSales, ...costOfSalesPL }
//       state.planning.employeeExpenses = { ...state.planning.employeeExpenses, ...employeeExpensesPL }
//       // ** PLANNING Calculations **
//       calculateFinancials(
//         state.planning.projects, 
//         state.planning.expenses, 
//         state.planning.costOfSales, 
//         state.planning.employeeExpenses, 
//         state.planning.calculations)

//       // --RESULTS--
//       const { results } = action.payload
//       // Destructure results state ('RES' = Results)
//       const { projects: projectsRES, expenses: expensesRES, costOfSales: costOfSalesRES, employeeExpenses: employeeExpensesRES } = results
//       // Update planning state with action
//       state.results.projects = { ...state.results.projects, ...projectsRES }
//       state.results.expenses = { ...state.results.expenses, ...expensesRES }
//       state.results.costOfSales = { ...state.results.costOfSales, ...costOfSalesRES }
//       state.results.employeeExpenses = { ...state.results.employeeExpenses, ...employeeExpensesRES }
//       // ** RESULTS Calculations **
//       calculateFinancials(
//         state.results.projects,
//         state.results.expenses,
//         state.results.costOfSales,
//         state.results.employeeExpenses,
//         state.results.calculations,
//       )
//     })
//   },
// })

// export const selectTotals = (state: RootState) => state.totals

// export default planningAndResultTotalsSlice.reducer