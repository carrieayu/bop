import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { months, monthNames, halfYears } from '../../constants'
import { translate } from '../../utils/translationUtil'
import { useSelector } from 'react-redux'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
import { resultsCalculationsSelector } from '../../selectors/results/resultsCalculationSelectors'
import { planningTableALabelsAndValues } from '../../utils/TablePlanningALabelAndValues'
import { resultsTableALabelsAndValues } from '../../utils/TableResultsALabelAndValues'
import { formatNumberWithCommas } from '../../utils/helperFunctionsUtil'

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

  useEffect(() => {
    const planningTotalsOnlyArr = getTotalsOnlyArr(planningData)
    const resultsTotalsOnlyArr = getTotalsOnlyArr(resultsData)
    let saleRatioArr = []
    
    if (planningTotalsOnlyArr.length && resultsTotalsOnlyArr.length) {
      saleRatioArr = getSalesRatios(planningTotalsOnlyArr, resultsTotalsOnlyArr)
    }

    setSalesRatios(saleRatioArr)
  }, [resultsData])

  const getSalesRatios = (planningArr, resultsArr) => {
    return resultsArr.map((resultTotalValue, i) => {
      const planningTotalValue = planningArr[i]
      // Prevent division by zero
      const salesRatio = planningTotalValue !== 0 ? (resultTotalValue / planningTotalValue) * 100 : 0
      return salesRatio.toFixed(2) // Round to 2 decimal places
    })
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

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

  // Assigns Class based on whether it needs indentation or not.
  const handleNoIndentLabels = (noIndentLabels, item) => {
    return noIndentLabels.includes(item.label)
      ? language !== 'en'
        ? 'no-indent'
        : 'no-indent-english-mode'
      : language !== 'en'
        ? 'indented-label'
        : 'indented-label-english-mode'
  }

  const handleIsThousandYenChecked = (isThousandYenChecked, value) => {
    if (value === undefined || value === null) return '';
    
    if (isThousandYenChecked) {
      return (Math.round((value / 1000) * 10) / 10).toLocaleString()
    }

    return value.toLocaleString()
  }

  const formatValue = (value, isChecked) =>
    isChecked ? handleIsThousandYenChecked(isChecked, value) : formatNumberWithCommas(value)
  
  return (
    <div className='table-planning-container editScrollable'>
      <div className='table-planning'>
        <table>
          <thead>
            <tr className='main-header dashboard-sticky dashboard-first-row'>
              <th className='border-sides-shadow sticky'>{translate('item', language)}</th>
              {months.map((month, index) => (
                <th
                  key={`month-planning-${month}`}
                  className={`border-right ${month >= 10 || month <= 3 ? 'half-year-second' : 'half-year-first'}`}
                  colSpan={2}
                >
                  {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                </th>
              ))}
              {halfYears.map((halfYear, index) => (
                <th key={`totals-${index}`} className='totals border-right ' colSpan={2}>
                  {translate(`${halfYear}`, language)}
                </th>
              ))}
              <th className='border sales-ratio' key={`test-sales-ratio`}>
                {translate(language === 'en' ? 'salesRatioShort' : 'salesRatio', language)}
              </th>
            </tr>
            <tr className='main-header dashboard-scnd-row'>
              <th className='borderless border-sides-shadow sticky'>{''}</th>
              {months.map((month, index) => (
                <React.Fragment key={`month-pair${index}-${month}`}>
                  <th className='planning-header'>{translate('planning', language)}</th>
                  <th className='result-header border-right'>{translate('results', language)}</th>
                </React.Fragment>
              ))}
              {halfYears.map((halfYear, index) => (
                <React.Fragment key={`header-${index}-${halfYear}`}>
                  <th className='planning-header border'>{translate('planning', language)}</th>
                  <th className='result-header border-right'>{translate('results', language)}</th>
                </React.Fragment>
              ))}
              <th className='sales-ratio'>{''}</th>
            </tr>
          </thead>
          <tbody>
            {planningData.map((item, index) => (
              <tr key={`planningData-${item.label}-${index}`}>
                <td className={`sticky border-sides-shadow ${handleNoIndentLabels(noIndentLabels, item)}`}>
                  {translate(item.label, language)}
                </td>
                {item.values.map((value, valueIndex) => [
                  <td key={`planning-${index}-${valueIndex}`} className='month-data planning-cells'>
                    {formatValue(value, isThousandYenChecked)}
                  </td>,
                  <td key={`results-${index}-${valueIndex}`} className='month-data result-cells'>
                    {formatValue(resultsData[index].values[valueIndex], isThousandYenChecked)}
                  </td>,
                ])}
                <td key={`sale-ratio-${index}`} className='sale-ratio-cells' colSpan={2}>
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