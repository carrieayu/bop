import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import axios from 'axios'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { getPlanningB } from '../../api/PlanningEndpoint/GetPlanningB'


type TableProps = {
  header: string[]
  dates: string[]
  smallDate: string[]
  data: any
  isThousandYenChecked: boolean
}

const objectEntity = [
  'sales_revenue',
  'employee_salaries',
  'operating_income',
  'non_operating_income',
  'non_operating_expense',
  'ordinary_profit',
  'ordinary_profit_margin',
]

const headerTitle = [
  'salesRevenue',
  'salary',
  'operatingIncome',
  'nonOperatingIncome',
  'nonOperatingExpenses',
  'ordinaryIncome',
  'ordinaryIncomeProfitMargin',
]

interface EntityGrid {
  clientName: string
  grid: string[][]
  clientId: string
}

export const TablePlanningB: React.FC<TableProps> = (props) => {
  const gridRows = objectEntity.length
  const gridCols = 12
  const token = localStorage.getItem('accessToken')
  const [grid, setGrid] = useState<EntityGrid[]>([])
  const [data, setData] = useState<any[]>([])
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  useEffect(() => {
    const fetchData = async () => {
      
      getPlanningB(token)
        .then((data) => {
          const groupedData: { [key: string]: EntityGrid } = {}

          data.forEach((project) => {
            const clientId = project.client
            const clientName = project.client_name

            if (!groupedData[clientId]) {
              groupedData[clientId] = {
                clientName,
                grid: Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => '0')),
                clientId,
              }
            }

            const month = project.month - 1
            const adjustedMonth = (month + 9) % 12

            objectEntity.forEach((field, index) => {
              if (field === 'employee_salaries') {
                const total_employee_salaries = project[field].reduce((acc, current) => acc + current, 0)
                groupedData[clientId].grid[index][adjustedMonth] = total_employee_salaries.toString()
              } else if (project[field] !== undefined) {
                const fieldValue = parseFloat(project[field])
                if (!isNaN(fieldValue)) {
                  groupedData[clientId].grid[index][adjustedMonth] = (
                    parseFloat(groupedData[clientId].grid[index][adjustedMonth]) + fieldValue
                  ).toString()
                }
              }
            })
          })

          setData(Object.values(groupedData))
        })
        .catch((error) => {
          console.error('Error fetching project data:', error)
        })
    }

    fetchData()
  }, [])

  useEffect(() => {
    const entityGrids: EntityGrid[] = data.map((entity) => ({
      clientName: entity.clientName,
      grid: entity.grid,
      clientId: entity.clientId,
    }))
    setGrid(entityGrids)
  }, [data])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  const monthNames: { [key: number]: { en: string; jp: string } } = {
    1: { en: 'Jan', jp: '1月' }, // January
    2: { en: 'Feb', jp: '2月' }, //February
    3: { en: 'Mar', jp: '3月' }, // March
    4: { en: 'Apr', jp: '4月' }, //April
    5: { en: 'May', jp: '5月' }, //May
    6: { en: 'Jun', jp: '6月' }, //June
    7: { en: 'Jul', jp: '7月' }, //July
    8: { en: 'Aug', jp: '8月' }, //August
    9: { en: 'Sep', jp: '9月' }, //September
    10: { en: 'Oct', jp: '10月' }, //October
    11: { en: 'Nov', jp: '11月' }, //November
    12: { en: 'Dec', jp: '12月' }, //December
  }

  const thousandYenConversion = (value) => {
    return (Math.round((value / 1000) * 10) / 10).toLocaleString() // Rounds to 1 decimal place  
  }

  console.log(
    thousandYenConversion(200000)
  )
  
  return (
    <div className='table-b-wrapper'>
      <div className='table-b-content-wrapper'>
        <div className='table-b-container'>
          <table className='table-b-table_header'>
            <thead>
              <tr className='table-b-planning-tr-header'>
                <th colSpan={15}>{translate('planning', language)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className={`table-b-client-header ${isTranslateSwitchActive  ? '' : ''}`}>{translate('client', language)}</th>
                <th className='table-b-categories-header'>{translate('accountCategories', language)}</th>
                {months.map((month, index) => (
                  <th
                    key={index}
                    className='table-b-months-header'
                    style={{
                      whiteSpace: 'nowrap',
                      backgroundColor: index <= 5 ? '#FCE5CD' : '#C9DAF8',
                    }}
                  >
                    {language === 'en' ? monthNames[month].en : monthNames[month].jp}
                  </th>
                ))}
                <th className='table-b-total-header sky-txt'>{translate('totalAmount', language)}</th>
              </tr>
            </tbody>
          </table>
          <div className='table-b-scrollable_container table-b-planning_scrollable'>
            {grid.map((entityGrid, entityIndex) => {
              let totalSum = 0 // used for sum totals of projects for each client
              return (
                <div key={entityIndex}>
                  <table className='table-b-grid' style={{ border: '1px solid #ddd' }}>
                    <tbody className='table-b-client-table'>
                      <td className='table-b-client-data grey' rowSpan={8}>
                        {entityGrid.clientName}
                      </td>
                      {entityGrid.grid.map((row, rowIndex) => {
                        const rowTotal = row.reduce((acc, cell) => acc + (parseFloat(cell) || 0), 0)
                        totalSum += rowTotal // Accumulate the row total
                        return (
                          <tr key={rowIndex}>
                            <td className={`table-b-categories-data ${isTranslateSwitchActive  ? 'smaller-font' : ''}`}>{translate(headerTitle[rowIndex], language)}</td>
                            {row.map((cell, colIndex) => (
                              <td
                                className='table-b-months-data'
                                key={colIndex}
                                style={{
                                  textAlign: 'center', // for some reason this would not work in scss file so I left it here.
                                }}
                              >
                                {props.isThousandYenChecked ? thousandYenConversion(cell) : cell}
                              </td>
                            ))}
                            <td className='table-b-total-data' style={{ textAlign: 'center', fontWeight: 'light' }}>
                              {props.isThousandYenChecked ? thousandYenConversion(rowTotal) : rowTotal}
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td className='table-b-divider' colSpan={14}>
                          {' '}
                        </td>
                        <td className='table-b-sum-of-totals sky-txt'>
                          {props.isThousandYenChecked ? thousandYenConversion(totalSum) : totalSum}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
