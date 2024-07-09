import React, { useEffect, useState } from 'react'
import Pagination from '../../components/Pagination/Pagination'
import { useDispatch } from 'react-redux'
import { UnknownAction } from '@reduxjs/toolkit'
import { TableComponentProps } from '../../components/Table/table.component'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import Sidebar from '../../components/SideBar/Sidebar'
import Btn from '../../components/Button/Button'
import { useLocation, useNavigate } from 'react-router-dom'


const header = ['計画	']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']

const Planning = () => {
  const [tableList, setTableList] = useState<any>([]);
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const totalPages = Math.ceil(tableList?.length / rowsPerPage)
  const select = [5, 10, 100]
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const loation = useLocation()

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction)
      setTableList(res.payload);
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])
  
  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(tableList?.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, tableList])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/result') {
      setActiveTab(path);
    }
  }, [location.pathname]);

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
        <div className='dashboard_content planning'>
          <div className='bottom_cont planning_btm'>
            <div className='pagination_cont planning_header'>
              <div className="left-content">
                <p>PL計画</p>
              </div>
              <div className="right-content">
                <div className="paginate">
                  <p className="pl-label">案件別表示</p>
                  <label className="switch">
                    <input type="checkbox"/>
                    <span className="slider"></span>
                  </label>
                  <p className="pl-label">千円</p>
                  <label className="switch">
                    <input type="checkbox"/>
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              {/* <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                options={select}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
              /> */}
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

export default Planning

