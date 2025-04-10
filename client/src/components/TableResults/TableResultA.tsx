import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import { halfYears, monthNames, months, noIndentLabels } from '../../constants'
import { resultsTableALabelsAndValues} from '../../utils/TableResultsALabelAndValues'
import { thousandYenConversion } from '../../utils/helperFunctionsUtil'

interface TableResultsAProps {
  isThousandYenChecked: boolean
  results
  resultsCalculations
}

const TableResultsA: React.FC<TableResultsAProps> = ({ isThousandYenChecked, results, resultsCalculations }) => {
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

  // JSX Helpers
  const renderMonths = () => {
    return months.map((month, index) => (
      <th key={index} className={month >= 10 || month <= 3 ? 'light-txt' : 'orange-txt'}>
        {language === 'en' ? monthNames[month].en : monthNames[month].jp}
      </th>
    ))
  }

  const renderHalfYears = () => {
    return halfYears.map((halfYear, index) => (
      <th key={index} className='sky-txt'>
        {translate(`${halfYear}`, language)}
      </th>
    ))
  }

  const renderResultsHeaders = () => {
    return (
      <>
        <th className='borderless'></th>
        {months.map((_, index) => (
          <th key={index}>{translate('results', language)}</th>
        ))}
        {halfYears.map((_, index) => (
          <th key={index} className=''>
            {translate('results', language)}
          </th>
        ))}
      </>
    )
  }

  const renderTableBody = () => {
    return data.map((item, index) => (
      <tr className='column-headers' key={index}>
        <td className={`${noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'} column-headers`}>
          {translate(item.label, language)}
        </td>
        {item.values.map((value, valueIndex) => (
          <td className='value-container' key={valueIndex}>
            <div className='values'>{isThousandYenChecked ? thousandYenConversion(value) : value.toLocaleString()}</div>
          </td>
        ))}
      </tr>
    ))
  }

  return (
    <div className='table-results-container editScrollable'>
      <div className='table-results'>
        <table>
          <thead>
            <tr className='table-header-sticky'>
              <th className='empty-column'></th>
              {renderMonths()}
              {renderHalfYears()}
            </tr>
            <tr className='scnd-row'>
              {renderResultsHeaders()}
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  )
};

export default TableResultsA
