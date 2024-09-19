import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'

type TableProps = {
  header: string[]
  dates: string[]
  smallDate: string[]
  data: any
}

const objectEntity = [
  'sales_revenue',
  'assignment_unit_price',
  'operating_profit',
  'non_operating_income',
  'non_operating_expenses',
  'ordinary_profit',
  'ordinary_profit_margin',
]

const headerTitle = ['salesRevenue', 'employeeExpenses', 'operatingIncome', 'nonOperatingIncome', 'nonOperatingExpenses', 'ordinaryIncome', 'ordinaryIncomeProfitMargin']

interface EntityGrid {
  clientName: string
  grid: string[][]
}

export const TablePlanningB: React.FC<TableProps> = (props) => {
const gridRows = objectEntity?.length
const gridCols = 13

const [grid, setGrid] = useState<EntityGrid[]>([])

const { language, setLanguage } = useLanguage()
const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translation

useEffect(() => {
  const entityGrids: EntityGrid[] = props.data?.map((entity) => ({
    clientName: entity.client_name,
    grid: Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => '0')),
  }))

  props.data?.forEach((entity, entityIndex) => {
    if (entity && entity.planning_project_data && entity.planning_project_data.length > 0) {
      const monthlyAccumulations = {
        sales_revenue: Array(12).fill(0),
        assignment_unit_price: Array(12).fill(0),
        operating_profit: Array(12).fill(0),
        non_operating_income: Array(12).fill(0),
        non_operating_expenses: Array(12).fill(0),
        ordinary_profit: Array(12).fill(0),
        ordinary_profit_margin: Array(12).fill(0),
      }

      entity.planning_project_data.forEach((project) => {
        const month = project.month - 1
        const adjustedMonth = (month + 9) % 12 

        ;[
          'sales_revenue',
          'assignment_unit_price',
          'operating_profit',
          'non_operating_income',
          'non_operating_expenses',
          'ordinary_profit',
          'ordinary_profit_margin',
        ].forEach((field) => {
          if (project[field] !== undefined) {
            const fieldValue = parseFloat(project[field])
            if (!isNaN(fieldValue)) {
              monthlyAccumulations[field][adjustedMonth] += fieldValue
            }
          }
        })

        objectEntity.forEach((header, index) => {
          if (
            ![
              'sales_revenue',
              'assignment_unit_price',
              'operating_profit',
              'non_operating_income',
              'non_operating_expenses',
              'ordinary_profit',
              'ordinary_profit_margin',
            ].includes(header) &&
            project[header] !== undefined
          ) {
            entityGrids[entityIndex].grid[index][adjustedMonth] = project[header].toString()
          }
        })
      })

      Object.keys(monthlyAccumulations).forEach((field) => {
        const fieldIndex = objectEntity.indexOf(field)
        if (fieldIndex !== -1) {
          monthlyAccumulations[field].forEach((total, monthIndex) => {
            if (['operating_profit', 'ordinary_profit', 'ordinary_profit_margin'].includes(field)) {
              entityGrids[entityIndex].grid[fieldIndex][monthIndex] = '-'
            } else {
              entityGrids[entityIndex].grid[fieldIndex][monthIndex] = total.toString()
            }
          })
        }
      })
    }
  })

  entityGrids.forEach((entityGrid) => {
    entityGrid.grid.forEach((row, rowIndex) => {
      const fieldName = objectEntity[rowIndex]
      if (['operating_profit', 'ordinary_profit', 'ordinary_profit_margin'].includes(fieldName)) {
        row[gridCols - 1] = '-' // Set last column for totals to hyphen
      } else {
        const total = row.slice(0, gridCols - 1).reduce((acc, val) => acc + parseFloat(val), 0)
        row[gridCols - 1] = total.toString() // Last column for totals
      }
    })
  })

  setGrid(entityGrids)
}, [props.data])

useEffect(() => {
  setIsTranslateSwitchActive(language === 'en');
}, [language]);

const handleTranslationSwitchToggle = () => {
  const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
  setLanguage(newLanguage);
};

const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const monthNames: { [key: number]: { en: string; jp: string } } = {
  1: { en: "January", jp: "1月" },
  2: { en: "February", jp: "2月" },
  3: { en: "March", jp: "3月" },
  4: { en: "April", jp: "4月" },
  5: { en: "May", jp: "5月" },
  6: { en: "June", jp: "6月" },
  7: { en: "July", jp: "7月" },
  8: { en: "August", jp: "8月" },
  9: { en: "September", jp: "9月" },
  10: { en: "October", jp: "10月" },
  11: { en: "November", jp: "11月" },
  12: { en: "December", jp: "12月" },
};

  return (
    <div className='table_container'>
      <div className='table-container'>
        <table className='table_header'>
          <></>
        </table>
        <div className='scrollable_container planning_scrollable'>
          {grid?.map((entityGrid: EntityGrid, entityIndex: number) => (
            <div key={entityIndex}>
              <table className='tableGrid'>
                <thead></thead>
                <tbody>
                  {entityIndex === 0 && (
                    <>
                      <tr className='tr_header'>
                        <th style={{ borderRight: '1px solid black' }}></th>
                        <th style={{ borderRight: '1px solid black' }}></th>
                        <th style={{ borderRight: '1px solid black' }}></th>
                        <th colSpan={5}></th>
                        {props.header?.map((item, index) => (
                          <th key={index}>{translate('planning', language)}</th>
                        ))}
                        <th colSpan={6}></th>
                        <th style={{ borderLeft: '1px solid black' }}></th>
                      </tr>
                      <tr className='tr_title'>
                        <th style={{ width: 100, textAlign: 'center', borderRight: '1px solid black' }}>{translate('itemNumber', language)}</th>
                        <th style={{ width: 100, textAlign: 'center' }}>{translate('client', language)}</th>
                        <th className='header_center' style={{ width: 100, borderRight: '1px solid black' }}>
                          {translate('accountCategories', language)}
                        </th>
                        <th colSpan={12}></th>
                        <th className='header_center'>{translate('totalAmount', language)}</th>
                      </tr>
                      <tr className='tr_dates'>
                        <td className='td_border'></td>
                        <td className='td_border'></td>
                        <td className='td_border'></td>
                        {months.map((month, index) => (
                          <td
                            key={index}
                            className='td_right'
                            style={{ width: 100, overflow: 'hidden', whiteSpace: 'nowrap' }}
                          >
                            {language === "en" ? monthNames[month].en : monthNames[month].jp}
                          </td>
                        ))}
                        <td style={{ width: 100 }}></td>
                      </tr>
                    </>
                  )}
                  {entityGrid.grid?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td style={{ width: 100, textAlign: 'center' }} className='div_border'>
                        {rowIndex === 5 ? <div>{entityIndex}</div> : rowIndex === 0 && <></>}
                      </td>
                      <td style={{ width: 100, textAlign: 'center' }} className='div_border'>
                        {rowIndex === 5 ? <div>{entityGrid.clientName}</div> : rowIndex === 0 && <></>}
                      </td>
                      <td style={{ width: 100, border: '1px solid black', textAlign: 'center' }}>
                      {translate(headerTitle[rowIndex], language)}
                      </td>
                      {Array.isArray(row)
                        ? row?.map((cell, colIndex) => (
                            <td
                              key={colIndex}
                              style={{ width: 100, height: 50, border: '1px solid black', textAlign: 'center' }}
                            >
                              {cell}
                            </td>
                          ))
                        : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

}
