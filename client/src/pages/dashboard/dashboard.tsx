import React, { HtmlHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react'
import Card from '../../components/Card/Card'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import Pagination from '../../components/Pagination/Pagination'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useDispatch } from 'react-redux'
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { UnknownAction } from '@reduxjs/toolkit'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { TableComponentProps } from '../../components/Table/table.component'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import { fetchGraphData } from '../../reducers/graph/graphSlice'
import { HeaderDashboard } from '../../components/header/header'
import Sidebar from '../../components/SideBar/Sidebar'
import Btn from '../../components/Button/Button'
import { useLocation, useNavigate } from 'react-router-dom'

function formatNumberWithCommas(number: number): string {
  return number.toLocaleString();
}

const header = ['計画	']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [tableList, setTableList] = useState<any>([]);
  const totalSales = useAppSelector((state: RootState) => state.cards.totalSales)
  const totalOperatingProfit = useAppSelector((state: RootState) => state.cards.totalOperatingProfit)
  const totalGrossProfit = useAppSelector((state: RootState) => state.cards.totalGrossProfit)
  const totalNetProfitPeriod = useAppSelector((state: RootState) => state.cards.totalNetProfitPeriod)
  const totalGrossProfitMargin = useAppSelector((state: RootState) => state.cards.totalGrossProfitMargin)
  const totalOperatingProfitMargin = useAppSelector((state: RootState) => state.cards.totalOperatingProfitMargin)
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const totalPages = Math.ceil(tableList?.length / rowsPerPage)
  const totalSalesByDate = useAppSelector((state: RootState) => state.graph.totalSalesByDate)
  const totalOperatingProfitByDate = useAppSelector((state: RootState) => state.graph.totalOperatingProfitByDate)
  const totalGrossProfitByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitByDate)
  const totalNetProfitPeriodByDate = useAppSelector((state: RootState) => state.graph.totalNetProfitPeriodByDate)
  const totalGrossProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitMarginByDate)
  const totalOperatingProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalOperatingProfitMarginByDate)
  const datePlanning = useAppSelector((state: RootState) => state.graph.datePlanning)
  const select = [5, 10, 100]
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction)
      setTableList(res.payload);
      await dispatch(fetchAllCards() as unknown as UnknownAction)
      await dispatch(fetchGraphData() as unknown as UnknownAction)
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/result') {
      setActiveTab(path);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(tableList?.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, tableList])

  const graphData = {
    labels: datePlanning,
    datasets: [
      {
        type: 'bar' as const,
        label: '売上高',
        data: datePlanning?.map(date => totalSalesByDate[date]),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '売上総利益',
        data: datePlanning?.map(date => totalGrossProfitByDate[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '営業利益',
        data: datePlanning?.map(date => totalOperatingProfitByDate[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: '当期純利益',
        data: datePlanning?.map(date => totalNetProfitPeriodByDate[date]),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '売上総利益率',
        data: datePlanning?.map(date => totalGrossProfitMarginByDate[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: '営業利益率',
        data: datePlanning?.map(date => totalOperatingProfitMarginByDate[date]),
        backgroundColor: '#ec3e4a',
        borderColor: '#ec3e4a',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
    ],
  }
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
  }

  return (
    <div className='wrapper'>
      <div className='header_cont'>
        <Btn
          label="分析"
          onClick={() => handleTabClick("/dashboard")}
          className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
        />
        <Btn
          label="計画"
          onClick={() => handleTabClick("/planning")}
          className={activeTab === "/planning" ? "h-btn-active header-btn" : "header-btn"}
        />
        <Btn
          label="実績"
          onClick={() => handleTabClick("/result")}
          className={activeTab === "/result" ? "h-btn-active header-btn" : "header-btn"}
        />
      </div>
      <div className='content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='dashboard_content'>
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
                      {formatNumberWithCommas(totalSales)}&nbsp;<span className='totalTxt'>円</span>
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
                      {formatNumberWithCommas(totalOperatingProfit)}&nbsp;<span className='totalTxt'>円</span>
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
                      {totalGrossProfitMargin}&nbsp;<span className='totalTxt'>%</span>
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
                      {formatNumberWithCommas(totalGrossProfit)}&nbsp;<span className='totalTxt'>円</span>
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
                      {formatNumberWithCommas(totalNetProfitPeriod)}&nbsp;<span className='totalTxt'>円</span>
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
                      {totalOperatingProfitMargin}&nbsp;<span className='totalTxt'>%</span>
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                options={select}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
            <div className='table_cont'>
              <TableComponentProps data={paginatedData} header={header} dates={dates} smallDate={smallDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
function debounce(handleInputChange: any, arg1: number): any {
  throw new Error('Function not implemented.')
}
