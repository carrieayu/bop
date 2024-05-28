import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'

type TableProps = {
  header: string[]
  dates: string[]
  smallDate: string[]
  data: any
}

const objectEntity = [
  'sales_revenue',
  'cost_of_goods_sold',
  'dispatched_personnel_expenses',
  'personal_expenses',
  'indirect_personal_expenses',
  'expenses',
  'operating_profit',
  'non_operating_income',
  'ordinary_profit',
  'ordinary_profit_margin'
]

const headerTitle = [
  '売上高',
  '売上原価',
  '派遣人件費',
  '人件費',
  '間接人件費',
  '経費',
  '営業利益',
  '營業外收益',
  '経常利益',
  '経常利益率',
]

interface EntityGrid {
  clientName: string
  grid: string[][]
}

export const TableComponentProps: React.FC<TableProps> = (props) => {
const gridRows = objectEntity.length
const gridCols = 12

const [grid, setGrid] = useState<EntityGrid[]>([])

useEffect(() => {
  const entityGrids: EntityGrid[] = props.data.map((entity) => ({
    clientName: entity.client_name,
    grid: Array.from({ length: gridRows }, () => Array.from({ length: gridCols }, () => '0')),
  }))

  props.data.forEach((entity, entityIndex) => {
    if (entity && entity.planning_project_data && entity.planning_project_data.length > 0) {
      entity.planning_project_data.forEach((project) => {
        if (project.planning && project.sales_revenue !== undefined) {
          const date = new Date(project.planning)
          const month = date.getMonth()
          const adjustedMonth = (month + 8 + 1) % 12

          objectEntity.forEach((header, index) => {
            if (project[header] !== undefined) {
              entityGrids[entityIndex].grid[index][adjustedMonth] = project[header].toString()

            }
          })
        }
      })
    }
  })

  setGrid(entityGrids)
}, [props.data])

  return (
    <div className='table_container'>
      <div className='table-container'>
        <table className='table_header'>
          <></>
        </table>
        <div className='scrollable_container'>
          {grid.map((entityGrid: EntityGrid, entityIndex: number) => (
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
                        {props.header.map((item, index) => (
                          <th key={index}>{item}</th>
                        ))}
                        <th colSpan={6}></th>
                        <th style={{ borderLeft: '1px solid black' }}></th>
                      </tr>
                      <tr className='tr_title'>
                        <th style={{ width: 100, textAlign: 'center', borderRight: '1px solid black' }}>No.</th>
                        <th style={{ width: 100, textAlign: 'center' }}>クライアント</th>
                        <th className='header_center' style={{ width: 100, borderRight: '1px solid black' }}>
                          勘定科目
                        </th>
                        <th colSpan={12}></th>
                        <th className='header_center'>合計</th>
                      </tr>
                      <tr className='tr_dates'>
                        <td className='td_border'></td>
                        <td className='td_border'></td>
                        <td className='td_border'></td>
                        {props.dates.map((item, index) => (
                          <td
                            key={index}
                            className='td_right'
                            style={{ width: 100, overflow: 'hidden', whiteSpace: 'nowrap' }}
                          >
                            {item}
                          </td>
                        ))}
                        <td style={{ width: 100 }}></td>
                      </tr>
                    </>
                  )}
                  {entityGrid.grid.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td style={{ width: 100, textAlign: 'center' }} className='div_border'>
                        {rowIndex === 5 ? <div>{entityIndex}</div> : rowIndex === 0 && <></>}
                      </td>
                      <td style={{ width: 100, textAlign: 'center' }} className='div_border'>
                        {rowIndex === 5 ? <div>{entityGrid.clientName}</div> : rowIndex === 0 && <></>}
                      </td>
                      <td style={{ width: 100, border: '1px solid black', textAlign: 'center' }}>
                        {headerTitle[rowIndex]}
                      </td>
                      {Array.isArray(row)
                        ? row.map((cell, colIndex) => (
                            <td key={colIndex} style={{ width: 100, border: '1px solid black', textAlign: 'center' }}>
                              {cell}
                            </td>
                          ))
                        : null}
                      <td
                        key={'total'}
                        style={{ width: 100, height: 50, border: '1px solid black', textAlign: 'center' }}
                      >
                        {Array.isArray(row) ? row.reduce((acc, val) => acc + parseInt(val), 0) : null}
                      </td>
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
