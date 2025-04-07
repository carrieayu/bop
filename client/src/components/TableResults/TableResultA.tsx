import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import { halfYears, monthNames, months } from '../../constants'
import { resultsTableALabelsAndValues} from '../../utils/TableResultsALabelAndValues'

interface TablePlanningAProps {
  isThousandYenChecked: boolean
  results
  resultsCalculations
}

const TableResultsA: React.FC<TablePlanningAProps> = ({ isThousandYenChecked, results, resultsCalculations }) => {
  const [data, setData] = useState([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation

  useEffect(() => {
    // RESULTS TABLE DATA
    setData(resultsTableALabelsAndValues(results, resultsCalculations))
  }, [results])

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
