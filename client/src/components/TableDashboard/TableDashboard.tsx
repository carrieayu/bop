import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { months, monthNames } from '../../constants'
import { cumulativeSum, organiseTotals } from '../../utils/helperFunctionsUtil'
import { translate } from '../../utils/translationUtil'
import { useSelector } from 'react-redux'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
import { resultsCalculationsSelector } from '../../selectors/results/resultsCalculationSelectors'

interface TableDashboardProps {
  isThousandYenChecked: boolean
  results
  planning
}

const TableDashboard: React.FC<TableDashboardProps> = ({
  isThousandYenChecked,
  results,
  planning,
}) => {
  const [planningData, setPlanningData] = useState([])
  const [salesRatios, setSalesRatios] = useState([])
  const [resultsData, setResultsData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const planningCalculations = useSelector(planningCalculationsSelector)
  const resultsCalculations = useSelector(resultsCalculationsSelector)

  useEffect(() => {
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

      { label: 'ordinaryIncome', values: planningCalculations.ordinaryIncome.monthlyTotals },
      { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeValues },
    ]

    const planningDataLabelsAndValues = labelsAndValues.map((item) => ({
      label: item.label,
      values: organiseTotals(item.values, item.label),
    }))

    setPlanningData(planningDataLabelsAndValues)

    // RESULTS TABLE DATA
    const cumulativeOrdinaryIncomeResultsValues = cumulativeSum(resultsCalculations.ordinaryIncome.monthlyTotals)

    const labelsAndValuesResults = [
      // Sales revenue section
      { label: 'salesRevenue', values: results.projects.monthlyTotals.salesRevenue },
      { label: 'sales', values: results.projects.monthlyTotals.salesRevenue },

      // Cost of sales section
      { label: 'costOfSales', values: results.costOfSales.monthlyTotals },
      { label: 'purchases', values: results.costOfSales.individualMonthlyTotals.purchase },
      { label: 'outsourcingExpenses', values: results.costOfSales.individualMonthlyTotals.outsourcingExpense },
      { label: 'productPurchases', values: results.costOfSales.individualMonthlyTotals.productPurchase },
      { label: 'dispatchLaborExpenses', values: results.costOfSales.individualMonthlyTotals.dispatchLaborExpense },
      { label: 'communicationExpenses', values: results.costOfSales.individualMonthlyTotals.communicationExpense },
      { label: 'workInProgressExpenses', values: results.costOfSales.individualMonthlyTotals.workInProgressExpense },
      { label: 'amortizationExpenses', values: results.costOfSales.individualMonthlyTotals.amortizationExpense },

      // Gross profit
      { label: 'grossProfit', values: resultsCalculations.grossProfit.monthlyTotals },

      // Employee expense section
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

      // Selling and general admin expenses
      {
        label: 'sellingAndGeneralAdminExpenses',
        values: resultsCalculations.sellingAndGeneralAdmin.monthlyTotals,
      },

      // Operating income section
      { label: 'operatingIncome', values: resultsCalculations.operatingIncome.monthlyTotals },

      { label: 'nonOperatingIncome', values: results.projects.monthlyTotals.nonOperatingIncome },
      { label: 'nonOperatingExpenses', values: results.projects.monthlyTotals.nonOperatingExpense },

      { label: 'ordinaryIncome', values: resultsCalculations.ordinaryIncome.monthlyTotals },
      { label: 'cumulativeOrdinaryIncome', values: cumulativeOrdinaryIncomeResultsValues },
    ]

    const resultsDataLabelsAndValues = labelsAndValuesResults.map((item) => ({
      label: item.label,
      values: organiseTotals(item.values, item.label), // planningData is included to calculate sales ratio
    }))

    setResultsData(resultsDataLabelsAndValues)
  }, [planning, results])

  // SALES RATIO (COMPARING RESULTS AND PLANNING)
  const getTotalsOnlyArr = (dataArr) => dataArr.map((item) => item.values[item.values.length - 1])

  let planningTotalsOnlyArr
  let resultsTotalsOnlyArr

  useEffect(() => {
    planningTotalsOnlyArr = getTotalsOnlyArr(planningData)
    resultsTotalsOnlyArr = getTotalsOnlyArr(resultsData)
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
