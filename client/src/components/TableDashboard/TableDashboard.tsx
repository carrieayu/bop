import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { token, months, monthNames } from '../../constants'
import { getPlanningAndResultsData } from '../../api/DashboardEndpoint/GetPlanningAndResultsTablesA'
import { organiseTotals, sumValues } from '../../utils/helperFunctionsUtil'
import { translate } from '../../utils/translationUtil'
import {
  aggregatedCostOfSalesFunction,
  aggregatedExpensesFunction,
  aggregatedEmployeeExpensesFunction,
  aggregatedProjectsFunction,
  costOfSalesTotalsFunction,
  expensesTotalsFunction,
  employeeExpensesTotalsFunction,
  grossProfitFunction,
  sellingAndGeneralAdminExpenseFunction,
  operatingIncomeFunction,
  ordinaryProfitFunction,
  mapValue,
} from '../../utils/tableAggregationUtil'

interface TableDashboardProps {
  isThousandYenChecked: boolean
}

const TableDashboard: React.FC<TableDashboardProps> = ({ isThousandYenChecked }) => {
  const [planningData, setPlanningData] = useState([])
  const [salesRatios, setSalesRatios] = useState([]) // Add this state
  const [resultsData, setResultsData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    getPlanningAndResultsData(token)
      .then((response) => {
        // --- PLANNING TABLE DATA ---

        // PLANNING:COST OF SALES
        const aggregatedCostOfSalesData = aggregatedCostOfSalesFunction(response.planning_data.cost_of_sales)
        // PLANNING:EXPENSES
        const aggregatedExpensesData = aggregatedExpensesFunction(response.planning_data.expenses)
        // PLANNING:EMPLOYEE EXPENSES
        const aggregatedEmployeeExpensesData = aggregatedEmployeeExpensesFunction(
          response.planning_data.employee_expenses,
        )
        // PLANNING:PROJECTS
        const aggregatedProjectsData = aggregatedProjectsFunction(response.planning_data.projects)

        // PLANNING:SALES REVENUE
        const salesRevenueValues = mapValue('sales_revenue', aggregatedProjectsData)
        console.log('salesValues', salesRevenueValues, 'aggregatedProjectsData', aggregatedProjectsData)

        // PLANNING: COST OF SALES TOTALS VALUES
        const costOfSalesValues = costOfSalesTotalsFunction(aggregatedCostOfSalesData)

        const purchaseValues = mapValue('purchase', aggregatedCostOfSalesData)
        const outsourcingExpenseValues = mapValue('outsourcing_expense', aggregatedCostOfSalesData)
        const productPurchaseValues = mapValue('product_purchase', aggregatedCostOfSalesData)
        const dispatchLaborExpenseValues = mapValue('dispatch_labor_expense', aggregatedCostOfSalesData)
        const communicationCostValues = mapValue('communication_expense', aggregatedCostOfSalesData)
        const workInProgressExpenseValues = mapValue('work_in_progress_expense', aggregatedCostOfSalesData)
        const amortizationExpenseValues = mapValue('amortization_expense', aggregatedCostOfSalesData)

        // PLANNING:GROSS PROFIT
        const grossProfitValues = grossProfitFunction(salesRevenueValues, costOfSalesValues)

        // PLANNING:EMPLOYEE EXPENSE

        const employeeExpenseExecutiveRemunerationValues = mapValue(
          'totalExecutiveRemuneration',
          aggregatedEmployeeExpensesData,
        )
        const employeeExpenseSalaryValues = mapValue('totalSalary', aggregatedEmployeeExpensesData)
        const employeeExpenseBonusAndFuelAllowanceValues = mapValue('totalBonusAndFuel', aggregatedEmployeeExpensesData)
        const employeeExpenseStatutoryWelfareExpenseValues = mapValue(
          'totalStatutoryWelfare',
          aggregatedEmployeeExpensesData,
        )
        const employeeExpenseWelfareExpenseValues = mapValue('totalWelfare', aggregatedEmployeeExpensesData)
        const employeeExpenseInsurancePremiumValues = mapValue('totalInsurancePremium', aggregatedEmployeeExpensesData)

        // PLANNING:EMPLOYEE EXPENSE TOTALS
        const employeeExpenseValues = employeeExpensesTotalsFunction(aggregatedEmployeeExpensesData)

        // PLANNING:EXPENSES
        const expenseValues = expensesTotalsFunction(aggregatedExpensesData)

        const consumableValues = mapValue('consumable_expense', aggregatedExpensesData)
        const rentValues = mapValue('rent_expense', aggregatedExpensesData)
        const taxesPublicChargesValues = mapValue('tax_and_public_charge', aggregatedExpensesData)
        const depreciationExpenseValues = mapValue('depreciation_expense', aggregatedExpensesData)
        const travelExpenseValues = mapValue('travel_expense', aggregatedExpensesData)
        const communicationExpenseValues = mapValue('communication_expense', aggregatedExpensesData)
        const utilitiesValues = mapValue('utilities_expense', aggregatedExpensesData)
        const transactionFeeValues = mapValue('transaction_fee', aggregatedExpensesData)
        const advertisingExpenseValues = mapValue('advertising_expense', aggregatedExpensesData)
        const entertainmentExpenseValues = mapValue('entertainment_expense', aggregatedExpensesData)
        const professionalServiceFeeValues = mapValue('professional_service_fee', aggregatedExpensesData)

        // PLANNING:SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseValues = sellingAndGeneralAdminExpenseFunction(
          employeeExpenseValues,
          expenseValues,
        )

        // PLANNING:OPERATING INCOME
        const operatingIncomeValues = operatingIncomeFunction(grossProfitValues, sellingAndGeneralAdminExpenseValues)

        // Non-Operating Income & Expense
        const nonOperatingIncomeValues = mapValue('non_operating_income', aggregatedProjectsData)
        const nonOperatingExpenseValues = mapValue('non_operating_expense', aggregatedProjectsData)

        // PLANNING:ORDINARY PROFIT
        const ordinaryIncomeValues = ordinaryProfitFunction(
          operatingIncomeValues,
          nonOperatingIncomeValues,
          nonOperatingExpenseValues,
        )

        const cumulativeSum = (arr) => {
          let sum = 0
          return arr.map((value) => (sum += value))
        }
        const cumulativeOrdinaryIncomeValues = cumulativeSum(ordinaryIncomeValues)

        const labelsAndValues = [
          // Sales revenue section
          { label: 'salesRevenue', values: salesRevenueValues },
          { label: 'sales', values: salesRevenueValues },

          // Cost of sales section
          { label: 'costOfSales', values: costOfSalesValues },
          { label: 'purchases', values: purchaseValues },
          { label: 'outsourcingExpenses', values: outsourcingExpenseValues },
          { label: 'productPurchases', values: productPurchaseValues },
          { label: 'dispatchLaborExpenses', values: dispatchLaborExpenseValues },
          { label: 'communicationExpenses', values: communicationCostValues },
          { label: 'workInProgressExpenses', values: workInProgressExpenseValues },
          { label: 'amortizationExpenses', values: amortizationExpenseValues },

          // Gross profit
          { label: 'grossProfit', values: grossProfitValues },

          // Employee expense section
          { label: 'employeeExpenses', values: employeeExpenseValues },
          { label: 'executiveRemuneration', values: employeeExpenseExecutiveRemunerationValues },
          { label: 'salary', values: employeeExpenseSalaryValues },
          { label: 'bonusAndFuelAllowance', values: employeeExpenseBonusAndFuelAllowanceValues },
          { label: 'statutoryWelfareExpenses', values: employeeExpenseStatutoryWelfareExpenseValues },
          { label: 'welfareExpenses', values: employeeExpenseWelfareExpenseValues },
          { label: 'insurancePremiums', values: employeeExpenseInsurancePremiumValues },

          // Expenses section
          { label: 'expenses', values: expenseValues },
          { label: 'consumableExpenses', values: consumableValues },
          { label: 'rentExpenses', values: rentValues },
          { label: 'taxesAndPublicCharges', values: taxesPublicChargesValues },
          { label: 'depreciationExpenses', values: depreciationExpenseValues },
          { label: 'travelExpenses', values: travelExpenseValues },
          { label: 'communicationExpenses', values: communicationExpenseValues },
          { label: 'utilitiesExpenses', values: utilitiesValues },
          { label: 'transactionFees', values: transactionFeeValues },
          { label: 'advertisingExpenses', values: advertisingExpenseValues },
          { label: 'entertainmentExpenses', values: entertainmentExpenseValues },
          { label: 'professionalServicesFees', values: professionalServiceFeeValues },

          // Selling and general admin expenses
          { label: 'sellingAndGeneralAdminExpensesShort', values: sellingAndGeneralAdminExpenseValues },

          // Operating income section
          { label: 'operatingIncome', values: operatingIncomeValues },
          { label: 'nonOperatingIncome', values: nonOperatingIncomeValues },
          { label: 'nonOperatingExpenses', values: nonOperatingExpenseValues },
          { label: 'ordinaryIncome', values: ordinaryIncomeValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
        ]

        const planningData = labelsAndValues.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values),
        }))

        setPlanningData(planningData)

        // --- RESULTS TABLE DATA ---

        // RESULTS:COST OF SALES
        const aggregatedResultsCostOfSalesData = aggregatedCostOfSalesFunction(response.results_data.cost_of_sales)
        // RESULTS:EXPENSES
        const aggregatedResultsExpensesData = aggregatedExpensesFunction(response.results_data.expenses)
        // RESULTS:EMPLOYEE EXPENSES
        const aggregatedResultsEmployeeExpensesData = aggregatedEmployeeExpensesFunction(
          response.results_data.employee_expenses,
        )
        // RESULTS:PROJECTS
        const aggregatedResultsProjectsData = aggregatedProjectsFunction(response.results_data.projects)

        // RESULTS:SALES REVENUE
        const salesRevenueResultsValues = mapValue('sales_revenue', aggregatedResultsProjectsData)

        // RESULTS:COST OF SALES
        const costOfSalesResultsValues = costOfSalesTotalsFunction(aggregatedResultsCostOfSalesData)

        const purchaseResultsValues = mapValue('purchase', aggregatedResultsCostOfSalesData)
        const outsourcingExpenseResultsValues = mapValue('outsourcing_expense', aggregatedResultsCostOfSalesData)
        const productPurchaseResultsValues = mapValue('product_purchase', aggregatedResultsCostOfSalesData)
        const dispatchLaborExpenseResultsValues = mapValue('dispatch_labor_expense', aggregatedResultsCostOfSalesData)
        const communicationCostResultsValues = mapValue('communication_expense', aggregatedResultsCostOfSalesData)
        const workInProgressResultsValues = mapValue('work_in_progress_expense', aggregatedResultsCostOfSalesData)
        const amortizationResultsValues = mapValue('amortization_expense', aggregatedResultsCostOfSalesData)

        // RESULTS:GROSS PROFIT
        const grossProfitResultsValues = grossProfitFunction(salesRevenueResultsValues, costOfSalesResultsValues)

        // RESULTS:EMPLOYEE EXPENSE
        const employeeExpenseExecutiveRemunerationResultsValues = mapValue(
          'totalExecutiveRemuneration',
          aggregatedResultsEmployeeExpensesData,
        )
        const employeeExpenseSalaryResultsValues = mapValue('totalSalary', aggregatedResultsEmployeeExpensesData)
        const employeeExpenseBonusAndFuelAllowanceResultsValues = mapValue(
          'totalBonusAndFuel',
          aggregatedResultsEmployeeExpensesData,
        )
        const employeeExpenseStatutoryWelfareExpenseResultsValues = mapValue(
          'totalStatutoryWelfare',
          aggregatedResultsEmployeeExpensesData,
        )
        const employeeExpenseWelfareExpenseResultsValues = mapValue(
          'totalWelfare',
          aggregatedResultsEmployeeExpensesData,
        )
        const employeeExpenseInsurancePremiumResultsValues = mapValue(
          'totalInsurancePremium',
          aggregatedResultsEmployeeExpensesData,
        )

        // RESULTS:EMPLOYEE EXPENSE TOTALS
        const employeeExpensesResultsValues = employeeExpensesTotalsFunction(aggregatedResultsEmployeeExpensesData)

        // RESULTS:EXPENSES
        const expenseResultsValues = expensesTotalsFunction(aggregatedResultsExpensesData)

        const consumableResultsValues = mapValue('consumable_expense', aggregatedResultsExpensesData)
        const rentResultsValues = mapValue('rent_expense', aggregatedResultsExpensesData)
        const taxesPublicChargesResultsValues = mapValue('tax_and_public_charge', aggregatedResultsExpensesData)
        const depreciationExpensesResultsValues = mapValue('depreciation_expense', aggregatedResultsExpensesData)
        const travelExpenseResultsValues = mapValue('travel_expense', aggregatedResultsExpensesData)
        const communicationExpenseResultsValues = mapValue('communication_expense', aggregatedResultsExpensesData)
        const utilitiesResultsValues = mapValue('utilities_expense', aggregatedResultsExpensesData)
        const transactionFeeResultsValues = mapValue('transaction_fee', aggregatedResultsExpensesData)
        const advertisingExpenseResultsValues = mapValue('advertising_expense', aggregatedResultsExpensesData)
        const entertainmentExpenseResultsValues = mapValue('entertainment_expense', aggregatedResultsExpensesData)
        const professionalServiceFeeResultsValues = mapValue('professional_service_fee', aggregatedResultsExpensesData)

        // RESULTS:SELLING AND GENERAL ADMIN EXPENSES
        const sellingAndGeneralAdminExpenseResultsValues = sellingAndGeneralAdminExpenseFunction(
          employeeExpensesResultsValues,
          expenseResultsValues,
        )

        // RESULTS:OPERATING INCOME
        const operatingIncomeResultsValues = operatingIncomeFunction(
          grossProfitResultsValues,
          sellingAndGeneralAdminExpenseResultsValues,
        )

        //Non-Operating Income & Expense
        const nonOperatingIncomeResultsValues = mapValue('non_operating_income', aggregatedProjectsData)
        const nonOperatingExpensesResultsValues = mapValue('non_operating_expense', aggregatedProjectsData)

        // RESULTS:ORDINARY PROFIT
        const ordinaryIncomeResultsValues = ordinaryProfitFunction(
          operatingIncomeResultsValues,
          nonOperatingIncomeResultsValues,
          nonOperatingExpensesResultsValues,
        )

        const cumulativeSumResults = (arr) => {
          let sum = 0
          return arr.map((value) => (sum += value))
        }
        const cumulativeOrdinaryIncomeResultsValues = cumulativeSum(ordinaryIncomeResultsValues)

        const labelsAndValuesResults = [
          // Sales revenue section
          { label: 'salesRevenue', values: salesRevenueResultsValues },
          { label: 'sales', values: salesRevenueResultsValues },

          // Cost of sales section
          { label: 'costOfSales', values: costOfSalesResultsValues },
          { label: 'purchases', values: purchaseResultsValues },
          { label: 'outsourcingExpenses', values: outsourcingExpenseResultsValues },
          { label: 'productPurchases', values: productPurchaseResultsValues },
          { label: 'dispatchLaborExpenses', values: dispatchLaborExpenseResultsValues },
          { label: 'communicationExpenses', values: communicationCostResultsValues },
          { label: 'workInProgressExpenses', values: workInProgressResultsValues },
          { label: 'amortizationExpenses', values: amortizationResultsValues },

          // Gross profit
          { label: 'grossProfit', values: grossProfitResultsValues },

          // Employee expense section
          { label: 'employeeExpenses', values: employeeExpensesResultsValues },
          { label: 'executiveRemuneration', values: employeeExpenseExecutiveRemunerationResultsValues },
          { label: 'salary', values: employeeExpenseSalaryResultsValues },
          { label: 'bonusAndFuelAllowance', values: employeeExpenseBonusAndFuelAllowanceResultsValues },
          { label: 'statutoryWelfareExpenses', values: employeeExpenseStatutoryWelfareExpenseResultsValues },
          { label: 'welfareExpenses', values: employeeExpenseWelfareExpenseResultsValues },
          { label: 'insurancePremiums', values: employeeExpenseInsurancePremiumResultsValues },

          // Expenses section
          { label: 'expenses', values: expenseResultsValues },
          { label: 'consumableExpenses', values: consumableResultsValues },
          { label: 'rentExpenses', values: rentResultsValues },
          { label: 'taxesAndPublicCharges', values: taxesPublicChargesResultsValues },
          { label: 'depreciationExpenses', values: depreciationExpensesResultsValues },
          { label: 'travelExpenses', values: travelExpenseResultsValues },
          { label: 'communicationExpenses', values: communicationExpenseResultsValues },
          { label: 'utilitiesExpenses', values: utilitiesResultsValues },
          { label: 'transactionFees', values: transactionFeeResultsValues },
          { label: 'advertisingExpenses', values: advertisingExpenseResultsValues },
          { label: 'entertainmentExpenses', values: entertainmentExpenseResultsValues },
          { label: 'professionalServicesFees', values: professionalServiceFeeResultsValues },

          // Selling and general admin expenses
          {
            label: 'sellingAndGeneralAdminExpenses',
            values: sellingAndGeneralAdminExpenseResultsValues,
          },

          // Operating income section
          { label: 'operatingIncome', values: operatingIncomeResultsValues },
          { label: 'nonOperatingIncome', values: nonOperatingIncomeResultsValues },
          { label: 'nonOperatingExpenses', values: nonOperatingExpensesResultsValues },
          { label: 'ordinaryIncome', values: ordinaryIncomeResultsValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeResultsValues },
        ]

        const results = labelsAndValuesResults.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values), // planningData is included to calculate sales ratio
        }))

        setResultsData(results)
        console.log('resultsData after set:', results) // Confirm data is set
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  // SALES RATIO (COMPARING RESULTS AND PLANNING)
  const getTotalsOnlyArr = (dataArr) => dataArr.map((item) => item.values[item.values.length - 1])

  let planningTotalsOnlyArr
  let resultsTotalsOnlyArr

  useEffect(() => {
    planningTotalsOnlyArr = getTotalsOnlyArr(planningData)
    resultsTotalsOnlyArr = getTotalsOnlyArr(resultsData)
    console.log('planningTotalsOnlyArr', planningTotalsOnlyArr, 'data',planningData, 'resultsTotalsOnlyArr', resultsTotalsOnlyArr)
    if (planningTotalsOnlyArr.length && resultsTotalsOnlyArr.length) {
      const saleRatio = getSalesRatios(planningTotalsOnlyArr, resultsTotalsOnlyArr)
    }

    const saleRatioArr = getSalesRatios(planningTotalsOnlyArr, resultsTotalsOnlyArr)
    setSalesRatios(saleRatioArr)
  }, [resultsData]) // Runs whenever data updates

  const getSalesRatios = (planningArr, resultsArr) => {
    return resultsArr.map((resultTotalValue, i) => {
      const planningTotalValue = planningArr[i]
      // Prevent division by zero
      const salesRatio = planningTotalValue !== 0 ? (resultTotalValue / planningTotalValue) * 100 : 0
      return salesRatio.toFixed(2) // Optional: round to 2 decimal places
    })
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])


  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const noIndentLabels = [
    'salesRevenue',
    'costOfSales',
    'grossProfit',
    'employeeExpenses',
    'expenses',
    'sellingAndGeneralAdminExpensesShort', // Just a shorter version for English Language Mode
    'operatingIncome',
    'ordinaryIncome',
    'cumulativeOrdinaryIncome',
  ]

  const halfYears = ['firstHalftotal', 'secondHalftotal', 'totalTable']

  return (
    <div className='table-planning-container editScrollable'>
      <div className='table-planning'>
        <table>
          <thead>
            <tr className='main-header dashboard-sticky dashboard-first-row'>
              <th className='border-sides-shadow sticky'>{translate('item', language)}</th>
              {months.map((month, index) => (
                <>
                  <th
                    key={`month-planning-${index}`}
                    className={`border-right ${month >= 10 || month <= 3 ? 'half-year-second' : 'half-year-first'}`}
                    colSpan={2}
                  >
                    {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                  </th>
                </>
              ))}
              {halfYears.map((halfYear, index) => (
                <>
                  <th key={index} className='totals border-right ' colSpan={2}>
                    {translate(`${halfYear}`, language)}
                  </th>
                </>
              ))}
              <th className='border sales-ratio'>
                {translate(language === 'en' ? 'salesRatioShort' : 'salesRatio', language)}
              </th>
            </tr>
            <tr className='main-header dashboard-scnd-row'>
              <th className='borderless border-sides-shadow sticky'>{''}</th>
              {months.map((month, index) => (
                <>
                  <th key={`planning-${index}`} className='planning-header'>
                    {translate('planning', language)}
                  </th>
                  <th key={`results-${index}`} className='result-header border-right'>
                    {translate('results', language)}
                  </th>
                </>
              ))}
              {halfYears.map((_, index) => (
                <>
                  <th key={index} className='planning-header border'>
                    {translate('planning', language)}
                  </th>
                  <th key={index} className='result-header border-right'>
                    {translate('results', language)}
                  </th>
                </>
              ))}
              <th className='sales-ratio'>{''}</th>
            </tr>
          </thead>
          <tbody>
            {planningData.map((item, index) => (
              <tr style={{}} key={index}>
                <td
                  className={`sticky border-sides-shadow  ${noIndentLabels.includes(item.label) ? (language !== 'en' ? 'no-indent' : 'no-indent-english-mode') : language !== 'en' ? 'indented-label' : 'indented-label-english-mode'}`}
                >
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <>
                    {/* Planning Column */}
                    <td className='month-data planning-cells' key={`planning-${valueIndex}`}>
                      {isThousandYenChecked
                        ? (Math.round((value / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                        : value.toLocaleString()}
                    </td>

                    {/* Results Column - Use resultsData here */}
                    <td className='month-data result-cells' key={`results-${valueIndex}`}>
                      {resultsData[index]?.values[valueIndex] !== undefined // Ensure resultsData exists
                        ? isThousandYenChecked
                          ? (Math.round((resultsData[index].values[valueIndex] / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                          : resultsData[index].values[valueIndex].toLocaleString()
                        : ''}
                    </td>
                  </>
                ))}
                <td className='sale-ratio-cells' colSpan={2}>
                  {salesRatios[index] !== undefined ? `${salesRatios[index]}%` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableDashboard
