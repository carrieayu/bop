import React, { useState } from 'react'

    
type TableProps = {
  header: string[]
  dates: string[]
  smallDate: string[]
  data: { id: number; number: string }[]
  data2: { id: number; number: string }[]
}

export const TableComponentProps: React.FC<TableProps> = (props) => {
    const inputCells = []
    for (let i = 0; i < 10; i++) {
      inputCells.push(
        <td className='td_right' key={i}>
          <input className='input_right' type='text' />
        </td>,
      )
    }
    return (
      <div className='table_container'>
        <table className='table_header'>
          <tr className='tr_header'>
            <th colSpan={5}></th>
            <th>header</th>
            <th colSpan={6}></th>
          </tr>
          <tr className='tr_title'>
            <th className='header_center'>header</th>
            <th colSpan={10}></th>
            <th className='header_center'>header</th>
          </tr>
          <tr className='tr_dates'>
            <td></td>
            {props.dates.map((item) => (
              <td className='td_right'>{item}</td>
            ))}
            <td></td>
          </tr>
          <tr className='tr_underline'>
            <td className='td_first'>title</td>
            {props.data2.map((data2) => (
              <td className='td_right' key={data2.id}>
                {data2.number}
              </td>
            ))}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_input_underline'>
            <td className='td_center'>title</td>
            {props.data.map((data) => (
              <td className='td_right' key={data.id}>
                {data.number}
              </td>
            ))}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_input_underline'>
            <td className='td_center'>input</td>
            {inputCells}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_input_underline'>
            <td className='td_center'>input</td>
            {inputCells}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_input_underline'>
            <td className='td_center'>input</td>
            {inputCells}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_input_underline'>
            <td className='td_center'>input</td>
            {inputCells}
            <td className='td_right'>total</td>
          </tr>
          <tr className='tr_underline'>
            <td className='td_first'>title</td>
            {props.data2.map((data2) => (
              <td className='td_right' key={data2.id}>
                {data2.number}
              </td>
            ))}
            <td className='td_right'>total</td>
          </tr>
        </table>
      </div>
    )
}
