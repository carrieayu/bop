import React, { useEffect, useState } from 'react'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import { createUser } from '../../api/UserEndpoint/CreateUser'
import {
  validateUserRecord,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { handleMMRegTabsClick, setupIdleTimer } from '../../utils/helperFunctionsUtil'
import { closeModal, openModal } from '../../actions/hooks'
import { masterMaintenanceScreenTabs, token, ACCESS_TOKEN } from '../../constants'
import { useAlertPopup, checkAccessToken, handleTimeoutConfirm } from "../../routes/ProtectedRoutes"

const UsersRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('users')
  const { language, setLanguage } = useLanguage()
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const [isPasswordValid, setIsPasswordValid] = useState(true)
  const [isPasswordMatch, setIsPasswordMatch] = useState(true)
  const [isEmailMatch, setIsEmailMatch] = useState(true)
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const { showAlertPopup, AlertPopupComponent } = useAlertPopup()
  
  const emptyFormData = {
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    email: '',
    confirm_password: '',
    confirm_email: '',
  }
  const [userData, setUserData] = useState(emptyFormData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const onTabClick = (tab) => handleMMRegTabsClick(tab, navigate, setActiveTab)
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal(setModalIsOpen)
  }

  const handleRemoveInputData = () => {
    setUserData(emptyFormData)
    closeModal(setModalIsOpen)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'users'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateUser = (records) => validateUserRecord(records, fieldChecks, 'user')

    // Step 2: Validate client-side input
    const validationErrors = validateUser([userData]) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['']
    const duplicateErrors = checkForDuplicates([userData], uniqueFields, 'user', language)

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
      setModalMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsModalOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }

    createUser(userData, token)
      .then(() => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setUserData(emptyFormData)
      })
      .catch((error) => {
        setModalMessage(translate('usersValidationText7', language))
        setIsModalOpen(true)
        console.error(error)
      })
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleListClick = () => {
    navigate('/users-list')
  }

  useEffect(() => {
    checkAccessToken().then(result => {
      if (!result) { showAlertPopup(handleTimeoutConfirm); }
    });
  }, [token])

  return (
    <div className='UsersRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='UsersRegistration_content_wrapper'>
        <Sidebar />
        <div className='UsersRegistration_data_content'>
          <div className='UsersRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('usersRegistration', language)}
              handleTabsClick={onTabClick}
              handleListClick={handleListClick}
              buttonConfig={masterMaintenanceScreenTabs}
            />
          </div>
          <div className='UsersRegistration_mid_body_cont'>
            <form className='UsersRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='UsersRegistration_mid_form_cont'>
                <div key='' className='UsersRegistration_top-form-input-div'>
                  <div className='UsersRegistration_username-div'>
                    <label className='username'>{translate('username', language)}</label>
                    <div className='input-with-msg'>
                      <input
                        type='text'
                        name='username'
                        value={userData.username}
                        placeholder={`${translate('eg', language)} : takahashi_taro`}
                        style={{
                          border: isUsernameValid ? '' : '2px solid red',
                        }}
                        onChange={(e) => handleChange(e)}
                      />
                      <p className='validation_txt1'>{translate('usersValidationText1', language)}</p>
                    </div>
                  </div>
                  <div className='UsersRegistration_bot-form-input-div'>
                    <div className='UsersRegistration_left-form-content-div'>
                      <div className='UsersRegistration_last_name-div'>
                        <label className='last_name'>{translate('lastName', language)}</label>
                        <input
                          type='text'
                          name='last_name'
                          value={userData.last_name}
                          placeholder={`${translate('eg', language)} : 高橋`}
                          onChange={(e) => handleChange(e)}
                        />
                      </div>
                      <div className='UsersRegistration_password-div'>
                        <label className='password'>{translate('password', language)}</label>
                        <input
                          type='password'
                          name='password'
                          value={userData.password}
                          style={{
                            border: isPasswordValid ? '' : '2px solid red',
                          }}
                          placeholder={`${translate('eg', language)} : Password1!`}
                          onChange={(e) => handleChange(e)}
                        />
                      </div>
                      <div className='UsersRegistration_email-div'>
                        <label className='email'>{translate('emailAddress', language)}</label>
                        <input
                          type='text'
                          name='email'
                          style={{
                            border: isEmailValid ? '' : '2px solid red',
                          }}
                          value={userData.email}
                          placeholder={`${translate('eg', language)} : takahashi_taro@gmail.com`}
                          onChange={(e) => handleChange(e)}
                        />
                      </div>
                    </div>
                    <div className='UsersRegistration_right-form-content-div'>
                      <div className='UsersRegistration_first_name-div'>
                        <label className='first_name'>{translate('firstName', language)}</label>
                        <div className='input-with-msg'>
                          <input
                            type='text'
                            name='first_name'
                            value={userData.first_name}
                            placeholder={`${translate('eg', language)} : 太郎`}
                            onChange={(e) => handleChange(e)}
                          />
                          <p className='validation_txt2'>{translate('usersValidationText2', language)}</p>
                        </div>
                      </div>
                      <div className='UsersRegistration_confirm_password-div'>
                        <label className='confirm_password'>{translate('confirmPassword', language)}</label>
                        <div className='input-with-msg'>
                          <input
                            type='password'
                            name='confirm_password'
                            value={userData.confirm_password}
                            style={{
                              border: isPasswordMatch ? '' : '2px solid red',
                            }}
                            placeholder={`${translate('eg', language)} : Password1!`}
                            onChange={(e) => handleChange(e)}
                          />
                          <p className='validation_txt3'>{translate('usersValidationText3', language)}</p>
                        </div>
                      </div>
                      <div className='UsersRegistration_confirm_email-div'>
                        <label className='confirm_email'>{translate('confirmEmailAddress', language)}</label>
                        <div className='input-with-msg'>
                          <input
                            type='text'
                            name='confirm_email'
                            value={userData.confirm_email}
                            placeholder={`${translate('eg', language)} : takahashi_taro@gmail.com`}
                            style={{
                              border: isEmailValid && isEmailMatch ? '' : '2px solid red',
                            }}
                            onChange={(e) => handleChange(e)}
                          />
                          <p className='validation_txt4'>{translate('usersValidationText4', language)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <input type='hidden' name='auth_user_id' value='' />
                </div>
              </div>
              <div className='UsersRegistration_lower_form_cont'>
                <div className='UsersRegistration_form-btn-content'>
                  <div className='UsersRegistration_options-btn'>
                    <button type='button' className='button is-light' onClick={handleCancel}>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AlertModal
        isOpen={modalIsOpen}
        onConfirm={handleRemoveInputData}
        onCancel={closeModal}
        message={translate('cancelCreation', language)}
      />
      <CrudModal
        message={modalMessage}
        onClose={() => setIsModalOpen(false)}
        isCRUDOpen={isModalOpen}
        validationMessages={crudValidationErrors}
      />
      <AlertPopupComponent />
    </div>
  )
}

export default UsersRegistration
