import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleError } from '../../utils/helperFunctionsUtil'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { TablePlanningB } from '../../components/Table/TablePlanningB'
import Sidebar from '../../components/Sidebar/Sidebar'
import TablePlanningA from '../../components/Table/TablePlanningA'
import EditTablePlanning from '../../components/Table/EditTablePlanning'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import { dates, header, smallDate } from '../../constants'
import { setupIdleTimer } from '../../utils/helperFunctionsUtil'
import AlertModal from '../../components/AlertModal/AlertModal'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes"
// REDUCERS
import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { fetchCostOfSale } from '../../reducers/costOfSale/costOfSaleSlice'
import { fetchEmployeeExpense } from '../../reducers/employeeExpense/employeeExpenseSlice'
import { fetchProject } from '../../reducers/project/projectSlice'
import { useAppDispatch } from '../../actions/hooks'
// SELECTORS
import { planningSelector } from '../../selectors/planning/planningSelector'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'

const PlanningListAndEdit = () => {
  const [tableList, setTableList] = useState<any>([])
  const dispatch = useAppDispatch()
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
  const planning = useSelector(planningSelector)
  const planningCalculations = useSelector(planningCalculationsSelector)

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  const handleEditModeToggle = () => {
    setIsThousandYenChecked(false)
    setIsEditing((prevState) => !prevState)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchActions = [
          { action: () => dispatch(fetchExpense()) },
          { action: () => dispatch(fetchCostOfSale()) },
          { action: () => dispatch(fetchEmployeeExpense()) },
          { action: () => dispatch(fetchProject()) },
        ]

        await Promise.all(
          fetchActions.map(({ action }) => action().catch((error) => handleError(action.name, error))),
        )
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData()
  }, [dispatch])

  useEffect(() => {
    if (isEditing) {
      setLanguage(initialLanguage)
    }
  }, [isEditing])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

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
    checkAccessToken().then(result => {
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
                    {isEditing ? (
                      <EditTablePlanning />
                    ) : (
                      <TablePlanningA
                        isThousandYenChecked={isThousandYenChecked}
                        planning={planning}
                        planningCalculations={planningCalculations}
                      />
                    )}
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
