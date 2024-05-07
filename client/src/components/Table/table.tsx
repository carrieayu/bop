import React from 'react'
import { TableComponentProps } from './table.component'

const header = ['テスト', 'テスト', '合計']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = [
    '2021/04月',
    '2021/05月',
    '2021/06月',
    '2021/07月',
    '2021/08月',
    '2021/09月',
    '2021/10月',
    '2021/11月',
    '2021/12月',
    '2021/13月'
]
const data = [
    { id: 1, number: '123,456,789' },
    { id: 2, number: '234,567,890' },
    { id: 3, number: '345,678,901' },
    { id: 4, number: '456,789,012' },
    { id: 5, number: '567,890,123' },
    { id: 6, number: '678,901,234' },
    { id: 7, number: '789,012,345' },
    { id: 8, number: '890,123,456' },
    { id: 9, number: '901,234,567' },
    { id: 10, number: '102,345,678' }
    
]

const data2 = [
    { id: 1, number: '3,456,789' }, 
    { id: 2, number: '4,567,890' },
    { id: 3, number: '5,678,901' },
    { id: 4, number: '6,789,012' },
    { id: 5, number: '7,890,123' },
    { id: 6, number: '8,901,234' },
    { id: 7, number: '9,012,345' },
    { id: 8, number: '1,023,456' },
    { id: 9, number: '2,134,567' },
    { id: 10, number: '3,245,678' },
]

const TableComponent = () => {
    return (
    <div>
        <TableComponentProps header={header} dates={dates} data={data} data2={data2} smallDate={smallDate} />
    </div>
    )
}

export default TableComponent