import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import { halfYears, monthNames, months } from '../../constants';
import { planningTableALabelsAndValues } from '../../utils/TablePlanningALabelAndValues'

interface TablePlanningAProps {
  isThousandYenChecked: boolean
  planning
  planningCalculations
}

const TablePlanning: React.FC<TablePlanningAProps> = ({isThousandYenChecked, planning, planningCalculations}) => {
  const { language, setLanguage } = useLanguage()
  const [data, setData] = useState([])
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en') // State for switch in translation

  useEffect(() => {
    // PLANNING TABLE DATA
    setData(planningTableALabelsAndValues(planning, planningCalculations))
  },[planning, planningCalculations])

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
    <div className='table-planning-container editScrollable'>
      <div className='table-planning'>
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
                <th key={index}>{translate('planning', language)}</th>
              ))}
              {halfYears.map((_, index) => (
                <th key={index} className=''>
                  {translate('planning', language)}
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
};

export default TablePlanning;
