
// Calculate and store Totals State.

import { createSlice } from '@reduxjs/toolkit'
import { fetchCos } from '../costOfSale/costOfSaleSlice'
import { CostOfSaleEntity } from '../../entity/cosEntity'
import { ExpenseEntity } from '../../entity/expenseEntity'
import { ProjectEntity } from '../../entity/projectEntity'
import CostOfSalesList from '../../pages/CostOfSales/CostOfSalesListAndEdit'
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction } from '../../utils/tableAggregationUtil'

const initialState = {
  isLoading: false,
  costOfSalesTotals: [],
  expensesList: [] as ExpenseEntity[],
  costOfSalesList: [] as CostOfSaleEntity[],
  projectsList: [] as ProjectEntity[],

  // planningGrossProfit: 0,
  // resultsGrossProfit: 0,
}

// const costOfSalesTotals = aggregatedCostOfSalesFunction(CostOfSalesList)
// console.log('costOfSalesTotals',costOfSalesTotals)

const planningAndResultTotalsSlice = createSlice({
  name: 'totals',
  initialState,
  reducers: {
    calculateCostOfSalesTotals: (state) => {
      const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(state.costOfSalesList)
      state.costOfSalesTotals = costOfSalesTotalsFunction(aggregatedCostOfSalesData)
      console.log('state.costOfSalesTotals', state.costOfSalesTotals)
    },
    // calculatePlanningGrossProfit: (state) => 
  },
})

export const { calculateCostOfSalesTotals } = planningAndResultTotalsSlice.actions

export default planningAndResultTotalsSlice.reducer