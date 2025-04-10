// # FINANCIAL CALCULATIONS
import { CostOfSaleDataEntity } from "../entity/costOfSaleEntity"
import { EmployeeExpenseDataEntity } from "../entity/employeeExpenseEntity"
import { ExpenseDataEntity } from "../entity/expenseEntity"
import { ProjectDataEntity } from "../entity/projectEntity"
import { monthlyDatesForGraphByYear } from "./helperFunctionsUtil"

// --TOTALS (Single Figures)--
// Gross Profit
export const calculateGrossProfit = (salesRevenue, costOfSale) => salesRevenue - costOfSale
export const calculateGrossProfitMargin = (grossProfit, salesRevenue) => salesRevenue !== 0 ? (grossProfit / salesRevenue) * 100 : 0
// Admin and General Expenses
export const calculateSellingAndGeneralAdmin = (employeeExpense, expense) => employeeExpense + expense
// Operating Income
export const calculateOperatingIncome = (grossProfit, sellingAndGeneralAdmin) => grossProfit - sellingAndGeneralAdmin
export const calculateOperatingProfitMargin = (operatingIncome, salesRevenue) => salesRevenue !== 0 ? (operatingIncome / salesRevenue) * 100 : 0
// Ordinary Income
export const calculateOrdinaryIncome = (operatingIncome, nonOperatingIncome, nonOperatingExpense) =>
  operatingIncome + nonOperatingIncome - nonOperatingExpense

// --MONTHLY--

// Returns Objects: {Date - Value}
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 } '

// # Gross Profit Monthly By Date: Object
// USED IN GRAPH
export const calculateMonthlyGrossProfit = (salesRevenueMonths, cosMonths) => {
  // ƒormula: sales revenue - cost of sale
  const grossProfitMonthlyByDate = {}

  const allMonths = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])

  allMonths.forEach((key) => {
    const sales = salesRevenueMonths[key] ?? 0
    const costOfSales = cosMonths[key] ?? 0
    grossProfitMonthlyByDate[key] = sales - costOfSales
  })

  return grossProfitMonthlyByDate
}

// # Admin and General Expense Monthly
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 }
export const calculateMonthlyAdminAndGeneralExpense = (expenseMonths, employeeExpenseMonths) => {
  // ƒormula: expense total + employee total
  const adminAndGeneralMonthlyTotalByDate = {}

  // Get all unique dates from both objects
  const allDates = new Set([...Object.keys(expenseMonths), ...Object.keys(employeeExpenseMonths)])

  for (const date of allDates) {
    const expenseTotal = expenseMonths[date] ?? 0
    const employeeTotal = employeeExpenseMonths[date] ?? 0

    adminAndGeneralMonthlyTotalByDate[date] = expenseTotal + employeeTotal
  }
  return adminAndGeneralMonthlyTotalByDate
}

// # Gross Profit Margin Monthly
// Eg. { 2024 - 4: 82.45, ..., 2025 - 3: 89.12 }
export const calculateMonthlyGrossProfitMargin = (salesRevenueMonths, grossProfitsMonths) => {
  const grossProfitMarginByDate = {}

  const dates = monthlyDatesForGraphByYear()
  const allDates = new Set([...Object(dates)])

  for (let date of allDates) {
    if (grossProfitsMonths.hasOwnProperty(date) || salesRevenueMonths.hasOwnProperty(date)) {
      const salesRevenueAmount = salesRevenueMonths[date]
      const grossProfitAmount = grossProfitsMonths[date]
      // If sales revenue is missing, set to null (to break the line)
      if (salesRevenueAmount === undefined || salesRevenueAmount === null) {
        grossProfitMarginByDate[date] = ""
      }
      // If sales revenue is explicitly 0, keep it as 0 so the graph shows it
      else if (salesRevenueAmount === 0) {
        grossProfitMarginByDate[date] = ""
      }
      // Normal calculation
      else {
        const margin = ((grossProfitAmount / salesRevenueAmount) * 100).toFixed(2)
        grossProfitMarginByDate[date] = parseFloat(margin)
      }
    } else {
      // Empty Month
       grossProfitMarginByDate[date] = ""
    }
  }
  return grossProfitMarginByDate
}


// # Operating Income Monthly
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 400000 } '
export const calculateMonthlyOperatingIncome = (grossProfitMonths, adminGeneralMonths) => {
  // ƒormula: operating income =  gross profit + admin and general expense
  const operatingIncomeMonthlyTotalByDate = {}

  const allDates = new Set([...Object.keys(grossProfitMonths), ...Object.keys(adminGeneralMonths)])

  for (let date of allDates) {
    const grossProfitTotal = grossProfitMonths[date] ?? 0
    const adminGeneralTotal = adminGeneralMonths[date] ?? 0

    operatingIncomeMonthlyTotalByDate[date] = grossProfitTotal - adminGeneralTotal
  }
  return operatingIncomeMonthlyTotalByDate
}

// # Operating Profit Margin Monthly
// Eg. { 2024 - 4: 82.45, ..., 2025 - 3: 89.12 } '
export const calculateMonthlyOperatingProfitMargin = (operatingIncomeMonths, salesRevenueMonths) => {

  // ƒormula: operating income / sales revenue * 100
  const operatingIncomeMonthlyProfitMarginByDate = {}

  const dates = monthlyDatesForGraphByYear()
  const allDates = new Set([...Object(dates)])

  for (let date of allDates) {
      const operatingIncomeAmount = operatingIncomeMonths[date] ?? 0
      const salesRevenueAmount = salesRevenueMonths[date] ?? 0

      // Check if salesRevenueAmount is 0
      if (salesRevenueAmount === undefined || salesRevenueAmount === null || salesRevenueAmount === 0) {
        operatingIncomeMonthlyProfitMarginByDate[date] = '' // or another default value, like '0'
      } else {
        const margin = ((operatingIncomeAmount / salesRevenueAmount) * 100).toFixed(2)
        operatingIncomeMonthlyProfitMarginByDate[date] = parseFloat(margin)
      }
  } 
  return operatingIncomeMonthlyProfitMarginByDate
}

// # Ordinary Income Monthly
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 }
export const calculateMonthlyOrdinaryIncome = (
  operatingIncomeMonths, // calculated
  nonOperatingIncomeMonths, // from projects
  nonOperatingExpenseMonths, // from projects.non_operatin
) => {
  // ƒormula: operating income + non operating income - non operating expense

  const ordinaryIncomeMonthlyByDate = {}

  const allDates = new Set([
    ...Object.keys(nonOperatingExpenseMonths),
    ...Object.keys(nonOperatingIncomeMonths),
    ...Object.keys(operatingIncomeMonths),
  ])

  for (let date of allDates) {

    const operatingIncome = operatingIncomeMonths[date] ?? 0;
    const nonOperatingIncome = nonOperatingIncomeMonths[date] ?? 0;
    const nonOperatingExpense = nonOperatingExpenseMonths[date] ?? 0;

    ordinaryIncomeMonthlyByDate[date] = operatingIncome + nonOperatingIncome - nonOperatingExpense
  }
  return ordinaryIncomeMonthlyByDate
}

// NEW FUNCTIONS FOR REFACTOR USING SELECTORS

export const calculateFinancials = (
  projects: ProjectDataEntity,
  expenses: ExpenseDataEntity,
  costOfSales: CostOfSaleDataEntity,
  employeeExpenses: EmployeeExpenseDataEntity,
) => {
  // Gross Profit
  const grossProfit = calculateGrossProfit(projects.salesRevenueTotal, costOfSales.yearlyTotal)
  // Gross Profit Margin
  const grossProfitMargin =calculateGrossProfitMargin(grossProfit, projects.salesRevenueTotal)
  // Admin and General Expenses
  const sellingAndAdminYearlyTotal = calculateSellingAndGeneralAdmin(
    employeeExpenses.yearlyTotal,
    expenses.yearlyTotal,
  )
  // Operating Income
  const operatingIncomeYearlyTotal = calculateOperatingIncome(
    grossProfit,
    sellingAndAdminYearlyTotal,
  )
  // Operating Profit Margin
  const operatingProfitMargin = calculateOperatingProfitMargin(
    projects.salesRevenueTotal,
    operatingIncomeYearlyTotal,
  )
  // Ordinary Income
  const ordinaryIncome = calculateOrdinaryIncome(
    operatingIncomeYearlyTotal,
    projects.nonOperatingIncomeTotal,
    projects.nonOperatingExpenseTotal,
  )

  return {
    grossProfit, grossProfitMargin, sellingAndAdminYearlyTotal, operatingIncomeYearlyTotal, operatingProfitMargin, ordinaryIncome
  }
}