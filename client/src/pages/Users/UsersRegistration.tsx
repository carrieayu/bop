import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import axios from 'axios'

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
        e.preventDefault()
        const token = localStorage.getItem('accessToken')
        const { username, first_name, last_name, password, confirm_password, email , confirm_email} = userData

        if (!username || !email || !password || !confirm_password) {
          alert(translate('usersValidationText6', language))
          return
        }

        if (!first_name || !last_name) {
          alert(translate('usersValidationText2', language))
          return
        }

        const usernameRegex = /^[a-zA-Z]+_[a-zA-Z]+$/
        if (!usernameRegex.test(username)) {
          setIsUsernameValid(usernameRegex.test(username))
          alert(
            translate('usersValidationText1', language),
          )
          return
        } else {
          setIsUsernameValid(true)
        }

        if (password !== confirm_password) {
            setIsPasswordMatch(false) 
            alert(translate('usersValidationText5', language))
          return
        } else {
            setIsPasswordMatch(true) 
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
        if (!passwordRegex.test(password)) {
          setIsPasswordValid(passwordRegex.test(password))
          alert(translate('usersValidationText3', language))
          return
        } else {
          setIsPasswordValid(true) 
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setIsEmailValid(false)
          alert(translate('usersValidationText4', language))
          return
        } else {
          setIsEmailValid(true)
        }

        if (email !== confirm_email) {
          setIsEmailMatch(false)
          alert(translate('usersValidationText8', language))
          return
        } else {
          setIsEmailMatch(true)
        }


        if (!token) {
          window.location.href = '/login'
          return
        }
        try {
          await axios.post('http://127.0.0.1:8000/api/user/register/', userData, {
            // await axios.post('http://54.178.202.58:8000/api/user/register/'', userData, {
          })
          alert('Sucessfully Saved')
          setUserData({
            username: '',
            first_name: '',
            last_name: '',
            password: '',
            email: '',
            confirm_password: '',
            confirm_email: '',
          })
        } catch (error) {
          console.error(translate('usersValidationText7', language))
        }
      }

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);

  return (
    <div className='UsersRegistration_wrapper'>
      <div className='UsersRegistration_header_cont'>
        <div className='UsersRegistration_header-buttons'>
          <Btn
            label={translate('analysis', language)}
            onClick={() => handleTabClick('/dashboard')}
            className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
          />
          <Btn
            label={translate('profitAndlossPlanning', language)}
            onClick={() => handleTabClick("/planning-list")}
            className={activeTab === "/planning-list" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('results', language)}
            onClick={() => handleTabClick('/*')}
            className={activeTab === '/*' ? 'h-btn-active header-btn' : 'header-btn'}
          />
        </div>
        <div className='UsersRegistration_language-toggle'>
          <p className='UsersRegistration_pl-label'>English</p>
          <label className='UsersRegistration_switch'>
            <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} />
            <span className='UsersRegistration_slider'></span>
          </label>
        </div>
      </div>
      <div className='UsersRegistration_content_wrapper'>
          <Sidebar />
        <div className='UsersRegistration_data_content'>
          <div className='UsersRegistration_top_body_cont'></div>
          <div className='UsersRegistration_mid_body_cont'>
            <div className='UsersRegistration_mid_btn_cont'>
              {[...Array(4)].map((_, index) => (
                <Btn
                  key={index}
                  label={translate(
                    index === 0 ? 'client' : index === 1 ? 'employee' : index === 2 ? 'businessDivision' : 'users',
                    language,
                  )}
                  onClick={() =>
                    handleTabsClick(
                      index === 0 ? 'client' : index === 1 ? 'employee' : index === 2 ? 'businessDivision' : 'users',
                    )
                  }
                  className={
                    activeTabOther ===
                    (index === 0 ? 'client' : index === 1 ? 'employee' : index === 2 ? 'businessDivision' : 'users')
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='UsersRegistration_mid_form_cont'>
              <p className='UsersRegistration_form-title'>{translate('usersRegistration', language)}</p>
              <form onSubmit={handleSubmit}>
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
                              border: isEmailValid && isEmailMatch? '' : '2px solid red',
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
                <div className='UsersRegistration_form-btn-content'>
                  <div className='UsersRegistration_options-btn'>
                    <button type='button' className='button is-light'>
                      {translate('cancel', language)}
                    </button>
                    <button type='submit' className='button is-info'>
                      {translate('submit', language)}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersRegistration
