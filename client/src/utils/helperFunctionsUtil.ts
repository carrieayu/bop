// GENERAL HELPER FUNCTIONS

import api from '../api/api'
import { MAX_NUMBER_LENGTH, MAX_RETRIES, MAX_SAFE_INTEGER, MAX_VALUE, POLLING_INTERVAL } from '../constants'
import { getReactActiveEndpoint } from '../toggleEndpoint'
import { translate } from './translationUtil'

// # Helper to block non-numeric key presses for number inputs

export const handleDisableKeysOnNumberInputs = (event) => {
  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Enter',
    'Escape',
    'Shift',
    'Control',
    'Meta', // Command key on Mac
    'c',
    'v',
  ]

  const key = event.key

  // Allow functional keys
  if (allowedKeys.includes(key)) {
    return
  }

  // Allow Command+C and Command+V (or Control+C and Control+V on Windows)
  if ((event.ctrlKey || event.metaKey) && (key === 'c' || key === 'v')) {
    return
  }

  // Allow numbers 1-9 only
  if (!/^[0-9]$/.test(key)) {
    event.preventDefault()
  }
}

// # Add Commas to Financial Numbers for Display on List, Edit, Registration Screens

export const formatNumberWithCommas = (value: number | string): string => {
  // Trim the string and remove non-numeric characters,
  if (typeof value === 'string') {
    value = value.replace(/[^0-9-]/g, '') // Remove non-numeric characters
  }

  // Convert the sanitized string to a number
  const number = typeof value === 'string' ? parseFloat(value) : value

  // Handle invalid number cases
  if (isNaN(number) || number === null) {
    return '' // Return empty string for invalid inputs
  }

  // Format the number
  return number.toLocaleString()
}

export const formatNumberWithDecimal = (value: number | string): string => {
  if (typeof value === 'string') {
    value = value.replace(/[^0-9.]/g, ''); // 数字と小数点以外を削除
    const dotCount = (value.match(/\./g) || []).length;
    if (dotCount > 1) {
      return '';
    }
  }
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number) || number === null) {
    return ''; // 無効な入力は空文字を返す
  }
  return number.toLocaleString(undefined, { maximumFractionDigits: 20 }) + '%';
}

// # Remove commas used when displaying numbers in List, Edit, Registration Screens
// EG. "999,999" → "999999"
export const removeCommas = (val) => val.replace(/,/g, '')

// # Get Formatted Date // year-month-day
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
  const day = String(date.getDate()).padStart(2, '0') // Get day
  const year = date.getFullYear() // Get full year

  return `${year}-${month}-${day}`
}

export const sortByFinancialYear = (months) => {
  const financialOrder = (month) => (month < 4 ? month + 12 : month)
  return months.sort((a, b) => financialOrder(a.month) - financialOrder(b.month))
}

export const handlePLRegTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'project':
      navigate('/projects-registration')
      break
    case 'employeeExpenses':
      navigate('/employee-expenses-registration')
      break
    case 'expenses':
      navigate('/expenses-registration')
      break
    case 'costOfSales':
      navigate('/cost-of-sales-registration')
      break
    default:
      break
  }
}

export const handlePLListTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'project':
      navigate('/projects-list')
      break
    case 'employeeExpenses':
      navigate('/employee-expenses-list')
      break
    case 'expenses':
      navigate('/expenses-list')
      break
    case 'costOfSales':
      navigate('/cost-of-sales-list')
      break
    default:
      break
  }
}

export const handleResultsListTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'projectSalesResults':
      navigate('/project-sales-results-list')
      break
    case 'expensesResults':
      navigate('/expenses-results-list')
      break
    case 'employeeExpensesResults':
      navigate('/employee-expenses-results-list')
      break
    case 'costOfSalesResults':
      navigate('/cost-of-sales-results-list')
      break
    default:
      break
  }
}

export const handleResultsRegTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'projectSalesResults':
      navigate('/project-sales-results-registration')
      break
    case 'expensesResults':
      navigate('/expenses-results-registration')
      break
    case 'employeeExpensesResults':
      navigate('/employee-expenses-results-registration')
      break
    case 'costOfSalesResults':
      navigate('/cost-of-sales-results-registration')
      break
    default:
      break
  }
}

export const handleMMListTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'client':
      navigate('/clients-list')
      break
    case 'employee':
      navigate('/employees-list')
      break
    case 'businessDivision':
      navigate('/business-divisions-list')
      break
    case 'users':
      navigate('/users-list')
      break
    default:
      break
  }
}

export const handleMMRegTabsClick = (tab, navigate, setActiveTabOther) => {
  setActiveTabOther(tab)
  switch (tab) {
    case 'client':
      navigate('/clients-registration')
      break
    case 'employee':
      navigate('/employees-registration')
      break
    case 'businessDivision':
      navigate('/business-divisions-registration')
      break
    case 'users':
      navigate('/users-registration')
      break
    default:
      break
  }
}

export const handleInputChange = (
  index,
  event,
  updateFunction,
  dataList,
  nonFinancialFieldsArray = null, // used in some screns
) => {
  const { name, value } = event.target
  // Check if the field is in the non-numeric fields array
  if (nonFinancialFieldsArray != null && nonFinancialFieldsArray.includes(name)) {
    // Directly update the data for non-numeric fields
    const updatedData = [...dataList]
    updatedData[index] = {
      ...updatedData[index],
      [name]: value, // Use raw value for non-numeric fields
    }
    updateFunction(updatedData)
    return // Skip the rest of the numeric-specific logic
  }
  // Remove commas to get the raw number
  // EG. 999,999 → 999999 in the DB
  const rawValue = removeCommas(value)

  // Prevent entry of more than 15 digits in Input
  if (rawValue.length > MAX_NUMBER_LENGTH) {
    return // Ignore input if the length exceeds 15 digits
  }

  if (rawValue.length <= MAX_NUMBER_LENGTH && rawValue <= MAX_SAFE_INTEGER) {
    const updatedData = [...dataList]
    updatedData[index] = {
      ...updatedData[index],
      [name]: rawValue,
    }
    updateFunction(updatedData)
  }
}
// Used for CostOfSalesResults & ExpensesResults Registration
export const handleGeneralResultsInputChange = (
  index,
  event,
  updateFunction,
  nonFinancialValuesArray,
  setFilteredMonth,
) => {
  const { name, value } = event.target
  const rawValue = removeCommas(value)

  if (!nonFinancialValuesArray.includes(name)) {
    if (rawValue.length > MAX_NUMBER_LENGTH) {
      return
    }
  }

  updateFunction((prevFormData) => {
    return prevFormData.map((form, i) => {
      if (i === index) {
        const resetFields = {
          params: ['months'],
        }
        let month = form.month
        if (name == 'year' && value == '') {
          form.month = ''
          setFilteredMonth((prev) => {
            return prev.map((eachMonth, monthIndex) => {
              if (index == monthIndex) {
                return [{}]
              }
              return eachMonth
            })
          })
        }
        const fieldsToReset = resetFields[name] || []
        const resetValues = fieldsToReset.reduce((acc, field) => {
          acc[field] = ''
          return acc
        }, {})
        return {
          ...form,
          [name]: rawValue,
          ...resetValues,
        }
      }
      return form
    })
  })
}

export const snakeCaseToCamelCase = (str) => {
  const camelCaseString = str
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
    .replace(/^([a-z])/, (match, letter) => letter.toLowerCase())
  return camelCaseString
}

//  (Plannning / Results / Dashboard) Screens

export const getRatio = (result, planning) => {
  if (planning === 0) return '0.00'
  return ((result / planning) * 100).toFixed(2)
}

export const sumValues = (arr) => arr.reduce((acc, value) => acc + parseFloat(value), 0)

// Create new array: get totals for values in each row for planning, result, analysis tables.
export const organiseTotals = (valuesArr, label = '') => {

  let firstHalfTotal
  let secondHalfTotal
  let total

  if (label === 'cumulativeOrdinaryIncome') {
    firstHalfTotal = valuesArr[5] // values already summed in cumulative so do not need sumValues.
    secondHalfTotal = valuesArr[11] // values already summed in cumulative so do not need sumValues.
    total = valuesArr[11] // values already summed in cumulative so do not need sumValues. (secondHalfTotal === total)
  }
  else {
    firstHalfTotal = sumValues(valuesArr.slice(0, 6)) // First Half Total
    secondHalfTotal = sumValues(valuesArr.slice(6)) // Second Half Total
    total = sumValues(valuesArr) // Total
  }

  return [
    ...valuesArr,
    firstHalfTotal, // First Half Total
    secondHalfTotal, // Second Half Total
    total, // Total
  ]
}

export const cumulativeSum = (arr) => {
  let sum = 0
  return arr.map((value) => (sum += value))
}

export const grossProfitTotal = (salesRevenueTotal, costOfSalesTotal) => {
  const grossProfit = salesRevenueTotal - costOfSalesTotal // Calculate gross profit
  return grossProfit
}

export async function fetchWithPolling<T>(
  endpoint: string,
  retries = MAX_RETRIES,
  pollingInterval = POLLING_INTERVAL,
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get(`${getReactActiveEndpoint()}/api/${endpoint}`)
      if (response.data && response.data.length > 0) {
        return response.data // Ensure this is returning the correct type T
      } else {
        console.error(`Attempt ${attempt}: Data is empty, retrying in ${pollingInterval / 1000} seconds...`)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, pollingInterval))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

// -- DASHBOARD CALCULATIONS USED IN GRAPH SLICE --

// # Creates Object with year & month, monthly total. 
// Eg. { 2024 - 5: 500000, 2024 - 6: 40000 } '
export const reformattedMonthlyTotalValues = (valuesArr) => {
  return valuesArr.reduce((acc, item) => {
    const label = `${item.year}-${item.month}`
    const monthValue = item.total
    if (acc[label]) {
      acc[label] += Number(monthValue)
    } else {
      acc[label] = Number(monthValue)
    }
    return acc
  }, {})
}

// # Year/Months with data to be displayed on graph in Financial Year Order.
// EG. ['2024-4',... '2025-3']
export const activeDatesOnGraph = (datesArrOne, datesArrTwo) => {
    const datesSet = new Set([...Object.keys(datesArrOne), ...Object.keys(datesArrTwo)])
    const dates = Array.from(datesSet)

    dates.sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number)
      const [yearB, monthB] = b.split('-').map(Number)

      const fiscalYearA = monthA >= 4 ? yearA : yearA - 1
      const fiscalYearB = monthB >= 4 ? yearB : yearB - 1

      // Sort by fiscal year first
      if (fiscalYearA !== fiscalYearB) {
        return fiscalYearA - fiscalYearB
      }

      // If same fiscal year, prioritize April-Dec (4-12) over Jan-March (1-3)
      const aPriority = monthA >= 4 ? monthA : monthA + 12
      const bPriority = monthB >= 4 ? monthB : monthB + 12

      return aPriority - bPriority
    })
  
    return dates
}
  
// # Gross Profit Monthly By Date: Object
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 } '
// CALCULATION: sales revenue - cost of sale
export const calculateMonthlyGrossProfit = (cosMonths, salesRevenueMonths) => {
  const grossProfitMonthlyByDate = {}

  const allMonths = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])
  allMonths.forEach((key) => {
    const sales = salesRevenueMonths[key] || 0
    const costOfSales = cosMonths[key] || 0
    grossProfitMonthlyByDate[key] = sales - costOfSales
  })
  return grossProfitMonthlyByDate
}

// # Admin and General Expense Monthly by Date: Object
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 }
// Calculation: expense total + employee total
export const calculateMonthlyAdminAndGeneralExpense = (expenseMonths, employeeExpenseMonths) => {
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

// # Gross Profit Margin Monthly by Date: Object
// Eg. { 2024 - 4: 82.45, ..., 2025 - 3: 89.12 } 
// CALCULATION: gross profit / sales revenue * 100
export const calculateMonthlyGrossProfitMargin = (salesRevenueMonths, grossProfitsMonths) => {

  const grossProfitMarginByDate = {}
  for (let date in salesRevenueMonths) {
    if (grossProfitsMonths[date]) {
      const salesRevenueAmount = salesRevenueMonths[date]
      const grossProfitAmount = grossProfitsMonths[date]

      // Check if salesRevenueAmount is 0
      if (salesRevenueAmount === 0) {
        grossProfitMarginByDate[date] = '' // or another default value, like '0'
      } else {
        const margin = ((grossProfitAmount / salesRevenueAmount) * 100).toFixed(2)
        grossProfitMarginByDate[date] = parseFloat(margin)
      }
    }
  }

  return grossProfitMarginByDate
}

// # Operating Income Monthly by Date: Object 
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 400000 } '
// CALCULATION: operating income =  gross profit + admin and general expense
export const calculateMonthlyOperatingIncome = (grossProfitMonths, adminGeneralMonths) => {
  const operatingIncomeMonthlyTotalByDate = {}

  const allDates = new Set([...Object.keys(grossProfitMonths), ...Object.keys(adminGeneralMonths)])

  for (let date of allDates) {
    const grossProfitTotal = grossProfitMonths[date]
    const adminGeneralTotal = adminGeneralMonths[date]

    operatingIncomeMonthlyTotalByDate[date] = grossProfitTotal - adminGeneralTotal
  }
  return operatingIncomeMonthlyTotalByDate
}

// # Operating Profit Margin Monthly by Date: Object 
// Eg. { 2024 - 4: 82.45, ..., 2025 - 3: 89.12 } '
// CALCULATION: operating income / sales revenue * 100
export const calculateMonthlyOperatingProfitMargin = (operatingIncomeMonths, salesRevenueMonths) => {
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

// # Ordinary Income Monthly by Date: Object 
// Eg. { 2024 - 4: 500000, ..., 2025 - 3: 40000 }
// CALCULATION: operating income + non operating income - non operating expense
export const calculateMonthlyOrdinaryIncome = (
  operatingIncomeMonths, // calculated
  nonOperatingIncomeMonths, // from projects
  nonOperatingExpenseMonths, // from projects.non_operatin
) => {
  const ordinaryIncomeMonthlyByDate = {}

  const allDates = new Set([
    ...Object.keys(nonOperatingExpenseMonths),
    ...Object.keys(nonOperatingIncomeMonths),
    ...Object.keys(operatingIncomeMonths),
  ])

  for (let date of allDates) {
    ordinaryIncomeMonthlyByDate[date] =
      (operatingIncomeMonths[date] + nonOperatingIncomeMonths[date]) - nonOperatingExpenseMonths[date]
  }

  return ordinaryIncomeMonthlyByDate
}

// -- Graph Dashboard  --

export const mapDataset = (datasets: any) =>
  datasets.map((dataset: any) => ({
    name: dataset.label,
    data: dataset.data,
    type: dataset.type,
    color: dataset.backgroundColor,
  }))

export const createGraphData = (
       datasetMappings: {
         labelKey: string
         data: any
         backgroundColor: string
         type: string
       }[],
       dates: string[],
       language,
     ) => ({
       labels: dates,
       datasets: datasetMappings.map(({ labelKey, data, backgroundColor, type }) => ({
         type,
         label: translate(labelKey, language),
         data: dates.map((date) => data[date] ?? 0),
         backgroundColor,
         borderColor: type === 'bar' ? 'black' : backgroundColor,
         borderWidth: type === 'bar' ? 1 : 2,
       })),
     })