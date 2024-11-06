import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { RootState } from '../../app/store'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import axios from 'axios'
// import { fetchMasterClient } from '../../reducers/client/clientSlice'
// import { UnknownAction } from 'redux'
import { getReactActiveEndpoint } from '../../toggleEndpoint'

type TableProps = {
  header: string[]
  dates: string[]
  smallDate: string[]
  data: any
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
  const [clients, setClients] = useState<any>([])
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${getReactActiveEndpoint()}/api/planning/display-by-projects/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const groupedData: { [key: string]: EntityGrid } = {}

        response.data.forEach((project) => {
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
      } catch (error) {
        console.error('Error fetching project data:', error)
      }
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
    1: { en: 'January', jp: '1月' },
    2: { en: 'February', jp: '2月' },
    3: { en: 'March', jp: '3月' },
    4: { en: 'April', jp: '4月' },
    5: { en: 'May', jp: '5月' },
    6: { en: 'June', jp: '6月' },
    7: { en: 'July', jp: '7月' },
    8: { en: 'August', jp: '8月' },
    9: { en: 'September', jp: '9月' },
    10: { en: 'October', jp: '10月' },
    11: { en: 'November', jp: '11月' },
    12: { en: 'December', jp: '12月' },
  }

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
                <th className='table-b-client-header'>{translate('client', language)}</th>
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
                <th style={{ width: '10%', border: '1px solid #ddd' }} className='table-b-total-header'>
                  {translate('totalAmount', language)}
                </th>
              </tr>
            </tbody>
          </table>
          <div className='table-b-scrollable_container table-b-planning_scrollable'>
            {grid.map((entityGrid, entityIndex) => (
              <div key={entityIndex}>
                <table className='table-b-grid' style={{ border: '1px solid #ddd'}}>
                  <tbody className='table-b-client-table'>
                    <td className='table-b-client-data' rowSpan={8}>
                      {entityGrid.clientName}
                    </td>
                    {entityGrid.grid.map((row, rowIndex) => {
                      const rowTotal = row.reduce((acc, cell) => acc + (parseFloat(cell) || 0), 0)
                      return (
                        <tr key={rowIndex}>
                          <td
                            style={{
                              width: '9%',
                              height: '20px',
                              textAlign: 'center',
                              border: '1px solid #ddd',
                              fontWeight: 'light',
                            }}
                          >
                            {translate(headerTitle[rowIndex], language)}
                          </td>
                          {row.map((cell, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                width: '6%',
                                textAlign: 'center',
                                borderBottom: '1px solid #ddd',
                                borderLeft: '1px solid #ddd',
                                borderRight: '1px solid #ddd',
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                          <td className='table-b-total-data' style={{ textAlign: 'center', fontWeight: 'light' }}>
                            {rowTotal}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
