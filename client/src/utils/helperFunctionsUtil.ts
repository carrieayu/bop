// GENERAL HELPER FUNCTIONS

import api from '../api/api'
import { currentYear, MAX_NUMBER_LENGTH, MAX_RETRIES, MAX_SAFE_INTEGER, months, POLLING_INTERVAL } from '../constants'
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

export const setupIdleTimer = (onIdle, idleTimeLimit) => {
  let timer;

  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onIdle();
    }, idleTimeLimit);
  };

  const startListening = () => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();
  };

  const stopListening = () => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
    if (timer) clearTimeout(timer);
  };

  return { startListening, stopListening };
};

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

// Empty Array of dates for current financial year
// Eg. [ "2024-4","2024-5",..."2025-3"]
export const monthlyDatesForGraphByYear = () => {

  // 1 financial year includes 2 years (eg. fiscal year: 2024 = 2024-1 -> 2025-3)
  const thisYear = currentYear.toString()
  const nextYear = (currentYear + 1).toString()

  const months = [4,5,6,7,8,9,10,11,12,1,2,3];;

  const formattedYearAndMonth = months.map((month) => {
    if (month >= 4) {
      return `${thisYear}-${month}`
    } else {
      return `${nextYear}-${month}`
    }
  })

  return formattedYearAndMonth
}
 
// # Year/Months with data to  be displayed on graph in Financial Year Order.
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

// -- Graph Dashboard  --

export const mapDataset = (datasets: any) =>
  datasets.map((dataset: any) => ({
    name: dataset.label,
    data: dataset.data,
    type: dataset.type,
    color: dataset.backgroundColor,
  }))

// # Maps the necessary data for each line or bar in chart
export const formatGraphData = (
  datasetMappings: {
    label: string
    data: any
    bgColor: string
    type: string
  }[],
  dates: string[],
  language,
) => {
  return ({
    labels: dates,
    datasets: datasetMappings.map(({ label, data, bgColor, type }) => ({
      type,
      label: translate(label, language),
      data: dates.map((date) => data[date] ?? 0),
      backgroundColor: bgColor,
      borderColor: type === 'bar' ? 'black' : bgColor,
      borderWidth: type === 'bar' ? 1 : 2,
    })),
  })
}

// # Darkens Color: Used for results bars in 
export const darkenColor = (hex, percent) => {
  let num = parseInt(hex.replace('#', ''), 16),
    r = (num >> 16) - percent,
    g = ((num >> 8) & 0x00ff) - percent,
    b = (num & 0x0000ff) - percent

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  return `rgb(${r}, ${g}, ${b})`
}

// # Changes the order of items in series so that legends and bars charts in chart are side by side.
// Eg. 売上計画 , 売上実績
export const reOrderArray = (series, length) => {
  let arrayOrder
  if (length === 4) {
    arrayOrder = [0, 2, 1, 3]
  }
  if (length === 8) {
    arrayOrder = [0, 4, 1, 5, 2, 6, 3, 7]
  }
  return arrayOrder.map((index) => series[index])
}

// Error message for when Redux dispatch data fetch fails on dashboard
export const handleError = (actionName: string, error: any) => {
    console.error(`Error fetching ${actionName}:`, error)
  }

export const getValueAndId = (valueName, recordType, aggregatedData, dataType) => { 
  const values = months.map((month) => {
    const dataEntry = aggregatedData[month]
    if (dataEntry) {
      const isPlanning = dataType === 'planning' // dataType === planning || results

      return {
        id: dataEntry[isPlanning ? `${recordType}_id` : `${recordType}_result_id`],
        [valueName]: dataEntry[valueName] || 0,
      }
    }
    return { id: null, [valueName]: 0 }
  })
  return values
}
