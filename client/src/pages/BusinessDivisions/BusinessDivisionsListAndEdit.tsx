import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import AlertModal from '../../components/AlertModal/AlertModal'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import ListButtons from '../../components/ListButtons/ListButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import CrudModal from '../../components/CrudModal/CrudModal'
import '../../assets/scss/Components/SliderToggle.scss'
import { getBusinessDivision } from '../../api/BusinessDivisionEndpoint/GetBusinessDivision'
import { getUser } from '../../api/UserEndpoint/GetUser'
import { getCompany } from '../../api/CompanyEndpoint/GetCompany'
import { deleteBusinessDivision } from '../../api/BusinessDivisionEndpoint/DeleteBusinessDivision'
import { updateBusinessDivision } from '../../api/BusinessDivisionEndpoint/UpdateBusinessDivision'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { formatDate, handleMMListTabsClick, setupIdleTimer } from '../../utils/helperFunctionsUtil'
import { masterMaintenanceScreenTabs, token } from '../../constants'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes"

const BusinessDivisionsListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('businessDivision')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [business, setBusiness] = useState([])
  const [originalBusiness, setOriginalBusinessList] = useState(business)
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedBusiness, setselectedBusiness] = useState<any>(null)
  const [companyMap, setCompanyMap] = useState({})
  const [userMap, setUserMap] = useState({})
  const [selectedCompany, setSelectedCompany] = useState('')

  const totalPages = Math.ceil(100 / 10)
  const onTabClick = (tab) => handleMMListTabsClick(tab, navigate, setActiveTab)
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [deleteComplete, setDeleteComplete] = useState(false)
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
  }

  const handleClick = () => {
    setIsEditing((prevState) => !prevState)
  }
  useEffect(() => {
    if (isEditing) {
      setLanguage('jp')
    }

    if (!isEditing) {
      // Reset to original values when switching to list mode
      setBusiness(originalBusiness)
    }
  }, [isEditing])

  const handleChange = (index, event) => {
    const { name, value } = event.target
    setBusiness((prevBusiness) => prevBusiness.map((item, i) => (i === index ? { ...item, [name]: value } : item)))
  }

  const handleSubmit = async () => {
    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'businessDivisions'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    console.log(fieldChecks)
    // Validate records for the specified project fields
    const validateBusinessDivision = (records) => validateRecords(records, fieldChecks, 'businessDivision')

    // Step 2: Validate client-side input
    const validationErrors = validateBusinessDivision(business) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['business_division_name', 'company_id']
    const duplicateErrors = checkForDuplicates(business, uniqueFields, 'businessDivision', language)

    // Step 4: Map error types to data and translation keys for handling in the modal
    const errorMapping = [
      { errors: validationErrors, errorType: 'normalValidation' },
      { errors: duplicateErrors, errorType: 'duplicateValidation' },
    ]

    // Step 5: Display the first set of errors found, if any
    const firstError = errorMapping.find(({ errors }) => errors.length > 0)

    if (firstError) {
      const { errors, errorType } = firstError
      const translatedErrors = translateAndFormatErrors(errors, language, errorType)
      console.log(translatedErrors, 'trans errors')
      setCrudMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsCRUDOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }

    const getModifiedFields = (original, updated) => {
      const modifiedFields = []

      updated.forEach((updatedBusiness) => {
        const originalBusiness = original.find((bd) => bd.business_division_id === updatedBusiness.business_division_id)

        if (originalBusiness) {
          const changes = { business_division_id: updatedBusiness.business_division_id }

          for (const key in updatedBusiness) {
            if (updatedBusiness[key] !== originalBusiness[key]) {
              changes[key] = updatedBusiness[key]
            }
          }

          if (Object.keys(changes).length > 1) {
            modifiedFields.push(changes)
          }
        }
      })

      return modifiedFields
    }
    const modifiedFields = getModifiedFields(originalBusiness, business)
    if (modifiedFields.length === 0) {
      return
    }

    updateBusinessDivision(modifiedFields, token)
      .then(() => {
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setOriginalBusinessList(business)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              setCrudMessage(translate('businessDivisionNameExistsValidationMessage', language))
              setIsCRUDOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the business division data!', error)
              setCrudMessage(translate('error', language))
              setIsCRUDOpen(true)
              break
          }
        }
      })
  }

  const handleUpdateConfirm = async () => {
    await handleSubmit() // Call the submit function for update
    setIsUpdateConfirmationOpen(false)
  }

  const fetchCompanyAndUserData = async () => {
    try {
      // Fetch companies
      getCompany(token).then((data) => {
        const companies = data
        const companyMapping = companies.reduce((map, company) => {
          map[company.company_id] = company.company_name
          return map
        }, {})
        setCompanyMap(companyMapping)
      })

      // Fetch users
      getUser(token)
        .then((data) => {
          const users = data
          const userMapping = users.reduce((map, user) => {
            map[user.id] = user.last_name + ' ' + user.first_name
            return map
          }, {})
          setUserMap(userMapping)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            console.log(error)
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        })
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'
      } else {
        console.error('Error fetching company or user data!', error)
      }
    }
  }

  const fetchBusinessDivision = async () => {
    getBusinessDivision(token)
      .then((data) => {
        setBusiness(data)
        setOriginalBusinessList(data)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          console.log(error)
        } else {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login'
          } else {
            console.error('There was an error fetching the business!', error)
          }
        }
      })
  }

  useEffect(() => {
    fetchBusinessDivision()
    fetchCompanyAndUserData()
  }, [])

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value) // Set selected company ID
  }

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(business.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, business])

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

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

  const openModal = (business, business_division_id) => {
    setselectedBusiness(business_division_id)
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setselectedBusiness(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])

    if (!token) {
      window.location.href = '/login'
      return
    }
    deleteBusinessDivision(selectedBusiness, token)
      .then(() => {
        updateBusinessDivisionLists(selectedBusiness)
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting data:', error)
        }
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateBusinessDivisionLists = (selectedBusiness) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalBusinessList((prevList) =>
      prevList.filter((business) => business.business_division_id !== selectedBusiness),
    )
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setBusiness(originalBusiness)
    }
  }, [deleteComplete])

  const handleNewRegistrationClick = () => {
    navigate('/business-divisions-registration')
  }

  useEffect(() => {
    checkAccessToken(setIsAuthorized).then(result => {
      if (!result) { showAlertPopup(handleTimeoutConfirm); }
    });
  }, [token])

  return (
    <div className='BusinessDivisionsListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='BusinessDivisionsListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='BusinessDivisionsListAndEdit_maincontent_wrapper'>
          <div className='BusinessDivisionsListAndEdit_top_content'>
            <div className='BusinessDivisionsListAndEdit_top_body_cont'>
              <div className='BusinessDivisionsListAndEdit_mode_switch_datalist'>
                <div className='mode-switch-container'>
                  <p className='slider-mode-switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider-switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='BusinessDivisionsListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'businessDivisionsEdit' : 'businessDivisionsList', language)}
                handleTabsClick={onTabClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={masterMaintenanceScreenTabs}
              />
              <div className={`BusinessDivisionsListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='BusinessDivisionsListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='BusinessDivisionsListAndEdit_table_title '>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-left'>
                                  ID
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('companyName', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdBy', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdAt', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('updatedAt', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='BusinessDivisionsListAndEdit_table_body'>
                              {business.map((business_data, index) => (
                                <tr
                                  key={business_data.business_division_id}
                                  className='BusinessDivisionsListAndEdit_table_body_content_horizontal'
                                >
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>
                                    {business_data.business_division_id}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <input
                                      className='edit_input'
                                      type='text'
                                      name='business_division_name'
                                      value={business_data.business_division_name || ''}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <select
                                      className='edit_select'
                                      name='company'
                                      value={business_data.company || ''}
                                      onChange={(e) => handleChange(index, e)}
                                    >
                                      {Object.entries(companyMap).map(([companyId, companyName]) => (
                                        <option key={companyId} value={companyId}>
                                          {companyName as String}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {userMap[business_data.auth_user] || 'Unknown User'}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {formatDate(business_data.created_at)}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {formatDate(business_data.updated_at)}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('business', business_data.business_division_id)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='BusinessDivisionsListAndEdit_table_title '>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-left'>
                                ID
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('businessDivision', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('companyName', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdBy', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdAt', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('updatedAt', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='BusinessDivisionsListAndEdit_table_body'>
                            {business.map((business_data) => (
                              <tr
                                key={business_data.business_division_id}
                                className='BusinessDivisionsListAndEdit_table_body_content_horizontal'
                              >
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>
                                  {business_data.business_division_id}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {business_data.business_division_name}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {companyMap[business_data.company] || 'Unknown Company'}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {userMap[business_data.auth_user] || 'Unknown User'}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {formatDate(business_data.created_at)}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {formatDate(business_data.updated_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='BusinessDivisionsListAndEdit_is_editing_wrapper'>
                <div className='BusinessDivisionsListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='BusinessDivisionsListAndEdit_edit_submit_btn_cont'>
                      <button
                        className='BusinessDivisionsListAndEdit_edit_submit_btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
                        {translate('update', language)}
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        message={translate('deleteMessage', language)}
      />
      <CrudModal
        isCRUDOpen={isCRUDOpen}
        onClose={closeModal}
        message={crudMessage}
        validationMessages={crudValidationErrors}
      />
      <AlertModal
        isOpen={isUpdateConfirmationOpen}
        onConfirm={handleUpdateConfirm}
        onCancel={() => setIsUpdateConfirmationOpen(false)}
        message={translate('updateMessage', language)}
      />
      <AlertPopupComponent />
    </div>
  )
}

export default BusinessDivisionsListAndEdit
