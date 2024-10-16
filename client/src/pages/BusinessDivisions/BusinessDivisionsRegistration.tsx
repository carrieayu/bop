import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import { translate } from '../../utils/translationUtil'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons'
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons'
import axios from 'axios'

const BusinessDivisionsRegistration = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('businessDivision')
    const storedUserID = localStorage.getItem('userID')
    const { language, setLanguage } = useLanguage()
    const token = localStorage.getItem('accessToken')
    const [companyList, setCompanyList] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    
    const [businessDivisionName, setBusinessDivisionName] = useState('');
    const [authUserID] = useState(storedUserID);
    const [formData, setFormData] = useState([
        {
          business_division_name: '',
          company_id: '',
          auth_user_id: authUserID,
        },
      ])

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

    const handleChange = (index, event) => {
      const {name, value} = event.target
      const updatedFormData = [...formData]
      updatedFormData[index] = {
        ...updatedFormData[index],
        [name]: value,
      }
      setFormData(updatedFormData)
    }

    const handleAdd = () => {
      if (formData.length < 10){
        setFormData([...formData, {
          business_division_name: '',
          company_id: '',
          auth_user_id: authUserID
        }]);
      }
      else {
        console.log("business limits to 10")
      }
    }
  
  
    const validateBusinessDivision = (businessDivision) => {
      return businessDivision.every((bd) => {
        console.log(businessDivision)
        return bd.business_division_name.trim() !== ''
      })
    }

    const handleMinus = () => {
      if (formData.length > 1) {
        setFormData(formData.slice(0, -1));
      }
    }

    useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

    
      const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData)
  
        const postData = formData.map((business) => ({
          business_division_name: business.business_division_name,
          company_id: business.company_id,
          auth_user_id: business.auth_user_id,
        }))

        // Extract business division names from postData
        const businessDivisionNames = postData.map((bd) => bd.business_division_name)
        const companyIds = postData.map((company) => company.company_id)

        // Check for duplicates in the [inputs] submitted business division names
        const hasDuplicates = businessDivisionNames.some((name, index) => businessDivisionNames.indexOf(name) !== index) &&
        (companyIds.some((id,index)=> companyIds.indexOf(id) !== index))

        if (!validateBusinessDivision(formData)) {
          alert(translate('allFieldsRequiredInputValidationMessage', language))
          return
        }

        if (hasDuplicates ) {
          alert(translate('businessDivisionDuplicateNameInputValidationMessage', language))
          return
        }

        if (!token) {
          window.location.href = '/login'
          return
        }
  
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/master-business-division/create', postData, {
          // const response = await axios.post('http://54.178.202.58:8000/api/master-business-division/create', postData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          alert('Sucessfully Saved')
          setFormData([
            {
             business_division_name: '',
             company_id: '',
             auth_user_id: authUserID
            },
          ])
        }
        catch (error)
        {
          if (error.response) {
            const { status, data } = error.response

            switch (status) {
              case 409:
                alert(translate('businessDivisionNameExistsValidationMessage', language))
                break
              case 401:
                console.error('Validation error:', data)
                window.location.href = '/login'
                break
              default:
                console.error('There was an error creating the business division data!', error)
                alert(translate('error', language))
                break
            }
          }
        }
      }
  
      useEffect(() => {
        const fetchCompany = async () => {
          try{
            const response = await axios.get('http://127.0.0.1:8000/api/master-companies/', {
            // const response = await axios.get('http://54.178.202.58:8000/api/master-companies/', {
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
              },
            });
            setCompanyList(response.data);
          }
          catch (error) {
            console.error('Error fetching business:', error);
          }
        };
    
        fetchCompany();
      }, [token]);
  
      const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value); // Update the selected company state
      };
   

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);

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
              handleTabsClick={handleTabsClick}
              buttonConfig={[
                { labelKey: 'client', tabKey: 'client' },
                { labelKey: 'employee', tabKey: 'employee' },
                { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                { labelKey: 'users', tabKey: 'users' },
              ]}
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
                    <div className={`BusinessDivisionsRegistration_form-content ${index > 0 ? 'HorizontalLineBelow': ''}`}></div>
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
                            <option value=''></option>
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
                    <button className='BusinessDivisionsRegistration_inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='BusinessDivisionsRegistration_dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='BusinessDivisionsRegistration_options-btn'>
                    <button type='button' className='button is-light'>
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
    </div>
  )
}

export default BusinessDivisionsRegistration
