import React, { useEffect, useState } from 'react'
import Card from '../../components/Card/Card'
import GraphDashboard from '../../components/GraphDashboard/GraphDashboard'
import { useDispatch } from 'react-redux'
import { fetchAllCards } from '../../reducers/card/cardSlice'
import { UnknownAction } from '@reduxjs/toolkit'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { TablePlanningB } from '../../components/Table/TablePlanningB.component'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import { fetchGraphData } from '../../reducers/graph/graphSlice'
import Sidebar from '../../components/Sidebar/Sidebar'
import Btn from '../../components/Button/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import TablePlanningA from '../../components/Table/TablePlanningA'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'

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
  const totalOperatingIncomeByDate = useAppSelector((state: RootState) => state.graph.totalOperatingIncomeByDate)
  const totalGrossProfitByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitByDate)
  const totalCumulativeOrdinaryIncomeByDate = useAppSelector((state: RootState) => state.graph.totalCumulativeOrdinaryIncome)
  const totalGrossProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalGrossProfitMarginByDate)
  const totalOperatingProfitMarginByDate = useAppSelector((state: RootState) => state.graph.totalOperatingProfitMarginByDate)
  const month = useAppSelector((state: RootState) => state.graph.month)
  const select = [5, 10, 100]
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/dashboard')
  const [isSwitchActive, setIsSwitchActive] = useState(false); 
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const navigate = useNavigate()
  const location = useLocation()
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false);

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked(prevState => !prevState);
  }

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
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);
  
  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(tableList?.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, tableList])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };


  const graphData = {
    labels: month,
    datasets: [
      {
        type: 'bar' as const,
        label: translate('sales', language),
        data: month?.map((date) => totalSalesByDate[date] || 0),
        backgroundColor: '#6e748c',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('grossProfit', language),
        data: month?.map((date) => totalGrossProfitByDate[date]),
        backgroundColor: '#7696c6',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('operatingIncome', language),
        data: month?.map((date) => totalOperatingIncomeByDate[date]),
        backgroundColor: '#b8cbe2',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: translate('cumulativeOrdinaryIncome', language),
        data: month?.map((date) => totalCumulativeOrdinaryIncomeByDate[date]),
        backgroundColor: '#bde386',
        borderColor: 'black',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: translate('grossProfitMargin', language),
        data: month?.map((date) => totalGrossProfitMarginByDate[date]),
        backgroundColor: '#ff8e13',
        borderColor: '#ff8e13',
        borderWidth: 2,
        yAxisID: 'y1',
        fill: false,
      },
      {
        type: 'line' as const,
        label: translate('operatingProfitMargin', language),
        data: month?.map((date) => totalOperatingProfitMarginByDate[date]),
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

  const handleSwitchToggle = () => {
    setIsSwitchActive(prevState => !prevState);
  };

  return (
    <div className='dashboard_wrapper'>
        <HeaderButtons 
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            isTranslateSwitchActive={isTranslateSwitchActive}
            handleTranslationSwitchToggle={handleTranslationSwitchToggle}
        />
      <div className='dashboard_content_wrapper'>
          <Sidebar />
        <div className='dashboard_content'>
          <div className='dashboard_body_cont'>
            <div className='dashboard_card_cont'>
              <div className='dashboard_left_card'>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('sales', language)}</p>
                    <p className='dashboard_numTxt'>
                      {formatNumberWithCommas(totalSales)}&nbsp;<span className='dashboard_totalTxt'>{translate('yen', language)}</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('operatingIncome', language)}</p>
                    <p className='dashboard_numTxt'>
                      {formatNumberWithCommas(totalOperatingProfit)}&nbsp;<span className='dashboard_totalTxt'>{translate('yen', language)}</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('grossProfitMargin', language)}</p>
                    <p className='dashboard_numTxt'>
                      {totalGrossProfitMargin}&nbsp;<span className='dashboard_totalTxt'>%</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
              </div>
              &nbsp;&nbsp;&nbsp;
              <div className='dashboard_right_card'>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('grossProfit', language)}</p>
                    <p className='dashboard_numTxt'>
                      {formatNumberWithCommas(totalGrossProfit)}&nbsp;<span className='dashboard_totalTxt'>{translate('yen', language)}</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('cumulativeOrdinaryIncome', language)}</p>
                    <p className='dashboard_numTxt'>
                      {formatNumberWithCommas(totalNetProfitPeriod)}&nbsp;<span className='dashboard_totalTxt'>{translate('yen', language)}</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
                <Card
                  backgroundColor='#fff'
                  shadow='2px 2px 4px rgba(0, 0, 0, 0.2)'
                  border='2px solid #ccc'
                  width='auto'
                  height='120px'
                >
                  <div className='dashboard_custom-card-content'>
                    <p className='dashboard_text1'>{translate('operatingProfitMargin', language)}</p>
                    <p className='dashboard_numTxt'>
                      {totalOperatingProfitMargin}&nbsp;<span className='dashboard_totalTxt'>%</span>
                    </p>
                    <p className='dashboard_text2'>{translate('total', language)}</p>
                  </div>
                </Card>
              </div>
            </div>
            &nbsp;&nbsp;&nbsp;
            <div className='dashboard_graph_cont'>
              <div className='dashboard_graph_wrap'>
                <GraphDashboard data={graphData} />
              </div>
            </div>
          </div>
          <div className='dashboard_bottom_cont'>
            <div className="dashboard_right-content">
              <div className="dashboard_paginate">
                <p className="dashboard_pl-label">{translate('displayByProject', language)}</p>
                  <label className="dashboard_switch">
                    <input type="checkbox" checked={isSwitchActive} onChange={handleSwitchToggle} />
                      <span className="dashboard_slider"></span>
                    </label>
                      <p className="dashboard_pl-label">{translate('thousandYen', language)}</p>
                      <label className="dashboard_switch">
                        <input type="checkbox" checked={isThousandYenChecked} onChange={handleThousandYenToggle} />
                        <span className="dashboard_slider"></span>
                      </label>
                </div>
              </div>
            <div className='dashboard_tbl_cont'>
                  <div className={`dashboard_table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                          {/* Render the TablePlanning component here */}
                          <TablePlanningA isThousandYenChecked={isThousandYenChecked}/>
                  </div>
                  <div className={`dashboard_table_content_props ${isSwitchActive ? '' : 'hidden'}`}>
                    <TablePlanningB data={paginatedData} header={header} dates={dates} smallDate={smallDate} />
                  </div>
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
