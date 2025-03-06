export const ACCESS_TOKEN = 'accessToken'
export const REFRESH_TOKEN = 'refreshToken'

export const years = [2024, 2025]
export const currentYear = new Date().getFullYear()
export const token = localStorage.getItem('accessToken')
export const maximumEntries = 10
export const maximumEntriesEE = 5
export const storedUserID = localStorage.getItem('userID')
export const header = ['計画	']
export const smallDate = ['2022/24月', '2022/25月', '2022/26月']
export const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']
export const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
export const monthNames: { [key: number]: { en: string; jp: string } } = {
  1: { en: 'January', jp: '1月' },
  2: { en: 'February', jp: '2月' },
  3: { en: 'March', jp: '3月' },
  4: { en: 'April', jp: '4月' },
  5: { en: 'May', jp: '5月' },
  6: { en: 'June', jp: '6月' },
  7: { en: 'July', jp: '7月' },
  8: { en: 'August', jp: '8月' },
  9: { en: 'September', jp: '9月' },
  10: { en: 'October', jp: '10月' },
  11: { en: 'November', jp: '11月' },
  12: { en: 'December', jp: '12月' },
}

export const planningScreenTabs = [
  { labelKey: 'project', tabKey: 'project' },
  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
  { labelKey: 'expenses', tabKey: 'expenses' },
  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
]

export const resultsScreenTabs = [
  { labelKey: 'projectSalesResultsShort', tabKey: 'projectSalesResults' },
  { labelKey: 'employeeExpensesResultsShort', tabKey: 'employeeExpensesResults' },
  { labelKey: 'expensesResultsShort', tabKey: 'expensesResults' },
  { labelKey: 'costOfSalesResultsShort', tabKey: 'costOfSalesResults' },
]

export const masterMaintenanceScreenTabs = [
  { labelKey: 'client', tabKey: 'client' },
  { labelKey: 'employee', tabKey: 'employee' },
  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
  { labelKey: 'users', tabKey: 'users' },
]
export const MAX_NUMBER_LENGTH = 15 // 15 digits [000,000,000,000,000]
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER // 9007199254740991
export const MAX_VALUE = Number.MAX_VALUE //1.7976931348623157e+308

export const IDLE_TIMEOUT = 900000;
// export const IDLE_TIMEOUT = 5000;

