import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import AlertModal from "../../components/AlertModal/AlertModal";

const UsersListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('users')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
    const [isEditing, setIsEditing] = useState(false)
    const [changes, setChanges] = useState({})
    const [projects, setProjects] = useState([])
    const [initialLanguage, setInitialLanguage] = useState(language);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

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


    // const handleChange = (index, event) => {
    //   const { name, value } = event.target
    //   const updatedProjects = [...projects]
    //   if (name.includes('client.client_name')) {
    //     updatedProjects[index].client.client_name = value
    //   } else {
    //     updatedProjects[index][name] = value
    //   }
    //   setProjects(updatedProjects)
    //   const projectId = updatedProjects[index].planning_project_id
    //   setChanges((prevChanges) => ({
    //     ...prevChanges,
    //     [projectId]: {
    //       ...prevChanges[projectId],
    //       [name]: value,
    //     },
    //   }))
    // }

    const handleSubmit = async (e) => {
      event.preventDefault()
      console.log('Changed Data:', changes)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login'
        return
      }

      try {
        // const response = await axios.put('http://127.0.0.1:8000/api/projectdatalist/update/', changes, {
        const response = await axios.put('http://54.178.202.58:8000/api/projectdatalist/update/',  changes ,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        alert('Sucessfully updated')
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the project planning data!', error)
        }
      }

    }

    useEffect(() => {
      const fetchProjects = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          window.location.href = '/login' // Redirect to login if no token found
          return
        }

        try {
          // const response = await axios.get('http://127.0.0.1:8000/api/planningprojects/', {
          const response = await axios.get('http://54.178.202.58:8000/api/planningprojects/', {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          setProjects(response.data)
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
        setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, projects])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/*') {
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
      navigate('/users-registration');
    };

  return (
    <div className='UsersListAndEdit_wrapper'>
      <div className='UsersListAndEdit_header_cont'>
        <div className='UsersListAndEdit_top_btn_cont'>
          <div className='UsersListAndEdit_header-buttons'>
            <Btn
              label={translate('analysis', language)}
              onClick={() => handleTabClick('/dashboard')}
              className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('profitAndlossPlanning', language)}
              onClick={() => handleTabClick('/planning')}
              className={activeTab === '/planning' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('results', language)}
              onClick={() => handleTabClick('/*')}
              className={activeTab === '/*' ? 'h-btn-active header-btn' : 'header-btn'}
            />
          </div>
          <div className='UsersListAndEdit_language-toggle'>
            <p className='UsersListAndEdit_pl-label'>English</p>
            <label className='UsersListAndEdit_switch'>
              <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} disabled={isEditing}/>
              <span className='UsersListAndEdit_slider'></span>
            </label>
          </div>
        </div>
      </div>
      <div className='UsersListAndEdit_cont_wrapper'>
        <div className='UsersListAndEdit_sidebar'>
          <Sidebar />
        </div>
        <div className='UsersListAndEdit_maincontent_wrapper'>
          <div className='UsersListAndEdit_top_content'>
            <div className='UsersListAndEdit_top_body_cont'>
              <div className='UsersListAndEdit_mode_switch_datalist'>
                <button className='UsersListAndEdit_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='UsersListAndEdit_mid_body_cont'>
              <div className='UsersListAndEdit_mid_btn_cont'>
                {[...Array(4)].map((_, index) => (
                  <Btn
                    key={index}
                    label={translate(
                      index === 0
                        ? 'client'
                        : index === 1
                          ? 'employee'
                          : index === 2
                            ? 'businessDivision'
                            : 'users',
                      language,
                    )}
                    onClick={() =>
                      handleTabsClick(
                        index === 0
                          ? 'client'
                          : index === 1
                            ? 'employee'
                            : index === 2
                              ? 'businessDivision'
                              : 'users',
                      )
                    }
                    className={
                      activeTabOther ===
                      (index === 0
                        ? 'client'
                        : index === 1
                          ? 'employee'
                          : index === 2
                            ? 'businessDivision'
                            : 'users')
                        ? 'body-btn-active body-btn'
                        : 'body-btn'
                    }
                  />
                ))}
              </div>
              <div className='UsersListAndEdit_title_table_cont'>
                <p className='UsersListAndEdit_title'>{translate('usersList', language)}</p>
                <Btn
                  label={translate('newRegistration', language)}
                  size='normal'
                  onClick={handleNewRegistrationClick}
                  className='UsersListAndEdit_btn'
                />
              </div>
              <div className='UsersListAndEdit_table_wrapper'>
                <div className='UsersListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='UsersListAndEdit_table_title '>
                                <th className='UsersListAndEdit_table_title_content_vertical has-text-left'>
                                  ID
                                </th>
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
                              {/* {projects.map((project, index) => ( */}
                                <tr key='{project.planning_project_id}' className='UsersListAndEdit_table_body_content_horizontal'>
                                  <td className='UsersListAndEdit_table_body_content_vertical has-text-left'></td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                      type='text'
                                      name='id'
                                      value=''
                                      // onChange={(e) => handleChange(index, e)}
                                    /> */}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                        type='text'
                                        name='last_name'
                                        value=''
                                        // onChange={(e) => handleChange(index, e)}
                                      /> */}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                        type='text'
                                        name='first_name'
                                        value=''
                                        // onChange={(e) => handleChange(index, e)}
                                      /> */}
                                    </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                        type='text'
                                        name='email'
                                        value=''
                                        // onChange={(e) => handleChange(index, e)}
                                      /> */}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                        type='text'
                                        name='date_joined'
                                        value=''
                                        // onChange={(e) => handleChange(index, e)}
                                      /> */}
                                  </td>
                                  <td className='UsersListAndEdit_table_body_content_vertical delete_icon'>
                                    {/* <RiDeleteBin6Fill className='delete-icon' onClick={() => openModal('project')}/> */}
                                  </td>
                                </tr>
                              {/* ))} */}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='UsersListAndEdit_table_title '>
                              <th className='UsersListAndEdit_table_title_content_vertical has-text-left'>
                                ID
                              </th>
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
                            {/* {projects.map((project) => ( */}
                              <tr key='{project.planning_project_id}' className='UsersListAndEdit_table_body_content_horizontal'>
                                <td className='UsersListAndEdit_table_body_content_vertical has-text-left'></td>
                                <td className='UsersListAndEdit_table_body_content_vertical'></td>
                                <td className='UsersListAndEdit_table_body_content_vertical'></td>
                                <td className='UsersListAndEdit_table_body_content_vertical'></td>
                                <td className='UsersListAndEdit_table_body_content_vertical'></td>
                                <td className='UsersListAndEdit_table_body_content_vertical'></td>
                              </tr>
                            {/* ))} */}
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
                    <div className='UsersListAndEdit_mode_switch_datalist'>
                      <button className='UsersListAndEdit_edit_submit_btn' onClick={handleSubmit}>
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

export default UsersListAndEdit;
