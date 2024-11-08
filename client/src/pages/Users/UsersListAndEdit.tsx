import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import AlertModal from "../../components/AlertModal/AlertModal";
import { RiDeleteBin6Fill } from 'react-icons/ri'
import DatePicker from 'react-datepicker'
import ListButtons from "../../components/ListButtons/ListButtons";
import HeaderButtons from "../../components/HeaderButtons/HeaderButtons";
import CrudModal from "../../components/CrudModal/CrudModal";
import { getReactActiveEndpoint } from '../../toggleEndpoint'
import '../../assets/scss/Components/SliderToggle.scss'

const UsersListAndEdit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('/planning-list')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('users')
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const select = [5, 10, 100]
  const { language, setLanguage } = useLanguage()
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const [isEmailValid, setIsEmailValid] = useState(true)
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
  const [isEditing, setIsEditing] = useState(false)
  const [userList, setUserList] = useState([])
  const [initialLanguage, setInitialLanguage] = useState(language);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [deleteId, setDeleteUserId] = useState([])
  const [userData, setUserData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    email: '',
    confirm_password: '',
    confirm_email: '',
  })

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
    setUserList((prevState) => {
      const updatedUserData = [...prevState]
      updatedUserData[index] = {
        ...updatedUserData[index],
        [name]: value,
      }
      return updatedUserData
    })
  }
  
  const validateUser = (users) => {
    return users.every((user) => {
      const { username, first_name, last_name, email, date_joined } = user

      if (!username || !email || !date_joined) {
        setCrudMessage(translate('usersValidationText6', language));
        setIsCRUDOpen(true);
        return false
      }

      if (!first_name || !last_name) {
        setCrudMessage(translate('usersValidationText2', language));
        setIsCRUDOpen(true);
        return
      }

      const usernameRegex = /^[a-zA-Z]+_[a-zA-Z]+$/
      if (!usernameRegex.test(username)) {
        setIsUsernameValid(usernameRegex.test(username))
        setCrudMessage(translate('usersValidationText1', language));
        setIsCRUDOpen(true);
        return false
      } else {
        setIsUsernameValid(true)
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setIsEmailValid(false)
        setCrudMessage(translate('usersValidationText4', language));
        setIsCRUDOpen(true);
        return false
      } else {
        setIsEmailValid(true)
      }

      return true
      
    })
  }

  const handleSubmit = async () => {

      if (!validateUser(userList)) {
        return
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login'
        return
      }
      try {
        const response = await axios.put(`${getReactActiveEndpoint()}/api/users/update/`, userList, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setCrudMessage(translate('successfullyUpdated', language));
        setIsCRUDOpen(true);
        setIsEditing(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the user data!', error)
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
          const response = await axios.get(`${getReactActiveEndpoint()}/api/users/list/`, {
          })
          setUserList(response.data)
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.log(error)
            // window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        }
      }

      fetchProjects()
    }, [])

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(userList.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, userList])

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

      const openModal = (users, id) => {
        setSelectedProject(users)
        setModalIsOpen(true);
        setDeleteUserId(id)
    };

    const closeModal = () => {
        setSelectedProject(null);
        setModalIsOpen(false);
        setIsCRUDOpen(false);
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const month = String(date.getMonth() + 1).padStart(2, '0') // Get month (0-indexed, so +1)
      const day = String(date.getDate()).padStart(2, '0') // Get day
      const year = date.getFullYear() // Get full year
      return `${month}/${day}/${year}`
    }

    const handleConfirm = async () => {
      // Currently no delete logic
      console.log('Confirmed action for project:', deleteId)
      const token = localStorage.getItem('accessToken')
      try {
        const response = await axios.delete(`${getReactActiveEndpoint()}/api/users/list/${deleteId}/delete/`, {
        })
        setUserList((prevList) => prevList.filter((user) => user.id !== deleteId))
        setCrudMessage(translate('successfullyDeleted', language));
        setIsCRUDOpen(true);
        setIsEditing(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login' // Redirect to login if unauthorized
        } else {
          console.error('Error deleting project:', error)
        }
      }
    };

    const handleNewRegistrationClick = () => {
      navigate('/users-registration');
    };

  return (
    <div className='UsersListAndEdit_wrapper'>
      <HeaderButtons
        activeTab={activeTab}
        handleTabClick={handleTabClick}
        isTranslateSwitchActive={isTranslateSwitchActive}
        handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className='UsersListAndEdit_cont_wrapper'>
        <Sidebar />
        <div className='UsersListAndEdit_maincontent_wrapper'>
          <div className='UsersListAndEdit_top_content'>
            <div className='UsersListAndEdit_top_body_cont'>
              <div className='UsersListAndEdit_mode_switch_datalist'>
                <div className='mode_switch_container'>
                  <p className='slider_mode_switch'>
                    {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                  </p>
                  <label className='slider_switch'>
                    <input type='checkbox' checked={isEditing} onChange={handleClick} />
                    <span className='slider'></span>
                  </label>
                </div>
              </div>
            </div>
            <div className='UsersListAndEdit_mid_body_cont'>
              <ListButtons
                activeTabOther={activeTabOther}
                message={translate(isEditing ? 'usersEdit' : 'usersList', language)}
                handleTabsClick={handleTabsClick}
                handleNewRegistrationClick={handleNewRegistrationClick}
                buttonConfig={[
                  { labelKey: 'client', tabKey: 'client' },
                  { labelKey: 'employee', tabKey: 'employee' },
                  { labelKey: 'businessDivision', tabKey: 'businessDivision' },
                  { labelKey: 'users', tabKey: 'users' },
                ]}
              />
              <div className={`UsersListAndEdit_table_wrapper ${isEditing ? 'editMode' : ''}`}>
                <div className='UsersListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='UsersListAndEdit_table_title '>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('username', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('lastName', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('firstName', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('emailAddress', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                  {translate('dateJoined', language)}
                                </th>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'></th>
                              </tr>
                            </thead>
                            <tbody className='UsersListAndEdit_table_body'>
                              {userList.map((users, index) => (
                                <tr key={users.id} className='UsersListAndEdit_table_body_content_horizontal'>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-left'>
                                    {users.id}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='username'
                                      value={users.username}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='last_name'
                                      value={users.last_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='first_name'
                                      value={users.first_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='email'
                                      value={users.email}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    <input
                                      type='date'
                                      name='date_joined'
                                      value={users.date_joined}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical delete_icon'>
                                    <RiDeleteBin6Fill
                                      className='delete-icon'
                                      onClick={() => openModal('users', users.id)}
                                      style={{ color: 'red' }}
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
                            <tr className='UsersListAndEdit_table_title '>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-left'>ID</th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('username', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('lastName', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('firstName', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('emailAddress', language)}
                              </th>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-centered'>
                                {translate('dateJoined', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='UsersListAndEdit_table_body'>
                            {userList.map((users) => (
                              <tr key={users.id} className='UsersListAndEdit_table_body_content_horizantal'>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-left'>
                                  {users.id}
                                </td>
                                <td className='UsersListAndEdit_table_body_content_vertical'>{users.username}</td>
                                <td className='UsersListAndEdit_table_body_content_vertical'>{users.last_name}</td>
                                <td className='UsersListAndEdit_table_body_content_vertical'>{users.first_name}</td>
                                <td className='UsersListAndEdit_table_body_content_vertical'>{users.email}</td>
                                <td className='UsersListAndEdit_table_body_content_vertical'>
                                  {formatDate(users.date_joined)}
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
              <div className='UsersListAndEdit_is_editing_wrapper'>
                <div className='UsersListAndEdit_is_editing_cont'>
                  {isEditing ? (
                    <div className='UsersListAndEdit_edit_submit_btn_cont'>
                      <button
                        className='UsersListAndEdit_edit_submit_btn'
                        onClick={() => {
                          setIsUpdateConfirmationOpen(true)
                        }}
                      >
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
      <CrudModal isCRUDOpen={isCRUDOpen} onClose={closeModal} message={crudMessage} />
      <AlertModal
        isOpen={isUpdateConfirmationOpen}
        onConfirm={handleUpdateConfirm}
        onCancel={() => setIsUpdateConfirmationOpen(false)}
        message={translate('updateMessage', language)}
      />
    </div>
  )
};

export default UsersListAndEdit;
