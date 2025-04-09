// src/utils/graphDataHelper.js
import { formatGraphData } from './helperFunctionsUtil' // assuming you have this function already

export const organiseGraphData = (planningGraph, resultsGraph, language) => {
  // Destructure the planning data
  const {
    projectSalesRevenueMonthlyPlanning,
    operatingIncomeMonthlyPlanning,
    operatingProfitMarginMonthlyPlanning,
    ordinaryIncomeMonthlyPlanning,
    grossProfitMarginMonthlyPlanning,
    grossProfitMonthlyPlanning,
    dates,
  } = planningGraph

  // Destructure the results data
  const {
    projectSalesRevenueMonthlyResults,
    operatingIncomeMonthlyResults,
    operatingProfitMarginMonthlyResults,
    ordinaryIncomeMonthlyResults,
    grossProfitMarginMonthlyResults,
    grossProfitMonthlyResults,
    datesResults,
  } = resultsGraph

  // Financials (Planning)
  const planningGraphData = formatGraphData(
    [
      { label: 'sales', data: projectSalesRevenueMonthlyPlanning, bgColor: '#6e748c', type: 'bar' },
      { label: 'grossProfit', data: grossProfitMonthlyPlanning, bgColor: '#7696c6', type: 'bar' },
      { label: 'operatingIncome', data: operatingIncomeMonthlyPlanning, bgColor: '#b8cbe2', type: 'bar' },
      { label: 'ordinaryIncome', data: ordinaryIncomeMonthlyPlanning, bgColor: '#bde386', type: 'bar' },
    ],
    dates,
    language,
  )

  // Margins (Planning)
  const planningLineGraphData = formatGraphData(
    [
      { label: 'grossProfitMargin', data: grossProfitMarginMonthlyPlanning, bgColor: '#ff8e13', type: 'line' },
      { label: 'operatingProfitMargin', data: operatingProfitMarginMonthlyPlanning, bgColor: '#ec3e4a', type: 'line' },
    ],
    dates,
    language,
  )

  // Financials (Results)
  const resultsGraphData = formatGraphData(
    [
      { label: 'sales', data: projectSalesRevenueMonthlyResults, bgColor: '#6e748c', type: 'bar' },
      { label: 'grossProfit', data: grossProfitMonthlyResults, bgColor: '#7696c6', type: 'bar' },
      { label: 'operatingIncome', data: operatingIncomeMonthlyResults, bgColor: '#b8cbe2', type: 'bar' },
      { label: 'ordinaryIncome', data: ordinaryIncomeMonthlyResults, bgColor: '#bde386', type: 'bar' },
    ],
    datesResults,
    language,
  )

  // Margins (Results)
  const resultsLineGraphData = formatGraphData(
    [
      { label: 'grossProfitMargin', data: grossProfitMarginMonthlyResults, bgColor: '#ff8e13', type: 'line' },
      { label: 'operatingProfitMargin', data: operatingProfitMarginMonthlyResults, bgColor: '#ec3e4a', type: 'line' },
    ],
    datesResults,
    language,
  )

  return {
    planningData: {
      financial: planningGraphData,
      margin: planningLineGraphData,
    },
    resultsData: {
      financial: resultsGraphData,
      margin: resultsLineGraphData,
    },
  }
}

