// # FINANCIAL CALCULATIONS

// --TOTALS (Single Figures)--
export const calculateGrossProfit = (salesRevenue, costOfSale) => salesRevenue - costOfSale
export const calculateGrossProfitMargin = (grossProfit, salesRevenue) => (grossProfit / salesRevenue) * 100
// Admin and General Expenses
export const calculateSellingAndGeneralAdmin = (employeeExpense, expense) => employeeExpense + expense
// Operating Income
export const calculateOperatingIncome = (grossProfit, sellingAndGeneralAdmin) => grossProfit - sellingAndGeneralAdmin
export const calculateOperatingProfitMargin = (salesRevenue, operatingIncome) => (operatingIncome / salesRevenue) * 100
// Ordinary Income
export const calculateOrdinaryIncome = (operatingIncome, nonOperatingIncome, nonOperatingExpense) =>
  operatingIncome + nonOperatingIncome - nonOperatingExpense

// --MONTHLY--

// Returns Objects: {Date - Value}
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 } '

// # Gross Profit Monthly By Date: Object
export const calculateMonthlyGrossProfit = (cosMonths, salesRevenueMonths) => {
  // ƒormula: sales revenue - cost of sale
  const grossProfitMonthlyByDate = {}

  const allDates = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])

  const allMonths = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])
  allMonths.forEach((key) => {
    const sales = salesRevenueMonths[key] || 0
    const costOfSales = cosMonths[key] || 0
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
  // ƒormula: gross profit / sales revenue * 100
  const grossProfitMarginByDate = {}
  
  const allDates = new Set([...Object.keys(grossProfitsMonths), ...Object.keys(salesRevenueMonths)])
  for (let date of allDates) {

    if (grossProfitsMonths[date]) {
      const salesRevenueAmount = salesRevenueMonths[date]
      const grossProfitAmount = grossProfitsMonths[date] || 0
      // Check if salesRevenueAmount is 0
      if (salesRevenueMonths === 0) {
        grossProfitMarginByDate[date] = null // or another default value, like '0'
      } else {
        const margin = ((grossProfitAmount / salesRevenueAmount) * 100).toFixed(2)
        grossProfitMarginByDate[date] = parseFloat(margin)
      }
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
    const grossProfitTotal = grossProfitMonths[date]
    const adminGeneralTotal = adminGeneralMonths[date]

    operatingIncomeMonthlyTotalByDate[date] = grossProfitTotal - adminGeneralTotal
  }
  return operatingIncomeMonthlyTotalByDate
}

// # Operating Profit Margin Monthly
// Eg. { 2024 - 4: 82.45, ..., 2025 - 3: 89.12 } '
export const calculateMonthlyOperatingProfitMargin = (operatingIncomeMonths, salesRevenueMonths) => {

  // ƒormula: operating income / sales revenue * 100
  const operatingIncomeMonthlyProfitMarginByDate = {}

  const allDates = new Set([...Object.keys(operatingIncomeMonths), ...Object.keys(salesRevenueMonths)])

  for (let date of allDates) {
    const operatingIncomeAmount = operatingIncomeMonths[date]
    const salesRevenueAmount = salesRevenueMonths[date]

    // Check if salesRevenueAmount is 0
    if (salesRevenueAmount === 0) {
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

    const operatingIncome = operatingIncomeMonths[date] || 0;
    const nonOperatingIncome = nonOperatingIncomeMonths[date] || 0;
    const nonOperatingExpense = nonOperatingExpenseMonths[date] || 0;

    ordinaryIncomeMonthlyByDate[date] = operatingIncome + nonOperatingIncome - nonOperatingExpense
  }
  return ordinaryIncomeMonthlyByDate
}