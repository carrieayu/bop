// GENERAL HELPER FUNCTIONS

import { MAX_NUMBER_LENGTH, MAX_SAFE_INTEGER, MAX_VALUE } from '../constants'

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
  // console.log('formatNumberWithCommas',value, typeof value, )
  // Trim the string and remove non-numeric characters,
  if (typeof value === 'string') {
    value = value.replace(/[^0-9]/g, '') // Remove non-numeric characters
  }

  // Convert the sanitized string to a number
  const number = typeof value === 'string' ? parseFloat(value) : value

  // Handle invalid number cases
  if (isNaN(number) || number === null) {
    // console.log('is NaN === true', value)
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
  return number.toLocaleString(undefined, { maximumFractionDigits: 20 });
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

//  Plannning / Results (Dashboard Screens)

const sumValues = (arr) => arr.reduce((acc, value) => acc + parseFloat(value), 0)

export const organiseTotals = (arr) => {

  return [
    ...arr,
    sumValues(arr.slice(0, 6)), // First Half Total
    sumValues(arr.slice(6)), // Second Half Total
    sumValues(arr), // Total
    '0',
  ]
}
