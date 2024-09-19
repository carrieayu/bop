import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'

const UsersRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');

    // const [formData, setFormData] = useState([
    //     {
    //       client_name: '',
    //       last_name: '',
    //       password: '',
    //       email: '',
    //       first_name: '',
    //       confirm_password: '',
    //       confirm_email: '',
    //       auth_user_id: storedUserID,
    //     },
    //   ])

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
    }

    const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
    }

    // const handleChange = (index, event) => {
    //   const { name, value } = event.target
    //   const newFormData = [...formData]
    //   newFormData[index] = {
    //     ...newFormData[index],
    //     [name]: value,
    //   }
    //   setFormData(newFormData)
    // }

    const handleTranslationSwitchToggle = () => {
        const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
        setLanguage(newLanguage);
    };

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

    //   const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     console.log(formData)
    
    //     const postData = {
    //       client: {
    //         client_name: formData.map((c) => c.client_name),
    //         auth_user_id: formData.map((c) => c.auth_user_id),
    //       },
    //       business: {
    //         business_division_name: formData.map((c) => c.business_division_name),
    //         auth_user_id: formData.map((c) => c.auth_user_id),
    //         company_id: formData.map((c) => c.auth_user_id),
    //       },
    //       planning: {
    //         project_name: formData.map((c) => c.project_name),
    //         month: formData.map((c) => c.month),
    //         sales_revenue: formData.map((c) => c.sales_revenue),
    //         non_operating_income: formData.map((c) => c.non_operating_income),
    //         non_operating_expenses: formData.map((c) => c.non_operating_expenses),
    //       },
    //       auth_user_id: formData.map((c) => c.auth_user_id),
    //     }
    
    //     const token = localStorage.getItem('accessToken')
    //     if (!token) {
    //       window.location.href = '/login'
    //       return
    //     }
    
    //     try {
    //       // const response = await axios.post('http://127.0.0.1:8000/api/projectplanning/create/', postData, {
    //         const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       })
    //       alert('Sucessfully Saved')
    //       setFormData([
    //         {
    //           last_name: '',
    //           password: '',
    //           email: '',
    //           first_name: '',
    //           confirm_password: '',
    //           confirm_email: '',
    //           auth_user_id: localStorage.getItem('userID'),
    //         },
    //       ])
    //     } catch (error) {
    //       if (error.response && error.response.status === 401) {
    //         window.location.href = '/login'
    //       } else {
    //         console.error('There was an error creating the project planning data!', error)
    //       }
    //     }
    //   }

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);

  return (
    <div className='UsersRegistration_wrapper'>
      <div className='UsersRegistration_header_cont'>
      <div className="UsersRegistration_header-buttons">
          <Btn
            label={translate('analysis', language)}
            onClick={() => handleTabClick("/dashboard")}
            className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('profitAndlossPlanning', language)}
            onClick={() => handleTabClick("/planning")}
            className={activeTab === "/planning" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('results', language)}
            onClick={() => handleTabClick("/*")}
            className={activeTab === "/*" ? "h-btn-active header-btn" : "header-btn"}
          />
        </div>
        <div className="UsersRegistration_language-toggle">
          <p className="UsersRegistration_pl-label">English</p>
            <label className="UsersRegistration_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="UsersRegistration_slider"></span>
            </label>
        </div>
      </div>
      <div className='UsersRegistration_content_wrapper'>
        <div className='UsersRegistration_sidebar'>
          <Sidebar />
        </div>
        <div className='UsersRegistration_data_content'>
          <div className='UsersRegistration_top_body_cont'></div>
          <div className='UsersRegistration_mid_body_cont'>
            <div className='UsersRegistration_mid_btn_cont'>
              {[...Array(4)].map((_, index) => (
                <Btn
                  key={index}
                  label={translate(index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
                  onClick={() =>
                    handleTabsClick(
                      index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales',
                    )
                  }
                  className={
                    activeTabOther ===
                    (index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales')
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='UsersRegistration_mid_form_cont'>
              <p className='UsersRegistration_form-title'>{translate('usersRegistration', language)}</p>
              {/* <form onSubmit={handleSubmit}> */}
                  <div key='' className='UsersRegistration_top-form-input-div'>
                    <div className='UsersRegistration_username-div'>
                        <label className='username'>{translate('username', language)}</label>
                        <div className='input-with-msg'>
                        <input
                            type='text'
                            name='username'
                            value=''
                            placeholder={`${translate('eg', language)} : takahashi_taro`}
                            // onChange={(e) => handleChange(index, e)}
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
                            value=''
                            placeholder={`${translate('eg', language)} : 高橋`}
                            // onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='UsersRegistration_password-div'>
                          <label className='password'>{translate('password', language)}</label>
                          <input
                            type='text'
                            name='password'
                            value=''
                            placeholder={`${translate('eg', language)} : Password1!`}
                            // onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='UsersRegistration_email-div'>
                          <label className='email'>{translate('emailAddress', language)}</label>
                          <input
                            type='text'
                            name='email'
                            value=''
                            placeholder={`${translate('eg', language)} : takahashi_taro@gmail.com`}
                            // onChange={(e) => handleChange(index, e)}
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
                                    value=''
                                    placeholder={`${translate('eg', language)} : 太郎`}
                                    // onChange={(e) => handleChange(index, e)}
                                />
                                <p className='validation_txt2'>{translate('usersValidationText2', language)}</p>
                            </div>
                        </div>
                        <div className='UsersRegistration_confirm_password-div'>
                          <label className='confirm_password'>{translate('confirmPassword', language)}</label>
                            <div className='input-with-msg'>
                                <input
                                    type='text'
                                    name='confirm_password'
                                    value=''
                                    placeholder={`${translate('eg', language)} : Password1!`}
                                    // onChange={(e) => handleChange(index, e)}
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
                                    value=''
                                    placeholder={`${translate('eg', language)} : takahashi_taro@gmail.com`}
                                    // onChange={(e) => handleChange(index, e)}
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
              {/* </form> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersRegistration
