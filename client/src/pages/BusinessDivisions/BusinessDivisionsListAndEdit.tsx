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
    const [changes, setChanges] = useState({})
    const [business, setBusiness] = useState([])
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [companyMap, setCompanyMap] = useState({});
    const [userMap, setUserMap] = useState({});
    const [selectedCompany, setSelectedCompany] = useState('');

    const totalPages = Math.ceil(100 / 10);

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
      const { name, value } = event.target;
      const updatedBusiness = [...business]; // Create a copy of the current state
      // Update the relevant field in the business array
      if (name === 'business_division_name') {
        updatedBusiness[index].business_division_name = value;
      } else if (name === 'company_name') {
        updatedBusiness[index].company = value; // Update the company field
      }
      // Update state with the modified array
      setBusiness(updatedBusiness);
    };
    

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // Check for duplicated entries
      const isDuplicate = business.some((currentBusiness, index) => {
        return business.some((otherBusiness, otherIndex) => 
          index !== otherIndex &&
          currentBusiness.business_division_name.trim() === otherBusiness.business_division_name.trim() &&
          currentBusiness.company === otherBusiness.company
        );
      });
    
      if (isDuplicate) {
        alert('Cannot Update Data: Duplicate business division name found for the same company!');
        return;
      }
    
      console.log('Changed Data:', business);
    
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    
      try {
        const response = await axios.put('http://127.0.0.1:8000/api/master-business-division/bulk-update/', business, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Successfully updated');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login';
        } else {
          console.error('There was an error updating the data!', error);
          alert('Cannot Update Data due to an error!');
        }
      }
    };
    

    useEffect(() => {
        const fetchCompanyAndUserData = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                window.location.href = '/login'; 
                return;
            }
            try {
                // Fetch companies
                const companyResponse = await axios.get('http://127.0.0.1:8000/api/master-companies/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const companies = companyResponse.data;
                console.log("Companies: ", companies)
                const companyMapping = companies.reduce((map, company) => {
                    map[company.company_id] = company.company_name;
                    return map;
                }, {});
                console.log("Comp Mapping: ", companyMapping)
                setCompanyMap(companyMapping);
                // Fetch users
                const userResponse = await axios.get('http://127.0.0.1:8000/api/user/list/', {
                    headers: { Authorization: `Bearer ${token}` },
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
        fetchCompanyAndUserData();
    }, []);

    useEffect(() => {
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
        } catch (error) {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        }
      }

      fetchBusinessDivision()
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

    const openModal = (project) => {
      setSelectedProject(project);
      setModalIsOpen(true);
    };

    const closeModal = () => {
        setSelectedProject(null);
        setModalIsOpen(false);
    };

    const handleConfirm = () => {
      // Currently no delete logic
      console.log('Confirmed action for project:', selectedProject);
      closeModal();
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
                  message={translate('businessDivisionsList', language)}
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
                                <tr key={business_data.business_division_id} className='BusinessDivisionsListAndEdit_table_body_content_horizontal'>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>{business_data.business_division_id}</td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    <input
                                      className="edit_input"
                                      type='text'
                                      name='business_division_name'
                                      value={business_data.business_division_name || ''}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                  <select
                                      className="edit_select"
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
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{userMap[business_data.auth_user_id] || 'Unknown User'}</td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{formatDate(business_data.created_at)}</td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{formatDate(business_data.updated_at)}</td>
                                  <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>
                                    {/* <RiDeleteBin6Fill className='delete-icon' onClick={() => openModal('project')}/> */}
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
                              <tr key={business_data.business_division_id} className='BusinessDivisionsListAndEdit_table_body_content_horizontal'>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical has-text-left'>{business_data.business_division_id}</td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{business_data.business_division_name}</td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{companyMap[business_data.company] || 'Unknown Company'}</td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{userMap[business_data.auth_user_id] || 'Unknown User'}</td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{formatDate(business_data.created_at)}</td>
                                <td className='BusinessDivisionsListAndEdit_table_body_content_vertical'>{formatDate(business_data.updated_at)}</td>
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
                    <div className='BusinessDivisionsListAndEdit_mode_switch_datalist'>
                      <button className='BusinessDivisionsListAndEdit_edit_submit_btn' onClick={handleSubmit}>
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
    </div>
  )
};

export default BusinessDivisionsListAndEdit;
