import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'
import AlertModal from '../../components/AlertModal/AlertModal'
import { RiDeleteBin6Fill } from 'react-icons/ri'
import DatePicker from 'react-datepicker'
import ListButtons from '../../components/ListButtons/ListButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss'
import { getUser } from '../../api/UserEndpoint/GetUser'
import { deleteUser } from '../../api/UserEndpoint/DeleteUser'
import { updateUser } from '../../api/UserEndpoint/UpdateUser'
import {
  validateUserRecord,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicateUsers,
} from '../../utils/validationUtil'
import { formatDate, handleMMListTabsClick, setupIdleTimer } from '../../utils/helperFunctionsUtil'
import { masterMaintenanceScreenTabs, token, IDLE_TIMEOUT } from '../../constants'

const UsersListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('users')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [isEditing, setIsEditing] = useState(false)
  const [userList, setUserList] = useState([])
  const [originalUserList, setOriginalUserList] = useState([])
  const [initialLanguage, setInitialLanguage] = useState(language)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [deleteId, setDeleteUserId] = useState([])
  const [userData, setUserData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    email: '',
    confirm_password: '',
    confirm_email: '',
  })

  const totalPages = Math.ceil(100 / 10)
  const onTabClick = (tab) => handleMMListTabsClick(tab, navigate, setActiveTab)
  const [isCRUDOpen, setIsCRUDOpen] = useState(false)
  const [crudMessage, setCrudMessage] = useState('')
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false)
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [deleteComplete, setDeleteComplete] = useState(false)
  const [isNonActiveOpen, setIsNonActiveOpen] = useState(false)

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
      setUserList(originalUserList)
    }
  }, [isEditing])

  const handleChange = (index, event) => {
    const { name, value } = event.target
    setUserList((prevState) => {
      const updatedUserData = [...prevState]
      updatedUserData[index] = {
        ...updatedUserData[index],
        [name]: value,
      }
      return updatedUserData
    })
  }

  const handleSubmit = async () => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    // Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'usersList'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateUser = (records) => validateUserRecord(records, fieldChecks, 'usersList')

    // Step 2: Validate client-side input
    const validationErrors = validateUser(userList) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['email', 'username']
    const duplicateErrors = checkForDuplicateUsers(userList, uniqueFields, 'usersList', language)

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

    updateUser(userList, token)
      .then(() => {
        setCrudMessage(translate('successfullyUpdated', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
        fetchUserListHandler(token)
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the user data!', error)
        }
      })
  }

  const handleUpdateConfirm = async () => {
    await handleSubmit() // Call the submit function for update
    setIsUpdateConfirmationOpen(false)
  }

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }

      fetchUserListHandler(token)
    }
    fetchUsers()
  }, [])

  useEffect(() => {}, [originalUserList])

  useEffect(() => {
    const startIndex = currentPage * rowsPerPage
    setPaginatedData(userList.slice(startIndex, startIndex + rowsPerPage))
  }, [currentPage, rowsPerPage, userList])

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

  const openModal = (users, id) => {
    setSelectedProject(users)
    setModalIsOpen(true)
    setDeleteUserId(id)
  }

  const closeModal = () => {
    setSelectedProject(null)
    setModalIsOpen(false)
    setIsCRUDOpen(false)
  }

  // # Handle DELETE on Edit Screen

  // STEP # 1
  const handleConfirm = async () => {
    // Sets the Validation Errors if any to empty as they are not necessary for delete.
    setCrudValidationErrors([])
    deleteUser(deleteId, token)
      .then(() => {
        updateUserLists(deleteId)
        // setUserList((prevList) => prevList.filter((user) => user.id !== deleteId))
        setCrudMessage(translate('successfullyDeleted', language))
        setIsCRUDOpen(true)
        setIsEditing(false)
      })
      .catch((error) => {
        console.error('Error deleting user:', error)
      })
  }

  // Set the Lists to match the DB after deletion.

  // Step #2
  const updateUserLists = (deleteId) => {
    // Deletes the record with deleteId from original list (This should always match DB)
    // setOriginalClientsList((prevList) => prevList.filter((client) => client.client_id !== deleteId))
    setOriginalUserList((prevList) => prevList.filter((user) => user.id !== deleteId))
    setDeleteComplete(true)
  }

  // Step #3
  useEffect(() => {
    if (deleteComplete) {
      // After Delete, Screen Automatically Reverts To List Screen NOT Edit Screen.
      // original list has deleted the record with deleteID
      // The updated list used on Edit screen goes back to matching orginal list.
      setUserList(originalUserList)
    }
  }, [deleteComplete])

  const handleNewRegistrationClick = () => {
    navigate('/users-registration')
  }

  const fetchUserListHandler = async (token) => {
    try {
      const data = await getUser(token);
      // Update Date Format For Display: Formats the Date so it appears correctly in the Edit Page
      const originalData = data.map((user) => ({
        ...user, // Keep other properties intact
        date_joined: formatDate(user.date_joined), // Update the date format
      }));
      setUserList(originalData); // Update state with the modified array. Will be updated on Front End (Edit Mode)
      setOriginalUserList(originalData); // Current State in DB (List Mode)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(error);
      } else {
        console.error('There was an error fetching the users!', error);
      }
    }
  };

  const [isIdle, setIsIdle] = useState(false);
  useEffect(() => {
    const onIdle = () => {
      setIsIdle(true);
      setIsNonActiveOpen(true)
    };
    const idleTimer = setupIdleTimer(onIdle, IDLE_TIMEOUT);
    idleTimer.startListening();
    return () => {
      idleTimer.stopListening();
    };
  }, []);

  const handleNonActiveConfirm = async () => {
    setIsNonActiveOpen(false)
    window.location.href = '/login'
  }

  return (
    <div className='UsersListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='UsersListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='UsersListAndEdit_maincontent_wrapper'>
          <div className='UsersListAndEdit_top_content'>
            <div className='UsersListAndEdit_top_body_cont'>
              <div className='UsersListAndEdit_mode_switch_datalist'>
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
            <div className='UsersListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'usersEdit' : 'usersList', language)}
                handleTabsClick={onTabClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={masterMaintenanceScreenTabs}
              />
              <div className={`UsersListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className={`UsersListAndEdit_table_cont ${isEditing ? 'editScrollable' : ''}`}>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='UsersListAndEdit_table_title '>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>ID</th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('username', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('lastName', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('firstName', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('emailAddress', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('dateJoined', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='UsersListAndEdit_table_body'>
                              {userList.map((users, index) => (
                                <tr key={users.id} className='UsersListAndEdit_table_body_content_horizontal'>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    {users.id}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    <input
                                      type='text'
                                      name='username'
                                      value={users.username}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    <input
                                      type='text'
                                      name='last_name'
                                      value={users.last_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    <input
                                      type='text'
                                      name='first_name'
                                      value={users.first_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    <input
                                      type='text'
                                      name='email'
                                      value={users.email}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                    <input
                                      type='date'
                                      name='date_joined'
                                      value={users.date_joined}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical delete_icon'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('users', users.id)}
                                      style={{ color: 'red' }}
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
                            <tr className='UsersListAndEdit_table_title '>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>ID</th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('username', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('lastName', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('firstName', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('emailAddress', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('dateJoined', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='UsersListAndEdit_table_body'>
                            {userList.map((users) => (
                              <tr key={users.id} className='UsersListAndEdit_table_body_content_horizantal'>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.id}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.username}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.last_name}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.first_name}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.email}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-centered'>
                                  {users.date_joined}
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
              <div className='UsersListAndEdit_is_editing_wrapper'>
                <div className='UsersListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='UsersListAndEdit_edit_submit_btn_cont'>
                      <button
                        className='UsersListAndEdit_edit_submit_btn'
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
      <AlertModal
        isOpen={isNonActiveOpen}
        onConfirm={handleNonActiveConfirm}
        onCancel={() => setIsNonActiveOpen(false)}
        message={translate('nonActiveMessage', language)}
      />
    </div>
  )
}

export default UsersListAndEdit
