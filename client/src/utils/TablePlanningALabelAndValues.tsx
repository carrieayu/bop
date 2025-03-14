import { cumulativeSum, organiseTotals } from './helperFunctionsUtil'

export const planningTableALabelsAndValues = (planning, planningCalculations) => {

        // --- PLANNING TABLE DATA ---
        const cumulativeOrdinaryIncomeValues = cumulativeSum(planningCalculations.ordinaryIncome.monthlyTotals)

        const labelsAndValues = [
            // Sales revenue section
            { label: 'salesRevenue', values: planning.projects.monthlyTotals.salesRevenue },
            { label: 'sales', values: planning.projects.monthlyTotals.salesRevenue },
            // Cost of sales section
            { label: 'costOfSales', values: planning.costOfSales.monthlyTotals },
            { label: 'purchases', values: planning.costOfSales.individualMonthlyTotals.purchase },
            { label: 'outsourcingExpenses', values: planning.costOfSales.individualMonthlyTotals.outsourcingExpense },
            { label: 'productPurchases', values: planning.costOfSales.individualMonthlyTotals.productPurchase },
            { label: 'dispatchLaborExpenses', values: planning.costOfSales.individualMonthlyTotals.dispatchLaborExpense },
            { label: 'communicationExpenses', values: planning.costOfSales.individualMonthlyTotals.communicationExpense },
            { label: 'workInProgressExpenses', values: planning.costOfSales.individualMonthlyTotals.workInProgressExpense },
            { label: 'amortizationExpenses', values: planning.costOfSales.individualMonthlyTotals.amortizationExpense },
            // Gross profit
            { label: 'grossProfit', values: planningCalculations.grossProfit.monthlyTotals },
            // Employee expense section
            { label: 'employeeExpenses', values: planning.employeeExpenses.monthlyTotals },
            {
                label: 'executiveRemuneration',
                values: planning.employeeExpenses.individualMonthlyTotals.executiveRemuneration,
            },
            { label: 'salary', values: planning.employeeExpenses.individualMonthlyTotals.salary },
            { label: 'bonusAndFuelAllowance', values: planning.employeeExpenses.individualMonthlyTotals.bonusAndFuel },
            { label: 'statutoryWelfareExpenses', values: planning.employeeExpenses.individualMonthlyTotals.statutoryWelfare },
            { label: 'welfareExpenses', values: planning.employeeExpenses.individualMonthlyTotals.welfare },
            { label: 'insurancePremiums', values: planning.employeeExpenses.individualMonthlyTotals.insurancePremium },
            // Expenses section
            { label: 'expenses', values: planning.expenses.monthlyTotals },
            { label: 'consumableExpenses', values: planning.expenses.individualMonthlyTotals.consumable },
            { label: 'rentExpenses', values: planning.expenses.individualMonthlyTotals.rent },
            { label: 'taxesAndPublicCharges', values: planning.expenses.individualMonthlyTotals.taxesPublicCharges },
            { label: 'depreciationExpenses', values: planning.expenses.individualMonthlyTotals.depreciationExpense },
            { label: 'travelExpenses', values: planning.expenses.individualMonthlyTotals.travelExpense },
            { label: 'communicationExpenses', values: planning.expenses.individualMonthlyTotals.communicationExpense },
            { label: 'utilitiesExpenses', values: planning.expenses.individualMonthlyTotals.utilities },
            { label: 'transactionFees', values: planning.expenses.individualMonthlyTotals.transactionFee },
            { label: 'advertisingExpenses', values: planning.expenses.individualMonthlyTotals.advertisingExpense },
            { label: 'entertainmentExpenses', values: planning.expenses.individualMonthlyTotals.entertainmentExpense },
            { label: 'professionalServicesFees', values: planning.expenses.individualMonthlyTotals.professionalServiceFee },
            // Selling and general admin expenses
            {
                label: 'sellingAndGeneralAdminExpensesShort',
                values: planningCalculations.sellingAndGeneralAdmin.monthlyTotals,
            },
            // Operating income section
            { label: 'operatingIncome', values: planningCalculations.operatingIncome.monthlyTotals },
            { label: 'nonOperatingIncome', values: planning.projects.monthlyTotals.nonOperatingIncome },
            { label: 'nonOperatingExpenses', values: planning.projects.monthlyTotals.nonOperatingExpense },
            // Ordinary Income Section
            { label: 'ordinaryIncome', values: planningCalculations.ordinaryIncome.monthlyTotals },
            { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
        ]

        return  labelsAndValues.map((item) => ({
            label: item.label,
            values: organiseTotals(item.values, item.label),
        }))

}