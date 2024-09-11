import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
import Sidebar from "../../components/SideBar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";
import { RiDeleteBin6Fill } from "react-icons/ri";
import AlertModal from "../../components/AlertModal/AlertModal";

const ClientsListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('')
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
      const updatedProjects = [...projects]
      if (name.includes('client.client_name')) {
        updatedProjects[index].client.client_name = value
      } else {
        updatedProjects[index][name] = value
      }
      setProjects(updatedProjects)
      const projectId = updatedProjects[index].planning_project_id
      setChanges((prevChanges) => ({
        ...prevChanges,
        [projectId]: {
          ...prevChanges[projectId],
          [name]: value,
        },
      }))
    }

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
      navigate('/clients-registration');
    };

  return (
    <div className='ClientsListAndEdit_wrapper'>
      <div className='ClientsListAndEdit_header_cont'>
        <div className='ClientsListAndEdit_top_btn_cont'>
          <div className='ClientsListAndEdit_header-buttons'>
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
          <div className='ClientsListAndEdit_language-toggle'>
            <p className='ClientsListAndEdit_pl-label'>English</p>
            <label className='ClientsListAndEdit_switch'>
              <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} disabled={isEditing}/>
              <span className='ClientsListAndEdit_slider'></span>
            </label>
          </div>
        </div>
      </div>
      <div className='ClientsListAndEdit_cont_wrapper'>
        <div className='ClientsListAndEdit_sidebar'>
          <Sidebar />
        </div>
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
              <div className='ClientsListAndEdit_mid_btn_cont'>
                {[...Array(4)].map((_, index) => (
                  <Btn
                    key={index}
                    label={translate(
                      index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales',
                      language,
                    )}
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
                      (index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales')
                        ? 'body-btn-active body-btn'
                        : 'body-btn'
                    }
                  />
                ))}
              </div>
              <div className='ClientsListAndEdit_title_table_cont'>
                <p className='ClientsListAndEdit_title'>{translate('clientsList', language)}</p>
                <Btn
                  label={translate('newRegistration', language)}
                  size='normal'
                  onClick={handleNewRegistrationClick}
                  className='ClientsListAndEdit_btn'
                />
              </div>
              <div className='ClientsListAndEdit_table_wrapper'>
                <div className='ClientsListAndEdit_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='ClientsListAndEdit_table_title '>
                                <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>
                                  ID
                                </th>
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
                              {/* {projects.map((project, index) => ( */}
                                <tr key='{project.planning_project_id}' className='ClientsListAndEdit_table_body_content_horizantal'>
                                  <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'></td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'>
                                    {/* <input
                                      type='text'
                                      name='client.client_name'
                                      value=''
                                      // onChange={(e) => handleChange(index, e)}
                                    /> */}
                                  </td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                  <td className='ClientsListAndEdit_table_body_content_vertical delete_icon'>
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
                            <tr className='ClientsListAndEdit_table_title '>
                              <th className='ClientsListAndEdit_table_title_content_vertical has-text-left'>
                                ID
                              </th>
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
                            {/* {projects.map((project) => ( */}
                              <tr key='{project.planning_project_id}' className='ClientsListAndEdit_table_body_content_horizantal'>
                                <td className='ClientsListAndEdit_table_body_content_vertical has-text-left'></td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                                <td className='ClientsListAndEdit_table_body_content_vertical'></td>
                              </tr>
                            {/* ))} */}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='ClientsListAndEdit_pagination_wrapper'>
                <div className='ClientsListAndEdit_pagination_cont'>
                  {/* <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    options={select}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  /> */}
                  {isEditing ? (
                    <div className='ClientsListAndEdit_mode_switch_datalist'>
                      <button className='ClientsListAndEdit_edit_submit_btn' onClick={handleSubmit}>
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

export default ClientsListAndEdit;
