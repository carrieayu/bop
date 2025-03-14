import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { months, monthNames } from '../../constants'
import { translate } from '../../utils/translationUtil'
import { useSelector } from 'react-redux'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
import { resultsCalculationsSelector } from '../../selectors/results/resultsCalculationSelectors'
import { planningTableALabelsAndValues } from '../../utils/TablePlanningALabelAndValues'
import { resultsTableALabelsAndValues } from '../../utils/TableResultsALabelAndValues'

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
    // PLANNING TABLE DATA
    setPlanningData(planningTableALabelsAndValues(planning, planningCalculations))
    // RESULTS TABLE DATA
    setResultsData(resultsTableALabelsAndValues(results, resultsCalculations))
  }, [planning, planningCalculations, results, resultsCalculations])

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
