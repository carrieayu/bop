import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'

const ClientsRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('client')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');

    // const [formData, setFormData] = useState([
    //     {
    //       client_name: '',
    //       business_division_name: '',
    //       project_name: '',
    //       month: '',
    //       sales_revenue: '',
    //       non_operating_income: '',
    //       non_operating_expenses: '',
    //       registered_user_id: storedUserID,
    //     },
    //   ])

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

    //   const handleSubmit = async (e) => {
    //     e.preventDefault()
    //     console.log(formData)
    
    //     const postData = {
    //       client: {
    //         client_name: formData.map((c) => c.client_name),
    //         registered_user_id: formData.map((c) => c.registered_user_id),
    //       },
    //       business: {
    //         business_division_name: formData.map((c) => c.business_division_name),
    //         registered_user_id: formData.map((c) => c.registered_user_id),
    //         company_id: formData.map((c) => c.registered_user_id),
    //       },
    //       planning: {
    //         project_name: formData.map((c) => c.project_name),
    //         month: formData.map((c) => c.month),
    //         sales_revenue: formData.map((c) => c.sales_revenue),
    //         non_operating_income: formData.map((c) => c.non_operating_income),
    //         non_operating_expenses: formData.map((c) => c.non_operating_expenses),
    //       },
    //       registered_user_id: formData.map((c) => c.registered_user_id),
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
    //           client_name: '',
    //           business_division_name: '',
    //           project_name: '',
    //           month: '',
    //           sales_revenue: '',
    //           non_operating_income: '',
    //           non_operating_expenses: '',
    //           registered_user_id: localStorage.getItem('userID'),
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
          <div className='ClientsRegistration_top_body_cont'></div>
          <div className='ClientsRegistration_mid_body_cont'>
              <RegistrationButtons
                  activeTabOther={activeTabOther}
                  message={translate('clientsRegistration', language)}
                  handleTabsClick={handleTabsClick}
                  buttonConfig={[
                    { labelKey: 'client', tabKey: 'client' },
                    { labelKey: 'employee', tabKey: 'employee' },
                    { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                    { labelKey: 'users', tabKey: 'users' },
                  ]}
                />
            <div className='ClientsRegistration_mid_form_cont'>
              {/* <form onSubmit={handleSubmit}> */}
                  <div key='' className='ClientsRegistration_ForImplementationOfPlusAndMinus'>
                    <div className='ClientsRegistration_ForImplementationOfHorizontalLineBelow'></div>
                    <div className='ClientsRegistration_form-div'>
                      <div className='ClientsRegistration_form-content-div'>
                        <div className='ClientsRegistration_client_name-div'>
                          <label className='client_name'>{translate('clientName', language)}</label>
                          <input
                            type='text'
                            name='client_name'
                            value=''
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value='' />
                  </div>
                <div className='ClientsRegistration_form-content'>
                  <div className='ClientsRegistration_plus-btn'>
                    <button className='ClientsRegistration_inc' type='button'>
                      +
                    </button>
                    <button className='ClientsRegistration_dec' type='button'>
                      -
                    </button>
                  </div>
                  <div className='ClientsRegistration_options-btn'>
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

export default ClientsRegistration
