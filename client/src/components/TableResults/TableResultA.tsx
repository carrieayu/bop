import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import { getResultsA } from '../../api/ResultsEndpoint/GetResultsA'
import { monthNames, months, token } from '../../constants'
import { cumulativeSum, organiseTotals } from '../../utils/helperFunctionsUtil'
import { aggregatedCostOfSalesFunction, aggregatedEmployeeExpensesFunction, aggregatedExpensesFunction, aggregatedProjectsFunction, costOfSalesTotalsFunction, employeeExpensesTotalsFunction, expensesTotalsFunction, grossProfitFunction, mapValue, operatingIncomeFunction, ordinaryProfitFunction, sellingAndGeneralAdminExpenseFunction } from '../../utils/tableAggregationUtil'

interface TablePlanningAProps {
  isThousandYenChecked: boolean
}

const TableResultsA: React.FC<TablePlanningAProps> = ({ isThousandYenChecked }) => {
  const [data, setData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation
  useEffect(() => {
    
    if (!token) {
      window.location.href = '/login'
      return
    }

    getResultsA(token)
      .then((response) => {
        // --- RESULTS TABLE DATA ---

        // RESULTS:COST OF SALES
        const aggregatedResultsCostOfSalesData = aggregatedCostOfSalesFunction(response.cost_of_sales_results)
        // RESULTS:EXPENSES
        const aggregatedResultsExpensesData = aggregatedExpensesFunction(response.expenses_results)
        // RESULTS:EMPLOYEE EXPENSES
        const aggregatedResultsEmployeeExpensesData = aggregatedEmployeeExpensesFunction(
          response.employee_expenses_results
        )
        // RESULTS:PROJECTS
        const aggregatedResultsProjectsData = aggregatedProjectsFunction(response.project_sales_results)

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
        const nonOperatingIncomeResultsValues = mapValue('non_operating_income', aggregatedResultsProjectsData)
        const nonOperatingExpensesResultsValues = mapValue('non_operating_expense', aggregatedResultsProjectsData)

        // RESULTS:ORDINARY PROFIT
        const ordinaryIncomeResultsValues = ordinaryProfitFunction(
          operatingIncomeResultsValues,
          nonOperatingIncomeResultsValues,
          nonOperatingExpensesResultsValues,
        )

        const cumulativeOrdinaryIncomeResultsValues = cumulativeSum(ordinaryIncomeResultsValues)

        const labelsAndValues = [
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
          { label: 'sellingAndGeneralAdminExpensesShort', values: sellingAndGeneralAdminExpenseResultsValues },

          // Operating income section
          { label: 'operatingIncome', values: operatingIncomeResultsValues },
          { label: 'nonOperatingIncome', values: nonOperatingIncomeResultsValues },
          { label: 'nonOperatingExpenses', values: nonOperatingExpensesResultsValues },
          { label: 'ordinaryIncome', values: ordinaryIncomeResultsValues },
          { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeResultsValues },
        ]

        const data = labelsAndValues.map((item) => ({
          label: item.label,
          values: organiseTotals(item.values),
        }))

        setData(data)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

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
    <div className='table-results_summary-container editScrollable'>
      <div className='table-results_summary'>
        <table>
          <thead>
            <tr className='table-header-sticky'>
              <th className=''>{''}</th>
              {months.map((month, index) => (
                <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
                  {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={index} className='sky-txt'>
                  {translate(`${halfYear}`, language)}
                </th>
              ))}
            </tr>
            <tr className='scnd-row'>
              <th className='borderless'>{''}</th>
              {months.map((month, index) => (
                <th key={index}>{translate('results', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>
                  {translate('results', language)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td
                  className={`${noIndentLabels.includes(item.label) ? (language !== 'en' ? 'no-indent' : 'no-indent-english-mode') : language !== 'en' ? 'indented-label' : 'indented-label-english-mode'}`}
                >
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => (
                  <td className='month-data' key={valueIndex}>
                    {isThousandYenChecked
                      ? (Math.round((value / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place
                      : value.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableResultsA
