import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { aggregatedExpensesFunction, expensesTotalsFunction, monthlyTotalsExpensesFunction } from '../../utils/tableAggregationUtil'
import { fetchWithPolling, sumValues } from '../../utils/helperFunctionsUtil'
import { ExpenseResultEntity } from '../../entity/expenseResultEntity'
import { RootState } from '../../app/store'

const initialState = {
  isLoading: false,
  expenseResultList: [] as ExpenseResultEntity[],
  expenseResultTotals: [],
  expenseResultYearTotal: 0 || '0',
  expensesResultMonthlyTotalsByDate: []
}

export const fetchExpenseResult = createAsyncThunk('expense-results/fetch', async () => {
  return await fetchWithPolling<ExpenseResultEntity[]>('expenses-results/list/')
})

const expenseResults = createSlice({
  name: 'expenseResults',
  initialState,
  reducers: {
    getExpenseResultsTotals: (state) => {
      const aggregatedExpensesData = aggregatedExpensesFunction(state.expenseResultList)
      state.expenseResultTotals = expensesTotalsFunction(aggregatedExpensesData)
      state.expenseResultYearTotal = sumValues(state.expenseResultTotals)
      state.expensesResultMonthlyTotalsByDate = monthlyTotalsExpensesFunction(state.expenseResultList)

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

export const expenseTotalYearResult = (state: RootState) => state.expensesResults.expenseResultYearTotal

export default expenseResults.reducer
