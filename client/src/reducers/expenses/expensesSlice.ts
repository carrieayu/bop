import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { aggregatedExpensesFunction, expensesTotalsFunction } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'

const initialState = {
  isLoading: false,
  expenseList: [] as ExpenseEntity[],
  expenseTotals: [],
  expensesYearTotal: 0 || '0',
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<ExpenseEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<ExpenseEntity[]>(`${getReactActiveEndpoint()}/api/expenses/list/`)

      if (response.data && response.data.length > 0) {
          console.log('expense slice',response.data)
          return response.data
      } else {
        console.log(`Attempt ${attempt}: Data is empty, retrying in 5 minutes...`)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching data -`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
  }
  throw new Error('Failed to fetch data after maximum retries.')
}

export const fetchExpense = createAsyncThunk('expense/fetch', async () => {
  return await fetchWithPolling()
})

const expense = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    getExpenseTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.expenseList)
      state.expenseTotals = expensesTotalsFunction(aggregatedExpensesData)
      state.expensesYearTotal = sumValues(state.expenseTotals)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.expenseList = action.payload
        state.isLoading = false
      })
      .addCase(fetchExpense.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchExpense.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getExpenseTotals } = expense.actions

export default expense.reducer
