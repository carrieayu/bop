import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/api'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { aggregatedExpensesFunction, expensesTotalsFunction } from '../../utils/tableAggregationUtil'
import { sumValues } from '../../utils/helperFunctionsUtil'
import { ExpenseResultEntity } from '../../entity/expenseResultEntity'

const initialState = {
  isLoading: false,
  expenseResultList: [] as ExpenseResultEntity[],
  expenseResultTotals: [],
  expenseResultYearTotal: 0 || '0',
}
const POLLING_INTERVAL = 60000
const MAX_RETRIES = 12

async function fetchWithPolling(retries = MAX_RETRIES): Promise<ExpenseResultEntity[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await api.get<ExpenseResultEntity[]>(`${getReactActiveEndpoint()}/api/expenses-results/list/`)

      if (response.data && response.data.length > 0) {
        console.log('expense results slice', response.data)
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

export const fetchExpenseResult = createAsyncThunk('expense-results/fetch', async () => {
  return await fetchWithPolling()
})

const expenseResults = createSlice({
  name: 'expenseResults',
  initialState,
  reducers: {
    getExpenseResultsTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.expenseResultList)
      state.expenseResultTotals = expensesTotalsFunction(aggregatedExpensesData)
      state.expenseResultYearTotal = sumValues(state.expenseResultTotals)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExpenseResult.fulfilled, (state, action) => {
        state.expenseResultList = action.payload
        state.isLoading = false
      })
      .addCase(fetchExpenseResult.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchExpenseResult.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const { getExpenseResultsTotals } = expenseResults.actions

export default expenseResults.reducer
