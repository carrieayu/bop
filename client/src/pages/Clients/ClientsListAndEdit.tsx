import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import AlertModal from "../../components/AlertModal/AlertModal";
import { RiDeleteBin6Fill } from "react-icons/ri";
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import CrudModal from "../../components/CrudModal/CrudModal";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss'
import { getClient } from "../../api/MasterClientEndpoint/GetMasterClient";
import { deleteClient } from "../../api/MasterClientEndpoint/DeleteMasterClient";
import { updateMasterClient } from "../../api/MasterClientEndpoint/UpdateMasterClient";
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { formatDate } from '../../utils/helperFunctionsUtil'



const ClientsListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('client')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [updatedClients, setUpdatedClients] = useState([])
  const [originalClientsList, setOriginalClientsList] = useState(updatedClients)
  const [deleteId, setDeleteClientId] = useState([])
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const token = localStorage.getItem('accessToken')
  const totalPages = Math.ceil(100 / 10)
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [deleteComplete, setDeleteComplete] = useState(false)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
    switch (tab) {
      case 'client':
        navigate('/clients-list')
        break
      case 'employee':
        navigate('/employees-list')
        break
      case 'businessDivision':
        navigate('/business-divisions-list')
        break
      case 'users':
        navigate('/users-list')
        break
      default:
        break
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRowsPerPageChange = (numRows: number) => {
    setRowsPerPage(numRows)
    setCurrentPage(0)
  }

  const handleClick = () => {
    setIsEditing((prevState) => {
      const newEditingState = !prevState
      if (newEditingState) {
        setLanguage(initialLanguage)
      }

      if (!newEditingState) {
        // Reset to original values when switching to list mode
        setUpdatedClients(originalClientsList)
      }

      return newEditingState
    })
  }

  const handleChange = (index, e) => {
    const { name, value } = e.target
    setUpdatedClients((prevState) => {
      const updatedClientData = [...prevState]
      updatedClientData[index] = {
        ...updatedClientData[index],
        [name]: value,
      }
      return updatedClientData
    })
  }

  const validateClient = (client) => {
    return client.every((cl) => {
      return cl.client_name.trim() !== ''
    })
  }

  const handleSubmit = async () => {
    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'clients'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateUser = (records) => validateRecords(records, fieldChecks, 'client')

    // Step 2: Validate client-side input
    const validationErrors = validateUser(updatedClients) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['client_name']
    const duplicateErrors = checkForDuplicates(updatedClients, uniqueFields, 'client', language)

    // Step 4: Map error types to data and translation keys for handling in the modal
    const errorMapping = [
      { errors: validationErrors, errorType: 'normalValidation' },
      { errors: duplicateErrors, errorType: 'duplicateValidation' },
    ]

    // Step 5: Display the first set of errors found, if any
    const firstError = errorMapping.find(({ errors }) => errors.length > 0)
    console.log(firstError, 'first error', typeof firstError, firstError.errors.length)
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

      updated.forEach((updatedClient) => {
        const originalClient = original.find((emp) => emp.client_id === updatedClient.client_id)

        if (originalClient) {
          const changes = { client_id: updatedClient.client_id }

          for (const key in updatedClient) {
            if (updatedClient[key] !== originalClient[key]) {
              changes[key] = updatedClient[key]
            }
          }

          if (Object.keys(changes).length > 1) {
            modifiedFields.push(changes)
          }
        }
      })

      return modifiedFields
    }
    const modifiedFields = getModifiedFields(originalClientsList, updatedClients)
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    updateMasterClient(modifiedFields, token)
      .then(() => {
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              setCrudMessage(translate('clientNameExistsUpdateValidationMessage', language))
              setIsCRUDOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error updating the clients data!', error)
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

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }
      getClient(token)
        .then((data) => {
          setUpdatedClients(data)
          setOriginalClientsList(data)
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        })
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(updatedClients.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, updatedClients])

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

  const openModal = (project, id) => {
    setDeleteClientId(id)
    setSelectedClient(project)
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setSelectedClient(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  // # Handle DELETE on Edit Screen

  // STEP # 1
  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])

    deleteClient(deleteId, token)
      .then(() => {
        updateClientLists(deleteId)
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting client:', error)
        }
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateClientLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    setOriginalClientsList((prevList) => prevList.filter((client) => client.client_id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setUpdatedClients(originalClientsList)
    }
  }, [deleteComplete])

  const handleNewRegistrationClick = () => {
    navigate('/clients-registration')
  }

  return (
    <div className='ClientsListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='ClientsListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='ClientsListAndEdit_maincontent_wrapper'>
          <div className='ClientsListAndEdit_top_content'>
            <div className='ClientsListAndEdit_top_body_cont'>
              <div className='ClientsListAndEdit_mode_switch_datalist'>
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
            <div className='ClientsListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'clientsEdit' : 'clientsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className={`ClientsListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='ClientsListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='ClientsListAndEdit_table_title '>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('clientName', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdBy', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdAt', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('updatedAt', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='ClientsListAndEdit_table_body'>
                              {updatedClients.map((clients, index) => (
                                <tr
                                  key={clients.client_id}
                                  className='ClientsListAndEdit_table_body_content_horizontal'
                                >
                                  <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'>
                                    {clients.client_id}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='client_name'
                                      value={clients.client_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {clients.auth_user}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {formatDate(clients.created_at)}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {formatDate(clients.updated_at)}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical delete_icon'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('project', clients.client_id)}
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
                            <tr className='ClientsListAndEdit_table_title '>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('clientName', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdBy', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdAt', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('updatedAt', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='ClientsListAndEdit_table_body'>
                            {originalClientsList.map((clients) => (
                              <tr key={clients.client_id} className='ClientsListAndEdit_table_body_content_horizontal'>
                                <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'>
                                  {clients.client_id}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {clients.client_name}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>{clients.auth_user}</td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {formatDate(clients.created_at)}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {formatDate(clients.updated_at)}
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
              <div className='ClientsListAndEdit_is_editing_wrapper'>
                <div className='ClientsListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='ClientsListAndEdit_edit_submit_btn_cont'>
                      <button
                        className='ClientsListAndEdit_edit_submit_btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
                        更新
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
        message={translate('clientDeleteMessage', language)}
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
    </div>
  )
};

export default ClientsListAndEdit;
