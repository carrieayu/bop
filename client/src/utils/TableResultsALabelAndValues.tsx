import { cumulativeSum, organiseTotals } from './helperFunctionsUtil'

export const resultsTableALabelsAndValues = (results, resultsCalculations) => { 
    // RESULTS TABLE DATA
    const cumulativeOrdinaryIncomeResultsValues = cumulativeSum(resultsCalculations.ordinaryIncome.monthlyTotals)

    const labelsAndValuesResults = [
        // Sales Revenue Section
        { label: 'salesRevenue', values: results.projects.monthlyTotals.salesRevenue },
        { label: 'sales', values: results.projects.monthlyTotals.salesRevenue },
        // Cost of Sales Section
        { label: 'costOfSales', values: results.costOfSales.monthlyTotals },
        { label: 'purchases', values: results.costOfSales.individualMonthlyTotals.purchase },
        { label: 'outsourcingExpenses', values: results.costOfSales.individualMonthlyTotals.outsourcingExpense },
        { label: 'productPurchases', values: results.costOfSales.individualMonthlyTotals.productPurchase },
        { label: 'dispatchLaborExpenses', values: results.costOfSales.individualMonthlyTotals.dispatchLaborExpense },
        { label: 'communicationExpenses', values: results.costOfSales.individualMonthlyTotals.communicationExpense },
        { label: 'workInProgressExpenses', values: results.costOfSales.individualMonthlyTotals.workInProgressExpense },
        { label: 'amortizationExpenses', values: results.costOfSales.individualMonthlyTotals.amortizationExpense },
        // Gross Profit
        { label: 'grossProfit', values: resultsCalculations.grossProfit.monthlyTotals },
        // Employee Expense Section
        { label: 'employeeExpenses', values: results.employeeExpenses.monthlyTotals },
        {
        label: 'executiveRemuneration',
        values: results.employeeExpenses.individualMonthlyTotals.executiveRemuneration,
        },
        { label: 'salary', values: results.employeeExpenses.individualMonthlyTotals.salary },
        { label: 'bonusAndFuelAllowance', values: results.employeeExpenses.individualMonthlyTotals.bonusAndFuel },
        { label: 'statutoryWelfareExpenses', values: results.employeeExpenses.individualMonthlyTotals.statutoryWelfare },
        { label: 'welfareExpenses', values: results.employeeExpenses.individualMonthlyTotals.welfare },
        { label: 'insurancePremiums', values: results.employeeExpenses.individualMonthlyTotals.insurancePremium },
        // Expenses section
        { label: 'expenses', values: results.expenses.monthlyTotals },
        { label: 'consumableExpenses', values: results.expenses.individualMonthlyTotals.consumable },
        { label: 'rentExpenses', values: results.expenses.individualMonthlyTotals.rent },
        { label: 'taxesAndPublicCharges', values: results.expenses.individualMonthlyTotals.taxesPublicCharges },
        { label: 'depreciationExpenses', values: results.expenses.individualMonthlyTotals.depreciationExpense },
        { label: 'travelExpenses', values: results.expenses.individualMonthlyTotals.travelExpense },
        { label: 'communicationExpenses', values: results.expenses.individualMonthlyTotals.communicationExpense },
        { label: 'utilitiesExpenses', values: results.expenses.individualMonthlyTotals.utilities },
        { label: 'transactionFees', values: results.expenses.individualMonthlyTotals.transactionFee },
        { label: 'advertisingExpenses', values: results.expenses.individualMonthlyTotals.advertisingExpense },
        { label: 'entertainmentExpenses', values: results.expenses.individualMonthlyTotals.entertainmentExpense },
        { label: 'professionalServicesFees', values: results.expenses.individualMonthlyTotals.professionalServiceFee },
        // Selling and General Admin Expenses
        {
        label: 'sellingAndGeneralAdminExpenses',
        values: resultsCalculations.sellingAndGeneralAdmin.monthlyTotals,
        },
        // Operating Income Section
        { label: 'operatingIncome', values: resultsCalculations.operatingIncome.monthlyTotals },

        { label: 'nonOperatingIncome', values: results.projects.monthlyTotals.nonOperatingIncome },
        { label: 'nonOperatingExpenses', values: results.projects.monthlyTotals.nonOperatingExpense },
        // Ordinary Income Section
        { label: 'ordinaryIncome', values: resultsCalculations.ordinaryIncome.monthlyTotals },
        { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeResultsValues },
    ]

    return labelsAndValuesResults.map((item) => ({
        label: item.label,
        values: organiseTotals(item.values, item.label), // planningData is included to calculate sales ratio
    }))
}