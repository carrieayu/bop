export const ACCESS_TOKEN = 'accessToken'
export const REFRESH_TOKEN = 'refresh'

// Months and Month Names
export const months = [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]

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

// Years
export const years = [2024, 2025]

export const currentYear = new Date().getFullYear()

export const maximumEntries = 10

export const planningScreenTabs = [
  { labelKey: 'project', tabKey: 'project' },
  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
  { labelKey: 'expenses', tabKey: 'expenses' },
  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
]
