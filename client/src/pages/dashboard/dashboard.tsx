import React, { HtmlHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react'
import { HeaderDashboard } from '../../components/header/header'
import Card from '../../components/Card/Card'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import Pagination from '../../components/Pagination/Pagination'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useDispatch } from 'react-redux'
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { UnknownAction } from '@reduxjs/toolkit'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import CardEntity from '../../entity/cardEntity'
import { OtherPlanningEntity } from '../../entity/otherPlanningEntity'
import { TableComponentProps } from '../../components/Table/table.component'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import TableEntity from '../../entity/tableEntity'

const header = ['計画	']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [tableList, setTableList] = useState<any>([]);
  // const tableList = useAppSelector((state: RootState) => state.table.tableList)
  const totalSales = useAppSelector((state: RootState) => state.cards.totalSales)
  const totalOperatingProfit = useAppSelector((state: RootState) => state.cards.totalOperatingProfit)
  const totalGrossProfit = useAppSelector((state: RootState) => state.cards.totalGrossProfit)
  const totalNetProfitPeriod = useAppSelector((state: RootState) => state.cards.totalNetProfitPeriod)
  const totalGrossProfitMargin = useAppSelector((state: RootState) => state.cards.totalGrossProfitMargin)
  const totalOperatingProfitMargin = useAppSelector((state: RootState) => state.cards.totalOperatingProfitMargin)
  const [datePlanning, setDatePlanning] = useState([])
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const rowsPerPage = 5
  const totalPages = Math.ceil(tableList.length / rowsPerPage)

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction)
      setTableList(res.payload);
      await dispatch(fetchAllCards() as unknown as UnknownAction)
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    fetchData()
    console.log('sensha kana: ', totalGrossProfit)
  }, [])

  const graphData = {
    labels: datePlanning,
    datasets: [
      {
        type: 'bar' as const,
        label: '売上高',
        data: totalSales,
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '売上総利益',
        data: totalGrossProfit,
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '営業利益',
        data: totalOperatingProfit,
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '当期純利益',
        data: totalNetProfitPeriod,
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '売上総利益率',
        data: totalGrossProfitMargin,
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: '営業利益率',
        data: totalOperatingProfitMargin,
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
    ],
  }

  //State for pagination
  //Function to handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getPaginatedData = () => {
    const startIndex = currentPage * rowsPerPage
    return tableList.slice(startIndex, startIndex + rowsPerPage)
  }

  return (
    <div className='wrapper'>
      <div className='header_cont'>
        <HeaderDashboard value='value' />
        {showMenu && (
          <div className='menu'>
            <HeaderDashboard value='value' />
          </div>
        )}
        <div className='hamburger' onClick={toggleMenu}>
          <span className='burger_icon'>
            <GiHamburgerMenu />
          </span>
        </div>
      </div>
      <div className='body_cont'>
        <div className='card_cont'>
          <div className='left_card'>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>売上高</p>
                <p className='numTxt'>
                  {totalSales}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>営業利益</p>
                <p className='numTxt'>
                  {totalOperatingProfit}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>売上総利益率</p>
                <p className='numTxt'>
                  {totalGrossProfitMargin}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className='right_card'>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>売上総利益</p>
                <p className='numTxt'>
                  {totalGrossProfit}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>当期純利益</p>
                <p className='numTxt'>
                  {totalNetProfitPeriod}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
            <Card
              backgroundColor='#fff'
              shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
              border='2px solid #ccc'
              width='auto'
              height='120px'
            >
              <div className='custom-card-content'>
                <p className='text1'>営業利益率</p>
                <p className='numTxt'>
                  {totalOperatingProfitMargin}&nbsp;<span className='totalTxt'>円</span>
                </p>
                <p className='text2'>トータル</p>
              </div>
            </Card>
          </div>
        </div>
        &nbsp;&nbsp;&nbsp;
        <div className='graph_cont'>
          <div className='graph_wrap'>
            <GraphDashboard data={graphData} />
          </div>
        </div>
      </div>
      <div className='bottom_cont'>
        <div className='pagination_cont'>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
        <div className='table_cont'>
          <TableComponentProps data={getPaginatedData()} header={header} dates={dates} smallDate={smallDate} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
function debounce(handleInputChange: any, arg1: number): any {
  throw new Error('Function not implemented.')
}
