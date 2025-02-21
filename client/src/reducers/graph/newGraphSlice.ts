import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { fetchProject } from '../project/projectSlice'
import { sortByFinancialYear } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  totalSalesByDate: {},
  planningMonthly: {
    // done-ish for now
    projectSalesRevenueMonthlyPlanning: [],
    grossProfitMonthlyPlanning: {},
    costOfSalesTotalMonthlyPlanning: [],
    grossProfitMarginMonthlyPlanning: {},
    dates: [], // Eg. '2024-5'

    expensesMonthlyPlanning: [],
    employeeExpensesMonthlyPlanning: [],
    adminAndGeneralExpenseMonthlyPlanning: {},
    operatingIncomeMonthlyPlanning: {},
    operatingProfitMarginMonthlyPlanning: {},
    //working on
    ordinaryIncomeMonthlyPlanning: {},
  },
}

export const fetchNewGraphData = createAsyncThunk('newGraph/fetchNewGraphData', async (_, { dispatch, getState }) => {
  await dispatch(fetchProject())

  const state = getState() as RootState

  // sales reveune monthly (from projects)
  // '{2024-5:500000,2024-6:40000 }'
  const reformattedOperatingMonthlyValue = (valuesArr) => {
    console.log('## values arr',valuesArr)
    return valuesArr.reduce((acc, item) => {
      console.log('##item' )
      const label = `${item.year}-${item.month}`
      const monthValue = item.totals
      if (acc[label]) {
        acc[label] += Number(monthValue)
      } else {
        acc[label] = Number(monthValue)
      }
      return acc
    }, {})
  }

  // sales reveune monthly (from projects)
  // '{2024-5:500000,2024-6:40000 }'
  const reformattedSalesRevenueMonthlyValue = (valuesArr) => {
    return valuesArr.reduce((acc, item) => {
      const label = `${item.year}-${item.month}`
      const monthValue = item.salesRevenue
      if (acc[label]) {
        acc[label] += Number(monthValue)
      } else {
        acc[label] = Number(monthValue)
      }
      return acc
    }, {})
  }

  // expenses monthly
  // cost of sales monthly
  // '{2024-5:500000,2024-6:40000 }'
  const reformattedMonthlyValues = (valuesArr) => {
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

  // Year/Months with data to be displayed on graph
  const activeDatesOnGraph = (cosMonths, salesRevenueMonths) => {
    const datesSet = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])
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

  // Gross Profit Monthly By Date
  const calculateMonthlyGrossProfit = (cosMonths, salesRevenueMonths) => {
    const grossProfitMonthlyByDate = {}

    const allMonths = new Set([...Object.keys(cosMonths), ...Object.keys(salesRevenueMonths)])
    allMonths.forEach((key) => {
      const sales = salesRevenueMonths[key] || 0
      const costOfSales = cosMonths[key] || 0
      grossProfitMonthlyByDate[key] = sales - costOfSales
    })

    console.log('grossProfitMontlyPlanning', grossProfitMonthlyByDate)
    return grossProfitMonthlyByDate
  }

  // gross proft margin monthly
  const calculateMonthlyGrossProfitMargin = (salesRevenueMonths, grossProfitsMonths) => {
    // const groupByDate = salesRevenueMonths^
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

    console.log('## grossProfitMarginByDate:', grossProfitMarginByDate)
    return grossProfitMarginByDate
  }

  // admin and general expense monthly
  const calculateMonthlyAdminAndGeneralExpense = (expenseMonths, employeeExpenseMonths) => {
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

  // operating income monthly
  // gross profit + admin and general expenses
  const calculateMonthlyOperatingIncome = (grossProfitMonths, adminGeneralMonths) => {
    const operatingIncomeMonthlyTotalByDate = {}

    const allDates = new Set([...Object.keys(grossProfitMonths), ...Object.keys(adminGeneralMonths)])

    for (let date of allDates) {
      const grossProfitTotal = grossProfitMonths[date]
      const adminGeneralTotal = adminGeneralMonths[date]

      operatingIncomeMonthlyTotalByDate[date] = grossProfitTotal - adminGeneralTotal
    }
    console.log(
      '## operatingIncomeMonthlyTotalByDate,',
      operatingIncomeMonthlyTotalByDate,
      grossProfitMonths,
      adminGeneralMonths,
    )
    return operatingIncomeMonthlyTotalByDate
  }

  const calculateMonthlyOperatingProfitMargin = (operatingIncomeMonths, salesRevenueMonths) => {
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

  const calculateMonthlyOrdinaryIncome = (
    operatingIncomeMonths, // calculated
    nonOperatingIncomeMonths, // from projects
    nonOperatingExpenseMonths, // from projects.non_operatin
  ) => {
    console.log(
      '## calculateMonthlyOrdinaryIncome ',
      nonOperatingExpenseMonths,
      nonOperatingIncomeMonths,
      operatingIncomeMonths,
    )
    const ordinaryIncomeMonthlyByDate = {}

    const allDates = new Set([
      ...Object.keys(nonOperatingExpenseMonths),
      ...Object.keys(nonOperatingIncomeMonths),
      ...Object.keys(operatingIncomeMonths),
    ])

    console.log('## all dates', allDates)
    for (let date of allDates) {
      ordinaryIncomeMonthlyByDate[date] =
        (operatingIncomeMonths[date] + nonOperatingIncomeMonths[date]) - nonOperatingExpenseMonths[date]
    }
        console.log('### ordinaryIncomeMonthlyByDate', ordinaryIncomeMonthlyByDate)

    return ordinaryIncomeMonthlyByDate
  }

  // variables
  const reformattedSalesRevenue = reformattedSalesRevenueMonthlyValue(state.project.salesRevenueMonthly)
  const reformattedCostOfSalesTotals = reformattedMonthlyValues(state.costOfSale.costOfSaleMonthlyTotalsByDate)
  const reformattedExpensesMonthlyTotals = reformattedMonthlyValues(state.expenses.expensesMonthlyTotalsByDate)
  const reformattedEmployeeExpensesMonthlyTotals = reformattedMonthlyValues(
    state.employeeExpense.employeeExpensesMonthlyTotalsByDate,
  )
  const reformattedNonOperatingIncomeMonthlyTotals = reformattedOperatingMonthlyValue(
    state.project.nonOperatingIncomeMonthly
  )
  console.log('## reformattedNonOperatingIncomeMonthlyTotals', reformattedNonOperatingIncomeMonthlyTotals)
  const reformattedNonOperatingExpenseMonthlyTotals = reformattedOperatingMonthlyValue(
    state.project.nonOperatingExpenseMonthly
  )

  const grossProfitMonthlyPlanning = calculateMonthlyGrossProfit(reformattedCostOfSalesTotals, reformattedSalesRevenue)
  const dates = activeDatesOnGraph(reformattedCostOfSalesTotals, reformattedSalesRevenue)
  const grossProfitMarginMonthly = calculateMonthlyGrossProfitMargin(
    reformattedSalesRevenue,
    grossProfitMonthlyPlanning,
  )

  const reformattedAdminAndGeneralMonthlyTotalsByDate = calculateMonthlyAdminAndGeneralExpense(
    reformattedExpensesMonthlyTotals,
    reformattedEmployeeExpensesMonthlyTotals,
  )
  const reformattedOperatingIncomeMonthlyTotalByDate = calculateMonthlyOperatingIncome(
    grossProfitMonthlyPlanning,
    reformattedAdminAndGeneralMonthlyTotalsByDate,
  )
  const operatingProfitMarginMonthly = calculateMonthlyOperatingProfitMargin(
    reformattedOperatingIncomeMonthlyTotalByDate,
    reformattedSalesRevenue,
  )

  //ordinary
  const reformattedOrdinaryIncomeMonthly = calculateMonthlyOrdinaryIncome(
    reformattedOperatingIncomeMonthlyTotalByDate,
    reformattedNonOperatingIncomeMonthlyTotals,
    reformattedNonOperatingExpenseMonthlyTotals,
  )

  const planningMonthly = {
    projectSalesRevenueMonthlyPlanning: reformattedSalesRevenue,
    costOfSalesTotalMonthlyPlanning: reformattedCostOfSalesTotals,
    grossProfitMontlyPlanning: grossProfitMonthlyPlanning,
    grossProfitMarginMonthlyPlanning: grossProfitMarginMonthly,
    dates: dates,
    //working on
    expensesMonthlyPlanning: reformattedExpensesMonthlyTotals,
    employeeExpenseMonthlyPlanning: reformattedEmployeeExpensesMonthlyTotals,
    adminAndGeneralExpenseMonthlyPlanning: reformattedAdminAndGeneralMonthlyTotalsByDate,
    operatingIncomeMonthlyPlanning: reformattedOperatingIncomeMonthlyTotalByDate,
    operatingProfitMarginMonthly: operatingProfitMarginMonthly,
    ordinaryIncomeMonthlyPlanning: reformattedOrdinaryIncomeMonthly,
  }

  return { planningMonthly }
})

const newGraphSlice = createSlice({
  name: 'newGraph',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
      builder
      .addCase(fetchNewGraphData.pending, (state) => {
        state.isLoading = true
    })
    .addCase(fetchNewGraphData.fulfilled, (state, action) => {
        
        state.isLoading = false
        // // Object.assign(state.planningMonthly, action.payload.planningMonthly)  

        // state.planningMonthly = {
        //   ...action.payload.planningMonthly,
        // }
        state.planningMonthly.projectSalesRevenueMonthlyPlanning =
            action.payload.planningMonthly.projectSalesRevenueMonthlyPlanning
        state.planningMonthly.costOfSalesTotalMonthlyPlanning =
            action.payload.planningMonthly.costOfSalesTotalMonthlyPlanning
        state.planningMonthly.grossProfitMonthlyPlanning = 
            action.payload.planningMonthly.grossProfitMontlyPlanning
        state.planningMonthly.dates = action.payload.planningMonthly.dates
        state.planningMonthly.grossProfitMarginMonthlyPlanning = action.payload.planningMonthly.grossProfitMarginMonthlyPlanning
        state.planningMonthly.expensesMonthlyPlanning = action.payload.planningMonthly.expensesMonthlyPlanning
        state.planningMonthly.employeeExpensesMonthlyPlanning = action.payload.planningMonthly.employeeExpenseMonthlyPlanning
        state.planningMonthly.adminAndGeneralExpenseMonthlyPlanning = action.payload.planningMonthly.adminAndGeneralExpenseMonthlyPlanning
        state.planningMonthly.operatingIncomeMonthlyPlanning = action.payload.planningMonthly.operatingIncomeMonthlyPlanning
      state.planningMonthly.operatingProfitMarginMonthlyPlanning = action.payload.planningMonthly.operatingProfitMarginMonthly
      state.planningMonthly.ordinaryIncomeMonthlyPlanning = action.payload.planningMonthly.ordinaryIncomeMonthlyPlanning
      })
      .addCase(fetchNewGraphData.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const selectNewGraphValues = (state: RootState) => state.newGraph

export default newGraphSlice.reducer