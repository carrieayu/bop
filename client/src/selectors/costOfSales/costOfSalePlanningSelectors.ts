import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import {
  aggregatedCostOfSalesFunction,
  getCostOfSalesMonthlyTotals,
  mapValue,
  getGraphDataForCostOfSales,
} from '../../utils/tableAggregationUtil'
import { sumValues } from "../../utils/helperFunctionsUtil";
import { fields } from "../../utils/inputFieldConfigurations";

// PLANNING

export const costOfSalesList =createSelector([(state:RootState) => state.costOfSale.list], (list)=> list.map((item) => ({...item})))

export const costOfSalesTotals = createSelector([costOfSalesList], (list) => {
  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  return getCostOfSalesMonthlyTotals(aggregatedCostOfSalesData)
})

export const costOfSalesYearlyTotals = createSelector([costOfSalesTotals], (totals) => sumValues(totals))

export const costOfSalesSelectMonthlyTotalsByDate = createSelector([costOfSalesList], (list) =>
  getGraphDataForCostOfSales(list),
)

export const costOfSalesCategoryTotals = createSelector([costOfSalesList], (list) => {
  // Second Param (true). This means detailed response = true (gives individual item totals)
  return getCostOfSalesMonthlyTotals(list, true)
})

export const costOfSalesSelectMonthlyTotalsByCategory = createSelector([costOfSalesList], (list) => {
  const costOfSalesFinancialFields = fields.costOfSales.filter((item) => item.isFinancial === true)

  const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(list)
  
  const monthlyTotals = costOfSalesFinancialFields.reduce((acc, item) => {
    acc[item.fieldName] = mapValue(item.field, aggregatedCostOfSalesData)
    return acc
  }, {})

  return monthlyTotals
})

// **New Memoized Selector for costOfSalesPlanning**
export const costOfSalesPlanningSelector = createSelector(
  [
    costOfSalesList,
    costOfSalesTotals,
    costOfSalesSelectMonthlyTotalsByDate,
    costOfSalesYearlyTotals,
    costOfSalesCategoryTotals,
    costOfSalesSelectMonthlyTotalsByCategory,
  ],
  (list, totals, monthlyTotalsByDate, yearlyTotal, categories, individualMonthlyTotals) => ({
    list,
    monthlyTotals: totals,
    monthlyTotalsByDate,
    yearlyTotal,
    categories,
    individualMonthlyTotals,
  }),
)


