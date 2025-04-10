import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import EditTableResults from '../../components/TableResults/EditTableResults'
import { TableResultsB } from '../../components/TableResults/TableResultB'
import TableResultsA from '../../components/TableResults/TableResultA'
import { RxHamburgerMenu } from 'react-icons/rx'
import { dates, smallDate, token } from '../../constants'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes"
// REDUCERS
import { fetchCostOfSaleResult } from '../../reducers/costOfSale/costOfSaleResultSlice'
import { fetchExpenseResult } from '../../reducers/expenses/expensesResultsSlice'
import { fetchProjectResult } from '../../reducers/project/projectResultSlice'
import { fetchEmployeeExpenseResult } from '../../reducers/employeeExpense/employeeExpenseResultSlice'
// SELECTORS
import { resultsSelector } from '../../selectors/results/resultsSelector'
import { resultsCalculationsSelector } from '../../selectors/results/resultsCalculationSelectors'
import { handleError } from '../../utils/helperFunctionsUtil'
import { useAppDispatch } from '../../actions/hooks'
import { downloadXLS } from './resultsDownloadXLS'
import {  tableEditingLabelAndValues } from '../../utils/tableAEditingLabelAndValues'

const ResultsListAndEdit = () => {
  const dispatch = useAppDispatch()
  const [data, setData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('/results')
  const [isSwitchActive, setIsSwitchActive] = useState(false)
  const [isThousandYenChecked, setIsThousandYenChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [isXLSModalOpen, setIsXLSModalOpen] = useState(false)
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const results = useSelector(resultsSelector)
  const resultsCalculations = useSelector(resultsCalculationsSelector)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchActions = [
          { action: () => dispatch(fetchExpenseResult()) },
          { action: () => dispatch(fetchCostOfSaleResult()) },
          { action: () => dispatch(fetchEmployeeExpenseResult()) },
          { action: () => dispatch(fetchProjectResult()) },
        ]

        await Promise.all(fetchActions.map(({ action }) => action().catch((error) => handleError(action.name, error))))
      } catch (error) {
        console.error('Unexpected error:', error)
      }
    }

    fetchData()
  }, [dispatch])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
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

  const handleEditModeToggle = () => {
    setIsThousandYenChecked(false)
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }
      return newEditingState
    })
  }

  const handleThousandYenToggle = () => {
    setIsThousandYenChecked((prevState) => !prevState)
  }

  // Temporarily Moved to Another File. (But it needs fixing)
  const handleDownloadXLS = () => {
    downloadXLS(language)
  }

  const toggleModal = () => {
    setIsXLSModalOpen((prev) => !prev)
  }

  const closeModal = () => {
    setIsXLSModalOpen(false)
  }

  const handleClickOutside = (e: MouseEvent) => {
    const modal = document.querySelector('.results-csv-modal')
    const burgerIcon = document.querySelector('.results_burger')

    if (modal && !modal.contains(e.target as Node) && burgerIcon && !burgerIcon.contains(e.target as Node)) {
      setIsXLSModalOpen(false)
    }
  }

  const header = [translate('planning', language)]

  useEffect(() => {
    if (isXLSModalOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isXLSModalOpen])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  useEffect(() => {
    checkAccessToken().then((result) => {
      if (!result) {
        showAlertPopup(handleTimeoutConfirm)
      }
    })
  }, [token])

  // # FOR EditTablePlanning Table/Component

  // Used as a comparison for editedData to check for unsaved changes.
  const [initialData, setInitialData] = useState(tableEditingLabelAndValues(results, resultsCalculations))

  // Variables below (↓) are all data to be passed into EditTablePlanning where it can be modified.

  // # Initialize as a copy of initalData to be updated in edit screen.
  // # Temporarlity Storing Edited (unsaved) data between (Display/Edit) (can be updated in edit screen)
  const [editedData, setEditedData] = useState(tableEditingLabelAndValues(results, resultsCalculations))
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

  // # JSX Helper
  const renderSwitch = (checked, onChange, disabled, label) => (
    <>
      <p className={`${disabled ? 'results_pl-label_disabled' : 'results_pl-label'}`}>
        {translate(label, language)}
      </p>
      <label className='results_switch'>
        <input type='checkbox' checked={checked} onChange={onChange} disabled={disabled} />
        <span className='results_slider'></span>
      </label>
    </>
  )

  return (
    <div className='results_wrapper'>
      <div className='main-header-buttons'>
        <HeaderButtons
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          isTranslateSwitchActive={isTranslateSwitchActive}
          handleTranslationSwitchToggle={handleTranslationSwitchToggle}
        />
      </div>
      <div className='results_content_wrapper'>
        <Sidebar />
        <div className='results_table_wrapper'>
          <div className='results_top_cont'>
            <div className='results_content'>
              <div className='results_btm'>
                <div className='results_header_text'>
                  <div className='results_left-content'>
                    <p>{translate('results', language)}</p>
                  </div>
                  <div className='results_right-content'>
                    <div className='results_paginate'>
                      <p className={`${isSwitchActive ? 'results_mode_switch_disabled' : 'results_mode_switch'}`}>
                        {isEditing
                          ? translate('switchToDisplayMode', language)
                          : translate('switchToEditMode', language)}
                      </p>
                      <label className='results_switch'>
                        <input
                          type='checkbox'
                          checked={isEditing}
                          onChange={handleEditModeToggle}
                          disabled={isSwitchActive}
                        />
                        <span className='results_slider'></span>
                      </label>
                      {renderSwitch(isThousandYenChecked, handleThousandYenToggle, isEditing, 'thousandYen')}
                      <label className='results_burger'>
                        <RxHamburgerMenu onClick={toggleModal} />
                      </label>
                      {isXLSModalOpen && (
                        <div className='results-csv-modal' onClick={closeModal}>
                          <div className='results-csv-modal-content' onClick={(e) => e.stopPropagation()}>
                            <p className='results-csv-p' onClick={handleDownloadXLS}>
                              {translate('download', language)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className='results_tbl_cont'>
                  <div className={`table_content_results ${isSwitchActive ? 'hidden' : ''}`}>
                    {/* Render the TablePlanning component here */}
                    {isEditing ? (
                      <EditTableResults
                        editedData={editedData}
                        setEditedData={setEditedData}
                        modifiedFields={modifiedFields}
                        setModifiedFields={setModifiedFields}
                        hasUnsavedChanges={hasUnsavedChanges}
                        setHasUnsavedChanges={setHasUnsavedChanges}
                      />
                    ) : (
                      <TableResultsA
                        isThousandYenChecked={isThousandYenChecked}
                        results={results}
                        resultsCalculations={resultsCalculations}
                      />
                    )}
                  </div>
                  <div className={`table_content_props ${isSwitchActive ? '' : 'hidden'}`}>
                    <TableResultsB
                      data={data}
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

export default ResultsListAndEdit
