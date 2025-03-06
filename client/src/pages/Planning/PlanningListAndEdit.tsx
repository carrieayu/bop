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
import { dates, header, smallDate } from '../../constants'
import { setupIdleTimer } from '../../utils/helperFunctionsUtil'
import AlertModal from '../../components/AlertModal/AlertModal'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes"

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
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleEditModeToggle = () => {
    setIsThousandYenChecked(false)
    setIsEditing((prevState) => !prevState)
  }
  useEffect(() => {
    if (isEditing) {
      setLanguage(initialLanguage)
    }
  }, [isEditing])

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

  useEffect(() => {
    checkAccessToken(setIsAuthorized).then(result => {
      if (!result) { showAlertPopup(handleTimeoutConfirm); }
    });
  }, [])

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
                      {isSwitchActive ? (
                        <p className='planning_mode_switch_disabled'>
                          {isEditing
                            ? translate('switchToDisplayMode', language)
                            : translate('switchToEditMode', language)}
                        </p>
                      ) : (
                        <p className='planning_mode_switch'>
                          {isEditing
                            ? translate('switchToDisplayMode', language)
                            : translate('switchToEditMode', language)}
                        </p>
                      )}

                      <label className='planning_switch'>
                        {isSwitchActive ? (
                          <label className='swith_edit'>
                            <input type='checkbox' checked={isEditing} onChange={handleEditModeToggle} disabled />
                            <span className='planning_slider'></span>
                          </label>
                        ) : (
                          <div>
                            <label className='swith_edit'>
                              <input type='checkbox' checked={isEditing} onChange={handleEditModeToggle} />
                              <span className='planning_slider'></span>
                            </label>
                          </div>
                        )}
                      </label>
                      {isEditing ? (
                        <p className='planning_pl-label_disabled'>{translate('displayByProject', language)}</p>
                      ) : (
                        <p className='planning_pl-label'>{translate('displayByProject', language)}</p>
                      )}

                      {isEditing ? (
                        <label className='planning_switch'>
                          <input type='checkbox' checked={isSwitchActive} onChange={handleSwitchToggle} disabled />
                          <span className='planning_slider'></span>
                        </label>
                      ) : (
                        <label className='planning_switch'>
                          <input type='checkbox' checked={isSwitchActive} onChange={handleSwitchToggle} />
                          <span className='planning_slider'></span>
                        </label>
                      )}

                      {isEditing ? (
                        <p className='planning_pl-label_disabled'>{translate('thousandYen', language)}</p>
                      ) : (
                        <p className='planning_pl-label'>{translate('thousandYen', language)}</p>
                      )}

                      {isEditing ? (
                        <label className='planning_switch'>
                          <input
                            type='checkbox'
                            checked={isThousandYenChecked}
                            onChange={handleThousandYenToggle}
                            disabled
                          />
                          <span className='planning_slider'></span>
                        </label>
                      ) : (
                        <label className='planning_switch'>
                          <input type='checkbox' checked={isThousandYenChecked} onChange={handleThousandYenToggle} />
                          <span className='planning_slider'></span>
                        </label>
                      )}
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
      <AlertPopupComponent />
    </div>
  )
}

export default PlanningListAndEdit
