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
import { createClient } from '../../api/MasterClientEndpoint/CreateMasterClient'
import {
  validateRecords,
  translateAndFormatErrors,
  getFieldChecks,
  checkForDuplicates,
} from '../../utils/validationUtil'


const ClientsRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('client')
  const storedUserID = localStorage.getItem('userID')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [clientData, setClientData] = useState([
      {
        client_name: '',
        created_at: '',
        auth_user:'',
      },
    ])

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [crudValidationErrors, setCrudValidationErrors] = useState([])


  const handleTabClick = (tab) => {
      setActiveTab(tab)
      navigate(tab)
  }

  const handleTabsClick = (tab) => {
      setActiveTabOther(tab)
      switch (tab) {
        case 'client':
          navigate('/clients-registration');
          break;
        case 'employee':
          navigate('/employees-registration');
          break;
        case 'businessDivision':
          navigate('/business-divisions-registration');
          break;
        case 'users':
          navigate('/users-registration');
          break;
        default:
          break;
      }
  }

  const handleCancel = () => {
    //opens the modal to confirm whether to cancel the input information and remove all added input project containers.
    openModal()
  }

  const handleRemoveInputData = () => {
    setClientData([
      {
        client_name: '',
        created_at: '',
        auth_user: '',
      },
    ])
    closeModal()
  }

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const handleTranslationSwitchToggle = () => {
      const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
      setLanguage(newLanguage);
  };

  useEffect(() => {
      const path = location.pathname;
      if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
        setActiveTab(path);
      }
    }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    const client = clientData.map((cl) => ({
      client_name: cl.client_name,
      auth_user: storedUserID,
      created_at: Date.now(),
    }))

    const token = localStorage.getItem('accessToken')

    // # Client Side Validation

    // Step 1: Preparartion for validation
    // Set record type for validation
    const recordType = 'clients'
    // Retrieve field validation checks based on the record type
    const fieldChecks = getFieldChecks(recordType)
    // Validate records for the specified project fields
    const validateUser = (records) => validateRecords(records, fieldChecks, 'client')

    // Step 2: Validate client-side input
    const validationErrors = validateUser(clientData) // Only one User can be registered but function expects an Array.

    // Step 3: Check for duplicate entries on specific fields
    const uniqueFields = ['client_name']
    const duplicateErrors = checkForDuplicates(clientData, uniqueFields, 'client', language)

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

    createClient(client, token)
      .then((data) => {
        setModalMessage(translate('successfullySaved', language))
        setIsModalOpen(true)
        setClientData([
          {
            client_name: '',
            created_at: '',
            auth_user: '',
          },
        ])
      })
      .catch((error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              // setModalMessage(translate('clientNameExistsValidationMessage', language));
              const existingClientNames = data.errors.map((err) => err.client_name).join(', ') || 'Unknown client'
              setModalMessage(
                translate('clientNameExistsValidationMessage', language).replace(
                  '${clientName}',
                  existingClientNames,
                ),
              )
              setIsModalOpen(true)
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error creating the client data!', error)
              setModalMessage(translate('error', language))
              setIsModalOpen(true)
              break
          }
        }
      })
  }

  const handleAddContainer = () => {
    setClientData([
      ...clientData,
      {
        client_name: '',
        created_at: '',
        auth_user: '',
      },
    ])
  }

  const handleRemoveContainer = () => {
    if (clientData.length > 1) {
      const newContainers = [...clientData]
      newContainers.pop()
      setClientData(newContainers)
    }
  }

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target
    const newContainers = [...clientData]
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      [name]: value,
    }
    setClientData(newContainers)
  }

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleListClick = () => { 
    navigate('/clients-list');
  };

  return (
    <div className='ClientsRegistration_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='ClientsRegistration_content_wrapper'>
        <Sidebar />
        <div className='ClientsRegistration_data_content'>
          <div className='ClientsRegistration_top_body_cont'>
            <RegistrationButtons
              activeTabOther={activeTabOther}
              message={translate('clientsRegistration', language)}
              handleTabsClick={handleTabsClick}
              handleListClick={handleListClick}
              buttonConfig={[
                { labelKey: 'client', tabKey: 'client' },
                { labelKey: 'employee', tabKey: 'employee' },
                { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                { labelKey: 'users', tabKey: 'users' },
              ]}
            />
          </div>
          <div className='ClientsRegistration_mid_body_cont'>
            <form className='ClientsRegistration_inputs_and_buttons' onSubmit={handleSubmit}>
              <div className='ClientsRegistration_mid_form_cont'>
                {clientData.map((container, containerIndex) => (
                  <div key={containerIndex} className='ClientsRegistration_ForImplementationOfPlusAndMinus'>
                    <div
                      className={`ClientsRegistration_ForImplementationOfHorizontalLineBelow-div ${containerIndex > 0 ? 'ClientsRegistration_form-line' : ''}`}
                    ></div>
                    <div className='ClientsRegistration_form-div'>
                      <div className='ClientsRegistration_form-content-div'>
                        <div className='ClientsRegistration_client_name-div'>
                          <label className='client_name'>{translate('clientName', language)}</label>
                          <input
                            type='text'
                            name='client_name'
                            value={container.client_name}
                            onChange={(e) => handleInputChange(containerIndex, null, e)}
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value='' />
                  </div>
                ))}
              </div>
              <div className='ClientsRegistration_lower_form_cont'>
                <div className='ClientsRegistration_form-content'>
                  <div className='ClientsRegistration_plus-btn'>
                    {clientData.length >= 2 ? (
                      <button className='ClientsRegistration_dec' type='button' onClick={handleRemoveContainer}>
                        -
                      </button>
                    ) : (
                      <div className='ClientsRegistration_dec_empty'></div>
                    )}
                    <button className='ClientsRegistration_inc' type='button' onClick={handleAddContainer}>
                      +
                    </button>
                  </div>
                  <div className='ClientsRegistration_options-btn'>
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
    </div>
  )
}

export default ClientsRegistration
