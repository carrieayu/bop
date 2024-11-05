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

const ClientsListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning-list')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('client')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const [isEditing, setIsEditing] = useState(false)
    const [updatedClients, setUpdatedClients] = useState([])
    const [originalClientsList, setOriginalClientsList] = useState(updatedClients)
    const [deleteId, setDeleteClientId] = useState([])
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

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


    const handleChange = (index, e) => {
      const { name, value } = e.target
      setUpdatedClients((prevState) => {
        const updatedClientData = [...prevState]
        updatedClientData[index] = {
          ...updatedClientData[index],
          [name]: value,
        }
        return updatedClientData
      })
    }
  
    const validateClient = (client) => {
      return client.every((cl) => {
        return cl.client_name.trim() !== ''
      })
    }

    const handleSubmit = async () => {

      // Extract client names from updatedClients
      const clientNames = updatedClients.map((cl) => cl.client_name)
      // Check no inputs are empty on Edit Screen
      if (!validateClient(updatedClients)) {
        setCrudMessage(translate('allFieldsRequiredInputValidationMessage', language));
        setIsCRUDOpen(true);
        return
      }

      const getModifiedFields = (original, updated) => {
        const modifiedFields = []

        updated.forEach((updatedClient) => {
          const originalClient = original.find((emp) => emp.client_id === updatedClient.client_id)

          if (originalClient) {
            const changes = { client_id: updatedClient.client_id }

            for (const key in updatedClient) {
              if (updatedClient[key] !== originalClient[key]) {
                changes[key] = updatedClient[key]
              }
            }

            if (Object.keys(changes).length > 1) {
              modifiedFields.push(changes)
            }
          }
        })

        return modifiedFields
      }
      const modifiedFields = getModifiedFields(originalClientsList, updatedClients)
      console.log('Data:', modifiedFields)
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login'
        return
      }

      try {
        const response = await axios.put('http://127.0.0.1:8000/api/master-clients/update/', modifiedFields, {
          // const response = await axios.put('http://54.178.202.58:8000/api/master-clients/update/', modifiedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCrudMessage(translate('successfullyUpdated', language));
        setIsCRUDOpen(true);
        setIsEditing(false);
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 409:
              setCrudMessage(translate('clientNameExistsUpdateValidationMessage', language));
              setIsCRUDOpen(true);
              break
            case 401:
              console.error('Validation error:', data)
              window.location.href = '/login'
              break
            default:
              console.error('There was an error updating the clients data!', error)
              setCrudMessage(translate('error', language));
              setIsCRUDOpen(true);
              break
          }
        }
      }
    }

    const handleUpdateConfirm = async () => {
      await handleSubmit(); // Call the submit function for update
      setIsUpdateConfirmationOpen(false);
  };
    

    useEffect(() => {
      const fetchProjects = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          window.location.href = '/login' // Redirect to login if no token found
          return
        }

        try {
          const response = await axios.get('http://127.0.0.1:8000/api/master-clients/list/', {
            // const response = await axios.get('http://54.178.202.58:8000/api/master-clients/list/', {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          })
          setUpdatedClients(response.data)
          setOriginalClientsList(response.data)
        } catch (error) {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        }
      }

      fetchProjects()
    }, [])

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(updatedClients.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, updatedClients])

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

      const openModal = (project , id) => {
        setDeleteClientId(id)
        setSelectedClient(project);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setSelectedClient(null);
        setModalIsOpen(false);
        setIsCRUDOpen(false);
    };

    const handleConfirm = async () => {
      // Currently no delete logic
      console.log('Confirmed action for project:', deleteId)
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/master-clients/${deleteId}/delete/`, {
        // const response = await axios.delete(`http://54.178.202.58:8000/api/master-clients/${deleteId}/delete/`, {
        })
        setUpdatedClients((prevList) => prevList.filter((client) => client.client_id !== deleteId))
        setCrudMessage(translate('successfullyDeleted', language));
        setIsCRUDOpen(true);
        setIsEditing(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('Error deleting client:', error)
        }
      }
    }

    const handleNewRegistrationClick = () => {
      navigate('/clients-registration');
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
      const day = String(date.getDate()).padStart(2, '0') // Get day
      const year = date.getFullYear() // Get full year
      return `${year}/${month}/${day}`
    }

  return (
    <div className='ClientsListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='ClientsListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='ClientsListAndEdit_maincontent_wrapper'>
          <div className='ClientsListAndEdit_top_content'>
            <div className='ClientsListAndEdit_top_body_cont'>
              <div className='ClientsListAndEdit_mode_switch_datalist'>
                <button className='ClientsListAndEdit_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='ClientsListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'clientsEdit' : 'clientsList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className={`ClientsListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='ClientsListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='ClientsListAndEdit_table_title '>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('clientName', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdBy', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('createdAt', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('updatedAt', language)}
                                </th>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='ClientsListAndEdit_table_body'>
                              {updatedClients.map((clients, index) => (
                                <tr
                                  key={clients.client_id}
                                  className='ClientsListAndEdit_table_body_content_horizontal'
                                >
                                  <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'>
                                    {clients.client_id}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='client_name'
                                      value={clients.client_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {clients.auth_user}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {formatDate(clients.created_at)}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {formatDate(clients.updated_at)}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical delete_icon'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('project', clients.client_id)}
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
                            <tr className='ClientsListAndEdit_table_title '>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('clientName', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdBy', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('createdAt', language)}
                              </th>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('updatedAt', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='ClientsListAndEdit_table_body'>
                            {updatedClients.map((clients) => (
                              <tr key={clients.client_id} className='ClientsListAndEdit_table_body_content_horizontal'>
                                <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'>
                                  {clients.client_id}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {clients.client_name}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>{clients.auth_user}</td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {formatDate(clients.created_at)}
                                </td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'>
                                  {formatDate(clients.updated_at)}
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
              <div className='ClientsListAndEdit_is_editing_wrapper'>
                <div className='ClientsListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='ClientsListAndEdit_edit_submit_btn_cont'>
                      <button className='ClientsListAndEdit_edit_submit_btn' onClick={() => {setIsUpdateConfirmationOpen(true)}}>
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
        message={translate('clientDeleteMessage', language)}
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

export default ClientsListAndEdit;
