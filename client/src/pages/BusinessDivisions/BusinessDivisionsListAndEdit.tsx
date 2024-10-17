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

const BusinessDivisionsListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('businessDivision')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const [isEditing, setIsEditing] = useState(false)
    const [business, setBusiness] = useState([])
    const [originalBusiness, setOriginalBusinessList] = useState(business)
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedBusiness, setselectedBusiness] = useState<any>(null);
    const [companyMap, setCompanyMap] = useState({});
    const [userMap, setUserMap] = useState({});
    const [selectedCompany, setSelectedCompany] = useState('');

    const totalPages = Math.ceil(100 / 10);

    const [isCRUDOpen, setIsCRUDOpen] = useState(false);
    const [crudMessage, setCrudMessage] = useState('');
    const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
      
      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
        switch (tab) {
          case 'client':
            navigate('/clients-list');
            break;
          case 'employee':
            navigate('/employees-list');
            break;
          case 'businessDivision':
            navigate('/business-divisions-list');
            break;
          case 'users':
            navigate('/users-list');
            break;
          default:
            break;
        }
      }
    
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
    }

    const handleClick = () => {
      setIsEditing((prevState) => {
        const newEditingState = !prevState;
        if (newEditingState) {
          setLanguage(initialLanguage);
        }
    
        return newEditingState;
      });
    }
    const handleChange = (index, event) => {
      const { name, value } = event.target
      setBusiness((prevBusiness) => prevBusiness.map((item, i) => (i === index ? { ...item, [name]: value } : item)))
    }
  
    const validateBusinessDivision = (businessDivision) => {
      return businessDivision.every((bd) => {
        return bd.business_division_name.trim() !== ''
      })
    }
    
    const handleSubmit = async () => {
      // e.preventDefault();
      
      const getModifiedFields = (original, updated) => {
        const modifiedFields = []

        updated.forEach((updatedBusiness) => {
          const originalBusiness = original.find(
            (bd) => bd.business_division_id === updatedBusiness.business_division_id,
          )

          if (originalBusiness) {
            const changes = { business_division_id: updatedBusiness.business_division_id }

            for (const key in updatedBusiness) {
              if (updatedBusiness[key] !== originalBusiness[key]) {
                changes[key] = updatedBusiness[key]
              }
            }

            if (Object.keys(changes).length > 1) {
              modifiedFields.push(changes)
            }
          }
        })

        return modifiedFields
      }
      const modifiedFields = getModifiedFields(originalBusiness, business)
      if (modifiedFields.length === 0) {
        return 
      }
        const isDuplicate = business.some((currentBusiness, index) => {
          return business.some(
            (otherBusiness, otherIndex) =>
              index !== otherIndex &&
              currentBusiness.business_division_name.trim() === otherBusiness.business_division_name.trim() &&
              currentBusiness.company === otherBusiness.company,
          )
        })

      if (!validateBusinessDivision(business)) {
        setCrudMessage(translate('allFieldsRequiredInputValidationMessage', language));
        setIsCRUDOpen(true);
        return
      }
    
      if (isDuplicate) {
        setCrudMessage(translate('businessDivisionUpdateFailed', language));
        setIsCRUDOpen(true);
        return;
      }
    
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    
      try {
        const response = await axios.put('http://127.0.0.1:8000/api/master-business-division/bulk-update/', modifiedFields, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setCrudMessage(translate('successfullyUpdated', language));
        setIsCRUDOpen(true);
        setOriginalBusinessList(business)
        setIsEditing(false)
      } catch (error) {
         if (error.response) {
            const { status, data } = error.response

            switch (status) {
              case 409:
                setCrudMessage(translate('businessDivisionNameExistsValidationMessage', language));
                setIsCRUDOpen(true);
                break
              case 401:
                console.error('Validation error:', data)
                window.location.href = '/login'
                break
              default:
                console.error('There was an error creating the business division data!', error)
                setCrudMessage(translate('error', language));
                setIsCRUDOpen(true);
                break
            }
          }
        }
      };
    
      const handleUpdateConfirm = async () => {
        await handleSubmit(); // Call the submit function for update
        setIsUpdateConfirmationOpen(false);
    };
    
      const fetchCompanyAndUserData = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
              window.location.href = '/login'; 
              return;
          }
          try {
              // Fetch companies
              const companyResponse = await axios.get('http://127.0.0.1:8000/api/master-companies/', {
                  // headers: { Authorization: `Bearer ${token}` },
              });
              const companies = companyResponse.data;
              const companyMapping = companies.reduce((map, company) => {
                  map[company.company_id] = company.company_name;
                  return map;
              }, {});
              setCompanyMap(companyMapping);
              // Fetch users
              const userResponse = await axios.get('http://127.0.0.1:8000/api/user/list/', {
                  // headers: { Authorization: `Bearer ${token}` },
              });
              const users = userResponse.data;
              const userMapping = users.reduce((map, user) => {
                  map[user.user_id] = user.first_name;
                  return map;
              }, {});
              setUserMap(userMapping);
          } catch (error) {
              if (error.response && error.response.status === 401) {
                  window.location.href = '/login';
              } else {
                  console.error('Error fetching company or user data!', error);
              }
          }
      };

    const fetchBusinessDivision = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login' // Redirect to login if no token found
        return
      }
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/master-business-divisions/', {
          // const response = await axios.get('http://54.178.202.58:8000/api/planningprojects/', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to request headers
          },
        })
        setBusiness(response.data)
        setOriginalBusinessList(response.data)
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('There was an error fetching the projects!', error)
        }
      }
    }

    useEffect(() => {
      fetchBusinessDivision()
      fetchCompanyAndUserData()
    }, [])

    const handleCompanyChange = (event) => {
      setSelectedCompany(event.target.value); // Set selected company ID
  };

    useEffect(() => {
      const startIndex = currentPage * rowsPerPage
      setPaginatedData(business.slice(startIndex, startIndex + rowsPerPage))
    }, [currentPage, rowsPerPage, business])

    useEffect(() => {
      const path = location.pathname;
      if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
        setActiveTab(path);
      }
    }, [location.pathname]);

    useEffect(() => {
      setIsTranslateSwitchActive(language === 'en');
    }, [language]);
  
    const handleTranslationSwitchToggle = () => {
      if (!isEditing) {
        const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
        setInitialLanguage(language); 
        setLanguage(newLanguage);
      }
    };

    const openModal = (business, business_division_id) => {
      setselectedBusiness(business_division_id);
      setModalIsOpen(true);
    };

    const closeModal = () => {
        setselectedBusiness(null);
        setModalIsOpen(false);
        setIsCRUDOpen(false);
    };

    const handleConfirm = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/master-business-division/${selectedBusiness}/delete/`, {
          // const response = await axios.delete('http://54.178.202.58:8000/api/master-business-division/${selectedBusiness}/delete/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Deleted successfully');
        // Update the business data after deletion
        const updatedBusiness = business.filter((item) => item.business_division_id !== selectedBusiness);
        setCrudMessage(translate('successfullyDeleted', language));
        setIsCRUDOpen(true);
        setIsEditing(false);
        setBusiness(updatedBusiness);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login';
        } else {
          console.error('Error deleting data:', error);
        }
      }
    };

    const handleNewRegistrationClick = () => {
      navigate('/business-divisions-registration');
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
      const day = String(date.getDate()).padStart(2, '0') // Get day
      const year = date.getFullYear() // Get full year
      return `${month}/${day}/${year}`
    }

  return (
    <div className='BusinessDivisionsListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='BusinessDivisionsListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='BusinessDivisionsListAndEdit_maincontent_wrapper'>
          <div className='BusinessDivisionsListAndEdit_top_content'>
            <div className='BusinessDivisionsListAndEdit_top_body_cont'>
              <div className='BusinessDivisionsListAndEdit_mode_switch_datalist'>
                <button className='BusinessDivisionsListAndEdit_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='BusinessDivisionsListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'businessDivisionsEdit' : 'businessDivisionsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className='BusinessDivisionsListAndEdit_table_wrapper'>
                <div className='BusinessDivisionsListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='BusinessDivisionsListAndEdit_table_title '>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-left'>
                                  ID
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('businessDivision', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('companyName', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdBy', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdAt', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('updatedAt', language)}
                                </th>
                                <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='BusinessDivisionsListAndEdit_table_body'>
                              {business.map((business_data, index) => (
                                <tr
                                  key={business_data.business_division_id}
                                  className='BusinessDivisionsListAndEdit_table_body_content_horizontal'
                                >
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>
                                    {business_data.business_division_id}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <input
                                      className='edit_input'
                                      type='text'
                                      name='business_division_name'
                                      value={business_data.business_division_name || ''}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <select
                                      className='edit_select'
                                      name='company_name'
                                      value={business_data.company || null} // Set value to null if company is undefined
                                      onChange={(e) => handleChange(index, e)}
                                    >
                                      <option value={null}>Select a company</option>
                                      {Object.entries(companyMap).map(([companyId, companyName]) => (
                                        <option key={companyId} value={companyId}>
                                          {companyName as string}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {userMap[business_data.auth_user_id] || 'Unknown User'}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {formatDate(business_data.created_at)}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {formatDate(business_data.updated_at)}
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('business', business_data.business_division_id)}
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
                            <tr className='BusinessDivisionsListAndEdit_table_title '>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-left'>
                                ID
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('businessDivision', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('companyName', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdBy', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdAt', language)}
                              </th>
                              <th className='BusinessDivisionsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('updatedAt', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='BusinessDivisionsListAndEdit_table_body'>
                            {business.map((business_data) => (
                              <tr
                                key={business_data.business_division_id}
                                className='BusinessDivisionsListAndEdit_table_body_content_horizontal'
                              >
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>
                                  {business_data.business_division_id}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {business_data.business_division_name}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {companyMap[business_data.company] || 'Unknown Company'}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {userMap[business_data.auth_user_id] || 'Unknown User'}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {formatDate(business_data.created_at)}
                                </td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  {formatDate(business_data.updated_at)}
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
              <div className='BusinessDivisionsListAndEdit_is_editing_wrapper'>
                <div className='BusinessDivisionsListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='BusinessDivisionsListAndEdit_edit_submit_btn_cont'>
                      <button className='BusinessDivisionsListAndEdit_edit_submit_btn' onClick={() => {setIsUpdateConfirmationOpen(true)}}>
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
        message={translate('deleteMessage', language)}
      />
      <CrudModal
        isCRUDOpen={isCRUDOpen}
        onClose={closeModal}
        message={crudMessage}
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

export default BusinessDivisionsListAndEdit;
