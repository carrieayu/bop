import {
  calculateMonthlyAdminAndGeneralExpense,
  calculateMonthlyGrossProfit,
  calculateMonthlyGrossProfitMargin,
  calculateMonthlyOperatingIncome,
  calculateMonthlyOperatingProfitMargin,
  calculateMonthlyOrdinaryIncome,
} from './financialCalculationsUtil'
import {  reformattedMonthlyTotalValues, activeDatesOnGraph } from './helperFunctionsUtil'

export const prepareGraphData = (data: any, type) => {
  const {
    salesRevenueMonthly,
    costOfSaleMonthlyTotalsByDate,
    expensesMonthlyTotalsByDate,
    employeeExpensesMonthlyTotalsByDate,
    nonOperatingIncomeMonthly,
    nonOperatingExpenseMonthly,
  } = data

  const reformattedData = {
    salesRevenue: reformattedMonthlyTotalValues(salesRevenueMonthly),
    costOfSales: reformattedMonthlyTotalValues(costOfSaleMonthlyTotalsByDate),
    expenses: reformattedMonthlyTotalValues(expensesMonthlyTotalsByDate),
    employeeExpenses: reformattedMonthlyTotalValues(employeeExpensesMonthlyTotalsByDate),
    nonOperatingIncome: reformattedMonthlyTotalValues(nonOperatingIncomeMonthly),
    nonOperatingExpense: reformattedMonthlyTotalValues(nonOperatingExpenseMonthly),
  }

  const grossProfit = calculateMonthlyGrossProfit(reformattedData.costOfSales, reformattedData.salesRevenue)
  const dates = activeDatesOnGraph(reformattedData.costOfSales, reformattedData.salesRevenue)
  
  const grossProfitMargin = calculateMonthlyGrossProfitMargin(reformattedData.salesRevenue, grossProfit)

  const adminAndGeneralExpenses = calculateMonthlyAdminAndGeneralExpense(
    reformattedData.expenses,
    reformattedData.employeeExpenses,
  )

  const operatingIncome = calculateMonthlyOperatingIncome(grossProfit, adminAndGeneralExpenses)

  const operatingProfitMargin = calculateMonthlyOperatingProfitMargin(operatingIncome, reformattedData.salesRevenue)

  const ordinaryIncome = calculateMonthlyOrdinaryIncome(
    operatingIncome,
    reformattedData.nonOperatingIncome,
    reformattedData.nonOperatingExpense,
  )

  if (type === 'planning') {
        return {
          type: type,
          projectSalesRevenueMonthlyPlanning: reformattedData.salesRevenue,
          costOfSalesMonthlyPlanning: reformattedData.costOfSales,
          grossProfitMonthlyPlanning: grossProfit,
          grossProfitMarginMonthlyPlanning: grossProfitMargin,
          dates: dates,
          expensesMonthlyPlanning: reformattedData.expenses,
          employeeExpensesMonthlyPlanning: reformattedData.employeeExpenses,
          adminAndGeneralExpensesMonthlyPlanning: adminAndGeneralExpenses,
          operatingIncomeMonthlyPlanning: operatingIncome,
          operatingProfitMarginMonthlyPlanning: operatingProfitMargin,
          ordinaryIncomeMonthlyPlanning: ordinaryIncome,
        }
    }

  if (type === 'results') {
        return {
        type: type,
        projectSalesRevenueMonthlyResults: reformattedData.salesRevenue,
        costOfSalesMonthlyResults: reformattedData.costOfSales,
        grossProfitMonthlyResults: grossProfit,
        grossProfitMarginMonthlyResults: grossProfitMargin,
        datesResults: dates,
        expensesMonthlyResults: reformattedData.expenses,
        employeeExpensesMonthlyResults: reformattedData.employeeExpenses,
        adminAndGeneralExpensesMonthlyResults: adminAndGeneralExpenses,
        operatingIncomeMonthlyResults: operatingIncome,
        operatingProfitMarginMonthlyResults: operatingProfitMargin,
        ordinaryIncomeMonthlyResults: ordinaryIncome,
      }
    }
}