import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { aggregatedCostOfSalesFunction, costOfSalesTotalsFunction, monthlyTotalsCostOfSalesFunction } from "../../utils/tableAggregationUtil";
import { sumValues } from "../../utils/helperFunctionsUtil";

// PLANNING

export const costOfSalesList =createSelector([(state:RootState) => state.costOfSale.list], (list)=> list)

export const costOfSalesTotals = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  return costOfSalesTotalsFunction(aggregatedCostOfSalesData)
})

export const costOfSalesYearlyTotals = createSelector([costOfSalesTotals], (totals) => sumValues(totals))

export const costOfSalesSelectMonthlyTotalsByDate = createSelector([costOfSalesList], (list) =>
  monthlyTotalsCostOfSalesFunction(list),
)

export const costOfSalesCategoryTotals = createSelector([costOfSalesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return costOfSalesTotalsFunction(list, true)
})

// **New Memoized Selector for costOfSalesPlanning**
export const costOfSalesPlanningSelector = createSelector(
  [
    costOfSalesList, 
    costOfSalesTotals, 
    costOfSalesSelectMonthlyTotalsByDate, 
    costOfSalesYearlyTotals, 
    costOfSalesCategoryTotals
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
  })
);