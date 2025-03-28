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
// REDUCERS
import { fetchExpense } from '../../reducers/expenses/expensesSlice'
import { fetchCostOfSale } from '../../reducers/costOfSale/costOfSaleSlice'
import { fetchEmployeeExpense } from '../../reducers/employeeExpense/employeeExpenseSlice'
import { fetchProject } from '../../reducers/project/projectSlice'
import { useAppDispatch } from '../../actions/hooks'
// SELECTORS
import { planningSelector } from '../../selectors/planning/planningSelector'
import { planningCalculationsSelector } from '../../selectors/planning/planningCalculationSelectors'
import { editingTableALabelsAndValues } from '../../utils/tableEditingALabelAndValues'

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
  const [initialLanguage, setInitialLanguage] = useState(language)
  const planning = useSelector(planningSelector)
  const planningCalculations = useSelector(planningCalculationsSelector)
  const [isEditing, setIsEditing] = useState(false)

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          dispatch(fetchExpense()),
          dispatch(fetchCostOfSale()),
          dispatch(fetchEmployeeExpense()),
          dispatch(fetchProject()),
        ])
      } catch (error) {
        handleError('fetchAllData', error)
      }
    }
    fetchAllData()
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

  const handleDisplayByProjectToggle = () => {
    console.log('switch')
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

  // # FOR EditTablePlanning Table/Component

  // Used as a comparison for editedData to check for unsaved changes.
  const [initialData, setInitialData] = useState(editingTableALabelsAndValues(planning, planningCalculations))

  // Variables below (↓) are all data to be passed into EditTablePlanning where it can be modified.

  // # Initialize as a copy of initalData to be updated in edit screen.
  // # Temporarlity Storing Edited (unsaved) data between (Display/Edit) (can be updated in edit screen)
  const [editedData, setEditedData] = useState(editingTableALabelsAndValues(planning, planningCalculations))
  // # Initialize Object that stores ONLY modified inputs with Record ID from database table as key.
  const [modifiedFields, setModifiedFields] = useState({})
  // # Boolean that tracks if there are any unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // # For Displaying Edited Unsaved Data on Edit Screen
  // # If changes have been made in edit screen but have NOT been saved.
  // # For Displaying Edited Unsaved Data on Edit Screen
  // If changes have been made in edit screen but have NOT been saved.
  const isDataModified = JSON.stringify(editedData) !== JSON.stringify(initialData)

  const checkChanges = () => {
    if (isDataModified) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }

  const handleEditModeToggle = () => {
    setIsThousandYenChecked(false)
    setIsEditing((prevState) => !prevState)
    checkChanges()
  }

  // # JSX Helper
  const renderSwitch = (checked, onChange, disabled, label) => (
    <>
      <p className={`${disabled ? 'planning_pl-label_disabled' : 'planning_pl-label'}`}>{translate(label, language)}</p>
      <label className='planning_switch'>
        <input type='checkbox' checked={checked} onChange={onChange} disabled={disabled} />
        <span className='planning_slider'></span>
      </label>
    </>
  )

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
                      <p className={`${isSwitchActive ? 'planning_mode_switch_disabled' : 'planning_mode_switch'}`}>
                        {isEditing
                          ? translate('switchToDisplayMode', language)
                          : translate('switchToEditMode', language)}
                      </p>
                      <label className='planning_switch'>
                        <input
                          type='checkbox'
                          checked={isEditing}
                          onChange={handleEditModeToggle}
                          disabled={isSwitchActive}
                        />
                        <span className='planning_slider'></span>
                      </label>
                      {renderSwitch(isSwitchActive, handleDisplayByProjectToggle, isEditing, 'displayByProject')}
                      {renderSwitch(isThousandYenChecked, handleThousandYenToggle, isEditing, 'thousandYen')}
                    </div>
                  </div>
                </div>
                <div className='planning_tbl_cont'>
                  <div className={`table_content_planning ${isSwitchActive ? 'hidden' : ''}`}>
                    {isEditing ? (
                      <EditTablePlanning
                        editedData={editedData}
                        setEditedData={setEditedData}
                        modifiedFields={modifiedFields}
                        setModifiedFields={setModifiedFields}
                        hasUnsavedChanges={hasUnsavedChanges}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
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
    </div>
  )
}

export default PlanningListAndEdit
