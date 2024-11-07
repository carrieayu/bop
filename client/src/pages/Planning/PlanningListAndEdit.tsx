import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { UnknownAction } from '@reduxjs/toolkit'
import { fetchAllClientData } from '../../reducers/table/tableSlice'
import Sidebar from '../../components/Sidebar/Sidebar'
import Btn from '../../components/Button/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import TablePlanningA from '../../components/Table/TablePlanningA'
import { TablePlanningB } from '../../components/Table/TablePlanningB'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import EditTablePlanning from '../../components/Table/EditTablePlanning'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'

const header = ['計画']
const smallDate = ['2022/24月', '2022/25月', '2022/26月']
const dates = ['04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月', '1月', '2月', '3月']

const PlanningListAndEdit = () => {
  const [tableList, setTableList] = useState<any>([])
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const totalPages = Math.ceil(tableList?.length / rowsPerPage)
  const select = [5, 10, 100]
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/planning-list')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')

  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      return newEditingState
    })
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const fetchData = async () => {
    try {
      const res = await dispatch(fetchAllClientData() as unknown as UnknownAction)
      setTableList(res.payload)
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
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
  }

  const handleSwitchToggle = () => {
    setIsSwitchActive((prevState) => !prevState)
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleTranslationSwitchToggle = () => {
    if (!isEditing) {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
      setInitialLanguage(language)
      setLanguage(newLanguage)
    }
  }

  return (
    <div className='planning_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='planning_content_wrapper'>
        <Sidebar />
        <div className='planning_table_wrapper'>
          <div className='planning_top_cont'>
            <div className='planning_content'>
              <div className='planning_btm'>
                <div className='planning_header_text'>
                  <div className='planning_left-content'>
                    <p>{translate('profitAndlossPlanning', language)}</p>
                  </div>
                  <div className='planning_right-content'>
                    <div className='planning_paginate'>
                      <button className='planning_mode_switch' onClick={handleClick}>
                        {isEditing
                          ? translate('switchToDisplayMode', language)
                          : translate('switchToEditMode', language)}
                      </button>
                      <p className='planning_pl-label'>{translate('displayByProject', language)}</p>
                      <label className='planning_switch'>
                        <input type='checkbox' checked={isSwitchActive} onChange={handleSwitchToggle} />
                        <span className='planning_slider'></span>
                      </label>
                      <p className='planning_pl-label'>{translate('thousandYen', language)}</p>
                      <label className='planning_switch'>
                        <input type='checkbox' checked={isThousandYenChecked} onChange={handleThousandYenToggle} />
                        <span className='planning_slider'></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className='planning_tbl_cont'>
                  <div className={`table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                    {/* Render the TablePlanning component here */}
                    {isEditing ? <EditTablePlanning /> : <TablePlanningA isThousandYenChecked={isThousandYenChecked} />}
                  </div>
                  <div className={`table_content_props ${isSwitchActive ? '' : 'hidden'}`}>
                    <TablePlanningB
                      data={paginatedData}
                      header={header}
                      dates={dates}
                      smallDate={smallDate}
                      isThousandYenChecked={isThousandYenChecked}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanningListAndEdit
