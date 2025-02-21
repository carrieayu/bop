import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import axios from 'axios'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import { createBusinessDivision } from '../../api/BusinessDivisionEndpoint/CreateBusinessDivision'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'
import { handleMMRegTabsClick, setupIdleTimer } from '../../utils/helperFunctionsUtil'
import { masterMaintenanceScreenTabs, maximumEntries, storedUserID, token, IDLE_TIMEOUT } from '../../constants'
import { addFormInput, closeModal, openModal, removeFormInput } from '../../actions/hooks'
import { useIdleTimer } from '../../hooks/useIdleTimer';

const BusinessDivisionsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('businessDivision')
  const { language, setLanguage } = useLanguage()
  const [companyList, setCompanyList] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en')
  const [businessDivisionName, setBusinessDivisionName] = useState('')
  const [authUserID] = useState(storedUserID)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const onTabClick = (tab) => handleMMRegTabsClick(tab, navigate, setActiveTab)
  const emptyFormData = {
    business_division_name: '',
    company_id: '',
    auth_user_id: authUserID,
  }
  const [formData, setFormData] = useState([emptyFormData])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [crudValidationErrors, setCrudValidationErrors] = useState([])
  const [isNonActiveOpen, setIsNonActiveOpen] = useState(false)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal(setModalIsOpen)
  }

  const handleRemoveInputData = () => {
    setFormData([emptyFormData])
    closeModal(setModalIsOpen)
  }

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en'
    setLanguage(newLanguage)
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const updatedFormData = [...formData]
    updatedFormData[index] = {
      ...updatedFormData[index],
      [name]: value,
    }
    setFormData(updatedFormData)
  }

  const handleAdd = () => {
    addFormInput(formData, setFormData, maximumEntries, emptyFormData)
  }

  const validateBusinessDivision = (businessDivision) => {
    return businessDivision.every((bd) => {
      return bd.business_division_name.trim() !== ''
    })
  }

  const handleRemove = () => {
    removeFormInput(formData, setFormData)
  }

  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path)
    }
  }, [location.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postData = formData.map((business) => ({
      business_division_name: business.business_division_name,
      company_id: business.company_id,
      auth_user_id: business.auth_user_id,
    }))

    if (!token) {
      window.location.href = '/login'
      return
    }

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
    const validationErrors = validateBusinessDivision(formData) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['business_division_name', 'company_id']
    const duplicateErrors = checkForDuplicates(formData, uniqueFields, 'businessDivision', language)

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
      setModalMessage(translatedErrors)
      setCrudValidationErrors(translatedErrors)
      setIsModalOpen(true)
      return
    } else {
      setCrudValidationErrors([])
    }

    createBusinessDivision(postData, token)
      .then((data) => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setFormData([emptyFormData])
      })
      .catch((error) => {
        console.log('error', error)
        if (error.response) {
          const { status, data } = error.response

          switch (status) {
            case 409:
              const existingDivisions =
                data.errors.map((err) => err.business_division_name).join(', ') || 'Unknown division'
              setModalMessage(
                translate('businessDivisionNameExistsValidationMessage', language).replace(
                  '${businessDivisionName}',
                  existingDivisions,
                ),
              )
              setIsModalOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the business division data!', error)
              setModalMessage(translate('error', language))
              setIsModalOpen(true)
              break
          }
        }
      })
  }

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${getReactActiveEndpoint()}/api/master-companies/list/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        setCompanyList(response.data)
      } catch (error) {
        console.error('Error fetching business:', error)
      }
    }

    fetchCompany()
  }, [token])

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value) // Update the selected company state
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en')
  }, [language])

  const handleListClick = () => {
    navigate('/business-divisions-list')
  }

  const onIdle = () => {};
  const { isIdle, isIdleModalOpen, handleNonActiveConfirm, setIsIdleModalOpen } = useIdleTimer(onIdle, IDLE_TIMEOUT);
  useEffect(() => {
      if (isIdleModalOpen) {
          setIsNonActiveOpen(true)
      }
  }, [isIdleModalOpen]);
  
  return (
    <div className='BusinessDivisionsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='BusinessDivisionsRegistration_content_wrapper'>
        <Sidebar />
        <div className='BusinessDivisionsRegistration_data_content'>
          <div className='BusinessDivisionsRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('businessDivisionsRegistration', language)}
              handleTabsClick={onTabClick}
              handleListClick={handleListClick}
              buttonConfig={masterMaintenanceScreenTabs}
            />
          </div>
          <div className='BusinessDivisionsRegistration_mid_body_cont'>
            <form className='BusinessDivisionsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='BusinessDivisionsRegistration_mid_form_cont'>
                {formData.map((form, index) => (
                  <div
                    key={index}
                    className='BusinessDivisionsRegistration_form-content BusinessDivisionsRegistration_ForImplementationOfPlusAndMinus'
                  >
                    <div
                      className={`BusinessDivisionsRegistration_form-content ${index > 0 ? 'HorizontalLineBelow' : ''}`}
                    ></div>
                    <div className='BusinessDivisionsRegistration_form-div'>
                      <div className='BusinessDivisionsRegistration_form-content-div'>
                        <div className='BusinessDivisionsRegistration_business_division_name-div'>
                          <label className='business_division_name'>{translate('businessDivision', language)}</label>
                          <input
                            type='text'
                            name='business_division_name'
                            value={form.business_division_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='BusinessDivisionsRegistration_company_name-div'>
                          <label className='BusinessDivisionsRegistration_company_name'>
                            {translate('companyName', language)}
                          </label>
                          <select
                            className='BusinessDivisionsRegistration_select-option'
                            name='company_id'
                            value={form.company_id}
                            // onChange={handleCompanyChange}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''>{translate('selectCompany', language)}</option>
                            {companyList.map((company) => (
                              <option key={company.company_id} value={company.company_id}>
                                {company.company_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='auth_user_id' value={form.auth_user_id} />
                  </div>
                ))}
              </div>
              {/* <div className='BusinessDivisionsRegistration_lower_form_cont'> */}
              <div className='BusinessDivisionsRegistration_form-btn-content'>
                <div className='BusinessDivisionsRegistration_plus-btn'>
                  {formData.length >= 2 ? (
                    <button className='BusinessDivisionsRegistration_dec' type='button' onClick={handleRemove}>
                      -
                    </button>
                  ) : (
                    <div className='BusinessDivisionsRegistration_dec_empty'></div>
                  )}
                  <button
                    className='BusinessDivisionsRegistration_inc custom-disabled'
                    type='button'
                    onClick={handleAdd}
                    disabled={formData.length === maximumEntries}
                  >
                    +
                  </button>
                </div>
                <div className='BusinessDivisionsRegistration_options-btn'>
                  <button type='button' className='button is-light' onClick={handleCancel}>
                    {translate('cancel', language)}
                  </button>
                  <button type='submit' className='button is-info'>
                    {translate('submit', language)}
                  </button>
                </div>
              </div>
              {/* </div> */}
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
      <AlertModal
        isOpen={isNonActiveOpen}
        onConfirm={handleNonActiveConfirm}
        onCancel={() => setIsNonActiveOpen(false)}
        message={translate('nonActiveMessage', language)}
      />
    </div>
  )
}

export default BusinessDivisionsRegistration
