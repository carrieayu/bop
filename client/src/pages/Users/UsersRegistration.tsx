import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import axios from 'axios'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import AlertModal from '../../components/AlertModal/AlertModal'
import CrudModal from '../../components/CrudModal/CrudModal'

const UsersRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('users')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isUsernameValid, setIsUsernameValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const [isPasswordMatch, setIsPasswordMatch] = useState(true)
    const [isEmailMatch, setIsEmailMatch] = useState(true)
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const [userData, setUserData] = useState(
      {
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        email: '',
        confirm_password: '',
        confirm_email: '',
      },
    )

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
    setUserData(
      {
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        email: '',
        confirm_password: '',
        confirm_email: '',
      },
    )
    closeModal()
  }

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

    const handleChange = (event) => {
      const { name, value } = event.target
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
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
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        const { username, first_name, last_name, password, confirm_password, email, confirm_email } = userData;
    
        if (!username || !email || !password || !confirm_password) {
          setModalMessage(translate('usersValidationText6', language));
          setIsModalOpen(true);
          return;
        }
    
        if (!first_name || !last_name) {
          setModalMessage(translate('usersValidationText2', language));
          setIsModalOpen(true);
          return;
        }
    
        const usernameRegex = /^[a-zA-Z]+_[a-zA-Z]+$/;
        if (!usernameRegex.test(username)) {
          setIsUsernameValid(usernameRegex.test(username));
          setModalMessage(translate('usersValidationText1', language));
          setIsModalOpen(true);
          return;
        } else {
          setIsUsernameValid(true);
        }
    
        if (password !== confirm_password) {
          setIsPasswordMatch(false);
          setModalMessage(translate('usersValidationText5', language));
          setIsModalOpen(true);
          return;
        } else {
          setIsPasswordMatch(true);
        }
    
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
          setIsPasswordValid(passwordRegex.test(password));
          setModalMessage(translate('usersValidationText3', language));
          setIsModalOpen(true);
          return;
        } else {
          setIsPasswordValid(true);
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setIsEmailValid(false);
          setModalMessage(translate('usersValidationText4', language));
          setIsModalOpen(true);
          return;
        } else {
          setIsEmailValid(true);
        }
    
        if (email !== confirm_email) {
          setIsEmailMatch(false);
          setModalMessage(translate('usersValidationText8', language));
          setIsModalOpen(true);
          return;
        } else {
          setIsEmailMatch(true);
        }
    
        if (!token) {
          window.location.href = '/login';
          return;
        }
        try {
          await axios.post('http://127.0.0.1:8000/api/users/create/', userData, {
            // await axios.post('http://54.178.202.58:8000/api/users/create/', userData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })
          setModalMessage(translate('successfullySaved', language));
          setIsModalOpen(true);
          setUserData({
            username: '',
            first_name: '',
            last_name: '',
            password: '',
            email: '',
            confirm_password: '',
            confirm_email: '',
          });
        } catch (error) {
          setModalMessage(translate('usersValidationText7', language));
          setIsModalOpen(true);
          console.error(error);
        }
      };
    

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);

      const handleListClick = () => { 
        navigate('/users-list');
      };

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
      />
    </div>
  )
}

export default UsersRegistration
